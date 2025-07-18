// document.addEventListener("DOMContentLoaded", async () => {
//   // Modal logic
//   const openBtn = document.getElementById('editPfpBtn');
//   const modal = document.getElementById('pfpModal');
//   const closeBtn = document.getElementById('closeModal');

//   if (openBtn && modal && closeBtn) {
//     openBtn.addEventListener('click', () => {
//       modal.classList.remove('hidden');
//     });

//     closeBtn.addEventListener('click', () => {
//       modal.classList.add('hidden');
//     });

//     modal.addEventListener('click', (e) => {
//       if (e.target === modal) {
//         modal.classList.add('hidden');
//       }
//     });
//   }

//   // Load user info
//   const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
//   if (!loggedIn) return;

//   const userId = loggedIn._id;

//   const res = await fetch(`/api/user/${userId}`);
//   const user = await res.json();
//   console.log("Profile picture filename from DB:", user.profilePicture);

//   const headerImg = document.getElementById("headerPfp");
//   const profileImg = document.getElementById("profilePfp");

//   if (user.profilePicture) {
//     const imageUrl = `/uploads/${user.profilePicture}?t=${Date.now()}`;
//     if (headerImg) headerImg.src = imageUrl;
//     if (profileImg) profileImg.src = imageUrl;
//   } else {
//     if (headerImg) headerImg.src = "user.jpg";
//     if (profileImg) profileImg.src = "user.jpg";
//   }

//   const name = document.getElementById("name");
//   const email = document.getElementById("email");
//   const contact = document.getElementById("contact");
//   const bio = document.getElementById("biography");
//   const links = document.getElementById("links");

//   name.textContent = `${user.firstName} ${user.lastName}`;
//   email.textContent = user.email;
//   contact.textContent = user.contact || "No contact info";
//   bio.textContent = user.biography || "No biography";
//   links.textContent = user.links || "No links";

//   const editBtn = document.getElementById("editProfile");
//   let editing = false;

//   editBtn.addEventListener("click", async () => {
//     if (!editing) {
//       editBtn.textContent = "Save Profile";
//       editing = true;

//       name.innerHTML = `<input id="inputName" value="${user.firstName} ${user.lastName}" class="border rounded px-2 py-1 w-full" />`;
//       email.innerHTML = `<input id="inputEmail" value="${user.email}" class="border rounded px-2 py-1 w-full" />`;
//       contact.innerHTML = `<input id="inputContact" value="${user.contact || ""}" class="border rounded px-2 py-1 w-full" />`;
//       bio.innerHTML = `<textarea id="inputBio" class="border rounded px-2 py-1 w-full">${user.biography || ""}</textarea>`;
//       links.innerHTML = `<input id="inputLinks" value="${user.links || ""}" class="border rounded px-2 py-1 w-full" />`;

//     } else {
//       await saveProfile(userId); 
//       editBtn.textContent = "Edit Profile";
//       editing = false;
//       setTimeout(() => window.location.reload(), 300);
//     }
//   });

  
//   const saveProfile = async (userId) => {
//   const updatedData = {
//     firstName: document.getElementById("inputName").value.split(" ")[0],
//     lastName: document.getElementById("inputName").value.split(" ").slice(1).join(" "),
//     email: document.getElementById("inputEmail").value,
//     contact: document.getElementById("inputContact").value,
//     biography: document.getElementById("inputBio").value,
//     links: document.getElementById("inputLinks").value
//   };

//   await fetch(`/api/user/${userId}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(updatedData)
//   });
// };
//   // Profile picture upload
//   const pfpForm = document.getElementById("pfpForm");
//   if (pfpForm) {
//     pfpForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const fileInput = document.getElementById("pfpInput");
//       const file = fileInput.files[0];
//       if (!file) return alert("Please select a file");

//       const formData = new FormData();
//       formData.append("profilePicture", file);

//       const res = await fetch(`/api/user/${userId}/pfp`, {
//         method: "POST",
//         body: formData
//       });

