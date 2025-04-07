const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
  description: { type: String, required: true },
  rating: {
    rate: { type: Number, required: true },
    count: { type: Number, required: true },
  },
});

module.exports = mongoose.model('Product', productSchema);
