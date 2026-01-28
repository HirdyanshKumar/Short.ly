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

    return success(res, {
      totalClicks,
      uniqueUsers,
      shortId: url.customAlias || url.shortId,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt
    });
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
      { $project: { _id: 0, date: "$_id", clicks: 1 } }
    ]);

    return success(res, { chartData: chart });
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

    const formatData = (data) => {
      const result = {};
      data.forEach(item => {
        result[item._id || 'Unknown'] = item.count;
      });
      return result;
    };

    const deviceData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    const countryData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ]);

    const browserData = await Analytics.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: "$browser", count: { $sum: 1 } } }
    ]);

    return success(res, {
      devices: formatData(deviceData),
      locations: formatData(countryData),
      browsers: formatData(browserData)
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
