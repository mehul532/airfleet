import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true
    },
    roomName: { type: String, required: true, trim: true },
    fanCFM: { type: Number, required: true, min: 1 },
    numFilters: { type: Number, required: true, min: 1, default: 4 },
    roomVolumeM3: { type: Number, required: true, min: 1 },
    baselineCADR: { type: Number, default: 0 },
    filterInstallDate: { type: Date, default: Date.now },
    cumulativeParticulateLoad: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "needs_replacement"],
      default: "active",
      index: true
    },
    powerState: { type: Boolean, default: false },
    aboveThresholdTicks: { type: Number, default: 0 },
    belowThresholdTicks: { type: Number, default: 0 }
  },
  { timestamps: true }
);

unitSchema.pre("validate", function computeBaselineCADR(next) {
  if (this.isModified("fanCFM") || this.baselineCADR === 0) {
    this.baselineCADR = Number((this.fanCFM * 0.0283 * 0.7).toFixed(2));
  }
  next();
});

export default mongoose.model("Unit", unitSchema);
