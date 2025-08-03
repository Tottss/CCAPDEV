const request = require('supertest');
const express = require('express');
const session = require('express-session');
jest.mock('../middleware/authentication', () => (req, res, next) => next());
const router = require('../routes/userRoutes');
const MemoryStore = require('memorystore')(session);
const path = require('path');
const Room = require('../models/Classes');

const mockSave = jest.fn();
const mockComparePassword = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../models/User', () => {
  const User = function (userData) {
    return { ...userData, save: mockSave, comparePassword: mockComparePassword };
  };

  User.findOne = jest.fn();
  User.findById = jest.fn();
  User.findByIdAndUpdate = jest.fn();
  User.findByIdAndDelete = jest.fn();
  User.find = jest.fn();

  return User;
});

jest.mock('../middleware/authentication', () => ({
  requireAuth: (req, res, next) => {
    req.session = { user: { id: '12345' } }; // simulate logged-in user
    next();
  },
  requireRole: jest.fn()
}));

jest.mock('../logError', () => jest.fn());

jest.mock('../models/Classes', () => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),  // <--- add this so you can mock findOne calls
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
const bcrypt = require('bcrypt');

const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');
const logError = require('../logError');

// Use a custom app with mock session
const app = express();
app.use(express.json());

// Mock session middleware
app.use((req, res, next) => {
  req.session = {
    save: (cb) => cb && cb(null) // mock session.save
  };
  next();
});

app.use('/', userRoutes);

describe('POST /:id/pfp', () => {
  it('uploads a profile picture and returns a success message', async () => {
    User.findByIdAndUpdate.mockResolvedValue({
      _id: '12345',
      profilePicture: 'mocked.jpg'
    });

    const res = await request(app)
      .post('/12345/pfp')
      .attach('profilePicture', path.join(__dirname, 'test.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile picture updated");
    expect(res.body.filename).toBeDefined();
  });

  it('returns 404 if user not found', async () => {
    User.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .post('/12345/pfp')
      .attach('profilePicture', path.join(__dirname, 'test.jpg'));

    expect(res.status).toBe(404);
    expect(res.text).toBe("User not found");
  });
});

describe('GET /me', () => {
  it('returns the current user', async () => {
    const mockUser = {
      _id: '12345',
      username: 'testuser',
      role: 'user',
      profilePicture: 'profile.jpg'
    };

    User.findById.mockResolvedValue(mockUser);

    const res = await request(app).get('/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
  });

  it('returns 401 if not authenticated', async () => {
    jest.resetModules();

    jest.doMock('../middleware/authentication', () => ({
      requireAuth: (req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      },
      requireRole: jest.fn()
    }));

    const express = require('express');
    const newUserRoutes = require('../routes/userRoutes');
    const tempApp = express();
    tempApp.use(express.json());
    tempApp.use(newUserRoutes);

    const res = await request(tempApp).get('/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('POST /login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with valid credentials', async () => {
    const mockUser = {
      _id: '12345',
      username: 'testuser',
      role: 'user',
      firstName: 'Test',
      lastName: 'User',
      comparePassword: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user).toEqual({
      id: '12345',
      username: 'testuser',
      role: 'user',
      firstname: 'Test',
      lastname: 'User'
    });
  });

  it('returns 401 if username is invalid', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ username: 'invaliduser', password: 'pass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid username');
  });

  it('returns 401 if password is incorrect', async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(false)
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid password');
  });

  it('returns 500 on server error', async () => {
    User.findOne.mockRejectedValue(new Error('DB failure'));

    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Server Error');
  });
});

describe('POST /signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up successfully with new user info', async () => {
    const newUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'newuser',
      password: 'password123',
    };

    User.findOne.mockResolvedValue(null);
    mockSave.mockResolvedValue(); 

    const res = await request(app).post('/signup').send(newUserData);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'newuser' });
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.text).toBe('Signup successful');
  });


  it('returns 401 if username already exists', async () => {
    User.findOne.mockResolvedValue({ username: 'janedoe' });

    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.text).toBe('Username already taken.');
  });

  it('returns 500 on server error during signup', async () => {
    User.findOne.mockRejectedValue(new Error('DB failed'));

    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'password123'
      });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Server Error during signup');
  });
});

