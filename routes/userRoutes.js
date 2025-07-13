const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async(req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send('Invalid username');
    }
    if (user.password !== password) {
      return res.status(401).send('Invalid password');
    }

    res.json({ message: 'Login successful', user });
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/signup', async(req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(401).send('Username already taken.');
    }
    
    const newUser = new User({ firstName, lastName, email, username, password });
    await newUser.save();

    res.send('Signup successful');
  }

  catch (err) {
    console.error(err);
    res.status(500).send('Server Error during signup');
  }
});

// View all registered users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render('partials/users', { users });
  } catch (err) {
    res.status(500).send("Error fetching users.");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
