import { getPosts } from "../js/db.js";

const publishedContainer = document.querySelector(".publishedContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

async function loadPublishedPosts() {
  let posts = await getPosts();
  posts = posts.filter(post => post.status === "published");
  renderPosts(posts);
}

function renderPosts(posts) {
  const searchQuery = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sortBy = sortSelect.value;

  let filtered = posts.filter(post =>
    (post.title.toLowerCase().includes(searchQuery) ||
      post.body.toLowerCase().includes(searchQuery) ||
      (post.author?.firstName + " " + post.author?.lastName).toLowerCase().includes(searchQuery)) &&
    (category ? post.category === category : true)
  );

  filtered.sort((a, b) => sortBy === "newest"
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : new Date(a.createdAt) - new Date(b.createdAt)
  );

  publishedContainer.innerHTML = filtered.map(post => `
    <div class="card">
      <img src="${post.image?.url || ""}" alt="Post Image">
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <p><strong>Author:</strong> ${post.author?.firstName || ""} ${post.author?.lastName || ""}</p>
      <p><strong>Category:</strong> ${post.category || "Uncategorized"}</p>
    </div>
  `).join("");
}

// Filters
searchInput.addEventListener("input", loadPublishedPosts);
categoryFilter.addEventListener("change", loadPublishedPosts);
sortSelect.addEventListener("change", loadPublishedPosts);

// Initial load
loadPublishedPosts();
