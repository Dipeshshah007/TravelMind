"""
LLM abstraction layer. Runs entirely on FREE-tier providers: Groq or Gemini.
Swap providers by changing LLM_PROVIDER in .env - no code changes needed.

Gemini model names get renamed/retired often and access varies by API key,
so on startup we ask the API what THIS key actually supports and
auto-fall-back to a working flash model instead of hard-failing on a
possibly-stale model name.
"""
import json
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

logger = logging.getLogger("travelmind.llm")
settings = get_settings()


def _resolve_groq_model(client, requested_model: str) -> str:
    requested = requested_model.strip()
    try:
        available = [m.id for m in client.models.list().data]
    except Exception as exc:
        logger.warning("Could not list Groq models (%s); using configured model as-is.", exc)
        return requested

    if requested in available:
        return requested

    fallback_candidates = [m for m in available if "gpt-oss" in m.lower() or "qwen" in m.lower()]
    fallback = (fallback_candidates or available or [requested])[0]

    logger.warning(
        "Configured GROQ_MODEL '%s' is not available for this API key. "
        "Available models: %s. Falling back to '%s'.",
        requested_model, available, fallback,
    )
    return fallback


def _resolve_gemini_model(genai, requested_model: str) -> str:
    requested_short = requested_model.replace("models/", "")
    try:
        available = [
            m.name.replace("models/", "")
            for m in genai.list_models()
            if "generateContent" in getattr(m, "supported_generation_methods", [])
        ]
    except Exception as exc:
        logger.warning("Could not list Gemini models (%s); using configured model as-is.", exc)
        return requested_model

    if requested_short in available:
        return requested_short

    flash_candidates = [m for m in available if "flash" in m.lower()]
    fallback = (flash_candidates or available or [requested_short])[0]

    logger.warning(
        "Configured GEMINI_MODEL '%s' is not available for this API key. "
        "Available models: %s. Falling back to '%s'.",
        requested_model, available, fallback,
    )
    return fallback


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        if self.provider == "groq":
            from groq import Groq
            if not settings.GROQ_API_KEY:
                raise RuntimeError("GROQ_API_KEY is missing. Add it to backend/.env")
            self._client = Groq(api_key=settings.GROQ_API_KEY)
            self._model = _resolve_groq_model(self._client, settings.GROQ_MODEL)
            logger.info("Groq model in use: %s", self._model)
        elif self.provider == "gemini":
            import google.generativeai as genai
            if not settings.GEMINI_API_KEY:
                raise RuntimeError("GEMINI_API_KEY is missing. Add it to backend/.env")
            genai.configure(api_key=settings.GEMINI_API_KEY)
            resolved_model = _resolve_gemini_model(genai, settings.GEMINI_MODEL)
            self._client = genai.GenerativeModel(resolved_model)
            self._model = resolved_model
            logger.info("Gemini model in use: %s", self._model)
        else:
            raise ValueError(f"Unsupported LLM_PROVIDER: {self.provider}")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    def complete(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        if self.provider == "groq":
            kwargs = {}
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=2048,
                **kwargs,
            )
            return resp.choices[0].message.content

        if self.provider == "gemini":
            prompt = f"{system_prompt}\n\n{user_prompt}"
            if json_mode:
                prompt += "\n\nRespond with valid JSON only. No markdown fences, no preamble."
            resp = self._client.generate_content(prompt)
            return resp.text

        raise ValueError(f"Unsupported provider: {self.provider}")

    def complete_json(self, system_prompt: str, user_prompt: str) -> dict:
        raw = self.complete(system_prompt, user_prompt, json_mode=True)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json\n", "", 1) if cleaned.startswith("json") else cleaned
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            start, end = cleaned.find("{"), cleaned.rfind("}")
            if start != -1 and end != -1:
                return json.loads(cleaned[start:end + 1])
            logger.error("Failed to parse LLM JSON output: %s", cleaned[:500])
            raise


_llm_singleton: LLMService | None = None


def get_llm() -> LLMService:
    global _llm_singleton
    if _llm_singleton is None:
        _llm_singleton = LLMService()
    return _llm_singleton
