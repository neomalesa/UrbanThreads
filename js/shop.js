import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { showNotification } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('grid');
  if (!productsGrid) return; // Only run on shop page

  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.empty) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>No products found in the database.</p>
          <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
            Tip: Run the seed script or add products to the 'products' collection in Firestore.
          </p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = ''; // Clear loading text

    productsSnapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const productId = docSnap.id;
      
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-card-category', product.category);
      
      card.innerHTML = `
        <img src="${product.imageURL}" alt="${product.name}" class="image" onerror="this.src='https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60'">
        <div class="info">
          <span class="category">${product.category}</span>
          <h3 class="title">${product.name}</h3>
          <div class="price">R${product.price.toFixed(2)}</div>
          <p class="desc">${product.description}</p>
        </div>
        <button class="add" data-id="${productId}">Add to Cart</button>
      `;
      
      productsGrid.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.add').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const user = auth.currentUser;
        if (!user) {
          showNotification('Please log in to add items to cart.', true);
          // Optional: redirect to login
          // window.location.href = 'login.html';
          return;
        }

        const productId = e.target.getAttribute('data-id');
        const btnText = e.target.textContent;
        e.target.textContent = 'Adding...';
        e.target.disabled = true;

        try {
          const productRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const productData = productSnap.data();
            const cartItemRef = doc(db, `users/${user.uid}/cart`, productId);
            const cartItemSnap = await getDoc(cartItemRef);

            if (cartItemSnap.exists()) {
              // Increase quantity
              await updateDoc(cartItemRef, {
                quantity: increment(1)
              });
            } else {
              // Add new item
              await setDoc(cartItemRef, {
                name: productData.name,
                price: productData.price,
                imageURL: productData.imageURL,
                quantity: 1
              });
            }
            showNotification('Item added to cart!');
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          showNotification('Error adding item to cart', true);
        } finally {
          e.target.textContent = btnText;
          e.target.disabled = false;
        }
      });
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--accent-color);">
        <p>Error loading products. Please check your Firebase configuration and database rules.</p>
        <p style="font-size: 0.8rem; margin-top: 1rem;">${error.message}</p>
      </div>
    `;
  }

  // --- Category Filtering Logic ---
  const filterBtns = document.querySelectorAll('.filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active class
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.getAttribute('data-category');
      const allCards = document.querySelectorAll('.card');

      allCards.forEach(card => {
        const cardCategory = card.getAttribute('data-card-category');
        if (category === 'all' || category === cardCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
