"""Live web-search grounding using DuckDuckGo (`ddgs` package) - free, no API key."""
import asyncio
from ddgs import DDGS


def _search_sync(query: str, max_results: int = 5) -> list[dict]:
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    return [
        {"title": r.get("title", ""), "snippet": r.get("body", ""), "url": r.get("href", "")}
        for r in results
    ]


async def web_search(query: str, max_results: int = 5) -> list[dict]:
    try:
        return await asyncio.to_thread(_search_sync, query, max_results)
    except Exception:
        return []
