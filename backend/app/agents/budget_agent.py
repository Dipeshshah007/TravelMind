from app.agents.base_agent import BaseAgent, ProgressCallback
from app.services.currency_service import get_exchange_rate


class BudgetAgent(BaseAgent):
    name = "BudgetAgent"

    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        req = context["request"]
        destination = req["destination"]
        nights = (req["end_date"] - req["start_date"]).days
        travelers = req["travelers"]
        currency = req["budget_currency"]

        await self.emit(on_progress, "started", "Estimating trip budget in USD baseline...")

        research = context.get("destination_research", {})
        system_prompt = (
            "You are a meticulous travel budget planner. Estimate realistic USD costs. "
            "Respond ONLY with valid JSON, numbers only (no currency symbols)."
        )
        user_prompt = f"""
Destination: {destination}
Trip length: {nights} nights
Travelers: {travelers}
Trip style: {req['trip_style']}
Destination notes: {research.get('best_areas_to_stay', [])}

Return JSON with this exact shape (all numbers are TOTAL USD for the whole group/trip):
{{
  "flights_estimate": 0,
  "accommodation_estimate": 0,
  "food_estimate": 0,
  "activities_estimate": 0,
  "local_transport_estimate": 0,
  "misc_buffer": 0
}}
"""
        await self.emit(on_progress, "working", "Reasoning about flight, stay, food and activity costs...")
        estimate_usd = self.llm.complete_json(system_prompt, user_prompt)

        rate = 1.0
        try:
            rate = await get_exchange_rate("USD", currency)
        except Exception:
            currency = "USD"

        converted = {k: round(v * rate, 2) for k, v in estimate_usd.items()}
        total = round(sum(converted.values()), 2)

        result = {
            "currency": currency,
            "converted_from_usd_rate": rate,
            **converted,
            "total_estimate": total,
            "requested_budget": req["budget_amount"],
            "within_budget": total <= req["budget_amount"],
        }
        context["budget"] = result

        status_msg = (
            f"Estimated total: {total:,.2f} {currency} "
            f"({'within' if result['within_budget'] else 'over'} your stated budget)."
        )
        await self.emit(on_progress, "completed", status_msg, {"total": total, "currency": currency})
        return result
