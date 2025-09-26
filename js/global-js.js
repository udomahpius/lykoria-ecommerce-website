// ================= CART SYSTEM =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Add product to cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  alert(`${product.title} added to cart!`);
}

// Remove product from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

// Change quantity (+/-)
function changeQuantity(id, amount) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) {
    removeFromCart(id);
  }
  saveCart();
  renderCart();
}

// Update cart count in navbar
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.innerText = count;
}

// Render cart on cart.html
function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let rows = cart.map(item => `
    <tr>
      <td><img src="${item.image}" alt="${item.title}" width="60"></td>
      <td>${item.title}</td>
      <td>₦${item.price.toLocaleString()}</td>
      <td>
        <button onclick="changeQuantity('${item.id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity('${item.id}', 1)">+</button>
      </td>
      <td>₦${(item.price * item.quantity).toLocaleString()}</td>
      <td><button onclick="removeFromCart('${item.id}')">❌</button></td>
    </tr>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="cart-summary">
      <h3>Total: ₦${total.toLocaleString()}</h3>
      <button onclick="checkout()">Proceed to Checkout</button>
    </div>
  `;
}

// Dummy checkout function
function checkout() {
  alert("Checkout not implemented yet. Cart data is ready for backend.");
  console.log("Cart Data:", cart);
}

// ================= EVENT HANDLER =================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // Add to cart for any button with class="add-to-cart"
  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("add-to-cart")) {
      const btn = e.target;
      const product = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image
      };
      addToCart(product);
    }
  });
});


// === Search function ===
async function handleSearch() {
  const query = document.querySelector(".search-box input").value.trim();
  const category = document.querySelector(".search-category").value;

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // === Filter results ===
    let results = data.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.description.toLowerCase().includes(query.toLowerCase())
    );

    // === Category filter ===
    if (category !== "all") {
      results = results.filter(post => 
        post.category && post.category.toLowerCase() === category.toLowerCase()
      );
    }

    // === Display results ===
    displaySearchResults(results, query);

  } catch (err) {
    console.error("Search failed:", err);
    alert("Something went wrong. Please try again.");
  }
}

// === Display function ===
function displaySearchResults(results, query) {
  const container = document.getElementById("searchResults");
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `<p>No results found for "<b>${query}</b>".</p>`;
    return;
  }

  container.innerHTML = results.map(post => `
    <div class="result-card">
      <img src="${post.image || '../assets/placeholder.png'}" alt="${post.title}">
      <div class="result-info">
        <h3>${post.title}</h3>
        <p>${post.description.substring(0, 100)}...</p>
        <a href="details.html?id=${post._id}">View More</a>
      </div>
    </div>
  `).join("");
}


function toggleMenu() {
  document.getElementById("mobileNav").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Expandable submenu in mobile
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".mobile-nav .has-sub > a").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      item.parentElement.classList.toggle("open");
    });
  });
});
