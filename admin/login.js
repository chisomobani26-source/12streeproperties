
const loginForm = document.getElementById("login-form");

const loginMessage =
  document.getElementById("login-message");


loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();


  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;


  try {

    const response = await fetch(
      "http://localhost:3000/admin/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      loginMessage.textContent =
        data.error || "Login failed.";

      return;
    }


    // Save the JWT token
    localStorage.setItem(
      "adminToken",
      data.token
    );


    loginMessage.textContent =
      "Login successful!";


    // Go to admin dashboard
    window.location.href =
      "admin.html";


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    loginMessage.textContent =
      "Unable to connect to server.";

  }

});

