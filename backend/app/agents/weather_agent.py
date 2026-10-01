from app.agents.base_agent import BaseAgent, ProgressCallback
from app.services.weather_service import geocode_place, get_forecast


class WeatherAgent(BaseAgent):
    name = "WeatherAgent"

    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        req = context["request"]
        destination = req["destination"]

        await self.emit(on_progress, "started", f"Locating {destination} and checking live weather...")

        geo = await geocode_place(destination)
        if not geo:
            await self.emit(on_progress, "error", f"Could not geocode '{destination}'.")
            result = {"geo": None, "forecast": []}
            context["weather"] = result
            return result

        context["geo"] = geo

        try:
            forecast = await get_forecast(
                geo["latitude"], geo["longitude"], req["start_date"].isoformat(), req["end_date"].isoformat()
            )
        except Exception:
            forecast = []

        result = {"geo": geo, "forecast": forecast}
        context["weather"] = result

        msg = f"Weather outlook ready ({len(forecast)} day(s) forecasted)." if forecast else \
              "Trip dates are outside the 16-day live forecast window — using seasonal climate norms instead."
        await self.emit(on_progress, "completed", msg, {"forecast_days": len(forecast)})
        return result
