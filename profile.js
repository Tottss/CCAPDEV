document.addEventListener("DOMContentLoaded", () => {
    const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));

    console.log(loggedIn);
    if (loggedIn) {
      const firstName = loggedIn.firstName;
      const lastName = loggedIn.lastName;
      const fullName = firstName + " " + lastName;

      // Set name label
      console.log(fullName);
      document.getElementById("name").textContent = fullName;
    } else {
      // Optional: Redirect to login page if not logged in
      window.location.href = "login.html";
    }
  });