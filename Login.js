let users = JSON.parse(localStorage.getItem("users")) || [];

  function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
  }

  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); 

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    
    const userFound = users.some(user => user.username === username && user.password === password);

    if (userFound) {
        window.location.href = "main.html";
    } else {
      alert("Incorrect User or Password.");
    }

    
});

document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;

    const exists = users.some(user => user.username === username);

    if (exists) {
      alert("Username already taken.");
    } else {
      users.push({ username, password });
      saveUsers(); // save to localStorage
      alert("User registered! You can now log in.");
      e.target.reset();
    }
});