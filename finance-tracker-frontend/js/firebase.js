// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHAdhAZs_93HA7wc5vlhy5I9COiqmYO8Q",
  authDomain: "budgetflow-ab829.firebaseapp.com",
  projectId: "budgetflow-ab829",
  storageBucket: "budgetflow-ab829.firebasestorage.app",
  messagingSenderId: "1002683229140",
  appId: "1:1002683229140:web:449ac709cb722fb78bac41",
  measurementId: "G-C27M88R5FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);