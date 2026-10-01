"""Real-time currency conversion using open.er-api.com - free, no API key."""
import httpx

BASE_URL = "https://open.er-api.com/v6/latest"


async def get_exchange_rate(base_currency: str, target_currency: str) -> float:
    base_currency, target_currency = base_currency.upper(), target_currency.upper()
    if base_currency == target_currency:
        return 1.0
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{BASE_URL}/{base_currency}")
        r.raise_for_status()
        rates = r.json().get("rates", {})
        rate = rates.get(target_currency)
        if rate is None:
            raise ValueError(f"Unsupported currency code: {target_currency}")
        return float(rate)
