import cors from "cors";
import express from "express";
import morgan from "morgan";
import alertsRouter from "./routes/alerts.js";
import simulatorRouter from "./routes/simulator.js";
import sitesRouter from "./routes/sites.js";
import unitsRouter from "./routes/units.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(",") ?? "http://localhost:5173"
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "airfleet-server" });
  });

  app.use("/api/sites", sitesRouter);
  app.use("/api/units", unitsRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/simulator", simulatorRouter);

  app.use((error, _req, res, _next) => {
    console.error(error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Unexpected server error" });
  });

  return app;
}
