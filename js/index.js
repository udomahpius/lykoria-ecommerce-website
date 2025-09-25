const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
const API_URL = `${BASE_URL}/api/posts`;

// ===== Load posts per category =====
async function loadCategory(categoryKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<p>Loading ${categoryKey} posts...</p>`;

  try {
    const res = await fetch(`${API_URL}?category=${categoryKey}&status=published&limit=12`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = await res.json();
    if (!posts.length) {
      container.innerHTML = `<p>No posts available for ${categoryKey}.</p>`;
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="post-card">
        <span class="badge">${post.category}</span>
        <img src="${post.image || './assets/default-product.png'}" alt="${post.title}">
        <div class="post-card-content">
          <h3>${post.title}</h3>
          <p>${post.body?.substring(0, 100) || ''}...</p>
          <a href="${post.url || '#'}" target="_blank" class="read-more">
            ${post.urlText || 'Read more'}
          </a>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error(`Error loading ${categoryKey} posts:`, err);
    container.innerHTML = `<p style="color:red;">Failed to load posts for ${categoryKey}.</p>`;
  }
}

// ===== Load all homepage categories =====
function loadHomepagePosts() {
  const categories = [
    { key: "health", container: "health-posts" },
    { key: "entertainment", container: "entertainment-posts" },
    { key: "sports", container: "sports-posts" },
    { key: "technology", container: "technology-posts" },
    { key: "education", container: "education-posts" },
    { key: "religion", container: "religion-posts" }
  ];

  categories.forEach(cat => loadCategory(cat.key, cat.container));
}

// ===== Render sample products & hot deals =====
function renderSampleProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const hotDeals = document.getElementById("hotDeals");
  if (!productsGrid || !hotDeals) return;

  const sampleProducts = [
    { title: "Health Product 1", desc: "Great product", img: "./assets/sample1.png", link: "#" },
    { title: "Sports Gear", desc: "Awesome gear", img: "./assets/sample2.png", link: "#" },
    { title: "Business Book", desc: "Learn fast", img: "./assets/sample3.png", link: "#" },
    { title: "Education Tool", desc: "Educational tool", img: "./assets/sample4.png", link: "#" },
    { title: "Fitness Kit", desc: "Top quality", img: "./assets/sample5.png", link: "#" }
  ];

  // Products grid
  productsGrid.innerHTML = '';
  sampleProducts.forEach(p => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="post-card-content">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <a href="${p.link}" class="read-more">View</a>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  // Hot deals carousel
  hotDeals.innerHTML = '';
  sampleProducts.forEach(p => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="carousel-content">
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      </div>
    `;
    hotDeals.appendChild(item);
  });
}

// ===== Initialize homepage =====
document.addEventListener("DOMContentLoaded", () => {
  loadHomepagePosts();
  renderSampleProducts();
});
