const users = [
    { username: "Jeru", password: "password" },
    { username: "Admin", password: "1234" },
  ];

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