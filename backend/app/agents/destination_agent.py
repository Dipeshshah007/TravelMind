from app.agents.base_agent import BaseAgent, ProgressCallback
from app.services.search_service import web_search


class DestinationResearchAgent(BaseAgent):
    name = "DestinationResearchAgent"

    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        destination = context["request"]["destination"]
        interests = context["request"].get("interests") or []

        await self.emit(on_progress, "started", f"Researching {destination}...")

        queries = [
            f"top attractions in {destination} 2026",
            f"{destination} travel tips culture etiquette",
        ]
        if interests:
            queries.append(f"{destination} {' '.join(interests)} recommendations")

        all_results, sources = [], []
        for q in queries:
            results = await web_search(q, max_results=4)
            all_results.extend(results)
            sources.extend([r["url"] for r in results if r.get("url")])

        await self.emit(on_progress, "working", "Synthesizing destination insights...")

        search_context = "\n".join(f"- {r['title']}: {r['snippet']}" for r in all_results[:15]) or "No live search results available."

        system_prompt = (
            "You are a professional travel research analyst. Use the provided web-search "
            "snippets as grounding, but write in your own words. Return concise, practical, "
            "up-to-date information. Respond ONLY with valid JSON."
        )
        user_prompt = f"""
Destination: {destination}
Traveler interests: {', '.join(interests) or 'general sightseeing'}

Live web search context:
{search_context}

Return JSON with this exact shape:
{{
  "must_see_attractions": ["...", "..."],
  "culture_and_etiquette": ["...", "..."],
  "best_areas_to_stay": ["...", "..."],
  "local_insights": ["...", "..."],
  "safety_notes": ["...", "..."]
}}
"""
        data = self.llm.complete_json(system_prompt, user_prompt)
        context["destination_research"] = data
        context.setdefault("sources", []).extend(sources)

        await self.emit(on_progress, "completed", f"Destination research complete for {destination}.", {"summary": data.get("must_see_attractions", [])[:3]})
        return data
