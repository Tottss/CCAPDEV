let users = JSON.parse(localStorage.getItem("users")) || []; // user data retrieval from storage

function saveUsers() { // saving users to local storage
    localStorage.setItem("users", JSON.stringify(users));
}

const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser")); // remember me feature
if (rememberedUser) {
    window.location.href = "main.html";
}

document.querySelector("form").addEventListener("submit", function (e) { // login form submission
    e.preventDefault(); // prevents reload on submission

    // gets input from login forms
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // checks if there's a user in the user array
    const userFound = users.some(user => user.username === username && user.password === password);

    if (userFound) {
        if (rememberMe) {
            localStorage.setItem("rememberedUser", JSON.stringify({ username }));
        }
        window.location.href = "main.html";
    } else {
        alert("Incorrect User or Password.");
    }    
});

document.getElementById("signupForm").addEventListener("submit", function (e) { // signup form
    e.preventDefault(); // prevents reload on submission

    // new user input
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
