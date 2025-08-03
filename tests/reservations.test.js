const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../models/Classes');
jest.mock('../logError');

const Room = require('../models/Classes');
const logError = require('../logError');

const reservationsRoute = require('../routes/reservations');

const app = express();
app.use('/reservations', reservationsRoute);

describe('GET /reservations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no user query param is provided', async () => {
    const res = await request(app).get('/reservations');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'User ID is required' });
  });

  it('should return reservations for the specified user', async () => {
    const mockRooms = [
      {
        roomCode: 'A101',
        reservations: [
          {
            date: '2025-08-01',
            slots: [
              {
                time: '10:00 AM',
                seats: [
                  { seatNumber: 1, reservedBy: 'user123' },
                  { seatNumber: 2, reservedBy: 'otherUser' }
                ]
              }
            ]
          }
        ]
      },
      {
        roomCode: 'B202',
        reservations: [
          {
            date: '2025-08-02',
            slots: [
              {
                time: '2:00 PM',
                seats: [
                  { seatNumber: 3, reservedBy: 'user123' }
                ]
              }
            ]
          }
        ]
      }
    ];

    Room.find.mockResolvedValue(mockRooms);

    const res = await request(app).get('/reservations').query({ user: 'user123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        room: 'A101',
        date: '2025-08-01',
        time: '10:00 AM',
        seat: 'Seat 1'
      },
      {
        room: 'B202',
        date: '2025-08-02',
        time: '2:00 PM',
        seat: 'Seat 3'
      }
    ]);
  });

  it('should handle server errors gracefully', async () => {
    Room.find.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/reservations').query({ user: 'user123' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Server error' });
    expect(logError).toHaveBeenCalled();
  });
});
