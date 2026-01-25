
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    url: { type: mongoose.Schema.Types.ObjectId, ref: "Url", required: true },
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    referrer: String,
    country: String,
    device: String,
    os: String,
    browser: String,
  },
  { timestamps: true }
);

analyticsSchema.index({ url: 1, timestamp: -1 });



module.exports = mongoose.model("Analytics", analyticsSchema);
