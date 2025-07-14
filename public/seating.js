const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const date = params.get("date");
const time = params.get("time");
// const professor = params.get("professor");

const currentUser = JSON.parse(localStorage.getItem("loggedIn") || "{}");
const selectedSeats = new Set();

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

      const isOwner = seat.reservedBy === currentUser.username; // if user is anonymous, and checks their own reservations, display their username
      const displayName = seat.isAnonymous && !isOwner ? "Anonymous" : seat.reservedBy || "Unknown";
      // const displayName = seat.isAnonymous ? "Anonymous" : (seat.reservedBy || "Unknown");

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Reserved by: ${displayName}`);
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
    const response = await fetch(`/api/rooms/${room}/${date}/${time}`);
    if (!response.ok) throw new Error("Failed to load data");

    const slot = await response.json(); // return timeslot including seat info
    populateSeats(slot.seats);
  }
  catch (error) {
    console.error("Error details:", {
      error: error.message,
      room, date, time,
      url: `/api/rooms/${room}/${date}/${time}`
    });
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

  const isAnonymous = document.getElementById("anonymousToggle").checked;

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
            reservedBy: currentUser.username, isAnonymous,
            reservationDate: new Date().toISOString().split('T')[0]
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
            window.location.href = "/dashboard"; // redirect back to dashboard
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