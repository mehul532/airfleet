import { formatNumber } from "../utils/format.js";

export default function FilterBar({ remaining = 100 }) {
  const safeRemaining = Math.max(0, Math.min(100, Number(remaining) || 0));
  const used = 100 - safeRemaining;
  const tone = safeRemaining <= 15 ? "bg-danger" : safeRemaining <= 40 ? "bg-amberline" : "bg-leaf";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <span>Filter life</span>
        <span>{formatNumber(safeRemaining)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" aria-label="Filter life">
        <div className={`h-full ${tone}`} style={{ width: `${100 - used}%` }} />
      </div>
    </div>
  );
}