describe('POST /logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears session and logs out successfully', async () => {
    const app = express();
    app.use(express.json());

    // Simulate an existing session with destroy function
    app.use((req, res, next) => {
      req.session = {
        destroy: jest.fn(cb => cb(null))
      };
      next();
    });

    app.use('/', userRoutes);

    const res = await request(app).post('/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });

  it('returns 500 if session destroy fails', async () => {
    const app = express();
    app.use(express.json());

    // Simulate a session destroy failure
    app.use((req, res, next) => {
      req.session = {
        destroy: jest.fn(cb => cb(new Error('Destroy error')))
      };
      next();
    });

    app.use('/', userRoutes);

    const res = await request(app).post('/logout');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Logout failed');
  });

  it('returns 200 if no session exists', async () => {
    const app = express();
    app.use(express.json());

    // Simulate no session object
    app.use((req, res, next) => {
      req.session = null;
      next();
    });

    app.use('/', userRoutes);

    const res = await request(app).post('/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('No active session');
  });
});

describe('GET /users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the users partial with retrieved users', async () => {
    const mockUsers = [
      { username: 'alice', email: 'alice@example.com' },
      { username: 'bob', email: 'bob@example.com' }
    ];

    const req = {};
    const res = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const mockLean = jest.fn().mockResolvedValue(mockUsers);
    User.find.mockReturnValue({ lean: mockLean });

    const route = userRoutes.stack.find(r => r.route?.path === '/users');
    await route.route.stack[0].handle(req, res);

    expect(res.render).toHaveBeenCalledWith('partials/users', { users: mockUsers });
  });

  it('returns 500 if there is an error fetching users', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    User.find.mockImplementation(() => {
      throw new Error('DB failed');
    });

    const route = userRoutes.stack.find(r => r.route?.path === '/users');
    await route.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error fetching users.');
  });
});

describe('GET /:id', () => {
  const mockUser = {
    _id: '12345',
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'janedoe',
    email: 'jane@example.com',
  };

  it('returns the user data when found', async () => {
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .get('/12345')
      .set('Authorization', 'Bearer validtoken'); // triggers requireAuth mock

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
  });

  it('returns 404 if user not found', async () => {
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .get('/12345')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'User not found' });
  });

  it('returns 500 if there is a server error', async () => {
    jest.clearAllMocks(); 

    const error = new Error('DB error');
    User.findByIdAndUpdate.mockImplementation(() => {
      throw error;
    });

    const res = await request(app).post('/12345').send({});

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Server error');
    expect(logError).toHaveBeenCalledWith(error, 'GET /:id');
  });
});

