import unittest
from types import SimpleNamespace

from app.services.llm_service import _resolve_groq_model


class GroqModelResolutionTests(unittest.TestCase):
    def test_uses_a_current_supported_model_when_requested_one_is_missing(self):
        class DummyListResponse:
            data = [
                SimpleNamespace(id="openai/gpt-oss-20b"),
                SimpleNamespace(id="qwen/qwen3.8-27b"),
            ]

        class DummyModels:
            def list(self):
                return DummyListResponse()

        class DummyClient:
            models = DummyModels()

        resolved = _resolve_groq_model(DummyClient(), "llama-3.3-70b-versatile")
        self.assertEqual(resolved, "openai/gpt-oss-20b")


if __name__ == "__main__":
    unittest.main()
