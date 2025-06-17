let users = JSON.parse(localStorage.getItem("users")) || []; // user data retrieval from storage

function saveUsers() { // saving users to local storage
    localStorage.setItem("users", JSON.stringify(users));
}

const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser")); // remember me feature
if (rememberedUser) {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("username").value = rememberedUser.username;
        document.getElementById("password").value = rememberedUser.password;
        document.getElementById("rememberMe").checked = true;
    })
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
            localStorage.setItem("rememberedUser", JSON.stringify({ username, password }));
        }
        else {
            localStorage.removeItem("rememberedUser");
        }
        window.location.href = "main.html";
    } else {
        alert("Incorrect User or Password.");
    }    
});


document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form input values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;

    // Check if username already exists
    const exists = users.some(user => user.username === username);

    if (exists) {
        alert("Username already taken.");
    } else {
    // Add new user with all fields
        users.push({
            firstName,
            lastName,
            email,
            username,
            password
    });

    saveUsers(); // Save to localStorage
    alert("✅ User registered! You can now log in.");
    e.target.reset(); // Clear the form
    window.location.href = "login.html";
    }
});
