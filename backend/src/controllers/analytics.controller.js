const Analytics = require("../models/analytics.model");
const Url = require("../models/url.model");
const { success, error } = require("../utils/response");

// Validate URL ownership
const validateUrlOwnership = async (req, urlId) => {
  return await Url.findOne({ _id: urlId, user: req.user.id });
};

// Total visits summary
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await validateUrlOwnership(req, id);
    if (!url) return error(res, "URL not found or unauthorized", 404);

    const totalClicks = await Analytics.countDocuments({ url: id });

    const uniqueUsersArray = await Analytics.distinct("ip", { url: id });
    const uniqueUsers = uniqueUsersArray.length;

    return success(res, { totalClicks, uniqueUsers });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Daily graph (visits per date)
exports.getDailyChart = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await validateUrlOwnership(req, id);
    if (!url) return error(res, "URL not found or unauthorized", 404);

    const chart = await Analytics.aggregate([
      { $match: { url: url._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: "$clicks" } } // Transform to frontend format
    ]);

    return success(res, chart);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Breakdown by device, country, browser
exports.getBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await validateUrlOwnership(req, id);
    if (!url) return error(res, "URL not found or unauthorized", 404);

    const breakdown = {};

    const formatData = (data) => data.map(item => ({ name: item._id || 'Unknown', value: item.count }));

    const deviceData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);
    breakdown.byDevice = formatData(deviceData);

    const countryData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ]);
    breakdown.byCountry = formatData(countryData);

    const browserData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$browser", count: { $sum: 1 } } }
    ]);
    breakdown.byBrowser = formatData(browserData);

    return success(res, breakdown);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
