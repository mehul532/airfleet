import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { startServer } from "../index.js";

dotenv.config();

const mongo = await MongoMemoryServer.create();
const port = Number(process.env.PORT) || 4000;

const { server, simulatorTimer } = await startServer({
  mongoUri: mongo.getUri(),
  port,
  simulatorEnabled: process.env.SIMULATOR_ENABLED !== "false"
});

console.log(`In-memory MongoDB running for AirFleet at ${mongo.getUri()}`);

async function shutdown() {
  simulatorTimer?.close?.();
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
