document.getElementById("registerForm")
    .addEventListener("submit", async function (e) {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
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
            body: JSON.stringify({
                fullName: fullName,
                email: email,
                password: password
            })
        });

        const result = await response.text();

        if (result === "User registered successfully!") {

            alert("Registration successful! Please login.");
            window.location.href = "login.html";

        } else {
            errorMsg.textContent = result;
        }

    } catch (error) {
        console.error("Registration error:", error);
        errorMsg.textContent = "Server error. Make sure backend is running.";
    }
});