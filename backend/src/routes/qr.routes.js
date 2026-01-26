const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { getQrCode } = require("../controllers/qr.controller");

router.get("/:id", auth, getQrCode);

module.exports = router;
