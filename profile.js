let loggedIn = JSON.parse(localStorage.getItem("loggedIn")) || [];


let firstName = loggedIn.firstName;
let lastName = loggedIn.lastName;
let fullName = firstName + " " + lastName;
console.log("Full Name:", fullName);
document.getElementById("name").textContent = fullName;