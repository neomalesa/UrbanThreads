// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";


const firebaseConfig = {
  apiKey: "AIzaSyBmZZ3kXl3G-AoOu1F8FnlOppwbszNaBnk",
  authDomain: "urbanthreadsstore-b9258.firebaseapp.com",
  projectId: "urbanthreadsstore-b9258",
  storageBucket: "urbanthreadsstore-b9258.firebasestorage.app",
  messagingSenderId: "97753965662",
  appId: "1:97753965662:web:6d321fa201b528489580cf",
  measurementId: "G-0CG8GTVZH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// analytics
const analytics = getAnalytics(app);