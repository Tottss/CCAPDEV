// app.js
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const addSampleData = require('./sampledata');
const { requireAuth, requireRole } = require('./middleware/authentication');

const app = express();

// --- middleware / parsing / session setup ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey123', // in prod, store in env
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// routes
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/userRoutes');
const reservationsRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/', roomRoutes);
app.use('/api/reservations', reservationsRoutes);

// top-level pages
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', requireAuth, requireRole('student'), (req, res) => res.render('signup'));
app.get('/profile', requireAuth, requireRole('student'), (req, res) => res.render('profile'));
app.get('/seating', requireAuth, requireRole('student'), (req, res) => res.render('seating'));
app.get('/reservations', requireAuth, requireRole('student'), (req, res) => res.render('viewReservations'));
app.get('/dashboard', requireAuth, requireRole('student'), (req, res) => res.render('main'));
app.get('/admin', requireAuth, requireRole('admin'), (req, res) => res.render('adminmain'));
app.get('/adminseating', requireAuth, requireRole('admin'), (req, res) => res.render('adminSeating'));

// exported function to connect to DB (tests will call this with their URI)
async function connectDb(uri) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri); // no deprecated options
    console.log('MongoDB connected');
    // only insert sample data in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      await addSampleData();
    }
  }
}

module.exports = { app, connectDb };

// Only start server in non-test mode
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/computerReservationDB';
  connectDb(mongoUri).catch(err => console.error('MongoDB error:', err));
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
