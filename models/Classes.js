const mongoose = require('mongoose');

// Schema for each time slot
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },   // e.g., 1, 2, 3, ..., 20
  isReserved: { type: Boolean, default: false },
  reservedBy: { type: String, default: null },  // user ID or name of the person who reserved the seat
  isBlocked: { type: Boolean, default: false },
  reservationDate: { type: String, default: null },
  isAnonymous: { type: Boolean, default: false } // true if the reservation is anonymous   
});

const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true },             // "0730 - 0800"
  cap: { type: Number, required: true },              // Total seats, e.g., 20
  reservedSeats: [{ type: Number }],                   // e.g., [1, 3, 5, 6, 20]
  // professor: { type: String, required: true },
  seats: [seatSchema]
});

// Schema for each date inside a room
const dateReservationSchema = new mongoose.Schema({
  date: { type: String, required: true },     // e.g., "2025-06-18"
  slots: [timeSlotSchema]                     // array of timeSlotSchema
});

// Schema for each room
const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },     // e.g., "G201"
  reservations: [dateReservationSchema]           // array of dates with slots
});

module.exports = mongoose.model('Room', roomSchema);