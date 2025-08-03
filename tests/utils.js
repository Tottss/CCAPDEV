const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createUser(role = 'student', options = {}) {
  const { 
    email = `${role}@example.com`, 
    password = 'password123',
    username = `${role}${Math.floor(Math.random() * 1000)}`
  } = options;
  
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email,
    username,
    password: hashed,
    role,
  });
  return { user, plainPassword: password };
}

module.exports = { createUser };
