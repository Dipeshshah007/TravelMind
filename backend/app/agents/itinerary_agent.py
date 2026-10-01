from app.agents.base_agent import BaseAgent, ProgressCallback


class ItineraryPlannerAgent(BaseAgent):
    name = "ItineraryPlannerAgent"

    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        req = context["request"]
        nights = (req["end_date"] - req["start_date"]).days
        days = max(nights, 1)

        await self.emit(on_progress, "started", f"Drafting a {days}-day itinerary...")

        research = context.get("destination_research", {})
        weather = context.get("weather", {})
        budget = context.get("budget", {})
        local = context.get("local_insider", {})

        system_prompt = (
            "You are TravelMind's lead trip designer. Combine destination research, "
            "live weather, budget constraints, and local real-time notes into a coherent, "
            "day-by-day itinerary. Balance pacing, respect the trip style, and weave in "
            "weather-appropriate activities. Respond ONLY with valid JSON."
        )
        user_prompt = f"""
Destination: {req['destination']}
Dates: {req['start_date']} to {req['end_date']} ({days} days)
Travelers: {req['travelers']}
Trip style: {req['trip_style']}
Interests: {', '.join(req.get('interests') or []) or 'general'}
Special notes: {req.get('special_notes') or 'none'}

Destination research: {research}
Weather forecast: {weather.get('forecast')}
Budget summary: {budget}
Live local notes: {local}

Return JSON with this exact shape:
{{
  "days": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "title": "short theme for the day",
      "weather_summary": "one line, or null",
      "activities": [
        {{"time": "Morning", "activity": "...", "notes": "..."}},
        {{"time": "Afternoon", "activity": "...", "notes": "..."}},
        {{"time": "Evening", "activity": "...", "notes": "..."}}
      ],
      "estimated_cost": 0
    }}
  ]
}}
Produce exactly {days} day objects, with date fields incrementing daily starting at {req['start_date']}.
"""
        await self.emit(on_progress, "working", "Balancing pacing, weather and budget across each day...")
        data = self.llm.complete_json(system_prompt, user_prompt)
        context["itinerary_days"] = data.get("days", [])

        await self.emit(on_progress, "completed", "Itinerary drafted.", {"days": len(data.get("days", []))})
        return data
