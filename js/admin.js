// ============================
// admin.js
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

  // ============================
  // Auth check
  // ============================
  function getToken() {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token) {
      alert("⚠️ Token missing! Redirecting to login.");
      window.location.href = "login.html";
      return null;
    }
    if (role !== "admin") {
      alert(`⚠️ Access denied. Role is '${role}', not admin.`);
      window.location.href = "login.html";
      return null;
    }
    return token;
  }

  const token = getToken();
  if (!token) return;

  // ============================
  // Elements
  // ============================
  const el = id => document.getElementById(id);
  const ui = {
    postForm: el("postForm"),
    titleInput: el("title"),
    bodyInput: el("body"),
    urlInput: el("url"),
    urlTextInput: el("urlText"),
    categorySelect: el("category"),
    imageInput: el("image"),
    previewImg: el("preview"),
    postsContainer: el("postsContainer"),
    welcomeMessage: el("welcomeMessage"),
    welcomeClock: el("welcomeClock"),
    logoutBtn: el("logoutBtn"),
  };

  // ============================
  // Logout
  // ============================
  ui.logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ============================
  // Clock
  // ============================
  function updateClock() {
    ui.welcomeClock.textContent = `🕒 ${new Date().toLocaleTimeString()}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ============================
  // Categories
  // ============================
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

  function loadCategories() {
    ui.categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.key;
      option.textContent = cat.label;
      ui.categorySelect.appendChild(option);
    });
  }
  loadCategories();

  // ============================
  // Profile
  // ============================
  async function loadProfile() {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const user = await res.json();
      if (user.firstName) localStorage.setItem("firstName", user.firstName);
      if (user.lastName) localStorage.setItem("lastName", user.lastName);
      ui.welcomeMessage.innerText = user.firstName && user.lastName
        ? `👋 Welcome back, ${user.firstName} ${user.lastName}!`
        : `👋 Welcome back, ${user.email || "Admin"}`;
    } catch (err) {
      console.error("Profile load error:", err);
      ui.welcomeMessage.innerText = "👋 Welcome back!";
    }
  }

  // ============================
  // Image Preview
  // ============================
  ui.imageInput.addEventListener("change", () => {
    const file = ui.imageInput.files[0];
    if (!file) return ui.previewImg.style.display = "none";
    if (!file.type.startsWith("image/")) {
      alert("❌ Please select a valid image.");
      ui.imageInput.value = "";
      ui.previewImg.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = e => { ui.previewImg.src = e.target.result; ui.previewImg.style.display = "block"; };
    reader.readAsDataURL(file);
  });

  // ============================
  // Posts
  // ============================
  async function loadPosts() {
    try {
      const res = await fetch(`${BASE_URL}/api/posts`, { headers: { Authorization: `Bearer ${token}` } });
      const posts = await res.json();
      ui.postsContainer.innerHTML = "";
      if (!Array.isArray(posts) || !posts.length) {
        ui.postsContainer.innerHTML = "<p>No posts found</p>";
        return;
      }
      posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post-card");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p><strong>Category:</strong> ${post.category || "N/A"}</p>
          <p>${post.body?.substring(0, 100)}...</p>
          ${post.image ? `<img src="${post.image}" />` : ""}
          <div class="actions">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </div>
        `;
        div.querySelector(".edit").addEventListener("click", () => editPost(post._id));
        div.querySelector(".delete").addEventListener("click", () => deletePost(post._id));
        ui.postsContainer.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      ui.postsContainer.innerHTML = "<p style='color:red'>Error loading posts</p>";
    }
  }

  // ============================
  // Create / Update Post
  // ============================
  ui.postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const postId = ui.postForm.dataset.editingId;
    const endpoint = postId ? `${BASE_URL}/api/posts/${postId}` : `${BASE_URL}/api/posts`;
    const method = postId ? "PUT" : "POST";

    try {
      const formData = new FormData(ui.postForm);
      formData.append("status", "published");

      const res = await fetch(endpoint, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();

      if (data.success) {
        alert(postId ? "✅ Post updated!" : "✅ Post created!");
        ui.postForm.reset();
        ui.previewImg.style.display = "none";
        delete ui.postForm.dataset.editingId;
        loadPosts();
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Request failed: " + err.message);
    }
  });

  // ============================
  // Edit Post
  // ============================
  async function editPost(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const post = await res.json();
      if (!post._id) return alert("Post not found");

      ui.titleInput.value = post.title;
      ui.bodyInput.value = post.body;
      ui.urlInput.value = post.url;
      ui.urlTextInput.value = post.urlText;
      ui.categorySelect.value = post.category || "";
      if (post.image) { ui.previewImg.src = post.image; ui.previewImg.style.display = "block"; }
      else { ui.previewImg.style.display = "none"; }

      ui.postForm.dataset.editingId = id;
    } catch (err) {
      console.error(err);
      alert("Failed to load post for editing");
    }
  }

  // ============================
  // Delete Post
  // ============================
  async function deletePost(id) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        alert("✅ Post deleted!");
        loadPosts();
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  }

  // ============================
  // Initialize
  // ============================
  loadProfile();
  loadPosts();
});
