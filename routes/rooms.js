const express = require('express');
const router = express.Router();
const Room = require('../models/Classes'); 



router.get('/api/rooms/:roomCode/:date', async (req, res) => {
  const { roomCode, date } = req.params;

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const reservation = room.reservations.find(r => r.date === date);
    if (!reservation) return res.json([]);

    const slots = reservation.slots.map(slot => ({
      time: slot.time,
      cap: slot.cap,
      reserved: slot.reservedSeats.length
    }));

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;