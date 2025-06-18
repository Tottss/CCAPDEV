let users = JSON.parse(localStorage.getItem("users")) || []; // user data retrieval from storage
let loggedIn = JSON.parse(localStorage.getItem("loggedIn")) || [];

if (!users || users.length === 0) {
  users = [
    {
      firstName: "Alice",
      lastName: "Santos",
      email: "alice.santos@dlsu.edu.ph",
      username: "alice",
      password: "alice123"
    },
    {
      firstName: "Bob",
      lastName: "Reyes",
      email: "bob.reyes@dlsu.edu.ph",
      username: "bob",
      password: "bob123"
    },
    {
      firstName: "Charlie",
      lastName: "Cruz",
      email: "charlie.cruz@dlsu.edu.ph",
      username: "charlie",
      password: "charlie123"
    },
    {
      firstName: "Diane",
      lastName: "Lopez",
      email: "diane.lopez@dlsu.edu.ph",
      username: "diane",
      password: "diane123"
    },
    {
      firstName: "Evan",
      lastName: "Tan",
      email: "evan.tan@dlsu.edu.ph",
      username: "evan",
      password: "evan123"
    }
  ];

  localStorage.setItem("users", JSON.stringify(users));
}


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
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe").checked;
    const Error = document.getElementById('Error');
    

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    // checks if there's a user in the user array
    const userFound = users.some(user => user.username === username && user.password === password);

   
    if (userFound) {
      localStorage.setItem("loggedIn",JSON.stringify(userFound));
        if (rememberMe) {
            localStorage.setItem("rememberedUser", JSON.stringify({ username, password }));
            
        }
        else {
            localStorage.removeItem("rememberedUser");
        }
        window.location.href = "main.html";
    } else {
        Error.textContent = "Incorrect Username and password";

        usernameInput.value = "";
        passwordInput.value = "";

        usernameInput.focus();
    }    
});


document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;
    // Get form input values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    const fnameError = document.getElementById('fnameError');
    const lnameError = document.getElementById('lnameError');
    const unameError = document.getElementById('unameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');


    if (!email.endsWith("@dlsu.edu.ph")) {
      emailError.textContent = "Email must be a dlsu email";
      isValid = false;
        
    }else{
        emailError.textContent = "";

    }


    if (username.length < 2) {
      unameError.textContent = "Username must consist of 3 or more characters";
        isValid = false;
        
    }else{
        unameError.textContent = "";

    }

    if (password.length < 2) {
      passwordError.textContent = "password must consist of 3 or more characters";
        isValid = false;
        
    }else{
        passwordError.textContent = "";

    }

    const nameRegex = /^[A-Za-z]+$/;

    // check first name
    if (!nameRegex.test(firstName)) {
      fnameError.textContent = "First name can only contain letters A - Z";
        isValid = false;
        
    }else{
        fnameError.textContent = "";

    }
    //check last name
    if (!nameRegex.test(lastName)) {
      lnameError.textContent = "Last name can only contain letters A - Z";
        isValid = false;
        
    }else{
        lnameError.textContent = "";

    }

    if (!isValid) return;
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
    alert("User registered! You can now log in.");
    e.target.reset(); // Clear the form
    window.location.href = "login.html";
    
  }
});


