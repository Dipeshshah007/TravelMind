export default function Footer() {
  return (
    <footer className="border-t border-ink-600/60 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-parchment/40 flex flex-col sm:flex-row justify-between gap-2">
        <p>TravelMind — a multi-agent AI travel planner. Built with free-tier APIs end to end.</p>
        <p>Weather &amp; geocoding by Open-Meteo · Rates by open.er-api.com · Search by DuckDuckGo</p>
      </div>
    </footer>
  );
}
