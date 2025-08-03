const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  message: String,
  stack: String,
  location: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Errors', errorSchema);