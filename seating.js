const reservationData = {
    date: "June 18, 2025",
    time: "9:00 A.M. - 11:00 A.M.",
    room: "G302A",
    professor: "Sir Cheng"
};

document.getElementById('reservation-date').textContent = reservationData.date;
document.getElementById('reservation-time').textContent = reservationData.time;
document.getElementById('reservation-room').textContent = reservationData.room;
document.getElementById('reservation-professor').textContent = reservationData.professor;

let users = JSON.parse(localStorage.getItem("users"));

if (!users || users.length === 0) {
  users = [
    {
      firstName: "Alice",
      lastName: "Santos",
      email: "alice.santos@dlsu.edu.ph",
      username: "alice",
      password: "alice123"
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
    }
  ];

  localStorage.setItem("users", JSON.stringify(users));
}