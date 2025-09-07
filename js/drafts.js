import { getPosts, deletePost } from "../js/db.js";
import { getCategories } from "../js/db.js";

const draftsContainer = document.querySelector(".draftsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

async function loadDrafts() {
  let posts = await getPosts();
  posts = posts.filter((p) => p.status === "draft");
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
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : new Date(a.createdAt) - new Date(b.createdAt)
  );

  draftsContainer.innerHTML = filtered.map(post => `
    <div class="card">
      <img src="${post.image?.url || ""}" alt="Draft Image">
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <p><strong>Author:</strong> ${post.author?.firstName || ""} ${post.author?.lastName || ""} (${post.author?.email || ""})</p>
      <p><strong>Category:</strong> ${post.category || "Uncategorized"}</p>
      <button class="edit-btn" data-id="${post.id}">Edit</button>
      <button class="delete-btn" data-id="${post.id}">Delete</button>
      <button class="publish-btn" data-id="${post.id}">Publish</button>
    </div>
  `).join("");

  bindCardButtons();
}

// Bind Edit, Delete, and Publish buttons
function bindCardButtons() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const postId = Number(btn.dataset.id);
      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      const draft = posts.find(p => p.id === postId);
      if (draft) {
        localStorage.setItem("editDraft", JSON.stringify(draft));
        window.location.href = "editor.html";
      }
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = Number(btn.dataset.id);
      await deletePost(postId);
      loadDrafts();
    };
  });

  document.querySelectorAll(".publish-btn").forEach(btn => {
    btn.onclick = async () => {
      const postId = Number(btn.dataset.id);
      const posts = await getPosts();
      const postToPublish = posts.find(p => p.id === postId);
      if (!postToPublish) return alert("Post not found!");
      postToPublish.status = "published";
      postToPublish.publishedAt = new Date();
      await updatePost(postToPublish);
      alert(`Post "${postToPublish.title}" published!`);
      loadDrafts(); // refresh drafts
      if (window.loadPublishedPosts) window.loadPublishedPosts();
    };
  });
}

// Event listeners for live filtering
searchInput.addEventListener("input", loadDrafts);
categoryFilter.addEventListener("change", loadDrafts);
sortSelect.addEventListener("change", loadDrafts);

window.loadDrafts = loadDrafts; // expose globally
loadDrafts();
