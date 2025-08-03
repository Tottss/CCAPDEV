const express = require('express');
const router = express.Router();
const Room = require('../models/Classes'); 
const { requireAuth, requireRole } = require('../middleware/authentication');

const logError = require('../logError');

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
    await logError(err, 'GET /api/rooms/:roomCode/:date');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
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
    await logError(err, 'GET /api/rooms/:room/:date/:time');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// router.post('/api/admin/reserve', requireAuth, requireRole('admin'), async (req, res) => {
//   const { room, date, time, seats, action, reservedBy, reservationDate } = req.body;

//   if (!room || !date || !time || !Array.isArray(seats) || seats.length === 0 || !action) {
//     return res.status(400).json({ message: "Missing reservation data." });
//   }

//   try {
//     const roomDoc = await Room.findOne({ roomCode: room });
//     if (!roomDoc) return res.status(404).json({ message: "Room not found." });

//     const dateRes = roomDoc.reservations.find(r => r.date === date);
//     if (!dateRes) return res.status(404).json({ message: "Date not found." });

//     const slot = dateRes.slots.find(s => s.time === time);
//     if (!slot) return res.status(404).json({ message: "Time slot not found." });

//     // check for conflicts
//     // const conflict = seats.some(seatNum =>
//     //   slot.seats.some(seat => seat.seatNumber === seatNum && seat.isReserved)
//     // );
//     // if (conflict) {
//     //   return res.status(409).json({ message: "One or more seats already reserved." });
//     // }

//     seats.forEach(seatNum => {
//       const seat = slot.seats.find(s => s.seatNumber === seatNum);
//       if (!seat) return;

//       switch(action) {
//         case "reserve":
//           // check for conflicts only for reservation
//           if (seat.isReserved || seat.isBlocked) {
//             return res.status(409).json({ 
//               message: `Seat ${seatNum} is already taken.` 
//             });
//           }
//           seat.isReserved = true;
//           seat.reservedBy = reservedBy;
//           seat.isBlocked = false;
//           seat.reservationDate = reservationDate;
//           if (!slot.reservedSeats.includes(seat.seatNumber)) {
//             slot.reservedSeats.push(seat.seatNumber);
//           }
//           break;
          
//         case "remove":
//           seat.isReserved = false;
//           seat.isBlocked = false;
//           seat.reservedBy = null;
//           seat.reservationDate = null;

//           const index = slot.reservedSeats.indexOf(seatNum);
//           if (index > -1) {
//             slot.reservedSeats.splice(index, 1);
//           }
//           break;
          
//         case "block":
//           seat.isBlocked = true;
//           seat.isReserved = false;
//           seat.reservedBy = null;
//           seat.reservationDate = null;

//           const blockIndex = slot.reservedSeats.indexOf(seatNum);
//           if (blockIndex > -1) {
//             slot.reservedSeats.splice(blockIndex, 1);
//           }
//           break;
          
//         default:
//           return res.status(400).json({ message: "Invalid action type" });
//       }
//     });

//     await roomDoc.save();
//     res.status(200).json({ message: "Operation completed successfully." });
//   } catch (err) {
//     await logError(err, 'POST /api/admin/reserve');
//     console.error(err);
//     res.status(500).json({ message: "Server error: " + err.message });
//   }
// });

router.post('/api/admin/reserve', requireAuth, requireRole('admin'), async (req, res) => {
  const { room, date, time, seatNumber, reservedBy, reservationDate } = req.body;

  try {
    // Atomically reserve the seat only if it's not already reserved or blocked
    const updatedRoom = await Room.findOneAndUpdate(
      {
        roomCode: room,
        "reservations.date": date,
        "reservations.slots.time": time,
        "reservations.slots.seats": {
          $elemMatch: {
            seatNumber: seatNumber,
            isReserved: false,
            isBlocked: false
          }
        }
      },
      {
        $set: {
          "reservations.$[dateElem].slots.$[slotElem].seats.$[seatElem].isReserved": true,
          "reservations.$[dateElem].slots.$[slotElem].seats.$[seatElem].reservedBy": reservedBy,
          "reservations.$[dateElem].slots.$[slotElem].seats.$[seatElem].reservationDate": reservationDate
        },
        $addToSet: {
          "reservations.$[dateElem].slots.$[slotElem].reservedSeats": seatNumber
        }
      },
      {
        arrayFilters: [
          { "dateElem.date": date },
          { "slotElem.time": time },
          { "seatElem.seatNumber": seatNumber }
        ],
        new: true
      }
    );

    if (!updatedRoom) {
      return res.status(409).json({ message: `Seat ${seatNumber} is already reserved or blocked.` });
    }

    res.json({ message: `Seat ${seatNumber} reserved successfully.` });
  } catch (err) {
    await logError(err, 'POST /api/admin/reserve');
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;