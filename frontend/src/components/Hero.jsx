export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-brass/90 text-sm tracking-wide mb-4">Multi-agent AI travel planning</p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
          Five AI agents plot your journey while you make the coffee.
        </h1>
        <p className="text-parchment/70 text-lg leading-relaxed mb-8 max-w-lg">
          TravelMind sends a research agent, a weather agent, a budget agent and a
          local-insider agent out to gather live information — then a planner agent
          weaves it all into a day-by-day itinerary built around your dates, your
          budget and what's actually happening at your destination right now.
        </p>
        <a href="#plan" className="inline-flex items-center gap-2 bg-brass text-ink font-medium px-6 py-3 rounded hover:bg-brass-light transition-colors">
          Plan my trip
        </a>
      </div>
      <div className="relative">
        <svg viewBox="0 0 420 420" className="w-full h-auto">
          <path d="M40 380 C 120 340, 90 260, 160 230 S 260 150, 230 90 S 340 40, 380 40"
            fill="none" stroke="#3E8F89" strokeWidth="2" strokeDasharray="6 8" opacity="0.7" />
          {[
            { x: 40, y: 380, label: "Your request" },
            { x: 160, y: 230, label: "Research + Weather" },
            { x: 230, y: 90, label: "Budget + Local intel" },
            { x: 380, y: 40, label: "Final itinerary" },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="7" fill="#C6963B" />
              <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#C6963B" opacity="0.4" />
              <text x={p.x + (i === 3 ? -110 : 14)} y={p.y + (i === 0 ? -14 : 4)}
                fill="#F4EEDE" fontSize="12" fontFamily="'Space Grotesk', sans-serif" opacity="0.85">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
