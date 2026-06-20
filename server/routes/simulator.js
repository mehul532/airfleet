import express from "express";
import { fastForwardSimulation, runSimulatorTick } from "../services/simulator.js";
import { asyncHandler } from "../utils.js";

const router = express.Router();

router.post(
  "/tick",
  asyncHandler(async (_req, res) => {
    const readings = await runSimulatorTick();
    res.json({ readingsCreated: readings.length });
  })
);

router.post(
  "/fast-forward",
  asyncHandler(async (req, res) => {
    const days = Number(req.body.days) || 30;
    const result = await fastForwardSimulation(days);
    res.json(result);
  })
);

export default router;
