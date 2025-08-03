process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app } = require('../app');
const setup = require('./setup');
const Room = require('../models/Classes');
const { createUser } = require('./utils');

// create admin user and login
async function createAdminAndLogin(agent) {
  const password = 'password123';
  const { user } = await createUser('admin', {
    password: password,
    username: 'admin_test'
  });
  
  await agent
    .post('/api/user/login')
    .send({ username: user.username, password: password })
    .expect(200);
  return user;
}

beforeAll(async () => {
  await setup.connect();
});

afterEach(async () => {
  await setup.clearDatabase();
});

afterAll(async () => {
  await setup.closeDatabase();
});

describe('Admin routes', () => {
  let testRoom;
  
  beforeEach(async () => {
    // create test room data
    testRoom = await Room.create({
      roomCode: 'TEST-ROOM-001',
      roomName: 'Test Computer Lab',
      capacity: 30,
      reservations: [
        {
          date: '2025-08-15',
          slots: [
            {
              time: '09:00-10:00',
              cap: 30,
              seats: Array.from({ length: 30 }, (_, i) => ({
                seatNumber: i + 1,
                isReserved: i < 3, // first 3 seats reserved
                isBlocked: false,
                reservedBy: i < 3 ? 'student123' : null,
                reservationDate: i < 3 ? new Date() : null
              })),
              reservedSeats: [1, 2, 3]
            },
            {
              time: '10:00-11:00',
              cap: 30,
              seats: Array.from({ length: 30 }, (_, i) => ({
                seatNumber: i + 1,
                isReserved: false,
                isBlocked: false,
                reservedBy: null,
                reservationDate: null
              })),
              reservedSeats: []
            }
          ]
        }
      ]
    });
  });

  test('GET /api/rooms/:roomCode/:date returns time slots for valid room and date', async () => {
    const response = await request(app)
      .get('/api/rooms/TEST-ROOM-001/2025-08-15')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    
    const firstSlot = response.body[0];
    expect(firstSlot.time).toBe('09:00-10:00');
    expect(firstSlot.cap).toBe(30);
    expect(firstSlot.reserved).toBe(3);
  });

  test('GET /api/rooms/:roomCode/:date returns 404 for non-existent room', async () => {
    await request(app)
      .get('/api/rooms/NON-EXISTENT/2025-08-15')
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Room not found');
      });
  });

  test('GET /api/rooms/:roomCode/:date returns empty array for date with no reservations', async () => {
    await request(app)
      .get('/api/rooms/TEST-ROOM-001/2025-12-25')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual([]);
      });
  });

  test('GET /api/rooms/:room/:date/:time returns specific time slot details', async () => {
    const response = await request(app)
      .get('/api/rooms/TEST-ROOM-001/2025-08-15/09:00-10:00')
      .expect(200);
    
    expect(response.body.time).toBe('09:00-10:00');
    expect(response.body.seats).toHaveLength(30);
    
    const reservedSeats = response.body.seats.filter(seat => seat.isReserved);
    expect(reservedSeats).toHaveLength(3);
  });

  test('GET /api/rooms/:room/:date/:time returns 404 for non-existent room', async () => {
    await request(app)
      .get('/api/rooms/NON-EXISTENT/2025-08-15/09:00-10:00')
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Room not found');
      });
  });

  test('GET /api/rooms/:room/:date/:time returns 404 for non-existent date', async () => {
    await request(app)
      .get('/api/rooms/TEST-ROOM-001/2025-12-25/09:00-10:00')
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Date not found');
      });
  });

  test('GET /api/rooms/:room/:date/:time returns 404 for non-existent time slot', async () => {
    await request(app)
      .get('/api/rooms/TEST-ROOM-001/2025-08-15/15:00-16:00')
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe('Time slot not found');
      });
  });

  test('POST /api/admin/reserve successfully reserves available seat when authenticated as admin', async () => {
    const agent = request.agent(app);
    await createAdminAndLogin(agent);

    await agent
      .post('/api/admin/reserve')
      .send({
        room: 'TEST-ROOM-001',
        date: '2025-08-15',
        time: '10:00-11:00',
        seatNumber: 10,
        reservedBy: 'student456',
        reservationDate: new Date().toISOString()
      })
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Seat 10 reserved successfully.');
      });
  });

  test('POST /api/admin/reserve returns 409 for already reserved seat', async () => {
    const agent = request.agent(app);
    await createAdminAndLogin(agent);

    await agent
      .post('/api/admin/reserve')
      .send({
        room: 'TEST-ROOM-001',
        date: '2025-08-15',
        time: '09:00-10:00',
        seatNumber: 1, // already reserved in test data
        reservedBy: 'student456',
        reservationDate: new Date().toISOString()
      })
      .expect(409)
      .expect(res => {
        expect(res.body.message).toBe('Seat 1 is already reserved or blocked.');
      });
  });

  test('POST /api/admin/reserve rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/admin/reserve')
      .send({
        room: 'TEST-ROOM-001',
        date: '2025-08-15',
        time: '10:00-11:00',
        seatNumber: 10,
        reservedBy: 'student456',
        reservationDate: new Date().toISOString()
      });
    
    expect([302, 401, 403]).toContain(res.status);
  });

  test('POST /api/admin/reserve rejects non-admin users', async () => {
    const agent = request.agent(app);
    const password = 'password123';
    const { user } = await createUser('student', {
        password: password,
        username: 'student_test'
    });

    await agent
        .post('/api/user/login')
        .send({ username: user.username, password: password })
        .expect(200);

    const res = await agent
        .post('/api/admin/reserve')
        .send({
            room: 'TEST-ROOM-001',
            date: '2025-08-15',
            time: '10:00-11:00',
            seatNumber: 10,
            reservedBy: 'student456',
            reservationDate: new Date().toISOString()
        });
    
    expect([302, 401, 403]).toContain(res.status);
    });
});
