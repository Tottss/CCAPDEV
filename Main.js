const roomButtons = document.querySelectorAll('button');
const displayDate = document.getElementById('displayDate');
const dateInput = document.getElementById('date');
const roomTitle = document.querySelector('h2.text-2xl');
const timeSlotsTable = document.querySelector('#timeSlots tbody');
const slotList = document.getElementById("slotList");
const scrollContainer = document.getElementById("slotScroll");

let currentRoom = "G201";
let currentDate = new Date().toISOString().split("T")[0];

const roomData = {
  G201: {
    "2025-06-18": [
      { time: "0730 - 0800", cap: 20, reserved: 20 },
      { time: "0900 - 0930", cap: 20, reserved: 20 }
    ],
    default: [
      { time: "0730 - 0800", cap: 20, reserved: 10 },
      { time: "0900 - 0930", cap: 20, reserved: 6 }
    ]
  },
  G202: {
    "2025-06-18": [
      { time: "0815 - 0845", cap: 23, reserved: 0 },
      { time: "1030 - 1100", cap: 23, reserved: 19 }
    ],
    default: [
      { time: "0730 - 0800", cap: 23, reserved: 23 },
      { time: "0815 - 0845", cap: 23, reserved: 0 },
      { time: "1030 - 1100", cap: 23, reserved: 19 }
    ]
  },
};

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString(undefined, options);
}

function updateRoomDisplay() {
  roomTitle.textContent = `${currentRoom} COMPUTER LABORATORY`;
  displayDate.textContent = formatDateDisplay(currentDate);
  timeSlotsTable.innerHTML = "";

  const slots = (roomData[currentRoom] && roomData[currentRoom][currentDate]) || roomData[currentRoom]?.default || [];

  slots.forEach(slot => {
    const row = document.createElement('tr');
    const isFull = slot.reserved >= slot.cap;
    row.className = `cursor-pointer ${isFull ? 'text-blue-500' : 'text-black'} bg-[#A2F1B6] hover:bg-lime-50`;
    row.innerHTML = `
      <td class="font-bold px-4 py-2 border border-white">${slot.time}</td>
      <td class="font-bold border border-white">${slot.cap}</td>
      <td class="font-bold border border-white">${slot.reserved}</td>
    `;

    row.addEventListener("click", () => {
      if (slot.reserved >= slot.cap) {
        alert("This slot is full.");
        return;
      }

      const lab = currentRoom;
      const time = slot.time;
      const dateDisplay = formatDateDisplay(currentDate);

      const params = new URLSearchParams({
        room: lab,
        time: time,
        date: dateDisplay
      });

      // 🔽 NEW: choose destination based on current page
      const isAdmin = window.location.pathname.includes("adminmain.html");
      const destination = isAdmin ? "adminSeating.html" : "seating.html";

      window.location.href = `${destination}?${params.toString()}`;
    });

    timeSlotsTable.appendChild(row);
  });
}

function addSlot(lab, time, date, seat) {
  const li = document.createElement("li");
  li.className = "flex items-center px-3 py-2 rounded bg-white";

  const removeBtn = document.createElement("span");
  removeBtn.className = "text-[#A2F1B6] bg-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold mr-2 cursor-pointer";
  removeBtn.textContent = "×";

  removeBtn.addEventListener("click", () => {
    li.remove();
  });

  const text = document.createElement("span");
  text.className = "text-sm font-bold";
  text.textContent = `${lab} | ${time} | ${date}${seat ? " | Seat: " + seat : ""}`;

  li.appendChild(removeBtn);
  li.appendChild(text);
  slotList.appendChild(li);

  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
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

  const params = new URLSearchParams(window.location.search);
  const lab = params.get("lab");
  const time = params.get("time");
  const date = params.get("date");
  const seat = params.get("seat");
  if (lab && time && date && seat) {
    addSlot(lab, time, date, seat);
  }

  updateRoomDisplay();
});
