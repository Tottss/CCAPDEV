import { loadHeaderPfp } from '../loadHeaderPfp.js';
document.addEventListener('DOMContentLoaded', loadHeaderPfp);

const roomButtons = document.querySelectorAll('button');
const displayDate = document.getElementById('displayDate');
const dateInput = document.getElementById('date');
const roomTitle = document.querySelector('h2.text-2xl');
const timeSlotsTable = document.querySelector('#timeSlots tbody');
const slotList = document.getElementById("slotList");
const scrollContainer = document.getElementById("slotScroll");

let currentRoom = "G201";
let currentDate = new Date().toISOString().split("T")[0];

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString(undefined, options);
}

async function updateRoomDisplay() {
  roomTitle.textContent = `${currentRoom} COMPUTER LABORATORY`;
  displayDate.textContent = formatDateDisplay(currentDate);
  timeSlotsTable.innerHTML = "";

  try {
    const response = await fetch(`/api/rooms/${currentRoom}/${currentDate}`);
    const slots = await response.json();

    slots.forEach(slot => {
      const reservedCount = slot.reserved;
      const isFull = reservedCount >= slot.cap;

      const row = document.createElement('tr');
      row.className = `cursor-pointer ${isFull ? 'text-blue-500' : 'text-black'} bg-[#A2F1B6] hover:bg-lime-50`;
      row.innerHTML = `
        <td class="font-bold px-4 py-2 border border-white">${slot.time}</td>
        <td class="font-bold border border-white">${slot.cap}</td>
        <td class="font-bold border border-white">${reservedCount}</td>
      `;

      row.addEventListener("click", () => {
        if (isFull) {
          alert("This slot is full.");
          return;
        }

        const params = new URLSearchParams({
          room: currentRoom,
          time: slot.time,
          date: currentDate
          // date: formatDateDisplay(currentDate)
        });

        const isAdmin = window.location.pathname.includes("/admin");
        const destination = isAdmin ? "/adminseating" : "/seating";

        window.location.href = `${destination}?${params.toString()}`;
      });

      timeSlotsTable.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to load room data:", err);
    alert("Unable to fetch time slots. Please try again.");
  }
}

async function loadReservationHistory() {
  const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
  if (!loggedIn) {
    alert("User not logged in.");
    return;
  }

  const userId = loggedIn._id;     

  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  try {
    const res = await fetch(`/api/reservations?user=${encodeURIComponent(userId)}`);
    const reservations = await res.json();

    if (reservations.length === 0) {
      historyList.innerHTML = "<li>No past reservations.</li>";
      return;
    }

    reservations.forEach(r => {
      const li = document.createElement("li");
      li.className = "flex flex-col px-3 py-2 rounded bg-white";
      li.innerHTML =
        `<span>${r.room} | ${r.time} | ${r.date}</span>
         <span class="text-gray-500 text-xs">${r.seat}</span>`;
      historyList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    historyList.innerHTML = "<li>Failed to load history.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];
  dateInput.min = formatDate(today);

  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);
  dateInput.max = formatDate(oneWeekLater);

  dateInput.value = currentDate;

  roomButtons.forEach(button => {
    const roomName = button.textContent.trim();
    button.setAttribute("data-room", roomName);

    button.addEventListener("click", () => {
      currentRoom = roomName;
      roomButtons.forEach(b => b.classList.remove('bg-green-600', 'text-white'));
      button.classList.add('bg-green-600', 'text-white');
      updateRoomDisplay();
      const defaultButton = Array.from(roomButtons).find(btn => btn.textContent.trim() === currentRoom);
      if (defaultButton) defaultButton.click();
    });
  });

  dateInput.addEventListener("change", (e) => {
    currentDate = e.target.value || currentDate;
    updateRoomDisplay();
  });

  updateRoomDisplay();
  loadReservationHistory();
});
