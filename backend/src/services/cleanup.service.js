const Url = require("../models/url.model");

exports.cleanupExpiredUrls = async () => {
  try {
    const result = await Url.deleteMany({
      expiryDate: { $lte: new Date() }
    });
    console.log("🧹 Cleanup completed — deleted:", result.deletedCount);
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
};
