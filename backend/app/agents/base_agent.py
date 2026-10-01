"""Base class every specialist agent inherits from."""
from abc import ABC, abstractmethod
from typing import Callable, Awaitable

from app.services.llm_service import get_llm

ProgressCallback = Callable[[str, str, str, dict | None], Awaitable[None]]


class BaseAgent(ABC):
    name: str = "BaseAgent"

    def __init__(self):
        self.llm = get_llm()

    async def emit(self, on_progress: ProgressCallback | None, status: str, message: str, payload: dict | None = None):
        if on_progress:
            await on_progress(self.name, status, message, payload)

    @abstractmethod
    async def run(self, context: dict, on_progress: ProgressCallback | None = None) -> dict:
        raise NotImplementedError
