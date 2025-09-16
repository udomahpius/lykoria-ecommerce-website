// ====== API BASE ======
const API_URL = "/api/posts"; // works in dev + Vercel

// ====== CATEGORIES ======
const categories = [
  { key: "tech", label: "Tech" },
  { key: "health", label: "Health" },
  { key: "sports", label: "Sports" },
  { key: "business", label: "Business" },
  { key: "education", label: "Education" },
  { key: "entertainment", label: "Entertainment" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "politics", label: "Politics" },
];

// ====== LOAD CATEGORY POSTS ======
async function loadCategory(categoryKey, categoryLabel) {
  try {
    const res = await fetch(`${API_URL}?category=${categoryKey}&limit=6`);

    if (!res.ok) {
      throw new Error(`Failed to load ${categoryLabel} posts`);
    }

    const posts = await res.json();

    const section = document.createElement("section");
    section.innerHTML = `
      <h2><a href="${categoryKey}.html">${categoryLabel}</a></h2>
      <div class="posts-grid">
        ${
          posts.length > 0
            ? posts
                .map(
                  (post) => `
          <div class="post-card">
            ${post.image ? `<img src="${post.image}" alt="">` : ""}
            <h3>${post.title}</h3>
            <p>${post.body ? post.body.substring(0, 100) : ""}...</p>
            <a href="${post.url}" target="_blank" class="read-more">
              ${post.urlText || "Read more"}
            </a>
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
      <p style="color:red;">Failed to load posts. Please check your internet connection.</p>
    `;
    document.getElementById("categories").appendChild(fallback);
  }
}

// ====== THEME TOGGLE ======
const toggleThemeBtn = document.getElementById("toggleTheme");
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isDark = document.body.classList.toggle("dark-mode");
    toggleThemeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("site-theme", isDark ? "dark" : "light");
  });

  // Load saved theme on page load
  const savedTheme = localStorage.getItem("site-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggleThemeBtn.textContent = "☀️ Light Mode";
  }
}

// ====== INIT ======
categories.forEach((cat) => loadCategory(cat.key, cat.label));
