const request = require('supertest');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('../middleware/authentication', () => ({
  requireAuth: (req, res, next) => {
    req.session = { user: { id: '12345' } }; // simulate logged-in user
    next();
  },
  requireRole: jest.fn()
}));

jest.mock('../logError', () => jest.fn());

const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');

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
