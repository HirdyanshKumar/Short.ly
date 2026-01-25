const Url = require("../models/url.model");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { success, error } = require("../utils/response");
const { isExpired } = require("../utils/urlExpiry");
const createSchema = Joi.object({
  originalUrl: Joi.string().uri().required(),
  customAlias: Joi.string().alphanum().min(3).max(20).optional(),
  expiryDate: Joi.date().optional(),
  isPrivate: Joi.boolean().optional(),
  password: Joi.string().min(6).optional(),
});


exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate, isPrivate, password } = req.body;



    const { error: validationError } = createSchema.validate(req.body);
    if (validationError) return error(res, validationError.message, 400);

    // Check if custom alias already exists
    if (customAlias) {
      const exists = await Url.findOne({ customAlias });
      if (exists) return error(res, "Custom alias already taken", 409);
    }

    const shortId = nanoid(8); // e.g., aB3dX8pQ
    let hashedPassword = null;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const url = await Url.create({
      originalUrl,
      shortId,
      customAlias,
      user: req.user.id,
      expiryDate,
      isPrivate: isPrivate || false,
      password: hashedPassword
    });

    const shortUrl = `${process.env.BASE_URL}/${shortId}`;

    return success(res, { shortUrl, url }, "Short URL created");
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// List all user's URLs
exports.getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });
    return success(res, urls, "My URLs fetched");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getUrlDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findOne({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);
    return success(res, url);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


exports.deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findOneAndDelete({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);
    return success(res, null, "Deleted");
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Toggle Active/Inactive
exports.toggleUrlStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findOne({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);
    if (isExpired(url)) return error(res, "Cannot toggle. URL expired.", 400);
    url.isActive = !url.isActive;
    await url.save();
    return success(res, url, `URL is now ${url.isActive ? "active" : "inactive"}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Update custom alias
exports.updateAlias = async (req, res) => {
  try {
    const { id } = req.params;
    const { customAlias } = req.body;

    if (!customAlias) return error(res, "Alias required", 400);
    const exists = await Url.findOne({ customAlias });
    if (exists) return error(res, "Alias already taken", 409);

    const url = await Url.findOne({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);
    if (isExpired(url)) return error(res, "Cannot update alias. URL expired.", 400);


    url.customAlias = customAlias;
    await url.save();

    return success(res, url, "Alias updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updatePrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPrivate, password } = req.body;

    const url = await Url.findOne({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);

    url.isPrivate = Boolean(isPrivate);

    // If enabling privacy and password provided, update it
    if (url.isPrivate && password) {
      url.password = await bcrypt.hash(password, 10);
    }

    await url.save();

    return success(res, url, `Privacy updated – now ${url.isPrivate ? "PRIVATE" : "PUBLIC"}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;

    const url = await Url.findOne({ _id: id, user: req.user.id });
    if (!url) return error(res, "URL not found", 404);

    url.expiryDate = expiryDate;
    await url.save();

    return success(res, url, "Expiry updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};
