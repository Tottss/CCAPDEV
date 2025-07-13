const express = require('express');
// const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');


const app = express();
app.use(express.json());
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/computerReservationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));


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

app.post('/login', async(req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send('Invalid username');
    }
    if (user.password !== password) {
      return res.status(401).send('Invalid password');
    }

    res.json({ message: 'Login successful', user });
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/signup', async(req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(401).send('Username already taken.');
    }
    
    const newUser = new User({ firstName, lastName, email, username, password });
    await newUser.save();

    res.send('Signup successful');
  }

  catch (err) {
    console.error(err);
    res.status(500).send('Server Error during signup');
  }
});

// View all registered users (for testing)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render('partials/users', { users });
  } catch (err) {
    res.status(500).send("Error fetching users.");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});