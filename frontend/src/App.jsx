import { useState, useRef, useEffect } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import TripForm from "./components/TripForm.jsx";
import AgentConsole from "./components/AgentConsole.jsx";
import ItineraryTimeline from "./components/ItineraryTimeline.jsx";
import BudgetChart from "./components/BudgetChart.jsx";
import WeatherStrip from "./components/WeatherStrip.jsx";
import InsightsPanel from "./components/InsightsPanel.jsx";
import MapView from "./components/MapView.jsx";
import SourcesList from "./components/SourcesList.jsx";
import Footer from "./components/Footer.jsx";
import { streamTripPlan } from "./lib/api.js";

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | planning | done | error
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleSubmit = (formValues) => {
    setPhase("planning");
    setEvents([]);
    setResult(null);
    setErrorMsg("");
    setElapsed(0);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    abortRef.current?.();
    abortRef.current = streamTripPlan(formValues, {
      onProgress: (evt) => setEvents((prev) => [...prev, evt]),
      onResult: (data) => { setResult(data); setPhase("done"); clearInterval(timerRef.current); },
      onError: (err) => { setErrorMsg(err.message || "Something went wrong."); setPhase("error"); clearInterval(timerRef.current); },
    });
  };

  const handleCancel = () => {
    abortRef.current?.();
    clearInterval(timerRef.current);
    setPhase("idle");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />

        <section className="max-w-6xl mx-auto px-6 pb-24 grid lg:grid-cols-[420px_1fr] gap-8">
          <div className="space-y-8">
            <TripForm onSubmit={handleSubmit} isPlanning={phase === "planning"} onCancel={handleCancel} />
            <AgentConsole events={events} elapsedSeconds={phase === "planning" ? elapsed : null} />
            {phase === "error" && (
              <div className="bg-red-950/40 border border-red-900 text-red-300 rounded-lg p-4 text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {phase === "idle" && (
              <div className="h-full min-h-[300px] flex items-center justify-center text-parchment/30 border border-dashed border-ink-600 rounded-lg">
                Your itinerary will appear here once the agents finish.
              </div>
            )}

            {result && (
              <>
                <WeatherStrip forecast={result.weather_outlook} />
                <ItineraryTimeline days={result.days} />
                <BudgetChart budget={result.budget} />
                <MapView geo={result.geo} />
                <InsightsPanel result={result} />
                <SourcesList sources={result.sources} />
              </>
            )}
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="font-display text-3xl mb-8">How the five agents work together</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              ["Orchestrator", "Coordinates every agent, shares a common context between them, and streams live progress to this screen."],
              ["Destination Research", "Pulls current attraction, culture and neighbourhood information via live web search."],
              ["Weather", "Checks real-time forecasts and geocodes your destination for the map."],
              ["Budget", "Estimates realistic costs and converts them at live exchange rates."],
              ["Local Insider", "Surfaces current events, advisories and entry requirements around your travel dates."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-ink-800 border border-ink-600 rounded-lg p-5">
                <p className="font-display text-lg mb-2">{title}</p>
                <p className="text-sm text-parchment/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
