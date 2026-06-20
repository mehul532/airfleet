import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import alertsRouter from "./routes/alerts.js";
import simulatorRouter from "./routes/simulator.js";
import sitesRouter from "./routes/sites.js";
import unitsRouter from "./routes/units.js";
import { seedDemoData } from "./seed.js";
import { startSimulator } from "./services/simulator.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const simulatorIntervalMs = Number(process.env.SIMULATOR_INTERVAL_MS) || 10000;

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

async function bootstrap() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri);
  await seedDemoData();

  if (process.env.SIMULATOR_ENABLED !== "false") {
    startSimulator(simulatorIntervalMs);
  }

  app.listen(port, () => {
    console.log(`AirFleet API listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start AirFleet API", error);
  process.exit(1);
});
