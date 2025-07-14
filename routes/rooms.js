const express = require('express');
const router = express.Router();
const Room = require('../models/Classes'); 



router.get('/api/rooms/:roomCode/:date', async (req, res) => { // fetches all timeslots for a date
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

router.get('/api/current-user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    username: req.session.user.username,
    email: req.session.user.email
  });
});

router.get('/api/rooms/:room/:date/:time', async (req, res) => { // fetches details of one timeslot
  const { room, date } = req.params;
  const time = decodeURIComponent(req.params.time);

  try {
    const roomDoc = await Room.findOne({ roomCode: room });
    if (!roomDoc) return res.status(404).json({ error: 'Room not found' });

    const dateReservation = roomDoc.reservations.find(r => r.date === date);
    if (!dateReservation) return res.status(404).json({ error: 'Date not found' });

    const slot = dateReservation.slots.find(s => s.time === time);
    if (!slot) return res.status(404).json({ error: 'Time slot not found' });

    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/api/reserve', async (req, res) => {
  const { room, date, time, seats, reservedBy, isAnonymous } = req.body;

  if (!room || !date || !time || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Missing reservation data." });
  }

  try {
    const roomDoc = await Room.findOne({ roomCode: room });
    if (!roomDoc) return res.status(404).json({ message: "Room not found." });

    const dateRes = roomDoc.reservations.find(r => r.date === date);
    if (!dateRes) return res.status(404).json({ message: "Date not found." });

    const slot = dateRes.slots.find(s => s.time === time);
    if (!slot) return res.status(404).json({ message: "Time slot not found." });

    // check for conflicts
    const conflict = seats.some(seatNum =>
      slot.seats.some(seat => seat.seatNumber === seatNum && seat.isReserved)
    );
    if (conflict) {
      return res.status(409).json({ message: "One or more seats already reserved." });
    }

    // reserve each seat
    slot.seats.forEach(seat => {
      if (seats.includes(seat.seatNumber)) {
        seat.isReserved = true;
        seat.reservedBy = reservedBy;
        seat.isAnonymous = isAnonymous;
        if (!slot.reservedSeats.includes(seat.seatNumber)) {
          slot.reservedSeats.push(seat.seatNumber);
        }
      }
    });

    await roomDoc.save();
    res.status(200).json({ message: "Seats reserved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;