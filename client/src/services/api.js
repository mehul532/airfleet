const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.message ?? message;
    } catch {
      // Keep the HTTP status message when the server has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  listSites: () => request("/sites"),
  createSite: (payload) =>
    request("/sites", { method: "POST", body: JSON.stringify(payload) }),
  updateSite: (id, payload) =>
    request(`/sites/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSite: (id) => request(`/sites/${id}`, { method: "DELETE" }),

  listUnits: () => request("/units"),
  getUnit: (id) => request(`/units/${id}`),
  createUnit: (payload) =>
    request("/units", { method: "POST", body: JSON.stringify(payload) }),
  updateUnit: (id, payload) =>
    request(`/units/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUnit: (id) => request(`/units/${id}`, { method: "DELETE" }),
  getUnitStatus: (id) => request(`/units/${id}/status`),
  listReadings: (id, limit = 100) => request(`/units/${id}/readings?limit=${limit}`),
  resetFilter: (id) => request(`/units/${id}/reset-filter`, { method: "POST" }),

  listAlerts: () => request("/alerts"),
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: "PATCH" }),
  fastForward: (days = 30) =>
    request("/simulator/fast-forward", {
      method: "POST",
      body: JSON.stringify({ days })
    })
};
