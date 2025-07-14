function addSampleData() {
    const User = require('./models/User');
    const Room = require('./models/Classes');

    User.insertMany([
    {
      firstName: "Alice",
      lastName: "Santos",
      email: "alice.santos@dlsu.edu.ph",
      username: "alice",
      password: "alice123",
      profilePicture: "6873e29529014536d16ce208_1752485744375.jpg",
      biography: "in wonderland",
      contact: "8700",
      links: "https://www.instagram.com/disneystudios/"
    },
    {
      firstName: "Bob",
      lastName: "Reyes",
      email: "bob.reyes@dlsu.edu.ph",
      username: "bob",
      password: "bob123"
    },
    {
      firstName: "Charlie",
      lastName: "Cruz",
      email: "charlie.cruz@dlsu.edu.ph",
      username: "charlie",
      password: "charlie123"
    },
    {
      firstName: "Diane",
      lastName: "Lopez",
      email: "diane.lopez@dlsu.edu.ph",
      username: "diane",
      password: "diane123"
    },
    {
      firstName: "Evan",
      lastName: "Tan",
      email: "evan.tan@dlsu.edu.ph",
      username: "evan",
      password: "evan123"
    },
    {
      firstName: "Admin",
      lastName: "Admin",
      email:"admin@dlsu.edu.ph",
      username: "Admin",
      password: "1234"
    }
    ]).then(function () {
        console.log("Users inserted")
    }).catch(function (error) {
        console.log(error) 
    })

    const cap = 35;
const timeSlots = [
  "0730 - 0800",
  "0800 - 0830",
  "0830 - 0900",
  "0900 - 0930",
  "0930 - 1000",
  "1000 - 1030"
];

function generateSeatData() {
  return Array.from({ length: cap }, (_, i) => ({
    seatNumber: i + 1,
    isReserved: false,
    reservedBy: null,
    isBlocked: false,
    reservationDate: null,
    isAnonymous: false
  }));
}

function generateReservations() {
  const today = new Date();
  const reservations = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const slots = timeSlots.map(time => ({
      time,
      cap,
      reservedSeats: [],
      seats: generateSeatData()
    }));

    reservations.push({ date: dateStr, slots });
  }

  return reservations;
}

async function populateRooms() {
  try {
    await Room.deleteMany({}); // Clear existing data

    const roomCodes = ["G201", "G202", "G203", "G204", "G205", "G206"];

    const roomData = roomCodes.map(roomCode => ({
      roomCode,
      reservations: generateReservations()
    }));

    await Room.insertMany(roomData);
    console.log("Rooms successfully populated!");
  } catch (err) {
    console.error("Error populating rooms:", err);
  } 
    
  
}

populateRooms();
}
module.exports = addSampleData;