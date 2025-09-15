    const API_URL = "http://localhost:5000/api/posts";

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

    async function loadCategory(categoryKey, categoryLabel) {
      try {
        const res = await fetch(`${API_URL}?category=${categoryKey}&limit=6`);
        const posts = await res.json();

        const section = document.createElement("section");
        section.innerHTML = `
          <h2><a href="${categoryKey}.html">${categoryLabel}</a></h2>
          <div class="posts-grid">
            ${posts.map(post => `
              <div class="post-card">
                ${post.image ? `<img src="${post.image}" alt="">` : ""}
                <h3>${post.title}</h3>
                <p>${post.body.substring(0,100)}...</p>
                <a href="${post.url}" target="_blank" class="read-more">${post.urlText || "Read more"}</a>
              </div>
            `).join("")}
          </div>
        `;
        document.getElementById("categories").appendChild(section);
      } catch (err) {
        console.error(`Error loading ${categoryKey}:`, err);
      }
    }

     // Dark/Light toggle
  document.getElementById("toggleTheme").addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark-mode");
  });

    // Load all categories
    categories.forEach(cat => loadCategory(cat.key, cat.label));
