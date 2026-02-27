// ===============================
// AUTH BACKEND LOGIC
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  console.log("Auth JS Loaded");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // ===============================
  // LOGIN
  // ===============================
  if (loginForm) {

    console.log("Login form detected");

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");

      if (errorMsg) errorMsg.textContent = "";

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.text();
        console.log("Login response:", result);

        if (response.ok) {

          localStorage.setItem("budgetflow_session", JSON.stringify({
            email: email
          }));

          window.location.href = "dashboard.html";
        }

      } catch (error) {
        console.error("Login error:", error);
        if (errorMsg) {
          errorMsg.textContent = "Server error. Make sure backend is running.";
        }
      }
    });
  }

  // ===============================
  // REGISTER
  // ===============================
  if (registerForm) {

    console.log("Register form detected");

    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");

      if (errorMsg) errorMsg.textContent = "";

      try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        const result = await response.text();
        console.log("Register response:", result);

        if (response.ok) {
          alert("Registration successful! Please login.");
          window.location.href = "login.html";
        } else if (errorMsg) {
          errorMsg.textContent = result;
        }

      } catch (error) {
        console.error("Register error:", error);
        if (errorMsg) {
          errorMsg.textContent = "Server error. Make sure backend is running.";
        }
      }
    });
  }

});