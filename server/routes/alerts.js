import express from "express";
import Alert from "../models/Alert.js";
import { asyncHandler } from "../utils.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = req.query.includeResolved === "true" ? {} : { resolved: false };
    const alerts = await Alert.find(filter)
      .populate({
        path: "unitId",
        populate: { path: "siteId" }
      })
      .sort({ resolved: 1, createdAt: 1 });
    res.json(alerts);
  })
);

router.patch(
  "/:id/resolve",
  asyncHandler(async (req, res) => {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    return res.json(alert);
  })
);

export default router;
