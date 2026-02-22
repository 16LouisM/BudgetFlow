// auth.js (MODULE VERSION)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyBHAdhAZs_93HA7wc5vlhy5I9COiqmYO8Q",
    authDomain: "budgetflow-ab829.firebaseapp.com",
    projectId: "budgetflow-ab829",
    storageBucket: "budgetflow-ab829.firebasestorage.app",
    messagingSenderId: "1:1002683229140:web:449ac709cb722fb78bac41",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* =========================
   DOM LOADED
========================= */
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const loginCard = document.querySelector('.login-card');
    const googleBtn = document.getElementById('googleLoginBtn');

    /* ===== INPUT FOCUS EFFECT ===== */
    if (loginCard) {
        const inputs = loginCard.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                loginCard.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    const focused = Array.from(inputs).includes(document.activeElement);
                    if (!focused) {
                        loginCard.classList.remove('focused');
                    }
                }, 0);
            });
        });
    }

    /* =========================
       EMAIL + PASSWORD LOGIN
    ========================= */
    if (loginForm) {
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
                    window.location.href = '../pages/dashboard.html';
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                }

            } catch (err) {
                console.error('Login error:', err);
                errorMsg.textContent = 'Unable to reach server. Try again later.';
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    /* =========================
       GOOGLE LOGIN
    ========================= */
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                // Get Firebase ID token
                const idToken = await user.getIdToken();

                // Send token to your backend
                const response = await fetch('http://localhost:8080/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: idToken })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '../pages/dashboard.html';
                } else {
                    errorMsg.textContent = data.message || 'Google login failed';
                }

            } catch (error) {
                console.error('Google login error:', error);
                errorMsg.textContent = 'Google login failed. Try again.';
            }
        });
    }

});
