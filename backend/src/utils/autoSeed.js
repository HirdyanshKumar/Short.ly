const mongoose= require("mongoose") ;

const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require( "../models/user.model.js");
const Url = require ("../models/url.model.js");
const Analytics = require ("../models/analytics.model.js");

const MONGO_URI = process.env.MONGO_URI;

const countries = ["IN", "US", "UK", "DE", "AU", "CA"];
const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];
const devices = ["desktop", "mobile", "tablet"];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithin(days) {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seedLarge() {
  try {
    console.log("🌱 Connecting...");
    await mongoose.connect(process.env.MONGO_URL, { autoIndex: true });

    console.log("🧨 Clearing Existing Data...");
    await User.deleteMany({});
    await Url.deleteMany({});
    await Analytics.deleteMany({});

    console.log("👤 Creating Primary Demo User...");
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "Demo Test User",
      email: "demo@mail.com",
      password: passwordHash,
    });

    console.log("🔗 Generating 20 URLs...");
    let urls = [];
    for (let i = 0; i < 20; i++) {
      const withPassword = Math.random() < 0.2; // 20% password-protected
      const isPrivate = Math.random() < 0.15;   // 15% private URLs
      const expired = Math.random() < 0.1;      // 10% expired URLs

      urls.push({
        originalUrl: `https://example-${i}.com`,
        shortId: `seed${i}`,
        user: user._id,
        isPrivate,
        password: withPassword ? await bcrypt.hash("1234", 10) : null,
        expiryDate: expired ? new Date(Date.now() - 86400000) : null,
        clickCount: Math.floor(Math.random() * 200)
      });
    }

    const insertedUrls = await Url.insertMany(urls);
    console.log(`📌 Inserted URLs: ${insertedUrls.length}`);

    console.log("📊 Creating 1000 Analytics logs...");
    let analyticsBatch = [];
    for (let x = 0; x < 1000; x++) {
      const u = insertedUrls[Math.floor(Math.random() * insertedUrls.length)];
      analyticsBatch.push({
        url: u._id,
        country: random(countries),
        browser: random(browsers),
        device: random(devices),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp: randomDateWithin(30)
      });
    }

    await Analytics.insertMany(analyticsBatch);
    console.log("📊 Analytics Seed Inserted: 10,000");

    console.log("🎯 DONE – LARGE SEED COMPLETED");
    console.log("Login Using:");
    console.log("Email: demo@mail.com");
    console.log("Password: password123");

    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR", err);
    process.exit(1);
  }
}

seedLarge();
