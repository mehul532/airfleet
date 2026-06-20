import { ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import FilterBar from "../components/FilterBar.jsx";
import PmBadge from "../components/PmBadge.jsx";
import { api } from "../services/api.js";
import { compactSite, formatDateTime, formatNumber } from "../utils/format.js";

function chartTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);

      if (nextWidth > 0 && nextHeight > 0) {
        setSize({ width: nextWidth, height: nextHeight });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

export default function UnitDetail() {
  const { unitId } = useParams();
  const [status, setStatus] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [chartRef, chartSize] = useElementSize();

  const loadUnit = useCallback(async () => {
    try {
      const [statusPayload, readingsPayload] = await Promise.all([
        api.getUnitStatus(unitId),
        api.listReadings(unitId, 100)
      ]);
      setStatus(statusPayload);
      setReadings(
        readingsPayload.map((reading) => ({
          ...reading,
          timeLabel: chartTime(reading.timestamp)
        }))
      );
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    loadUnit();
    const timer = setInterval(loadUnit, 5000);
    return () => clearInterval(timer);
  }, [loadUnit]);

  async function resetFilter() {
    setBusy(true);
    setError("");
    try {
      await api.resetFilter(unitId);
      await loadUnit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="rounded-md border border-line bg-panel p-6">Loading unit...</div>;
  }

  if (!status?.unit) {
    return (
      <div className="rounded-md border border-line bg-panel p-6">
        <p className="text-sm text-slate-600">{error || "Unit not found"}</p>
        <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-aqua">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { unit } = status;
  const latestPm = unit.latestReading?.pm25;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/"
            className="focus-ring mb-3 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-aqua"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Dashboard
          </Link>
          <h2 className="text-2xl font-semibold">{unit.roomName}</h2>
          <p className="mt-1 text-sm text-slate-600">{compactSite(unit.siteId)}</p>
        </div>
        <button
          type="button"
          onClick={resetFilter}
          disabled={busy}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-aqua bg-aqua px-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset Filter
        </button>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-line bg-panel p-4">
          <p className="text-sm font-semibold text-slate-600">Live PM2.5</p>
          <div className="mt-3">
            <PmBadge pm25={latestPm} />
          </div>
        </div>
        <div className="rounded-md border border-line bg-panel p-4">
          <p className="text-sm font-semibold text-slate-600">Power State</p>
          <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold">
            <Zap size={18} className={unit.powerState ? "text-leaf" : "text-slate-400"} />
            {unit.powerState ? "On" : "Off"}
          </p>
        </div>
        <div className="rounded-md border border-line bg-panel p-4">
          <p className="text-sm font-semibold text-slate-600">Baseline CADR</p>
          <p className="mt-3 text-lg font-semibold">{formatNumber(unit.baselineCADR, 1)} m³/min</p>
        </div>
        <div className="rounded-md border border-line bg-panel p-4">
          <p className="text-sm font-semibold text-slate-600">Installed</p>
          <p className="mt-3 text-lg font-semibold">{formatDateTime(unit.filterInstallDate)}</p>
        </div>
      </div>

      <section className="rounded-md border border-line bg-panel p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Last 100 Readings</h3>
            <p className="text-sm text-slate-600">Threshold line at {status.thresholdPm25} µg/m³</p>
          </div>
          <div className="w-full max-w-sm">
            <FilterBar remaining={unit.filterLifeRemaining} />
          </div>
        </div>
        <div ref={chartRef} className="h-[360px] min-h-[260px] min-w-0">
          {chartSize.width > 0 && chartSize.height > 0 && (
            <LineChart
              width={chartSize.width}
              height={chartSize.height}
              data={readings}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid stroke="#dce4e8" strokeDasharray="4 4" />
              <XAxis dataKey="timeLabel" tick={{ fontSize: 12 }} minTickGap={28} />
              <YAxis tick={{ fontSize: 12 }} width={42} domain={[0, "dataMax + 30"]} />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.timestamp
                    ? formatDateTime(payload[0].payload.timestamp)
                    : ""
                }
                formatter={(value) => [`${formatNumber(value, 1)} µg/m³`, "PM2.5"]}
              />
              <ReferenceLine
                y={status.thresholdPm25}
                stroke="#d99b17"
                strokeDasharray="6 4"
                label={{ value: "35", position: "insideTopLeft", fill: "#8a610c" }}
              />
              <Line
                type="monotone"
                dataKey="pm25"
                stroke="#1b9aaa"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </div>
      </section>

      {status.openAlerts.length > 0 && (
        <section className="rounded-md border border-danger bg-red-50 p-4">
          <h3 className="text-base font-semibold text-red-800">Open Replacement Alert</h3>
          <p className="mt-1 text-sm text-red-700">
            This unit has reached the configured particulate-load capacity.
          </p>
        </section>
      )}
    </div>
  );
}
