import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true
    },
    timestamp: { type: Date, default: Date.now, index: true },
    pm25: { type: Number, required: true, min: 0 },
    powerState: { type: Boolean, required: true }
  },
  { versionKey: false }
);

readingSchema.index({ unitId: 1, timestamp: -1 });

export default mongoose.model("Reading", readingSchema);
