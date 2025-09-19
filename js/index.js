// ====== API BASE ======
const BASE_URL = "https://adminblog-zk87.onrender.com";
const API_URL = `${BASE_URL}/api/posts`;

// ====== CATEGORIES (map backend keys to labels) ======
const categories = [
  { key: "health", label: "Health" },
  { key: "sports", label: "Sports" },
  { key: "business", label: "Business" },
  { key: "education", label: "Education" },
  { key: "entertainment", label: "Entertainment" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "politics", label: "Politics" },
  { key: "travel", label: "Travel" },
];

// ====== LOAD CATEGORY POSTS ======
async function loadCategory(categoryKey, categoryLabel) {
  try {
    const res = await fetch(`${API_URL}?category=${categoryKey}&status=published&limit=6`);
    if (!res.ok) throw new Error(`Failed to load ${categoryLabel} posts`);

    const posts = await res.json();

    const section = document.createElement("section");
    section.innerHTML = `
      <h2><a href="./product-category/${categoryKey}.html">${categoryLabel}</a></h2>
      <div class="posts-grid">
        ${
          posts.length > 0
            ? posts
                .map(
                  (post) => `
          <div class="post-card">
            <span class="badge">${post.category}</span>
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ""}
            <div class="post-card-content">
              <h3>${post.title}</h3>
              <p>${post.body ? post.body.substring(0, 100) : ""}...</p>
              <a href="${post.url}" target="_blank" class="read-more">
                ${post.urlText || "Read more"}
              </a>
            </div>
          </div>
        `
                )
                .join("")
            : `<p>No posts available in ${categoryLabel}</p>`
        }
      </div>
    `;
    document.getElementById("categories").appendChild(section);
  } catch (err) {
    console.error(`Error loading ${categoryKey}:`, err);
    const fallback = document.createElement("section");
    fallback.innerHTML = `
      <h2>${categoryLabel}</h2>
      <p style="color:red;">⚠️ Failed to load posts. Please try again later.</p>
    `;
    document.getElementById("categories").appendChild(fallback);
  }
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  categories.forEach((cat) => loadCategory(cat.key, cat.label));
});
