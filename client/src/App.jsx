import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UnitDetail from "./pages/UnitDetail.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navigation />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/units/:unitId" element={<UnitDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
