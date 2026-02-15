// ...existing code...
const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

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
            // usually network failures or CORS errors
            errorMsg.textContent = 'Unable to reach server. Check your network or try again later.';
        } else {
            errorMsg.textContent = 'An unexpected error occurred. Please try again.';
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});
// ...existing code...