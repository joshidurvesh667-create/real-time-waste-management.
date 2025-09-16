// BACKEND/models/Waste.js
const mongoose = require("mongoose");

const WasteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },   // E-Waste, Glass, Food, etc.
  details: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Waste", WasteSchema);
