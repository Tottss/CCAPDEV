const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createUser(role = 'student', email = null, password = 'password123') {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email || `${role}@example.com`,
    password: hashed,
    role,
  });
  return { user, plainPassword: password };
}

module.exports = { createUser };
