import { loadHeaderPfp } from '../loadHeaderPfp.js';
document.addEventListener('DOMContentLoaded', loadHeaderPfp);

document.addEventListener("click", (e) => {
  document.querySelectorAll('.dropdown').forEach(drop => {
    if (!e.target.closest('.edit') && !e.target.closest('.dropdown')) {
      drop.classList.add('hidden');
    }
  });

  if (e.target.classList.contains('edit')) {
    const dropdown = e.target.nextElementSibling;
    dropdown.classList.toggle('hidden');

    document.querySelectorAll('.dropdown').forEach(d => {
      if (d !== dropdown) d.classList.add('hidden');
    });
  }
});

function switchTab(tabName) {
  const tabs = ['upcoming', 'past'];

  tabs.forEach(name => {
    document.getElementById(`${name}-tab`).classList.add('hidden');
    const btn = document.getElementById(`tab-${name}`);
    btn?.classList.remove('bg-white', 'text-black', 'shadow');
    btn?.classList.add('text-gray-400');
  });

  document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  const activeBtn = document.getElementById(`tab-${tabName}`);
  activeBtn?.classList.remove('text-gray-400');
  activeBtn?.classList.add('bg-white', 'text-black', 'shadow');

  loadReservations(tabName);
}

async function loadReservations(tabName) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedIn"));
  if (!loggedInUser || !loggedInUser.username) {
    return window.location.href = "/login";
  }

  const username = loggedInUser.username;
  const container = document.getElementById(`${tabName}-tab`);
  container.innerHTML = "";

  try {
    const res = await fetch(`/api/user/view_reservation/${username}`);
    const reservations = await res.json();

    if (!reservations.length) {
      container.innerHTML = `<div class="text-center text-gray-500">No reservations found.</div>`;
      return;
    }

    const now = new Date();
    const filtered = reservations.filter(r => {
      const resDate = new Date(r.date);
      return tabName === 'upcoming' ? resDate >= now : resDate < now;
    });

    if (!filtered.length) {
      container.innerHTML = `<div class="text-center text-gray-500">No ${tabName} reservations.</div>`;
      return;
    }

    filtered.forEach((r) => {
      const dateObj = new Date(r.date);
      const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const day = dateObj.getDate();
      const monthYear = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const requestDate = "2025-06-02"; // hardcoded

      const div = document.createElement("div");
      div.className = "flex flex-col gap-4 mb-12";
      div.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-700 mx-30">${monthYear}</h2>
        <div class="flex items-center justify-between bg-white p-4 mx-30 rounded-lg shadow">
          <div class="flex mx-4 gap-6 items-center">
            <div class="text-center">
              <p class="text-sm text-gray-600">${weekday}</p>
              <h3 class="text-3xl text-green-600 font-bold">${day}</h3>
            </div>
            <div class="w-px h-15 bg-gray-300"></div>
            <div class="text-sm text-gray-800">
              <p>${r.time}</p>
              <p class="text-gray-500">${r.roomCode}</p>
            </div>
            <div class="text-sm text-gray-800 mx-20">
              <p>Seat No. ${r.seatNumber}</p>
              <p>${r.reservedBy || username}</p>
            </div>
          </div>
          <div class="flex gap-6 items-end items-center">
            <div class="flex flex-col text-sm text-gray-800 mx-20 gap-y-2">
              <p class="bg-green-100 rounded-full px-2 text-xs font-semibold text-center">
                Requested ${requestDate}
              </p>
              <p class="bg-green-100 rounded-full px-2 text-xs font-semibold text-center">
                ${r.reservedBy || username}
              </p>
            </div>
            ${tabName === 'upcoming' ? `
            <div class="flex self-center relative">
                <button class="edit bg-gray-100 px-3 py-1 rounded-md text-sm shadow-sm hover:bg-green-100">
                Edit this reservation
                </button>
                <div class="dropdown absolute mt-7 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden z-100">
                <ul class="py-1 text-sm text-gray-700">
                    <li><a href="/seating" class="block px-4 py-2 hover:bg-gray-100">Edit</a></li>
                    <li>
                    <a href="#" class="block px-4 py-2 text-red-500 hover:bg-red-100" onclick="cancelReservation('${r.roomCode}', '${r.date}', '${r.time}', ${r.seatNumber}, this)">
                        Cancel
                    </a>
                    </li>
                </ul>
                </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="text-center text-red-500">Error loading reservations.</div>`;
  }
}
window.cancelReservation = async function cancelReservation(roomCode, date, time, seatNumber, el) {
  if (!confirm("Are you sure you want to cancel this reservation?")) return;

  try {
    const res = await fetch(`/api/user/cancel_reservation`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, date, time, seatNumber }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.message);
      return;
    }

    const box = el.closest(".mb-12");
    box?.remove();

  } catch (err) {
    console.error(err);
    alert("Failed to cancel reservation.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tab-upcoming").addEventListener("click", () => switchTab('upcoming'));
  document.getElementById("tab-past").addEventListener("click", () => switchTab('past'));

  switchTab('upcoming');
});
