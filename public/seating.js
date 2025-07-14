// previous hardcoded static data
// const reservationData = {
//     date: "June 18, 2025",
//     time: "9:00 A.M. - 11:00 A.M.",
//     room: "G302A",
//     professor: "Danny Cheng"
// };

// let users = JSON.parse(localStorage.getItem("users"));

// if (!users || users.length === 0) {
//   users = [
//     {
//       firstName: "Alice",
//       lastName: "Santos",
//       email: "alice.santos@dlsu.edu.ph",
//       username: "alice",
//       password: "alice123"
//     },
//     {
//       firstName: "Bob",
//       lastName: "Reyes",
//       email: "bob.reyes@dlsu.edu.ph",
//       username: "bob",
//       password: "bob123"
//     },
//     {
//       firstName: "Charlie",
//       lastName: "Cruz",
//       email: "charlie.cruz@dlsu.edu.ph",
//       username: "charlie",
//       password: "charlie123"
//     },
//     {
//       firstName: "Diane",
//       lastName: "Lopez",
//       email: "diane.lopez@dlsu.edu.ph",
//       username: "diane",
//       password: "diane123"
//     },
//     {
//       firstName: "Evan",
//       lastName: "Tan",
//       email: "evan.tan@dlsu.edu.ph",
//       username: "evan",
//       password: "evan123"
//     }
//   ];

//   localStorage.setItem("users", JSON.stringify(users));
// }

// dynamic data
const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const date = params.get("date");
const time = params.get("time");
// const professor = params.get("professor");

const selectedSeats = new Set();

// document.getElementById('reservation-date').textContent = reservationData.date;
// document.getElementById('reservation-time').textContent = reservationData.time;
// document.getElementById('reservation-room').textContent = reservationData.room;
// document.getElementById('reservation-professor').textContent = reservationData.professor;

// update seat buttons dynamically
function populateSeats(seatsData) {
  seatsData.forEach(seat => {
    const btn = document.getElementById(seat.seatNumber);
    if (!btn) return;

    if (seat.isBlocked) { // blocked
        btn.classList.add('bg-black', 'text-white', 'cursor-not-allowed');
        btn.disabled = true;
        return;
    }

    if (seat.isReserved) { // reserved
      btn.classList.add('bg-red-500', 'text-white', 'cursor-pointer');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Reserved by: ${seat.reservedBy || "Unknown"}`);
      });
    } 
    
    else { // untouched
      btn.addEventListener('click', () => {
        btn.classList.toggle('bg-green-800');
        btn.classList.toggle('text-white');
        selectedSeats.has(seat.seatNumber)
          ? selectedSeats.delete(seat.seatNumber)
          : selectedSeats.add(seat.seatNumber);
      });
    }
  });
}

// fetch reservation data from server (/api/rooms/:room/:data/:time)
async function fetchSeatingData() {
  try {
    const response = await fetch(`/api/rooms/${room}/${date}/${encodeURIComponent(time)}`);
    if (!response.ok) throw new Error("Failed to load data");

    const slot = await response.json(); // return timeslot including seat info
    populateSeats(slot.seats);
  }
  catch (error) {
    console.error(error);
    alert("Failed to load seating data.");
  }
}

// initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (!room || !date || !time) {
    alert("Missing reservation details in the URL.");
    return;
  }

  // update reservation summary UI
  document.getElementById("reservation-room").textContent = room;
  document.getElementById("reservation-date").textContent = date;
  document.getElementById("reservation-time").textContent = time;
  // document.getElementById('reservation-professor').textContent = professor;

  fetchSeatingData();
});

// reserve button
document.getElementById("reserveButton").addEventListener("click", async () => {
    if (selectedSeats.size === 0) {
        alert("No seats selected.");
        return;
    }

    try {
        const payload = {
            room,
            date,
            time,
            seats: Array.from(selectedSeats),
            reservedBy: "alice"  // Replace with actual logged-in user
        };

        const response = await fetch("/api/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Reservation successful!");
            window.location.reload();
        }
        else {
            const err = await response.json();
            alert("Failed: " + err.message);
        }
    } catch (err) {
        console.error(err);
        alert("Reservation failed.");
    }
});