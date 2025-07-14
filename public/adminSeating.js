const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const date = params.get("date");
const time = params.get("time");
// const professor = params.get("professor");

const selectedSeats = new Set();

let currentMode = "reserve";

const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentMode = btn.dataset.mode;

        modeButtons.forEach(b => b.classList.remove("ring", "ring-offset-2", "ring-black"));
        btn.classList.add("ring", "ring-offset-2", "ring-black");

        console.log("Current mode:", currentMode);
    });
});

// const seats = document.querySelectorAll('button');

// seats.forEach(button => {
//     if (button.id !== 'saveButton' && !button.classList.contains('mode-btn')) {
//         button.addEventListener('click', () => {
//             if (currentMode === "reserve") {
//                 button.classList.add('bg-green-800', 'text-white');
//                 button.classList.remove('bg-red-700');
//             } else if (currentMode === "remove") {
//                 button.classList.remove('bg-green-800', 'bg-red-700', 'text-white');
//                 button.classList.add('bg-gray-300');
//             } else if (currentMode === "block") {
//                 button.classList.add('bg-red-700', 'text-white');
//                 button.classList.remove('bg-green-800');
//             }
//         });
//     }
// });

// update seat buttons dynamically
function populateSeats(seatsData) {
  seatsData.forEach(seat => {
    const btn = document.getElementById(seat.seatNumber);
    if (!btn) return;

    // reset button classes and events
    btn.className = 'w-14 h-14 rounded hover:bg-gray-400';
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn); // now newBtn is the real element in DOM

    if (seat.isBlocked) { // blocked
        newBtn.classList.add('bg-black', 'text-white', 'cursor-not-allowed');
        newBtn.disabled = true;
        return;
    }

    if (seat.isReserved) { // reserved
      newBtn.classList.add('bg-red-500', 'text-white', 'cursor-pointer');

      const displayName = seat.reservedBy || "Unknown";

      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentMode === "remove") {
            if (seat.isReserved) {
                newBtn.classList.remove('bg-red-500', 'text-white');
                newBtn.classList.add('bg-gray-300');
                selectedSeats.add(seat.seatNumber);
            }
            else {
                alert("Only reserved seats can be removed.")
            }   
        }
        else {
            alert(`Reserved by: ${displayName}`);
        }
      });
    } 
    else { // untouched
      newBtn.classList.add('bg-gray-300');

      newBtn.addEventListener('click', () => {
        if (currentMode === "reserve") {
            newBtn.classList.toggle('bg-green-800');
            newBtn.classList.toggle('text-white');
        }
        else if (currentMode === "block") {
            newBtn.classList.toggle('bg-black');
            newBtn.classList.toggle('text-white');
        }

        if (currentMode === "reserve" || currentMode === "block") {
            selectedSeats.has(seat.seatNumber)
                ? selectedSeats.delete(seat.seatNumber)
                : selectedSeats.add(seat.seatNumber);
        }
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

// reserve button
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

    try {
        const payload = {
            room,
            date,
            time,
            seats: Array.from(selectedSeats),
            action: currentMode,
            reservedBy: studentName || "Student"
        };

        const response = await fetch("/api/admin/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Operation successful!");
            window.location.reload();
        }
        else {
            const err = await response.json();
            alert("Failed: " + err.message);
        }
    } catch (err) {
        console.error(err);
        alert("Operation failed.");
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