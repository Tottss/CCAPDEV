const express = require('express');
// const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const addSampleData = require('./sampledata')

const app = express();
app.use(express.json());
const port = 3000;

const roomRoutes = require('./routes/rooms');
app.use('/', roomRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/computerReservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async() => {
  console.log("MongoDB connected");

  const count = await User.countDocuments({});
  if (count === 0) {
    addSampleData();
  }
}).catch(err => console.log("MongoDB error:", err));


app.use(express.urlencoded({ extended: true }));

const staticFilesPath = path.join(__dirname); // path; currently all html files are at the root directory
console.log('Serving static files from:', staticFilesPath);
app.use(express.static(staticFilesPath));
//app.use(express.static(__dirname + "public"));

//app.engine('handlebars', exphbs.engine());
// app.engine('hbs', exphbs.engine({extname:'hbs'}));
//app.set('view engine', 'handlebars');
// app.set('view engine', 'hbs');
//app.set('views', path.join(__dirname, 'views'));
// app.set("views", "./views");

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});