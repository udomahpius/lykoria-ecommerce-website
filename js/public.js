import { getPosts, updatePost, deletePost } from "../js/db.js";
import { getCategories } from "../js/db.js";

const publishedContainer = document.querySelector(".publishedContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

async function loadPublishedPosts() {
  let posts = await getPosts();
  posts = posts.filter((p) => p.status === "published");
  renderPosts(posts);
}

async function loadCategoryFilter() {
  const categories = await getCategories();
  categoryFilter.innerHTML = `<option value="">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    categoryFilter.appendChild(opt);
  });
}

loadCategoryFilter();

function renderPosts(posts) {
  const searchQuery = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sortBy = sortSelect.value;

  let filtered = posts.filter(
    (p) =>
      (p.title.toLowerCase().includes(searchQuery) ||
       p.body.toLowerCase().includes(searchQuery) ||
       (p.author?.firstName + " " + p.author?.lastName).toLowerCase().includes(searchQuery)) &&
      (category ? p.category === category : true)
  );

  filtered.sort((a, b) => sortBy === "newest"
    ? new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    : new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt)
  );

  publishedContainer.innerHTML = filtered.map(post => `
    <div class="card">
      <img src="${post.image?.url || ""}" alt="Post Image">
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <p><strong>Author:</strong> ${post.author?.firstName || ""} ${post.author?.lastName || ""} (${post.author?.email || ""})</p>
      <p><strong>Category:</strong> ${post.category || "Uncategorized"}</p>
      <p><strong>Published At:</strong> ${post.publishedAt ? new Date(post.publishedAt).toLocaleString() : "Unknown"}</p>
      <button class="delete-btn" data-id="${post.id}">Delete</button>
    </div>
  `).join("");

  bindCardButtons();
}

// Delete button functionality
function bindCardButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = Number(btn.dataset.id);
      await deletePost(postId);
      loadPublishedPosts();
    };
  });
}

// Live filtering
searchInput.addEventListener("input", loadPublishedPosts);
categoryFilter.addEventListener("change", loadPublishedPosts);
sortSelect.addEventListener("change", loadPublishedPosts);

window.loadPublishedPosts = loadPublishedPosts; // expose globally
loadPublishedPosts();
