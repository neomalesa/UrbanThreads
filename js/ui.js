// UI Utilities

/**
 * Loads repeating components (navbar, notification) from index.html.
 * Injects them if they are missing on the current page.
 */
export async function loadComponents() {
  const needsNavbar = document.getElementById('navbar-placeholder');
  const needsNotification = !document.getElementById('notification');

  let navbar = document.querySelector('.navbar');

  if (needsNavbar || needsNotification) {
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
    } catch (error) {
      console.error('Error loading components:', error);
    }
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
