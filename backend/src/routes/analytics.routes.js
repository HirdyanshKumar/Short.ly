const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { getSummary, getDailyChart, getBreakdown } = require("../controllers/analytics.controller");

router.get("/:id/summary", auth, getSummary);
router.get("/:id/chart", auth, getDailyChart);
router.get("/:id/breakdown", auth, getBreakdown);

module.exports = router;
