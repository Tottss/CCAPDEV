const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  contact: String,
  biography: String,
  links: String,
  profilePicture: {
  type: String,
  default: ''
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);