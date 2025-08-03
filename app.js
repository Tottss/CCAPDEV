const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const addSampleData = require('./sampledata');
const { requireAuth, requireRole } = require('./middleware/authentication');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/computerReservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("MongoDB connected");

    addSampleData(); // removed the checkers since it should always delete everything then insert sample data

}).catch(err => console.log("MongoDB error:", err));

app.use(session({ // session
  secret: 'secretKey123', // store securely in env var
  resave: false, // don't save unchanged sessions
  saveUninitialized: true, // create session even if empty
  cookie: { maxAge: 604800000} // 3 weeks
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // for JS, CSS, images, etc.

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/userRoutes');
const reservationsRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/adminRoutes');

// basically when u undo page after destroying session, it doesnt show the page
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

const logoutScript = require('./middleware/logout');
app.use(logoutScript);

app.use('/', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/', roomRoutes); 
app.use('/api/reservations', reservationsRoutes);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login'); 
});

app.get('/signup', requireAuth, requireRole('student'), (req, res) => {
  res.render('signup'); 
});

app.get('/profile', requireAuth, requireRole('student'), (req, res) => {
  res.render('profile');
});

app.get('/seating', requireAuth, requireRole('student'), (req, res) => {
  res.render('seating');
});

app.get('/reservations', requireAuth, requireRole('student'), (req, res) => {
  res.render('viewReservations');
});

app.get('/dashboard', requireAuth, requireRole('student'), (req, res) => {
  res.render('main'); 
});

app.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.render('adminmain'); 
});

app.get('/adminseating', requireAuth, requireRole('admin'), (req, res) => {
  res.render('adminSeating'); 
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
