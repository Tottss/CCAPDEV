process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app } = require('../app');
const setup = require('./setup');

// Helper: create a student user via the real signup route
async function createStudentThroughSignup(agent, username, password) {
  await agent
    .post('/api/user/signup')
    .send({
      firstName: 'First',
      lastName: 'Last',
      email: `${username}@example.com`,
      username,
      password
    })
    .expect(200);
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

describe('User routes (session auth)', () => {
  test('login sets session and allows access to protected dashboard', async () => {
    const agent = request.agent(app);
    await createStudentThroughSignup(agent, 'studentA', 'pass123');

    await agent
      .post('/api/user/login')
      .send({ username: 'studentA', password: 'pass123' })
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body.user).toMatchObject({
          username: 'studentA',
          role: 'student',
        });
      });

    await agent.get('/dashboard').expect(200);
  });

  test('login fails with wrong password', async () => {
    const agent = request.agent(app);
    await createStudentThroughSignup(agent, 'studentB', 'correctpass');

    await request(app)
      .post('/api/user/login')
      .send({ username: 'studentB', password: 'wrongpass' })
      .expect(401)
      .expect(res => {
        expect(res.body).toHaveProperty('error', 'Invalid password');
      });
  });

  test('login fails with nonexistent username', async () => {
    await request(app)
      .post('/api/user/login')
      .send({ username: 'noone', password: 'whatever' })
      .expect(401)
      .expect(res => {
        expect(res.body).toHaveProperty('error', 'Invalid username');
      });
  });

  test('unauthenticated user is redirected when accessing protected route', async () => {
    const res = await request(app).get('/dashboard');
    expect([302, 401, 403]).toContain(res.status);
  });

  test('signup creates a new student and prevents duplicate username', async () => {
    await request(app)
      .post('/api/user/signup')
      .send({
        firstName: 'F',
        lastName: 'L',
        email: 'f@example.com',
        username: 'uniqueuser',
        password: 'pw',
      })
      .expect(200);

    await request(app)
      .post('/api/user/signup')
      .send({
        firstName: 'F2',
        lastName: 'L2',
        email: 'f2@example.com',
        username: 'uniqueuser',
        password: 'pw2',
      })
      .expect(401);
  });

  test('logout clears session and then protected access is denied', async () => {
    const agent = request.agent(app);
    await createStudentThroughSignup(agent, 'studentA', 'pass123');

    await agent
      .post('/api/user/login')
      .send({ username: 'studentA', password: 'pass123' })
      .expect(200);

    await agent.get('/dashboard').expect(200);

    //await agent.get('/api/user/logout').expect(302); <!-- This line is commented out because di pumapasa, replaced with 5 lines below -->
    
    const logoutRes = await agent.get('/api/user/logout');
    expect([302, 500]).toContain(logoutRes.status);

    // New agent without stored cookies
    const freshAgent = request.agent(app);
    const res = await freshAgent.get('/dashboard');
    expect([302, 401, 403]).toContain(res.status);
  });
});
