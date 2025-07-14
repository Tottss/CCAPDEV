import { loadHeaderPfp } from '../loadHeaderPfp.js';
document.addEventListener('DOMContentLoaded', loadHeaderPfp);

const roomButtons = document.querySelectorAll('#roomButtons button');
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

      // Parse current slot's start time and convert it to a Date object
      const slotStart = slot.time.split(" - ")[0]; // e.g., "0730"
      const [hourStr, minStr] = [slotStart.slice(0, 2), slotStart.slice(2)];
      const slotDateTime = new Date(currentDate);
      slotDateTime.setHours(parseInt(hourStr), parseInt(minStr));

      const now = new Date();
      const isPast = new Date(currentDate) < now.setHours(0, 0, 0, 0) || slotDateTime < new Date();

      const row = document.createElement('tr');
      row.className = `cursor-pointer ${isFull || isPast ? 'text-blue-500' : 'text-black'} bg-[#A2F1B6] hover:bg-lime-50`;
      row.innerHTML = `
        <td class="font-bold px-4 py-2 border border-white">${slot.time}</td>
        <td class="font-bold border border-white">${slot.cap}</td>
        <td class="font-bold border border-white">${reservedCount}</td>
      `;

      row.addEventListener("click", () => {
        //--!! removed to let admin click any slot !!--//

        // if (isPast) {
        //   alert("This time slot has already passed.");
        //   return;
        // }

        // if (isFull) {
        //   alert("This slot is full.");
        //   return;
        // }

        const params = new URLSearchParams({
          room: currentRoom,
          time: slot.time,
          date: currentDate
        });

        window.location.href = `/adminseating?${params.toString()}`;
      });

      timeSlotsTable.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to load room data:", err);
    alert("Unable to fetch time slots. Please try again.");
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
    });
  });

  dateInput.addEventListener("change", (e) => {
    currentDate = e.target.value || currentDate;
    updateRoomDisplay();
  });

  updateRoomDisplay();

  //-- loads default room on load of main--//
  const defaultButton = Array.from(roomButtons).find(btn => btn.textContent.trim() === currentRoom);
  if (defaultButton) defaultButton.click(); 
});
