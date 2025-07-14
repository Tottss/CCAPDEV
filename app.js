const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const User = require('./models/User');
const addSampleData = require('./sampledata');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/computerReservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("MongoDB connected");

  const count = await User.countDocuments({});
  if (count === 0) {
    addSampleData();
  }
}).catch(err => console.log("MongoDB error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // for JS, CSS, images, etc.

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/userRoutes');

app.use('/api/user', userRoutes);
app.use('/', roomRoutes); 

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login'); 
});

app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/seating', (req, res) => {
  res.render('seating');
});

app.get('/reservations', (req, res) => {
  res.render('viewReservations');
});

app.get('/dashboard', (req, res) => {
  res.render('main'); 
});

app.get('/admin', (req, res) => {
  res.render('adminmain'); 
});

app.get('/adminseating', (req, res) => {
  res.render('adminSeating'); 
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
