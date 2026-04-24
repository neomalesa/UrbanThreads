import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { showNotification, updateNavbarState } from './ui.js';

// Setup Auth State Listener globally
let cartUnsubscribe = null;
let currentUser = null;
let currentCartCount = 0;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    // User is signed in, fetch cart count
    cartUnsubscribe = onSnapshot(collection(db, `users/${user.uid}/cart`), (snapshot) => {
      currentCartCount = snapshot.docs.reduce((total, doc) => total + doc.data().quantity, 0);
      updateNavbarState(user, currentCartCount);
    }, (error) => {
      console.error("Error fetching cart count:", error);
      currentCartCount = 0;
      updateNavbarState(user, 0);
    });

    // If on login page, redirect to shop or home
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'shop.html';
    }
  } else {
    // User is signed out
    if (cartUnsubscribe) {
      cartUnsubscribe();
      cartUnsubscribe = null;
    }
    currentCartCount = 0;
    updateNavbarState(null, 0);

    // If on cart page, redirect to login
    if (window.location.pathname.includes('cart.html')) {
      window.location.href = 'login.html';
    }
  }
});

// Setup DOM event listeners for Auth
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification('Logged in successfully!');
      } catch (error) {
        showNotification(error.message, true);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showNotification('Account created successfully!');
      } catch (error) {
        showNotification(error.message, true);
      }
    });
  }

  // Use event delegation for dynamic logout link
  document.body.addEventListener('click', async (e) => {
    if (e.target.closest('#logout-link')) {
      e.preventDefault();
      try {
        await signOut(auth);
        showNotification('Logged out successfully!');
      } catch (error) {
        showNotification('Error logging out', true);
      }
    }
  });

  // Google Sign-In
  const googleBtns = document.querySelectorAll('.google');
  const provider = new GoogleAuthProvider();
  
  googleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, provider);
        showNotification('Logged in with Google successfully!');
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        showNotification(error.message, true);
      }
    });
  });
});

// Update navbar state when the navbar is injected dynamically
document.addEventListener('navbarLoaded', () => {
  updateNavbarState(currentUser, currentCartCount);
});
