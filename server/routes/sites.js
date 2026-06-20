import express from "express";
import Alert from "../models/Alert.js";
import Reading from "../models/Reading.js";
import Site from "../models/Site.js";
import Unit from "../models/Unit.js";
import { asyncHandler } from "../utils.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sites = await Site.find().sort({ country: 1, name: 1 });
    res.json(sites);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ message: "Site not found" });
    return res.json(site);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const site = await Site.create(req.body);
    res.status(201).json(site);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!site) return res.status(404).json({ message: "Site not found" });
    return res.json(site);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const units = await Unit.find({ siteId: req.params.id }).select("_id");
    const unitIds = units.map((unit) => unit._id);

    await Reading.deleteMany({ unitId: { $in: unitIds } });
    await Alert.deleteMany({ unitId: { $in: unitIds } });
    await Unit.deleteMany({ siteId: req.params.id });
    const site = await Site.findByIdAndDelete(req.params.id);

    if (!site) return res.status(404).json({ message: "Site not found" });
    return res.status(204).send();
  })
);

export default router;
