const express = require('express');
const router = express.Router();
const Room = require('../models/Room'); 

router.get('/api/room', async (req, res) => {
  const { roomCode, date } = req.query;

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const reservationForDate = room.reservations.find(r => r.date === date);
    if (!reservationForDate) return res.status(200).json({ slots: [] });
s
    res.json({ slots: reservationForDate.slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;