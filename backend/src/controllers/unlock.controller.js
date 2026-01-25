const Url = require("../models/url.model");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response");

exports.unlockUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.body;

    const url = await Url.findOne({
      $or: [{ shortId }, { customAlias: shortId }]
    });

    if (!url || !url.isActive) return error(res, "URL not found or inactive", 404);
    if (!url.password) return error(res, "This URL is not password protected", 400);

    const isMatch = await bcrypt.compare(password, url.password);
    if (!isMatch) return error(res, "Wrong password", 403);

    return success(res, { originalUrl: url.originalUrl }, "Unlocked");
  } catch (err) {
    return error(res, err.message, 500);
  }
};
