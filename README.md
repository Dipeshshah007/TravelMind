# TravelMind — Multi-Agent AI Travel Planner

TravelMind plans a complete trip day-by-day itinerary, live weather, a real
cost breakdown in your currency, and current local conditions by sending
five cooperating AI agents to research it in parallel, in real time, in
front of you. It's a full-stack, agentic AI/ML application built entirely on

## 1. What real-time problem does this solve?

Planning a trip today means manually stitching together stale, scattered
information: attraction lists from old blog posts, a separate weather app,
manual currency conversion for a guessed budget, and no visibility into
what's *currently* happening at the destination (festivals, advisories,
entry-rule changes) until you're already there.

## 2. My solution

TravelMind treats trip planning as a multi-agent reasoning problem:

| Agent | Responsibility | Real-time data source |
|---|---|---|
| **Destination Research Agent** | Attractions, culture, best areas to stay | Live web search (DuckDuckGo) |
| **Weather Agent** | Forecast for exact travel dates + geocoding | Open-Meteo |
| **Budget Agent** | Cost breakdown converted to your currency | Live FX rates |
| **Local Insider Agent** | Current events, advisories, entry requirements | Live web search (DuckDuckGo) |
| **Itinerary Planner Agent** | Synthesizes everything into a paced day-by-day plan | Reads shared context from all other agents |

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env      # add your free Groq or Gemini key
uvicorn app.main:app --reload --port 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```
