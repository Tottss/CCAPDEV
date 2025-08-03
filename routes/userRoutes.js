const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // adjust path if needed
const Room = require('../models/Classes');
const router = express.Router();
const bcrypt = require('bcrypt');
const { requireAuth, requireRole } = require('../middleware/authentication');

const logError = require('../logError');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.params.id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Upload profile picture route
router.post('/:id/pfp', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: req.file.filename },
      { new: true }
    );
    if (!user) return res.status(404).send("User not found");
    res.send({ message: "Profile picture updated", filename: req.file.filename });
  } catch (err) {
    await logError(err, 'POST /:id/pfp');
    console.error(err);
    res.status(500).send("Error uploading profile picture");
  }
  console.log("Received file:", req.file);
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.json(user);
});

router.post('/login', async(req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({error:'Invalid username'});
    }
    if (!(await user.comparePassword(password))) { // compares hashed passwords
      return res.status(401).json({error:'Invalid password'});
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      firstname: user.firstName,
      lastname: user.lastName
    };

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({ message: 'Login successful', user: req.session.user });
    });
  } catch (err) {
    await logError(err, 'POST /login');
      console.error(err);
      res.status(500).json({error:'Server Error'});
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
    await logError(err, 'POST /signup');
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
    await logError(err, 'POST /signup');
    res.status(500).send("Error fetching users.");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    await logError(err, 'GET /users');
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
    await logError(err, 'GET /:id');
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// view reservations fetch db
router.get('/view_reservation/:username', async (req, res) => {
  const username = req.params.username;

  try {
    const rooms = await Room.find();
    const userReservations = [];

    rooms.forEach(room => {
      room.reservations.forEach(dateEntry => {
        dateEntry.slots.forEach(slot => {
          slot.seats.forEach(seat => {
            if (seat.reservedBy === username) {
              userReservations.push({
                roomCode: room.roomCode,
                date: dateEntry.date,
                time: slot.time,
                seatNumber: seat.seatNumber,
                isAnnonymous: seat.isAnonymous ? 'Anonymous' : 'Public',
                reservedBy: seat.reservedBy,
                reservationDate: seat.reservationDate,
              });
            }
          });
        });
      });
    });

    res.json(userReservations);
  } catch (err) {
    await logError(err, 'GET /view_reservation/:username');
    console.error("Error fetching reservations:", err);
    res.status(500).send("Error fetching reservations");
  }
});
//cancel res
// btw the implementation of this just sets
// reservedBy and reservationDate to null
// it doesnt actually delete the record
router.delete('/cancel_reservation', async (req, res) => {
  const { roomCode, date, time, reservedBy } = req.body;

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const dateEntry = room.reservations.find(r => r.date === date);
    if (!dateEntry) return res.status(404).json({ message: 'Date not found' });

    const slot = dateEntry.slots.find(s => s.time === time);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    let removedCount = 0;

    slot.seats.forEach(seat => {
      if (seat.reservedBy === reservedBy) {
        seat.reservedBy = null;
        seat.reservationDate = null;
        seat.isReserved = false;
        seat.isAnonymous = false;

        // Remove from reservedSeats if it's there
        const index = slot.reservedSeats.indexOf(seat.seatNumber);
        if (index !== -1) {
          slot.reservedSeats.splice(index, 1);
        }

        removedCount++;
      }
    });

    await room.save();

    res.json({ message: `${removedCount} seat(s) cancelled successfully.` });
  } catch (err) {
    await logError(err, 'DELETE /cancel_reservation');
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => { // destory session
    res.redirect('/login');
  });
});


router.post('/:id/deleteWithPassword', async (req, res) => {
  console.log("Delete request received for:", req.params.id);
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password." });

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "User deleted." });
  } catch (err) {
    await logError(err, 'POST /:id/deleteWithPassword');
    console.error("Error in deleteWithPassword route:", err);
    return res.status(500).json({ error: "Server error." });
  }
});
module.exports = router;