//       if (res.ok) {
//         alert("Profile picture updated!");
//         window.location.reload();
//       } else {
//         alert("Upload failed");
//       }
//     });
//   }
// });

import { loadHeaderPfp } from './loadHeaderPfp.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Modal logic
  const openBtn = document.getElementById('editPfpBtn');
  const modal = document.getElementById('pfpModal');
  const closeBtn = document.getElementById('closeModal');

  if (openBtn && modal && closeBtn) {
    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Load user info
  const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
  if (!loggedIn) return;

  const userId = loggedIn._id;
  const res = await fetch(`/api/user/${userId}`);
  const user = await res.json();

  const profileImg = document.getElementById("profilePfp");
  if (profileImg) {
    profileImg.src = user.profilePicture
      ? `/uploads/${user.profilePicture}?t=${Date.now()}`
      : "user.jpg";
  }

  await loadHeaderPfp(); // ✅ Use shared code to load header image

  // Fill user info fields
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const contact = document.getElementById("contact");
  const bio = document.getElementById("biography");
  const links = document.getElementById("links");

  name.textContent = `${user.firstName} ${user.lastName}`;
  email.textContent = user.email;
  contact.textContent = user.contact || "No contact info";
  bio.textContent = user.biography || "No biography";
  links.textContent = user.links || "No links";

  // Edit Profile Logic
  const editBtn = document.getElementById("editProfile");
  let editing = false;

  editBtn.addEventListener("click", async () => {
    if (!editing) {
      editBtn.textContent = "Save Profile";
      editing = true;

      name.innerHTML = `<input id="inputName" value="${user.firstName} ${user.lastName}" class="border rounded px-2 py-1 w-full" />`;
      email.innerHTML = `<input id="inputEmail" value="${user.email}" class="border rounded px-2 py-1 w-full" />`;
      contact.innerHTML = `<input id="inputContact" value="${user.contact || ""}" class="border rounded px-2 py-1 w-full" />`;
      bio.innerHTML = `<textarea id="inputBio" class="border rounded px-2 py-1 w-full">${user.biography || ""}</textarea>`;
      links.innerHTML = `<input id="inputLinks" value="${user.links || ""}" class="border rounded px-2 py-1 w-full" />`;
    } else {
      await saveProfile(userId);
      editBtn.textContent = "Edit Profile";
      editing = false;
      setTimeout(() => window.location.reload(), 300);
    }
  });

  async function saveProfile(userId) {
    const updatedData = {
      firstName: document.getElementById("inputName").value.split(" ")[0],
      lastName: document.getElementById("inputName").value.split(" ").slice(1).join(" "),
      email: document.getElementById("inputEmail").value,
      contact: document.getElementById("inputContact").value,
      biography: document.getElementById("inputBio").value,
      links: document.getElementById("inputLinks").value
    };

    await fetch(`/api/user/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
  }

  // Profile picture upload
  const pfpForm = document.getElementById("pfpForm");
  if (pfpForm) {
    pfpForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("pfpInput");
      const file = fileInput.files[0];
      if (!file) return alert("Please select a file");

      const formData = new FormData();
      formData.append("profilePicture", file);

      const uploadRes = await fetch(`/api/user/${userId}/pfp`, {
        method: "POST",
        body: formData
      });

      if (uploadRes.ok) {
        alert("Profile picture updated!");

        // ✅ Re-fetch user info to get actual profilePicture filename
        const updatedUser = await fetch(`/api/user/${userId}`).then(res => res.json());

        if (profileImg) {
          profileImg.src = updatedUser.profilePicture
            ? `/uploads/${updatedUser.profilePicture}?t=${Date.now()}`
            : "user.jpg";
        }

        await loadHeaderPfp(); // Refresh the header too
        modal.classList.add("hidden"); // Close modal
      } else {
        alert("Upload failed");
      }
    });
  }
});
