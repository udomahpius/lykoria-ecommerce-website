const BASE_URL = "https://lykoria-ecommerce-website.onrender.com"; // Your API base
const API_URL = `${BASE_URL}/api/posts`;

// ===== Load 12 latest posts per category =====
async function loadCategory(categoryKey, containerId) {
  try {
    // Fetch latest 12 posts per category
    const res = await fetch(`${API_URL}?category=${categoryKey}&status=published&limit=12`);
    const posts = await res.json();

    const container = document.getElementById(containerId);
    container.innerHTML = posts.map(post => `
      <div class="post-card">
        <span class="badge">${post.category}</span>
        ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ""}
        <div class="post-card-content">
          <h3>${post.title}</h3>
          <p>${post.body}</p>
          <a href="${post.url}" target="_blank" class="read-more">
            ${post.urlText || "Read more"}
          </a>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error(`Error loading ${categoryKey} posts:`, error);
  }
}

// ===== Call categories for homepage =====
document.addEventListener("DOMContentLoaded", () => {
  loadCategory("health", "health-posts");
  loadCategory("entertainment", "entertainment-posts");
  loadCategory("sports", "sports-posts");
  loadCategory("technology", "technology-posts");
  loadCategory("education", "education-posts");
  loadCategory("religion", "religion-posts");
});
