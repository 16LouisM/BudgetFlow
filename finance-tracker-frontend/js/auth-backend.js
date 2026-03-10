// ===============================
// AUTH BACKEND LOGIC (UPDATED)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  console.log("Auth JS Loaded");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // ===============================
  // LOGIN
  // ===============================
  if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");

      if (errorMsg) errorMsg.textContent = "";

      try {
        const response = await fetch("https://your-render-backend-url.onrender.com/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.text();
        console.log("Login response:", result);

        if (response.ok) {

          // 🔥 CRITICAL SESSION STORAGE
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUser", email);

          window.location.replace("dashboard.html");
        } else if (errorMsg) {
          errorMsg.textContent = result;
        }

      } catch (error) {
        console.error("Login error:", error);
        if (errorMsg) {
          errorMsg.textContent = "Server error.";
        }
      }
    });
  }

// ===============================
// REGISTER
// ===============================
if (registerForm) {

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.textContent = "";

    if (password !== confirmPassword) {
      errorMsg.textContent = "Passwords do not match.";
      return;
    }

    try {
      const response = await fetch("https://your-render-backend-url.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const result = await response.text();

      if (!response.ok) {
        errorMsg.textContent = result;
        return;
      }

      alert("Registration successful! Please login.");
      window.location.href = "login.html";

    } catch (error) {
      console.error("Registration error:", error);
      errorMsg.textContent = "Server error. Make sure backend is running.";
    }

  });
}

});