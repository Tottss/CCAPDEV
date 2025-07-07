const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);