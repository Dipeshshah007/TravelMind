"""Orchestrator: coordinates the multi-agent pipeline and streams live progress."""
import asyncio

from app.agents.destination_agent import DestinationResearchAgent
from app.agents.weather_agent import WeatherAgent
from app.agents.budget_agent import BudgetAgent
from app.agents.local_insider_agent import LocalInsiderAgent
from app.agents.itinerary_agent import ItineraryPlannerAgent


class TravelMindOrchestrator:
    def __init__(self):
        self.destination_agent = DestinationResearchAgent()
        self.weather_agent = WeatherAgent()
        self.budget_agent = BudgetAgent()
        self.local_agent = LocalInsiderAgent()
        self.itinerary_agent = ItineraryPlannerAgent()

    async def plan_trip(self, request: dict, on_progress=None) -> dict:
        context: dict = {"request": request, "sources": []}

        await self._safe_emit(on_progress, "Orchestrator", "started", "TravelMind agents are assembling your trip...")

        await asyncio.gather(
            self.destination_agent.run(context, on_progress),
            self.weather_agent.run(context, on_progress),
            self.local_agent.run(context, on_progress),
        )

        await self.budget_agent.run(context, on_progress)
        await self.itinerary_agent.run(context, on_progress)

        await self._safe_emit(on_progress, "Orchestrator", "completed", "Your TravelMind itinerary is ready.")

        return self._assemble_response(context)

    @staticmethod
    async def _safe_emit(on_progress, agent, status, message, payload=None):
        if on_progress:
            await on_progress(agent, status, message, payload)

    @staticmethod
    def _assemble_response(context: dict) -> dict:
        req = context["request"]
        research = context.get("destination_research", {})
        local = context.get("local_insider", {})
        budget = context.get("budget", {})
        weather = context.get("weather", {})

        return {
            "destination": req["destination"],
            "trip_style": req["trip_style"],
            "days": context.get("itinerary_days", []),
            "budget": budget,
            "weather_outlook": weather.get("forecast", []),
            "geo": weather.get("geo"),
            "local_insights": research.get("local_insights", []) + local.get("current_events", []),
            "safety_notes": research.get("safety_notes", []) + local.get("advisories", []),
            "entry_requirements": local.get("entry_requirements", []),
            "must_see_attractions": research.get("must_see_attractions", []),
            "culture_and_etiquette": research.get("culture_and_etiquette", []),
            "sources": sorted(set(context.get("sources", []))),
        }
