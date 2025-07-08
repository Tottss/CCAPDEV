// let users = JSON.parse(localStorage.getItem("users")) || []; // user data retrieval from storage
// let loggedIn = JSON.parse(localStorage.getItem("loggedIn"));

// if (!users || users.length === 0) {
//   users = [
//     {
//       firstName: "Alice",
//       lastName: "Santos",
//       email: "alice.santos@dlsu.edu.ph",
//       username: "alice",
//       password: "alice123"
//     },
//     {
//       firstName: "Bob",
//       lastName: "Reyes",
//       email: "bob.reyes@dlsu.edu.ph",
//       username: "bob",
//       password: "bob123"
//     },
//     {
//       firstName: "Charlie",
//       lastName: "Cruz",
//       email: "charlie.cruz@dlsu.edu.ph",
//       username: "charlie",
//       password: "charlie123"
//     },
//     {
//       firstName: "Diane",
//       lastName: "Lopez",
//       email: "diane.lopez@dlsu.edu.ph",
//       username: "diane",
//       password: "diane123"
//     },
//     {
//       firstName: "Evan",
//       lastName: "Tan",
//       email: "evan.tan@dlsu.edu.ph",
//       username: "evan",
//       password: "evan123"
//     },
//     {
//       firstName: "Admin",
//       lastName: " Admin",
//       email:"admin@dlsu.edu.ph",
//       username: "Admin",
//       password: "1234"
//     }
//   ];

//   localStorage.setItem("users", JSON.stringify(users));
// }


// function saveUsers() { // saving users to local storage
//     localStorage.setItem("users", JSON.stringify(users));
// }

document.addEventListener("DOMContentLoaded", () => { // login form submission
    
    // gets input from login forms
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const errorElement = document.getElementById('Error');
    
    // checks if there's a user in the user array
    // const userFound = users.find(user => user.username === username && user.password === password);

    // remember me feature
    const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if (rememberedUser) {
        usernameInput.value = rememberedUser.username;
        passwordInput.value = rememberedUser.password;
        rememberMe.checked = true;
    }

    document.querySelector("form").addEventListener("submit", async function (e) {
      e.preventDefault(); // prevents reload on submission
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      try { // send data to backend
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });

        const result = await response.text();

        if (response.ok) { // if successful login
          // store session info
          if (rememberMe.checked) {
            localStorage.setItem("rememberedUser", JSON.stringify({ username, password }));
          }
          else {
            localStorage.removeItem("rememberedUser");
          }

          if(username === "Admin") {
            window.location.href = "adminmain.html";
          }
          else {
            window.location.href = "main.html";
          }
        }

        else {
          errorElement.textContent = result || "Incorrect username or password";
          usernameInput.value = "";
          passwordInput.value = "";
          usernameInput.focus();
        }
      }

      catch (err) {
        console.error(err);
        errorElement.textContent = "Server Error. Please try again later."
      }
    });

   
    // if (userFound) {
    //   localStorage.setItem("loggedIn",JSON.stringify(userFound));
    //     if (rememberMe) {
    //         localStorage.setItem("rememberedUser", JSON.stringify({ username, password }));
            
    //     }
    //     else {
    //         localStorage.removeItem("rememberedUser");
    //     }
    //     if (userFound.username === "Admin"){
    //       window.location.href = "adminmain.html";
    //     }else{
    //     window.location.href = "main.html";
    //     }
    // } else {
    //     errorElement.textContent = "Incorrect Username and password";

    //     usernameInput.value = "";
    //     passwordInput.value = "";

    //     usernameInput.focus();
    // }    
});