describe('POST /:id', () => {
  it('updates user info and returns the updated user', async () => {
    const mockUser = { _id: '12345', name: 'Updated' };
    User.findByIdAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/12345')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
  });

  it('returns 404 if user is not found', async () => {
    User.findByIdAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/12345')
      .send({ name: 'Does Not Exist' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('returns 500 if there is a server error', async () => {
    const error = new Error('DB error');
    User.findByIdAndUpdate.mockImplementation(() => {
      throw error;
    });

    const res = await request(app).post('/12345').send({});

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Server error');
    expect(logError).toHaveBeenCalledWith(error, 'GET /:id');
  });
});

describe('GET /view_reservation/:username', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns reservations made by the user', async () => {
    const mockRooms = [
      {
        roomCode: 'G101',
        reservations: [
          {
            date: '2025-08-01',
            slots: [
              {
                time: '10:00',
                seats: [
                  {
                    reservedBy: 'john_doe',
                    seatNumber: 5,
                    isAnonymous: false,
                    reservationDate: '2025-07-31'
                  },
                  {
                    reservedBy: 'other_user',
                    seatNumber: 6,
                    isAnonymous: true,
                    reservationDate: '2025-07-31'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    Room.find.mockResolvedValue(mockRooms);

    const res = await request(app).get('/view_reservation/john_doe');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        roomCode: 'G101',
        date: '2025-08-01',
        time: '10:00',
        seatNumber: 5,
        isAnnonymous: 'Public',
        reservedBy: 'john_doe',
        reservationDate: '2025-07-31'
      }
    ]);
  });

  it('returns 500 if there is a server error', async () => {
    const error = new Error('DB error');
    Room.find.mockRejectedValue(error);

    const res = await request(app).get('/view_reservation/john_doe');

    expect(res.status).toBe(500);
    expect(res.text).toBe('Error fetching reservations');
    expect(logError).toHaveBeenCalledWith(error, 'GET /view_reservation/:username');
  });
});

describe('DELETE /cancel_reservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cancels the reservation seats reserved by the user and returns success message', async () => {
    const mockRoom = {
      roomCode: 'G101',
      reservations: [
        {
          date: '2025-08-01',
          slots: [
            {
              time: '10:00',
              reservedSeats: [5, 6],
              seats: [
                {
                  seatNumber: 5,
                  reservedBy: 'john_doe',
                  reservationDate: '2025-07-31',
                  isReserved: true,
                  isAnonymous: false,
                },
                {
                  seatNumber: 6,
                  reservedBy: 'other_user',
                  reservationDate: '2025-07-31',
                  isReserved: true,
                  isAnonymous: true,
                }
              ]
            }
          ]
        }
      ],
      save: jest.fn().mockResolvedValue()
    };

    Room.findOne.mockResolvedValue(mockRoom);

    const res = await request(app)
      .delete('/cancel_reservation')
      .send({
        roomCode: 'G101',
        date: '2025-08-01',
        time: '10:00',
        reservedBy: 'john_doe'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('1 seat(s) cancelled successfully.');

    // Check that seat 5 was cleared
    const slot = mockRoom.reservations[0].slots[0];
    const seat5 = slot.seats.find(s => s.seatNumber === 5);
    expect(seat5.reservedBy).toBeNull();
    expect(seat5.reservationDate).toBeNull();
    expect(seat5.isReserved).toBe(false);
    expect(seat5.isAnonymous).toBe(false);

    // Check reservedSeats updated (seatNumber 5 removed)
    expect(slot.reservedSeats).not.toContain(5);
    expect(slot.reservedSeats).toContain(6);

    expect(mockRoom.save).toHaveBeenCalled();
  });

  it('returns 404 if room not found', async () => {
    Room.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/cancel_reservation')
      .send({
        roomCode: 'UNKNOWN',
        date: '2025-08-01',
        time: '10:00',
        reservedBy: 'john_doe'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Room not found');
  });

  it('returns 404 if date not found', async () => {
    const mockRoom = {
      roomCode: 'G101',
      reservations: [],
      save: jest.fn()
    };

    Room.findOne.mockResolvedValue(mockRoom);

    const res = await request(app)
      .delete('/cancel_reservation')
      .send({
        roomCode: 'G101',
        date: '2025-08-01',
        time: '10:00',
        reservedBy: 'john_doe'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Date not found');
  });

  it('returns 404 if slot not found', async () => {
    const mockRoom = {
      roomCode: 'G101',
      reservations: [
        {
          date: '2025-08-01',
          slots: []
        }
      ],
      save: jest.fn()
    };

    Room.findOne.mockResolvedValue(mockRoom);

    const res = await request(app)
      .delete('/cancel_reservation')
      .send({
        roomCode: 'G101',
        date: '2025-08-01',
        time: '10:00',
        reservedBy: 'john_doe'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Slot not found');
  });

  it('returns 500 on server error', async () => {
    const error = new Error('DB error');
    Room.findOne.mockRejectedValue(error);

    const res = await request(app)
      .delete('/cancel_reservation')
      .send({
        roomCode: 'G101',
        date: '2025-08-01',
        time: '10:00',
        reservedBy: 'john_doe'
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error cancelling reservation');
  });
});

describe('POST /:id/deleteWithPassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

it('deletes the user if password matches', async () => {
  // Mock DB calls
  User.findById.mockResolvedValue({ password: 'hashed_password' });
  bcrypt.compare.mockResolvedValue(true);
  User.findByIdAndDelete.mockResolvedValue({});

  // Create custom app with session mock
  const customApp = express();
  customApp.use(express.json());
  customApp.use((req, res, next) => {
    req.session = {
      destroy: (cb) => cb(null) // Simulate successful session destroy
    };
    next();
  });
  customApp.use('/', router);

  const server = customApp.listen();

  const res = await request(server)
    .post('/12345/deleteWithPassword')
    .send({ password: 'correct_password' });

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Account deleted, redirect to login");

  await new Promise(resolve => server.close(resolve));
});


  it('returns 500 if session destroy fails', async () => {
    const customApp = express();
    customApp.use(express.json());

    // Mock session with failing destroy
    customApp.use((req, res, next) => {
      req.session = {
        destroy: (cb) => cb(new Error('Session destroy failed')),
      };
      next();
    });

    customApp.use('/', router);

    const mockUser = { _id: '12345', password: 'hashed_pw', toObject: () => ({}) };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const server = customApp.listen();
    const res = await request(server)
      .post('/12345/deleteWithPassword')
      .send({ password: 'correct_password' });

    expect(res.status).toBe(500);
    await new Promise(resolve => server.close(resolve));
  }, 15000);

  it('returns 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/12345/deleteWithPassword')
      .send({ password: 'doesntmatter' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found.');
  }, 15000);

  it('returns 401 if password is incorrect', async () => {
    User.findById.mockResolvedValue({ _id: '12345', password: 'hashedpassword' });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/12345/deleteWithPassword')
      .send({ password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Incorrect password.');
  });

  it('returns 500 if there is a server error', async () => {
    User.findById.mockRejectedValue(new Error('something broke'));

    const res = await request(app)
      .post('/12345/deleteWithPassword')
      .send({ password: 'whatever' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Server error.');
  }, 15000);
});