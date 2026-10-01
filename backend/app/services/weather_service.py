"""Real-time weather + geocoding using Open-Meteo. Free, no API key."""
import httpx

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

WEATHER_CODE_MAP = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm",
}


async def geocode_place(place_name: str) -> dict | None:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(GEOCODE_URL, params={"name": place_name, "count": 1})
        r.raise_for_status()
        results = r.json().get("results")
        if not results:
            return None
        top = results[0]
        return {
            "name": top["name"],
            "country": top.get("country", ""),
            "latitude": top["latitude"],
            "longitude": top["longitude"],
            "timezone": top.get("timezone", "UTC"),
        }


async def get_forecast(latitude: float, longitude: float, start_date: str, end_date: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(FORECAST_URL, params={
            "latitude": latitude,
            "longitude": longitude,
            "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "timezone": "auto",
            "start_date": start_date,
            "end_date": end_date,
        })
        r.raise_for_status()
        daily = r.json().get("daily", {})
        days = []
        for i, d in enumerate(daily.get("time", [])):
            code = daily["weathercode"][i]
            days.append({
                "date": d,
                "condition": WEATHER_CODE_MAP.get(code, "Unknown"),
                "temp_max_c": daily["temperature_2m_max"][i],
                "temp_min_c": daily["temperature_2m_min"][i],
                "rain_chance_pct": daily.get("precipitation_probability_max", [None] * len(daily["time"]))[i],
            })
        return days
