import { WaypointDot } from "./Icons.jsx";

const AGENT_LABELS = {
  Orchestrator: "Orchestrator",
  DestinationResearchAgent: "Destination Research Agent",
  WeatherAgent: "Weather Agent",
  BudgetAgent: "Budget Agent",
  LocalInsiderAgent: "Local Insider Agent",
  ItineraryPlannerAgent: "Itinerary Planner Agent",
};

export default function AgentConsole({ events, elapsedSeconds }) {
  if (events.length === 0) return null;

  const latestByAgent = {};
  events.forEach((e) => { latestByAgent[e.agent] = e; });
  const allDone = Object.values(latestByAgent).every((e) => e.status === "completed" || e.status === "error");

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-xl">Agents at work</h3>
        {!allDone && elapsedSeconds != null && (
          <span className="text-xs text-parchment/40">Working for {elapsedSeconds}s...</span>
        )}
      </div>
      <div className="flex flex-col">
        {Object.entries(latestByAgent).map(([agent, e], idx, arr) => (
          <div key={agent} className="flex gap-4">
            <div className="flex flex-col items-center">
              <WaypointDot active={e.status === "working" || e.status === "started"} done={e.status === "completed"} />
              {idx < arr.length - 1 && <div className="route-line flex-1 min-h-[28px]" />}
            </div>
            <div className="pb-6">
              <p className="text-sm font-medium text-parchment">{AGENT_LABELS[agent] ?? agent}</p>
              <p className={`text-sm ${e.status === "error" ? "text-red-400" : "text-parchment/60"}`}>{e.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
