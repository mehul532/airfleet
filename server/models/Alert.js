import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["replace_filter"],
      required: true
    },
    createdAt: { type: Date, default: Date.now, index: true },
    resolved: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date, default: null }
  },
  { versionKey: false }
);

export default mongoose.model("Alert", alertSchema);
