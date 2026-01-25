const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
    customAlias: {
        type: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: null }, 
    expiryDate: { type: Date, default: null },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

urlSchema.index({ shortId: 1 });
urlSchema.index({ user: 1 });
urlSchema.index({ expiryDate: 1 });


module.exports = mongoose.model("Url", urlSchema);
