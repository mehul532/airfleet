import { FastForward, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import FleetCard from "../components/FleetCard.jsx";
import RegistryPanel from "../components/RegistryPanel.jsx";
import { api } from "../services/api.js";

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadFleet = useCallback(async () => {
    try {
      const [sitePayload, unitPayload] = await Promise.all([api.listSites(), api.listUnits()]);
      setSites(sitePayload);
      setUnits(unitPayload);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
    const timer = setInterval(loadFleet, 5000);
    return () => clearInterval(timer);
  }, [loadFleet]);

  const unitsBySite = useMemo(() => {
    return sites.map((site) => ({
      site,
      units: units.filter((unit) => unit.siteId?._id === site._id)
    }));
  }, [sites, units]);

  async function fastForward() {
    setBusy(true);
    setError("");
    try {
      await api.fastForward(30);
      await loadFleet();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Fleet Dashboard</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Live PM2.5, automation state, and filter-life status across demo sites.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadFleet}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm font-semibold text-slate-700 hover:border-aqua"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={fastForward}
            disabled={busy}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-aqua bg-aqua px-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FastForward size={16} aria-hidden="true" />
            Fast-forward 30 days
          </button>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="rounded-md border border-line bg-panel p-6 text-sm text-slate-600">
          Loading fleet...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {unitsBySite.map(({ site, units: siteUnits }) => (
            <section key={site._id} className="min-w-0">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{site.name}</h3>
                  <p className="text-sm text-slate-600">
                    {site.city}, {site.country} · {site.profile.replace("_", " ")}
                  </p>
                </div>
                <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {siteUnits.length} units
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {siteUnits.map((unit) => (
                  <FleetCard key={unit._id} unit={unit} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <RegistryPanel sites={sites} units={units} onChange={loadFleet} />
    </div>
  );
}
