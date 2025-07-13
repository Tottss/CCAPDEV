const mongoose = require('mongoose');

// Schema for each time slot
const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true },     // e.g., "0730 - 0800"
  cap: { type: Number, required: true },      // capacity
  reserved: { type: Number, default: 0 }      // how many are reserved
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