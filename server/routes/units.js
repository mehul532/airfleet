import express from "express";
import Alert from "../models/Alert.js";
import Reading from "../models/Reading.js";
import Unit from "../models/Unit.js";
import { FILTER_CAPACITY } from "../config.js";
import { resetUnitFilter } from "../services/simulator.js";
import { asyncHandler, serializeUnit } from "../utils.js";

const router = express.Router();

async function latestReadingFor(unitId) {
  return Reading.findOne({ unitId }).sort({ timestamp: -1 });
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const units = await Unit.find().populate("siteId").sort({ roomName: 1 });
    const payload = [];

    for (const unit of units) {
      payload.push(serializeUnit(unit, await latestReadingFor(unit._id)));
    }

    res.json(payload);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate("siteId");
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    return res.json(serializeUnit(unit, await latestReadingFor(unit._id)));
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const unit = await Unit.create(req.body);
    const populated = await unit.populate("siteId");
    res.status(201).json(serializeUnit(populated));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("siteId");

    if (!unit) return res.status(404).json({ message: "Unit not found" });
    return res.json(serializeUnit(unit, await latestReadingFor(unit._id)));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await Reading.deleteMany({ unitId: req.params.id });
    await Alert.deleteMany({ unitId: req.params.id });
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    return res.status(204).send();
  })
);

router.post(
  "/:id/readings",
  asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const reading = await Reading.create({
      unitId: unit._id,
      pm25: req.body.pm25,
      powerState: req.body.powerState ?? unit.powerState,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
    });

    res.status(201).json(reading);
  })
);

router.get(
  "/:id/readings",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const readings = await Reading.find({ unitId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(readings.reverse());
  })
);

router.get(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate("siteId");
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const openAlerts = await Alert.find({ unitId: unit._id, resolved: false }).sort({
      createdAt: -1
    });
    const latestReading = await latestReadingFor(unit._id);

    res.json({
      unit: serializeUnit(unit, latestReading),
      currentPm25: latestReading?.pm25 ?? null,
      powerState: unit.powerState,
      filterLifePercent: Math.max(
        0,
        100 - Math.min(100, Math.round((unit.cumulativeParticulateLoad / FILTER_CAPACITY) * 100))
      ),
      thresholdPm25: 35,
      filterCapacity: FILTER_CAPACITY,
      openAlerts
    });
  })
);

router.post(
  "/:id/reset-filter",
  asyncHandler(async (req, res) => {
    const unit = await resetUnitFilter(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    const populated = await unit.populate("siteId");
    return res.json(serializeUnit(populated, await latestReadingFor(unit._id)));
  })
);

export default router;
