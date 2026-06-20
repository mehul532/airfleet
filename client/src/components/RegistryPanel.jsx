import { Save, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const blankSite = {
  name: "",
  city: "",
  country: "",
  profile: "wildfire_spike"
};

const blankUnit = {
  siteId: "",
  roomName: "",
  fanCFM: 420,
  numFilters: 4,
  roomVolumeM3: 180
};

function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "border-aqua bg-aqua text-white hover:bg-cyan-700",
    ghost: "border-line bg-panel text-slate-700 hover:border-aqua hover:text-ink",
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
  };

  return (
    <button
      className={`focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink";

export default function RegistryPanel({ sites, units, onChange }) {
  const [siteForm, setSiteForm] = useState(blankSite);
  const [unitForm, setUnitForm] = useState(blankUnit);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [siteDraft, setSiteDraft] = useState(blankSite);
  const [unitDraft, setUnitDraft] = useState(blankUnit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!unitForm.siteId && sites[0]?._id) {
      setUnitForm((current) => ({ ...current, siteId: sites[0]._id }));
    }
  }, [sites, unitForm.siteId]);

  const siteOptions = useMemo(
    () => sites.map((site) => ({ value: site._id, label: `${site.name} · ${site.city}` })),
    [sites]
  );

  async function submitSite(event) {
    event.preventDefault();
    setError("");
    try {
      await api.createSite(siteForm);
      setSiteForm(blankSite);
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitUnit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.createUnit({
        ...unitForm,
        fanCFM: Number(unitForm.fanCFM),
        numFilters: Number(unitForm.numFilters),
        roomVolumeM3: Number(unitForm.roomVolumeM3)
      });
      setUnitForm({ ...blankUnit, siteId: unitForm.siteId });
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveSite(id) {
    setError("");
    try {
      await api.updateSite(id, siteDraft);
      setEditingSiteId(null);
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveUnit(id) {
    setError("");
    try {
      await api.updateUnit(id, {
        ...unitDraft,
        fanCFM: Number(unitDraft.fanCFM),
        numFilters: Number(unitDraft.numFilters),
        roomVolumeM3: Number(unitDraft.roomVolumeM3)
      });
      setEditingUnitId(null);
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeSite(id) {
    setError("");
    try {
      await api.deleteSite(id);
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUnit(id) {
    setError("");
    try {
      await api.deleteUnit(id);
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="mt-8 border-t border-line pt-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fleet Registry</h2>
          <p className="text-sm text-slate-600">Sites and units are live API records.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitSite} className="rounded-md border border-line bg-panel p-4">
          <h3 className="mb-4 text-base font-semibold">Register Site</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={inputClass}
                required
                value={siteForm.name}
                onChange={(event) => setSiteForm({ ...siteForm, name: event.target.value })}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                required
                value={siteForm.city}
                onChange={(event) => setSiteForm({ ...siteForm, city: event.target.value })}
              />
            </Field>
            <Field label="Country">
              <input
                className={inputClass}
                required
                value={siteForm.country}
                onChange={(event) => setSiteForm({ ...siteForm, country: event.target.value })}
              />
            </Field>
            <Field label="Profile">
              <select
                className={inputClass}
                value={siteForm.profile}
                onChange={(event) => setSiteForm({ ...siteForm, profile: event.target.value })}
              >
                <option value="wildfire_spike">Wildfire spike</option>
                <option value="chronic_high">Chronic high</option>
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Button type="submit">
              <UserPlus size={16} aria-hidden="true" />
              Add Site
            </Button>
          </div>
        </form>

        <form onSubmit={submitUnit} className="rounded-md border border-line bg-panel p-4">
          <h3 className="mb-4 text-base font-semibold">Register Unit</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Site">
              <select
                className={inputClass}
                required
                value={unitForm.siteId}
                onChange={(event) => setUnitForm({ ...unitForm, siteId: event.target.value })}
              >
                {siteOptions.map((site) => (
                  <option key={site.value} value={site.value}>
                    {site.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Room">
              <input
                className={inputClass}
                required
                value={unitForm.roomName}
                onChange={(event) => setUnitForm({ ...unitForm, roomName: event.target.value })}
              />
            </Field>
            <Field label="Fan CFM">
              <input
                className={inputClass}
                min="1"
                required
                type="number"
                value={unitForm.fanCFM}
                onChange={(event) => setUnitForm({ ...unitForm, fanCFM: event.target.value })}
              />
            </Field>
            <Field label="Filters">
              <input
                className={inputClass}
                min="1"
                required
                type="number"
                value={unitForm.numFilters}
                onChange={(event) => setUnitForm({ ...unitForm, numFilters: event.target.value })}
              />
            </Field>
            <Field label="Room m3">
              <input
                className={inputClass}
                min="1"
                required
                type="number"
                value={unitForm.roomVolumeM3}
                onChange={(event) =>
                  setUnitForm({ ...unitForm, roomVolumeM3: event.target.value })
                }
              />
            </Field>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={siteOptions.length === 0}>
              <UserPlus size={16} aria-hidden="true" />
              Add Unit
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-panel p-4">
          <h3 className="mb-3 text-base font-semibold">Sites</h3>
          <div className="space-y-3">
            {sites.map((site) => {
              const editing = editingSiteId === site._id;
              return (
                <div key={site._id} className="grid gap-2 rounded-md border border-line p-3">
                  {editing ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        value={siteDraft.name}
                        onChange={(event) =>
                          setSiteDraft({ ...siteDraft, name: event.target.value })
                        }
                      />
                      <input
                        className={inputClass}
                        value={siteDraft.city}
                        onChange={(event) =>
                          setSiteDraft({ ...siteDraft, city: event.target.value })
                        }
                      />
                      <input
                        className={inputClass}
                        value={siteDraft.country}
                        onChange={(event) =>
                          setSiteDraft({ ...siteDraft, country: event.target.value })
                        }
                      />
                      <select
                        className={inputClass}
                        value={siteDraft.profile}
                        onChange={(event) =>
                          setSiteDraft({ ...siteDraft, profile: event.target.value })
                        }
                      >
                        <option value="wildfire_spike">Wildfire spike</option>
                        <option value="chronic_high">Chronic high</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">{site.name}</p>
                      <p className="text-sm text-slate-600">
                        {site.city}, {site.country} · {site.profile.replace("_", " ")}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      <Button type="button" onClick={() => saveSite(site._id)}>
                        <Save size={16} aria-hidden="true" />
                        Save
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingSiteId(site._id);
                          setSiteDraft({
                            name: site.name,
                            city: site.city,
                            country: site.country,
                            profile: site.profile
                          });
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button type="button" variant="danger" onClick={() => removeSite(site._id)}>
                      <Trash2 size={16} aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-line bg-panel p-4">
          <h3 className="mb-3 text-base font-semibold">Units</h3>
          <div className="space-y-3">
            {units.map((unit) => {
              const editing = editingUnitId === unit._id;
              return (
                <div key={unit._id} className="grid gap-2 rounded-md border border-line p-3">
                  {editing ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select
                        className={inputClass}
                        value={unitDraft.siteId}
                        onChange={(event) =>
                          setUnitDraft({ ...unitDraft, siteId: event.target.value })
                        }
                      >
                        {siteOptions.map((site) => (
                          <option key={site.value} value={site.value}>
                            {site.label}
                          </option>
                        ))}
                      </select>
                      <input
                        className={inputClass}
                        value={unitDraft.roomName}
                        onChange={(event) =>
                          setUnitDraft({ ...unitDraft, roomName: event.target.value })
                        }
                      />
                      <input
                        className={inputClass}
                        type="number"
                        value={unitDraft.fanCFM}
                        onChange={(event) =>
                          setUnitDraft({ ...unitDraft, fanCFM: event.target.value })
                        }
                      />
                      <input
                        className={inputClass}
                        type="number"
                        value={unitDraft.roomVolumeM3}
                        onChange={(event) =>
                          setUnitDraft({ ...unitDraft, roomVolumeM3: event.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">{unit.roomName}</p>
                      <p className="text-sm text-slate-600">
                        {unit.siteId?.name} · {unit.fanCFM} CFM · {unit.roomVolumeM3} m3
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      <Button type="button" onClick={() => saveUnit(unit._id)}>
                        <Save size={16} aria-hidden="true" />
                        Save
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingUnitId(unit._id);
                          setUnitDraft({
                            siteId: unit.siteId?._id,
                            roomName: unit.roomName,
                            fanCFM: unit.fanCFM,
                            numFilters: unit.numFilters,
                            roomVolumeM3: unit.roomVolumeM3
                          });
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button type="button" variant="danger" onClick={() => removeUnit(unit._id)}>
                      <Trash2 size={16} aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
