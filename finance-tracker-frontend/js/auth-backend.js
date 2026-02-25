document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // ================= LOGIN =================
  if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      errorMsg.textContent = "";

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.text();

        if (response.ok) {
          localStorage.setItem("isLoggedIn", "true");
          window.location.href = "dashboard.html";
        } else {
          errorMsg.textContent = result;
        }

      } catch (error) {
        console.error(error);
        errorMsg.textContent = "Server error. Make sure backend is running.";
      }
    });
  }

  // ================= REGISTER =================
  if (registerForm) {

    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      errorMsg.textContent = "";

      try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        const result = await response.text();

        if (response.ok) {
          alert("Registration successful! Please login.");
          window.location.href = "login.html";
        } else {
          errorMsg.textContent = result;
        }

      } catch (error) {
        console.error(error);
        errorMsg.textContent = "Server error. Make sure backend is running.";
      }
    });
  }

});