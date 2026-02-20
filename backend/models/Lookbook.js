const mongoose = require('mongoose');

const hotspotSchema = new mongoose.Schema({
  x: { type: Number, required: true }, // Percentage 0-100
  y: { type: Number, required: true }, // Percentage 0-100
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

const lookbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: String,
  hotspots: [hotspotSchema],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lookbook', lookbookSchema);
