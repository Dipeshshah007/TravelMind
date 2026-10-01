export default function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <h3 className="font-display text-xl mb-3">Live sources consulted</h3>
      <ul className="space-y-1.5 text-sm">
        {sources.slice(0, 10).map((url) => (
          <li key={url} className="truncate">
            <a href={url} target="_blank" rel="noreferrer" className="text-route-light hover:text-brass transition-colors">{url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
