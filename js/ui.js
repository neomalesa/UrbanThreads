import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// UI Utilities

/**
 * Loads repeating components (navbar, notification) from index.html.
 * Injects them if they are missing on the current page.
 */
export async function loadComponents() {
  const needsNavbar = document.getElementById('navbar-placeholder');
  const needsNotification = !document.getElementById('notification');
  const needsSearchPanel = !document.getElementById('search-panel');

  let navbar = document.querySelector('.navbar');

  if (needsNavbar || needsNotification || needsSearchPanel) {
    try {
      const response = await fetch('index.html');
      if (!response.ok) throw new Error('Failed to load components from index.html');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (needsNavbar) {
        const fetchedNavbar = doc.querySelector('.navbar');
        if (fetchedNavbar) {
          needsNavbar.replaceWith(fetchedNavbar);
          navbar = fetchedNavbar;
        }
      }

      if (needsNotification) {
        const fetchedNotification = doc.querySelector('#notification');
        if (fetchedNotification) {
          document.body.appendChild(fetchedNotification);
        }
      }

      if (needsSearchPanel) {
        const fetchedSearch = doc.querySelector('#search-panel');
        if (fetchedSearch) {
          document.body.appendChild(fetchedSearch);
        }
      }

      // ✅ initSearch called HERE — after navbar & search panel are in the DOM
      initSearch();

    } catch (error) {
      console.error('Error loading components:', error);
    }
  } else {
    // Elements already exist on index.html itself — init immediately
    initSearch();
  }

  // Highlight active link
  if (navbar) {
    let currentPath = window.location.pathname.split('/').pop();
    if (!currentPath || currentPath === '') currentPath = 'index.html';

    const navLinks = navbar.querySelectorAll('.link[data-path]');
    navLinks.forEach(link => {
      if (link.getAttribute('data-path') === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Notify other scripts that components are ready
  document.dispatchEvent(new CustomEvent('navbarLoaded'));
}

let productsCache = null;

function initSearch() {
  const searchTrigger = document.getElementById('search-trigger');
  const searchPanel = document.getElementById('search-panel');
  const closeSearch = document.getElementById('close-search');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchTrigger || !searchPanel) return;

  // Make sure we only attach listeners once
  if (searchPanel.dataset.initialized) return;
  searchPanel.dataset.initialized = 'true';

  searchTrigger.addEventListener('click', async (e) => {
    e.preventDefault();
    searchPanel.classList.add('active');
    searchInput.focus();

    if (!productsCache) {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        productsCache = [];
        snapshot.forEach(doc => {
          productsCache.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.error("Error loading products for search:", err);
      }
    }
  });

  closeSearch.addEventListener('click', () => {
    searchPanel.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    searchResults.innerHTML = '';

    if (!query || !productsCache) return;

    const filtered = productsCache.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No products found.</p>';
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.imageURL}" class="image" onerror="this.src='https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60'">
        <div class="info">
          <span class="category">${p.category}</span>
          <h3 class="title">${p.name}</h3>
          <div class="price">R${p.price.toFixed(2)}</div>
        </div>
        <button class="btn primary" onclick="window.location.href='shop.html'">Shop Now</button>
      `;
      searchResults.appendChild(card);
    });
  });
}

/**
 * Shows a sliding notification.
 * @param {string} message The message to display
 * @param {boolean} isError Whether the message is an error
 */
export function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message;
  notification.style.borderLeftColor = isError ? '#ff3b30' : '#4cd964';
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Updates the navbar state based on the user's authentication status.
 * @param {object|null} user The Firebase user object or null
 * @param {number} cartCount The number of items in the cart
 */
export function updateNavbarState(user, cartCount = 0) {
  const userEmailEl = document.getElementById('email');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const cartBadge = document.getElementById('badge');

  if (user) {
    if (userEmailEl) {
      userEmailEl.textContent = user.email;
      userEmailEl.style.display = 'inline';
    }
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
    
    // Update cart badge
    if (cartBadge) {
      if (cartCount > 0) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = 'block';
      } else {
        cartBadge.style.display = 'none';
      }
    }
  } else {
    if (userEmailEl) userEmailEl.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
    if (cartBadge) cartBadge.style.display = 'none';
  }
}

// Automatically load components when the DOM is ready
document.addEventListener('DOMContentLoaded', loadComponents);