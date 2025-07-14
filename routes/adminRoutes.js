const express = require('express');
const router = express.Router();
const Room = require('../models/Classes');

const adminCheck = (req, res, next) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.post('/api/rooms/:roomCode/:date/:time', adminCheck, async (req, res) => {
  const { room, date, time, seats, action, reservedBy } = req.body;

  if (!room || !date || !time || !Array.isArray(seats) || seats.length === 0 || !action) {
    return res.status(400).json({ message: "Missing reservation data." });
  }

  try {
    const roomDoc = await Room.findOne({ roomCode: room });
    if (!roomDoc) return res.status(404).json({ message: "Room not found." });

    const dateRes = roomDoc.reservations.find(r => r.date === date);
    if (!dateRes) return res.status(404).json({ message: "Date not found." });

    const slot = dateRes.slots.find(s => s.time === time);
    if (!slot) return res.status(404).json({ message: "Time slot not found." });

    // process each seat based on action
    slot.seats.forEach(seat => {
      if (seats.includes(seat.seatNumber)) {
        switch (action) {
          case 'reserve':
            seat.isReserved = true;
            seat.reservedBy = reservedBy || 'Student';
            seat.isAnonymous = false;
            if (!slot.reservedSeats.includes(seat.seatNumber)) {
              slot.reservedSeats.push(seat.seatNumber);
            }
            break;
          
          case 'remove':
            seat.isReserved = false;
            seat.reservedBy = undefined;
            seat.isAnonymous = false;
            slot.reservedSeats = slot.reservedSeats.filter(s => s !== seat.seatNumber);
            break;
          
          case 'block':
            seat.isBlocked = true;
            seat.isReserved = false;
            seat.reservedBy = undefined;
            slot.reservedSeats = slot.reservedSeats.filter(s => s !== seat.seatNumber);
            break;
            
          case 'unblock':
            seat.isBlocked = false;
            break;
        }
      }
    });

    await roomDoc.save();
    res.status(200).json({ message: `Operation ${action} completed successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;