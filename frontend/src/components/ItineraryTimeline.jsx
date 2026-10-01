export default function ItineraryTimeline({ days }) {
  if (!days || days.length === 0) return null;
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <h3 className="font-display text-xl mb-5">Day-by-day itinerary</h3>
      <div className="flex flex-col">
        {days.map((day, idx) => (
          <div key={day.day_number} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-ink-700 border border-brass/50 text-brass text-sm flex items-center justify-center shrink-0">
                {day.day_number}
              </span>
              {idx < days.length - 1 && <div className="route-line flex-1 min-h-[24px]" />}
            </div>
            <div className="pb-8 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <h4 className="font-display text-lg">{day.title}</h4>
                <span className="text-xs text-parchment/40">{day.date}</span>
                {day.weather_summary && <span className="text-xs text-route-light">{day.weather_summary}</span>}
              </div>
              <ul className="space-y-2">
                {(day.activities || []).map((a, i) => (
                  <li key={i} className="text-sm text-parchment/75 flex gap-2">
                    <span className="text-brass/80 shrink-0 w-16">{a.time}</span>
                    <span>
                      <span className="text-parchment">{a.activity}</span>
                      {a.notes && <span className="text-parchment/50"> — {a.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {day.estimated_cost != null && <p className="text-xs text-parchment/40 mt-2">Est. cost: {day.estimated_cost}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
