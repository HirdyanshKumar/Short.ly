const Analytics = require("../models/analytics.model");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

exports.logAnalytics = async (req, urlDoc) => {
  try {
    const ua = UAParser(req.headers["user-agent"]);
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Handle comma-separated IPs (x-forwarded-for can be a list)
    if (ip && typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Handle Localhost (::1 or 127.0.0.1) -> Use a dummy IP so analytics show data in dev
    if (ip === "::1" || ip === "127.0.0.1" || ip.includes("::ffff:")) {
      ip = "8.8.8.8"; // Google Public DNS (US) for testing
    }

    const geo = geoip.lookup(ip);

    await Analytics.create({
      url: urlDoc._id,
      ip,
      userAgent: req.headers["user-agent"],
      referrer: req.headers.referer || null,
      country: geo?.country || null,
      device: ua.device?.type || "desktop",
      os: ua.os?.name,
      browser: ua.browser?.name,
    });
  } catch (err) {
    console.error("Analytics log failed", err);
  }
};
