import { formatNumber } from "../utils/format.js";

export function pmTone(pm25) {
  if (pm25 === null || pm25 === undefined) return "bg-slate-100 text-slate-600 border-slate-200";
  if (pm25 < 35) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (pm25 < 150) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export default function PmBadge({ pm25 }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-semibold ${pmTone(
        pm25
      )}`}
    >
      {formatNumber(pm25, 1)} µg/m³
    </span>
  );
}
