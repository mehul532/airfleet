import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../app.js";
import { seedDemoData } from "../seed.js";

const mongo = await MongoMemoryServer.create();

try {
  await mongoose.connect(mongo.getUri());
  await seedDemoData();

  const app = createApp();

  const health = await request(app).get("/api/health").expect(200);
  assert.equal(health.body.ok, true);

  const sites = await request(app).get("/api/sites").expect(200);
  assert.equal(sites.body.length, 2);

  const units = await request(app).get("/api/units").expect(200);
  assert.equal(units.body.length, 8);

  await request(app).post("/api/simulator/tick").expect(200);

  const unitId = units.body[0]._id;
  const status = await request(app).get(`/api/units/${unitId}/status`).expect(200);
  assert.equal(status.body.unit._id, unitId);
  assert.equal(typeof status.body.powerState, "boolean");
  assert.equal(typeof status.body.filterLifePercent, "number");

  const fastForward = await request(app)
    .post("/api/simulator/fast-forward")
    .send({ days: 30 })
    .expect(200);
  assert.ok(fastForward.body.readingsCreated > 0);

  const alerts = await request(app).get("/api/alerts").expect(200);
  assert.ok(alerts.body.length > 0);

  await request(app).post(`/api/units/${alerts.body[0].unitId._id}/reset-filter`).expect(200);

  console.log("API verification passed");
} finally {
  await mongoose.disconnect();
  await mongo.stop();
}
