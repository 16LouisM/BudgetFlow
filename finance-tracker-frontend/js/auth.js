// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const loginCard = document.querySelector('.login-card');

    // Add focus/blur listeners to inputs to toggle .focused class
    if (loginCard) {
        const inputs = loginCard.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                loginCard.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                // Check if any other input is still focused
                setTimeout(() => {
                    const focused = Array.from(inputs).includes(document.activeElement);
                    if (!focused) {
                        loginCard.classList.remove('focused');
                    }
                }, 0);
            });
        });
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '../finance-tracker-frontend/pages/dashboard.html';
            } else {
                errorMsg.textContent = data.message || 'Login failed';
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err instanceof TypeError) {
                errorMsg.textContent = 'Unable to reach server. Check your network or try again later.';
            } else {
                errorMsg.textContent = 'An unexpected error occurred. Please try again.';
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});