export default function WeatherStrip({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
        <h3 className="font-display text-xl mb-2">Live weather outlook</h3>
        <p className="text-parchment/50 text-sm">
          Your dates fall outside the 16-day live forecast window, so the itinerary
          uses seasonal norms instead of a real-time forecast.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <h3 className="font-display text-xl mb-4">Live weather outlook</h3>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {forecast.map((d) => (
          <div key={d.date} className="min-w-[110px] bg-ink-700 border border-ink-600 rounded-md p-3 text-center shrink-0">
            <p className="text-xs text-parchment/50">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
            <p className="text-sm mt-1.5 text-parchment/80">{d.condition}</p>
            <p className="text-brass font-medium mt-1">{Math.round(d.temp_max_c)}° / {Math.round(d.temp_min_c)}°C</p>
            {d.rain_chance_pct != null && <p className="text-xs text-route-light mt-1">{d.rain_chance_pct}% rain</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
