const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes/route');
const Url = require("./models/url.model");
const { logAnalytics } = require("./services/analytics.service");
const { isExpired } = require("./utils/urlExpiry");

require('dotenv').config();
const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));


app.use('/api', routes); // Mount API routes first

app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    // Look up either customAlias or shortId
    const urlDoc = await Url.findOne({
      $or: [{ shortId }, { customAlias: shortId }]
    });

    if (!urlDoc || !urlDoc.isActive) {
      return res.status(404).json({ success: false, message: "URL not found or inactive" });
    }

    // Expiry validation
    if (isExpired(urlDoc)) {
      // mark inactive permanently
      urlDoc.isActive = false;
      await urlDoc.save();
      return res.status(410).json({ success: false, message: "URL expired and disabled" });
    }
    // Increment click count
    urlDoc.clickCount += 1;
    await urlDoc.save();
    // Log analytics
    logAnalytics(req, urlDoc);

    if (urlDoc.password) {
      // Allow browser to handle redirect to unlock page
      return res.redirect(`${process.env.FRONTEND_URL}/unlock/${shortId}`);
    }

    if (urlDoc.isPrivate) {
      return res.redirect(`${process.env.FRONTEND_URL}/unlock/${shortId}`);
    }

    return res.redirect(urlDoc.originalUrl);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.use('/api', routes);



module.exports = app;
