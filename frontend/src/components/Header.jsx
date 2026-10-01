import { CompassIcon } from "./Icons.jsx";

export default function Header() {
  return (
    <header className="border-b border-ink-600/60">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CompassIcon className="w-7 h-7 text-brass" />
          <span className="font-display text-xl tracking-tight">TravelMind</span>
        </div>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-parchment/70">
          <a href="#how-it-works" className="hover:text-brass transition-colors">How it works</a>
          <a href="#plan" className="hover:text-brass transition-colors">Plan a trip</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer"
            className="px-4 py-2 rounded border border-brass/50 text-brass hover:bg-brass/10 transition-colors">
            View on GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
