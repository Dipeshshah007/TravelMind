import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import travel

logging.basicConfig(level=logging.INFO)
settings = get_settings()

app = FastAPI(title="TravelMind API", description="Multi-agent AI travel planner backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(travel.router)


@app.get("/")
async def root():
    return {"message": "TravelMind API is running. See /docs for the OpenAPI schema."}
