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
  // Apply filters
  const searchQuery = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sortBy = sortSelect.value;

  let filtered = posts.filter(
    (p) =>
      (p.title.toLowerCase().includes(searchQuery) ||
        p.body.toLowerCase().includes(searchQuery) ||
        (p.author?.firstName + " " + p.author?.lastName)
          .toLowerCase()
          .includes(searchQuery)) &&
      (category ? p.category === category : true)
  );

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Render
  draftsContainer.innerHTML = filtered
    .map(
      (post) => `
      <div class="card">
        <img src="${post.image?.url || ""}" alt="Draft Image">
        <h2>${post.title}</h2>
        <p>${post.body}</p>
        <p><strong>Author:</strong> ${post.author?.firstName || ""} ${
        post.author?.lastName || ""
      } (${post.author?.email || ""})</p>
        <p><strong>Category:</strong> ${post.category || "Uncategorized"}</p>
        <button onclick="editDraft(${post.id})">Edit</button>
        <button onclick="removeDraft(${post.id})">Delete</button>
      </div>
    `
    )
    .join("");
}

// Event listeners for live filtering
searchInput.addEventListener("input", loadDrafts);
categoryFilter.addEventListener("change", loadDrafts);
sortSelect.addEventListener("change", loadDrafts);

window.editDraft = (id) => {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const draft = posts.find((d) => d.id === id);
  if (draft) {
    localStorage.setItem("editDraft", JSON.stringify(draft));
    window.location.href = "editor.html";
  }
};

window.removeDraft = async (id) => {
  await deletePost(id);
  loadDrafts();
};

loadDrafts();
