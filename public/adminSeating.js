const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const date = params.get("date");
const time = params.get("time");
// const professor = params.get("professor");

const selectedSeats = new Set();
let currentMode = "reserve";
let seatsData = [];

const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentMode = btn.dataset.mode;

        modeButtons.forEach(b => b.classList.remove("ring", "ring-offset-2", "ring-black"));
        btn.classList.add("ring", "ring-offset-2", "ring-black");

        // mode switching resets layout to prevent overlapping
        selectedSeats.clear();
        populateSeats(seatsData);

        console.log("Current mode:", currentMode);
    });
});

// update seat buttons dynamically
function populateSeats(seats) {
  seatsData = seats;

  seats.forEach(seat => {
    const btn = document.getElementById(seat.seatNumber);
    if (!btn) return;

    const cleanBtn = btn.cloneNode(true);
    btn.replaceWith(cleanBtn);
    cleanBtn.className = 'w-14 h-14 bg-gray-300 rounded hover:bg-gray-400';
    cleanBtn.disabled = false;

    if (seat.isBlocked) { // blocked
      cleanBtn.classList.add('bg-black', 'text-white', 'cursor-pointer');
      return;
    }

    if (seat.isReserved) { // reserved
      cleanBtn.classList.add('bg-red-500', 'text-white', 'cursor-pointer');
      const displayName = seat.reservedBy || "Unknown";

      cleanBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (currentMode === 'remove') {
          if (selectedSeats.has(seat.seatNumber)) { /// deselect (go back to red bg)
            cleanBtn.classList.remove('bg-gray-300', 'text-black');
            cleanBtn.classList.add('bg-red-500', 'text-white');
            selectedSeats.delete(seat.seatNumber);
          }
          else { // select (turn into default bg)
            cleanBtn.classList.remove('bg-red-500', 'text-white');
            cleanBtn.classList.add('bg-gray-300', 'text-black');
            selectedSeats.add(seat.seatNumber);
          }
        }
        else {
          alert(`Reserved by: ${displayName}`);
        }
      });
    } 
    
    else { // untouched
      cleanBtn.addEventListener('click', () => {

        if (currentMode === 'reserve') {
          cleanBtn.classList.toggle('bg-green-800');
          cleanBtn.classList.toggle('text-white');
        }
        else if (currentMode === 'remove') {
          alert('This seat is not reserved.');
          return;
        }
        else if (currentMode === 'block') {
          cleanBtn.classList.toggle('bg-black');
          cleanBtn.classList.toggle('text-white');
        }
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

// save button
document.getElementById("saveButton").addEventListener("click", async () => {

  const studentName = document.getElementById("studentName").value;

    if (selectedSeats.size === 0) {
        alert("No seats selected.");
        return;
    }

    if (currentMode === "reserve" && !studentName) {
        alert("Student name is required for reservations");
        return;
    }

    // confirmation for removing reservations
    if (currentMode === "remove") {
      const confirmMessage = `Are you sure you want to remove ${selectedSeats.size} seat(s)?`;
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
        const payload = {
            room,
            date,
            time,
            seats: Array.from(selectedSeats),
            action: currentMode,
            reservedBy: studentName,
            reservationDate: new Date().toISOString().split('T')[0]
        };

        console.log("Sending payload:", payload); // debugging

        const response = await fetch("/api/admin/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
          const actionWord = currentMode === 'reserve' ? 'reserved' : currentMode === 'remove' ? 'removed' : 'blocked';
            alert("Operation successful!");
            window.location.reload();
        }
        else {
            const err = await response.json();
            alert("Failed: " + err.message);
        }
    } catch (err) {
        console.error(err);
        alert("Operation failed:" + err.message);
    }
});

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