function InfoList({ title, items, accent = "text-brass" }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className={`text-sm font-medium mb-2 ${accent}`}>{title}</p>
      <ul className="space-y-1.5 text-sm text-parchment/70">
        {items.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
    </div>
  );
}

export default function InsightsPanel({ result }) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6 space-y-5">
      <h3 className="font-display text-xl mb-1">Real-time local intelligence</h3>
      <InfoList title="Must-see attractions" items={result.must_see_attractions} />
      <InfoList title="Culture & etiquette" items={result.culture_and_etiquette} />
      <InfoList title="Happening around your dates" items={result.local_insights} accent="text-route-light" />
      <InfoList title="Safety & advisories" items={result.safety_notes} accent="text-red-300" />
      <InfoList title="Entry requirements" items={result.entry_requirements} />
    </div>
  );
}
