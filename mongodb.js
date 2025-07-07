const express = require('express');
// const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');


const app = express();
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

app.post('/signup', async (req, res) => {
  const formData = req.body;
  formData.newsletter = formData.newsletter === 'on';
  const newUser = new User(formData);
  
  await newUser.save();

//   res.render('partials/confirmation', { formData });
});

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({email});

    if (!user) {
      return res.status(401).send('Invalid email');
    }
    if (user.password !== password) {
      return res.status(401).send('Invalid password');
    }

    res.send('Login successful');
    res.redirect('/dashboard');
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
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

app.get('/login', (req, res) => {
  res.render('partials/login');
});

app.get('/dashboard', (req, res) => {
  res.render('partials/dashboard');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});