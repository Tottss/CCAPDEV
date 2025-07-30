const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) // if the password is modified (new user or password change)
    return next(); // Only hash if password is new or modified, it skips hashing

  try { // if password was modified
    const salt = await bcrypt.genSalt(10); // generates a salt (random data) with a complexity factor of 10
    this.password = await bcrypt.hash(this.password, salt); // hashes password combined with the salt, and replaces plaintext password
    next();
  } catch (err) {
    next(err);
  }
});

// password comparison method (both hashed passwords)
userSchema.methods.comparePassword = function (candidatePassword) { // basically, method for login verification
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);