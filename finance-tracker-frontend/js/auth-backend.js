document.getElementById("loginForm")
    .addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.text();

        if (result === "Login successful!") {
            window.location.href = "dashboard.html";
        } else {
            errorMsg.textContent = result;
        }

    } catch (error) {
        console.error("Login error:", error);
        errorMsg.textContent = "Server error. Make sure backend is running.";
    }
});