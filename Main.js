const roomButtons = document.querySelectorAll('button');
const displayDate = document.getElementById('displayDate');
const dateInput = document.getElementById('date');
const roomTitle = document.querySelector('h2.text-2xl');
const timeSlotsTable = document.querySelector('#timeSlots tbody');
const slotList = document.getElementById("slotList");
const scrollContainer = document.getElementById("slotScroll");

let currentRoom = "G201";
let currentDate = new Date().toISOString().split("T")[0];

document.getElementById('confirmBtn').addEventListener('click', function () {
  window.location.href = 'login.html';
});

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
          date: formatDateDisplay(currentDate)
        });

        const isAdmin = window.location.pathname.includes("adminmain.html");
        const destination = isAdmin ? "adminSeating.html" : "seating.html";

        window.location.href = `${destination}?${params.toString()}`;
      });

      timeSlotsTable.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to load room data:", err);
    alert("Unable to fetch time slots. Please try again.");
  }
}

function addSlot(lab, time, date, seat) {
  const li = document.createElement("li");
  li.className = "flex items-center px-3 py-2 rounded";
  li.style="background-color: #A2F1B6;"

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
      updateRoomDisplay(); // This already clears and reloads time slot content
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
  addSlot("G202", "0815 - 0845", "07/20/25");
  addSlot("G203", "1245 - 1315", "07/20/25");
  addSlot("G202", "0815 - 0845", "07/25/25");
  addSlot("G211", "1245 - 1315", "07/27/25");
});
