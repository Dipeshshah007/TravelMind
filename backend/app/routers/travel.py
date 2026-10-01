import asyncio
import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import TripRequest
from app.agents.orchestrator import TravelMindOrchestrator
from app.services.weather_service import geocode_place, get_forecast
from app.services.currency_service import get_exchange_rate

router = APIRouter(prefix="/api", tags=["travel"])
orchestrator = TravelMindOrchestrator()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "TravelMind backend"}


@router.post("/trip/plan/stream")
async def plan_trip_stream(request: TripRequest):
    payload = request.model_dump()

    async def event_generator():
        queue: asyncio.Queue = asyncio.Queue()

        async def on_progress(agent: str, status: str, message: str, event_payload: dict | None):
            await queue.put({
                "event": "progress",
                "data": json.dumps({"agent": agent, "status": status, "message": message, "payload": event_payload}),
            })

        async def run_pipeline():
            try:
                result = await orchestrator.plan_trip(payload, on_progress)
                await queue.put({"event": "result", "data": json.dumps(result, default=str)})
            except Exception as exc:
                await queue.put({"event": "error", "data": json.dumps({"message": str(exc)})})
            finally:
                await queue.put(None)

        task = asyncio.create_task(run_pipeline())
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                yield item
        finally:
            task.cancel()

    return EventSourceResponse(event_generator())


@router.post("/trip/plan")
async def plan_trip_sync(request: TripRequest):
    try:
        return await orchestrator.plan_trip(request.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/weather")
async def weather(city: str, start_date: str, end_date: str):
    geo = await geocode_place(city)
    if not geo:
        raise HTTPException(status_code=404, detail=f"Could not find location: {city}")
    forecast = await get_forecast(geo["latitude"], geo["longitude"], start_date, end_date)
    return {"geo": geo, "forecast": forecast}


@router.get("/currency")
async def currency(base: str, target: str):
    try:
        rate = await get_exchange_rate(base, target)
        return {"base": base.upper(), "target": target.upper(), "rate": rate}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
