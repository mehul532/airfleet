import { Fan, Power, PowerOff } from "lucide-react";
import { Link } from "react-router-dom";
import FilterBar from "./FilterBar.jsx";
import PmBadge from "./PmBadge.jsx";
import { formatNumber } from "../utils/format.js";

export default function FleetCard({ unit }) {
  const latestPm = unit.latestReading?.pm25;
  const needsReplacement = unit.status === "needs_replacement";
  const PowerIcon = unit.powerState ? Power : PowerOff;

  return (
    <Link
      to={`/units/${unit._id}`}
      className={[
        "focus-ring block rounded-md border bg-panel p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-aqua",
        needsReplacement ? "border-danger" : "border-line"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{unit.roomName}</h3>
          <p className="mt-1 truncate text-sm text-slate-600">
            {unit.siteId?.name} · {unit.siteId?.city}
          </p>
        </div>
        <PmBadge pm25={latestPm} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-line bg-mist p-3">
          <div className="flex items-center gap-2 text-slate-600">
            <PowerIcon size={16} aria-hidden="true" />
            <span>Power</span>
          </div>
          <p className="mt-2 font-semibold">{unit.powerState ? "On" : "Off"}</p>
        </div>
        <div className="rounded-md border border-line bg-mist p-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Fan size={16} aria-hidden="true" />
            <span>CADR</span>
          </div>
          <p className="mt-2 font-semibold">{formatNumber(unit.baselineCADR, 1)} m³/min</p>
        </div>
      </div>

      <div className="mt-5">
        <FilterBar remaining={unit.filterLifeRemaining} />
      </div>

      {needsReplacement && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          Replacement due
        </p>
      )}
    </Link>
  );
}
