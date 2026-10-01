import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const LABELS = {
  flights_estimate: "Flights", accommodation_estimate: "Stay", food_estimate: "Food",
  activities_estimate: "Activities", local_transport_estimate: "Local transport", misc_buffer: "Buffer",
};

export default function BudgetChart({ budget }) {
  if (!budget) return null;
  const data = Object.entries(LABELS).map(([key, label]) => ({ label, amount: budget[key] ?? 0 }));

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-xl">Budget breakdown</h3>
        <span className={`text-sm px-2.5 py-1 rounded-full border ${budget.within_budget ? "border-route text-route-light" : "border-brass text-brass"}`}>
          {budget.within_budget ? "Within budget" : "Over stated budget"}
        </span>
      </div>
      <p className="text-3xl font-display text-brass mb-4">
        {budget.total_estimate?.toLocaleString(undefined, { maximumFractionDigits: 0 })} {budget.currency}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#233248" horizontal={false} />
          <XAxis type="number" stroke="#F4EEDE60" fontSize={12} />
          <YAxis type="category" dataKey="label" stroke="#F4EEDE80" fontSize={12} width={100} />
          <Tooltip contentStyle={{ background: "#1B283A", border: "1px solid #233248", borderRadius: 6, color: "#F4EEDE" }}
            formatter={(v) => [`${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${budget.currency}`, "Estimate"]} />
          <Bar dataKey="amount" fill="#C6963B" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
