const express = require("express");
const router = express.Router();
const { unlockUrl } = require("../controllers/unlock.controller");

router.post("/:shortId", unlockUrl);

module.exports = router;
