const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../models/Classes');
jest.mock('../logError');

const Room = require('../models/Classes');
const logError = require('../logError');

const roomsRoute = require('../routes/rooms'); // adjust path if needed

const app = express();
app.use(express.json());
app.use('/', roomsRoute);

describe('Rooms API Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  // GET /api/rooms/:roomCode/:date
  // ---------------------------
  describe('GET /api/rooms/:roomCode/:date', () => {
    it('should return 404 if room not found', async () => {
      Room.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/rooms/ABC/2025-08-01');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Room not found' });
    });

    it('should return empty array if no reservation for that date', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [{ date: '2025-08-02', slots: [] }]
      });

      const res = await request(app).get('/api/rooms/ABC/2025-08-01');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return slots with time, cap and reserved count', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [
          {
            date: '2025-08-01',
            slots: [
              { time: '10:00 AM', cap: 5, reservedSeats: [1, 2] },
              { time: '2:00 PM', cap: 3, reservedSeats: [] }
            ]
          }
        ]
      });

      const res = await request(app).get('/api/rooms/ABC/2025-08-01');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { time: '10:00 AM', cap: 5, reserved: 2 },
        { time: '2:00 PM', cap: 3, reserved: 0 }
      ]);
    });

    it('should handle server errors gracefully', async () => {
      Room.findOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/rooms/ABC/2025-08-01');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Server error' });
      expect(logError).toHaveBeenCalled();
    });
  });

  // ---------------------------
  // GET /api/rooms/:room/:date/:time
  // ---------------------------
  describe('GET /api/rooms/:room/:date/:time', () => {
    it('should return 404 if room not found', async () => {
      Room.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/rooms/ABC/2025-08-01/10%3A00%20AM');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Room not found' });
    });

    it('should return 404 if date not found', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [{ date: '2025-08-02', slots: [] }]
      });

      const res = await request(app).get('/api/rooms/ABC/2025-08-01/10%3A00%20AM');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Date not found' });
    });

    it('should return 404 if time slot not found', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [
          { date: '2025-08-01', slots: [{ time: '2:00 PM', seats: [] }] }
        ]
      });

      const res = await request(app).get('/api/rooms/ABC/2025-08-01/10%3A00%20AM');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Time slot not found' });
    });

    it('should return slot details if found', async () => {
      const slotData = {
        time: '10:00 AM',
        cap: 5,
        reservedSeats: [1],
        seats: [
          { seatNumber: 1, isReserved: true },
          { seatNumber: 2, isReserved: false }
        ]
      };
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [{ date: '2025-08-01', slots: [slotData] }]
      });

      const res = await request(app).get('/api/rooms/ABC/2025-08-01/10%3A00%20AM');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(slotData);
    });

    it('should handle server errors gracefully', async () => {
      Room.findOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/rooms/ABC/2025-08-01/10%3A00%20AM');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Server error' });
      expect(logError).toHaveBeenCalled();
    });
  });

  // ---------------------------
  // POST /api/reserve
  // ---------------------------
  describe('POST /api/reserve', () => {
    it('should return 400 if missing reservation data', async () => {
      const res = await request(app).post('/api/reserve').send({
        room: 'ABC', date: '2025-08-01', time: '10:00 AM', seats: []
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Missing reservation data.' });
    });

    it('should return 404 if room not found', async () => {
      Room.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Room not found.' });
    });

    it('should return 404 if date not found', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: []
      });

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Date not found.' });
    });

    it('should return 404 if time slot not found', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [
          { date: '2025-08-01', slots: [{ time: '2:00 PM', seats: [] }] }
        ]
      });

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Time slot not found.' });
    });

    it('should return 409 if any seat is already reserved', async () => {
      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [
          {
            date: '2025-08-01',
            slots: [
              {
                time: '10:00 AM',
                reservedSeats: [1],
                seats: [
                  { seatNumber: 1, isReserved: true },
                  { seatNumber: 2, isReserved: false }
                ]
              }
            ]
          }
        ]
      });

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ message: 'One or more seats already reserved.' });
    });

    it('should reserve seats successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue();

      Room.findOne.mockResolvedValue({
        roomCode: 'ABC',
        reservations: [
          {
            date: '2025-08-01',
            slots: [
              {
                time: '10:00 AM',
                reservedSeats: [],
                seats: [
                  { seatNumber: 1, isReserved: false },
                  { seatNumber: 2, isReserved: false }
                ]
              }
            ]
          }
        ],
        save: mockSave
      });

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Seats reserved successfully.' });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      Room.findOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/reserve').send({
        room: 'ABC',
        date: '2025-08-01',
        time: '10:00 AM',
        seats: [1],
        reservedBy: 'user123',
        isAnonymous: false,
        reservationDate: '2025-07-31'
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Server error.' });
      expect(logError).toHaveBeenCalled();
    });
  });
});
