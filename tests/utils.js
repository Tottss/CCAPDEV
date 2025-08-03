const User = require('../models/User');

async function createUser(role = 'student', options = {}) {
  const { 
    email = `${role}@example.com`, 
    password = 'password123',
    username = `${role}${Math.floor(Math.random() * 1000)}`
  } = options;
  
  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email,
    username,
    password, // plain password, schema will hash
    role,
  });
  return { user, plainPassword: password };
}
module.exports = { createUser };