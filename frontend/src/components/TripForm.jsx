import { useState } from "react";

const STYLES = ["relaxed", "adventure", "cultural", "luxury", "budget", "family", "solo", "romantic"];
const INTEREST_OPTIONS = ["food", "history", "nature", "nightlife", "art", "shopping", "wellness", "photography"];

const inputClass =
  "w-full bg-ink-700 border border-ink-600 rounded px-4 py-2.5 text-parchment placeholder:text-parchment/30 focus:outline-none focus:ring-2 focus:ring-brass/60";

export default function TripForm({ onSubmit, isPlanning, onCancel }) {
  const [form, setForm] = useState({
    destination: "", origin: "", start_date: "", end_date: "",
    travelers: 2, budget_amount: 1500, budget_currency: "USD",
    trip_style: "cultural", interests: [], special_notes: "",
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest) ? f.interests.filter((i) => i !== interest) : [...f.interests, interest],
    }));
  };
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form id="plan" onSubmit={handleSubmit} className="bg-ink-800 border border-ink-600 rounded-lg p-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Where to?</h2>
        <p className="text-parchment/50 text-sm">Tell the agents the shape of your trip.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Destination</label>
          <input required className={inputClass} placeholder="e.g. Kyoto, Japan"
            value={form.destination} onChange={(e) => update("destination", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Origin (optional)</label>
          <input className={inputClass} placeholder="e.g. New Delhi, India"
            value={form.origin} onChange={(e) => update("origin", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Start date</label>
          <input required type="date" className={inputClass}
            value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">End date</label>
          <input required type="date" className={inputClass}
            value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Travelers</label>
          <input required type="number" min="1" max="20" className={inputClass}
            value={form.travelers} onChange={(e) => update("travelers", Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Budget amount</label>
          <input required type="number" min="1" className={inputClass}
            value={form.budget_amount} onChange={(e) => update("budget_amount", Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-parchment/60 block mb-1.5">Currency</label>
          <select className={inputClass} value={form.budget_currency} onChange={(e) => update("budget_currency", e.target.value)}>
            {["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-parchment/60 block mb-1.5">Trip style</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button type="button" key={s} onClick={() => update("trip_style", s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                form.trip_style === s ? "bg-brass text-ink border-brass" : "border-ink-600 text-parchment/70 hover:border-brass/50"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-parchment/60 block mb-1.5">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => (
            <button type="button" key={i} onClick={() => toggleInterest(i)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                form.interests.includes(i) ? "bg-route text-ink border-route" : "border-ink-600 text-parchment/70 hover:border-route/50"
              }`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-parchment/60 block mb-1.5">Anything else the agents should know?</label>
        <textarea rows="2" className={inputClass}
          placeholder="e.g. traveling with a toddler, vegetarian, mobility considerations..."
          value={form.special_notes} onChange={(e) => update("special_notes", e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPlanning}
          className="flex-1 bg-brass text-ink font-medium py-3 rounded hover:bg-brass-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isPlanning ? "Agents are working..." : "Send the agents to work"}
        </button>
        {isPlanning && (
          <button type="button" onClick={onCancel}
            className="px-5 py-3 rounded border border-ink-600 text-parchment/70 hover:border-red-400 hover:text-red-300 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
