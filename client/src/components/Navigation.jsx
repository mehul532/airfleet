import { Activity, Bell, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alerts", label: "Alerts", icon: Bell }
];

export default function Navigation() {
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-aqua text-white">
            <Activity size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">AirFleet Orchestrator</h1>
            <p className="text-sm text-slate-600">Fleet controls for CR-box air filtration</p>
          </div>
        </div>
        <nav className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "focus-ring inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                    isActive
                      ? "border-aqua bg-aqua text-white"
                      : "border-line bg-panel text-slate-700 hover:border-aqua hover:text-ink"
                  ].join(" ")
                }
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
