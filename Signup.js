document.getElementById("signupForm").addEventListener("submit", async function (e) {
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

    try {
        const response = await fetch("/api/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, email, username, password })
        });

        const result = await response.text();

        if (response.ok) {
            alert("User registered! You can now log in.");
            e.target.reset();
            window.location.href = "login.html";
        }
        else {
            alert("Signup failed: " + result);
        }
    }

    catch (err) {
        console.error(err);
        alert("Server error. Please try again later.");
    }
});