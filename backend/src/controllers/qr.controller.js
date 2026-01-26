const QRCode = require("qrcode");
const Url = require("../models/url.model");
const { success, error } = require("../utils/response");

exports.getQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const urlDoc = await Url.findOne({ _id: id, user: req.user.id });
    if (!urlDoc) return error(res, "URL not found or unauthorized", 404);

    const shortUrl = `${process.env.BASE_URL}/${urlDoc.customAlias || urlDoc.shortId}`;

    const qr = await QRCode.toDataURL(shortUrl);

    return success(res, { qr, shortUrl }, "QR generated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};
