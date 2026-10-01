from datetime import date
from typing import Literal
from pydantic import BaseModel, Field


class TripRequest(BaseModel):
    destination: str = Field(..., examples=["Kyoto, Japan"])
    origin: str | None = Field(None, examples=["New Delhi, India"])
    start_date: date
    end_date: date
    travelers: int = Field(1, ge=1, le=20)
    budget_amount: float = Field(..., gt=0)
    budget_currency: str = Field("USD", min_length=3, max_length=3)
    trip_style: Literal[
        "relaxed", "adventure", "cultural", "luxury", "budget", "family", "solo", "romantic"
    ] = "cultural"
    interests: list[str] = Field(default_factory=list, examples=[["food", "history", "nature"]])
    special_notes: str | None = None
