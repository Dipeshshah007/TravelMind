from app.agents.base_agent import BaseAgent, ProgressCallback
from app.services.search_service import web_search


class LocalInsiderAgent(BaseAgent):
    name = "LocalInsiderAgent"

    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        req = context["request"]
        destination = req["destination"]

        await self.emit(on_progress, "started", "Checking for current local events and advisories...")

        queries = [
            f"{destination} events {req['start_date'].strftime('%B %Y')}",
            f"{destination} travel advisory safety news",
            f"{destination} visa entry requirements",
        ]
        all_results, sources = [], []
        for q in queries:
            results = await web_search(q, max_results=3)
            all_results.extend(results)
            sources.extend([r["url"] for r in results if r.get("url")])

        search_context = "\n".join(f"- {r['title']}: {r['snippet']}" for r in all_results) or "No live results found."

        system_prompt = (
            "You summarize current, time-sensitive travel information from search snippets. "
            "Be factual and note if information may be outdated. Respond ONLY with valid JSON."
        )
        user_prompt = f"""
Destination: {destination}
Travel window: {req['start_date']} to {req['end_date']}

Live search context:
{search_context}

Return JSON: {{"current_events": ["..."], "advisories": ["..."], "entry_requirements": ["..."]}}
"""
        data = self.llm.complete_json(system_prompt, user_prompt)
        context["local_insider"] = data
        context.setdefault("sources", []).extend(sources)

        await self.emit(on_progress, "completed", "Local real-time checks complete.", {"events_found": len(data.get("current_events", []))})
        return data
