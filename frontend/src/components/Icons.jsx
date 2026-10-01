export function CompassIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" />
      <path d="M24 8 L28 22 L24 24 L20 22 Z" fill="currentColor" />
      <path d="M24 40 L20 26 L24 24 L28 26 Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function WaypointDot({ active, done }) {
  return (
    <span
      className={[
        "block w-3 h-3 rounded-full border-2 shrink-0",
        done ? "bg-route border-route" : active ? "bg-brass border-brass animate-pulse" : "bg-transparent border-ink-600",
      ].join(" ")}
    />
  );
}
