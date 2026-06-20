import { CheckCircle2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { compactSite, formatDateTime } from "../utils/format.js";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadAlerts = useCallback(async () => {
    try {
      const payload = await api.listAlerts();
      setAlerts(payload);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const timer = setInterval(loadAlerts, 5000);
    return () => clearInterval(timer);
  }, [loadAlerts]);

  async function markReplaced(alert) {
    const unitId = alert.unitId?._id;
    if (!unitId) return;

    setBusyId(alert._id);
    setError("");
    try {
      await api.resetFilter(unitId);
      await loadAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Alerts</h2>
          <p className="mt-1 text-sm text-slate-600">Open replacement events sorted by age.</p>
        </div>
        <button
          type="button"
          onClick={loadAlerts}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 text-sm font-semibold text-slate-700 hover:border-aqua"
        >
          <RefreshCcw size={16} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="rounded-md border border-line bg-panel p-6 text-sm text-slate-600">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-md border border-line bg-panel p-8 text-center">
          <CheckCircle2 className="mx-auto text-leaf" size={32} aria-hidden="true" />
          <p className="mt-3 font-semibold">No open alerts</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const unit = alert.unitId;
            return (
              <article key={alert._id} className="rounded-md border border-line bg-panel p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-normal text-danger">
                      Replace filter
                    </p>
                    {unit ? (
                      <>
                        <Link
                          to={`/units/${unit._id}`}
                          className="focus-ring mt-1 inline-flex rounded-md text-lg font-semibold text-ink hover:text-aqua"
                        >
                          {unit.roomName}
                        </Link>
                        <p className="text-sm text-slate-600">{compactSite(unit.siteId)}</p>
                      </>
                    ) : (
                      <p className="mt-1 text-lg font-semibold">Deleted unit</p>
                    )}
                    <p className="mt-2 text-sm text-slate-500">
                      Opened {formatDateTime(alert.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!unit || busyId === alert._id}
                    onClick={() => markReplaced(alert)}
                    className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-aqua bg-aqua px-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Mark Replaced
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
