import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { seedDemoData } from "./seed.js";
import { startSimulator } from "./services/simulator.js";

dotenv.config();

export async function startServer(options = {}) {
  const mongoUri = options.mongoUri ?? process.env.MONGO_URI;
  const port = Number(options.port ?? process.env.PORT) || 4000;
  const simulatorIntervalMs =
    Number(options.simulatorIntervalMs ?? process.env.SIMULATOR_INTERVAL_MS) || 10000;
  const simulatorEnabled = options.simulatorEnabled ?? process.env.SIMULATOR_ENABLED !== "false";

  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
  await seedDemoData();

  const simulatorTimer = simulatorEnabled ? startSimulator(simulatorIntervalMs) : null;
  const app = createApp();

  const server = app.listen(port, () => {
    console.log(`AirFleet API listening on http://localhost:${port}`);
  });

  return { app, server, simulatorTimer };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer().catch((error) => {
    console.error("Failed to start AirFleet API", error);
    process.exit(1);
  });
}
