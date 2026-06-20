import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    profile: {
      type: String,
      enum: ["wildfire_spike", "chronic_high"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Site", siteSchema);
