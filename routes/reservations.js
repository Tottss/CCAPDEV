const express = require('express');
const router = express.Router();
const Room = require('../models/Classes'); 

router.get('/', async (req, res) => {
  const currentUser = req.query.user;   

  if (!currentUser) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const rooms = await Room.find({});
    const out = [];

    rooms.forEach(room => {
      room.reservations.forEach(dateObj => {
        dateObj.slots.forEach(slot => {
          slot.seats.forEach(seat => {
            if (seat.reservedBy === currentUser) {
              out.push({
                room: room.roomCode,
                date: dateObj.date,
                time: slot.time,
                seat: `Seat ${seat.seatNumber}`
              });
            }
          });
        });
      });
    });

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

