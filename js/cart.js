import { db, auth } from './firebase-config.js';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { showNotification } from './ui.js';

let unsubscribeCart = null;

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('items-container');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');

  if (!cartItemsContainer) return; // Only run on cart page

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadCart(user.uid);
    } else {
      cartItemsContainer.innerHTML = '<p>Please log in to view your cart.</p>';
      if (unsubscribeCart) unsubscribeCart();
    }
  });

  function loadCart(userId) {
    const cartRef = collection(db, `users/${userId}/cart`);
    
    unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
      if (snapshot.empty) {
        cartItemsContainer.innerHTML = `
          <div class="empty">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any streetwear yet.</p>
            <a href="shop.html" class="btn primary" style="margin-top: 1.5rem;">Go Shopping</a>
          </div>
        `;
        updateTotals(0);
        return;
      }

      cartItemsContainer.innerHTML = '';
      let subtotal = 0;

      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const itemId = docSnap.id;
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'item';
        cartItemEl.innerHTML = `
          <img src="${item.imageURL}" alt="${item.name}" class="image" onerror="this.src='https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150&auto=format&fit=crop&q=60'">
          <div class="details">
            <h4 class="title">${item.name}</h4>
            <div class="price">R${item.price.toFixed(2)} x ${item.quantity}</div>
          </div>
          <div class="actions">
            <div style="font-weight: bold;">R${itemTotal.toFixed(2)}</div>
            <button class="remove" data-id="${itemId}">Remove</button>
          </div>
        `;
        
        cartItemsContainer.appendChild(cartItemEl);
      });

      updateTotals(subtotal);

      // Attach remove event listeners
      document.querySelectorAll('.remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-id');
          try {
            await deleteDoc(doc(db, `users/${userId}/cart`, itemId));
            showNotification('Item removed from cart');
          } catch (error) {
            console.error("Error removing item:", error);
            showNotification('Failed to remove item', true);
          }
        });
      });
    }, (error) => {
      console.error("Cart subscription error:", error);
      cartItemsContainer.innerHTML = '<p>Error loading cart. Check permissions.</p>';
    });
  }

  function updateTotals(subtotal) {
    if (cartSubtotalEl) cartSubtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `R${subtotal.toFixed(2)}`; // Free shipping
  }
});
