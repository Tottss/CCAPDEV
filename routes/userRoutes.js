const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // adjust path if needed
const Room = require('../models/Classes');
const router = express.Router();

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
    console.error(err);
    res.status(500).send("Error uploading profile picture");
  }
  console.log("Received file:", req.file);
});

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
    console.error("Error fetching reservations:", err);
    res.status(500).send("Error fetching reservations");
  }
});
//cancel res
// btw the implementation of this just sets
// reservedBy and reservationDate to null
// it doesnt actually delete the record
router.delete('/cancel_reservation', async (req, res) => {
  const { roomCode, date, time, seatNumber } = req.body;

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const dateEntry = room.reservations.find(res => res.date === date);
    if (!dateEntry) {
      return res.status(404).json({ message: 'Date not found' });
    }
    const slot = dateEntry.slots.find(s => s.time === time);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const seat = slot.seats.find(seat => seat.seatNumber === seatNumber);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    seat.reservedBy = null;
    seat.reservationDate = null;

    await room.save();

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
});


module.exports = router;
