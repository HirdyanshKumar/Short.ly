const express = require('express');
const router = express.Router();
const authRoutes = require("./auth.routes");
const urlRoutes = require("./url.routes");
const analyticsRoutes = require("./analytics.routes");
const qrRoutes = require("./qr.routes");
const unlockRoutes = require("./unlock.routes");


router.use("/auth", authRoutes);
router.use("/url", urlRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/qr", qrRoutes);
router.use("/unlock", unlockRoutes);

router.get('/status', (req, res) => {
  res.json({ status: 'API is running' });
});

module.exports = router;