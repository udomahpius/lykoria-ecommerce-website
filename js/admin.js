document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

  // ====== TOKEN & ROLE CHECK ======
  function getTokenAndRole() {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").trim().toLowerCase();

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

  const token = getTokenAndRole();
  if (!token) return;

  // ====== ELEMENTS ======
  const postForm = document.getElementById("postForm");
  const titleInput = document.getElementById("title");
  const bodyInput = document.getElementById("body");
  const urlInput = document.getElementById("url");
  const urlTextInput = document.getElementById("urlText");
  const categorySelect = document.getElementById("category");
  const imageInput = document.getElementById("image");
  const previewImg = document.getElementById("preview");
  const postsContainer = document.getElementById("postsContainer");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const welcomeClock = document.getElementById("welcomeClock");
  const logoutBtn = document.getElementById("logoutBtn");

  // ====== LOGOUT ======
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ====== IMAGE PREVIEW ======
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) {
      previewImg.style.display = "none";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("❌ Please select a valid image.");
      imageInput.value = "";
      previewImg.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // ====== CLOCK ======
  function updateClock() {
    welcomeClock.textContent = `🕒 ${new Date().toLocaleTimeString()}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ====== LOAD CATEGORIES ======
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
  categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.key;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });

  // ====== LOAD PROFILE ======
  async function loadProfile() {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");

      const user = await res.json();

      // save to localStorage for later use
      if (user.firstName) localStorage.setItem("firstName", user.firstName);
      if (user.lastName) localStorage.setItem("lastName", user.lastName);

      welcomeMessage.innerText = user.firstName && user.lastName
        ? `👋 Welcome back, ${user.firstName} ${user.lastName}!`
        : `👋 Welcome back, ${user.email || "Admin"}`;
    } catch (err) {
      console.error("Profile load error:", err);
      welcomeMessage.innerText = "👋 Welcome back!";
    }
  }

  // ====== LOAD POSTS ======
  async function loadPosts() {
    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const posts = await res.json();
      postsContainer.innerHTML = "";

      if (!Array.isArray(posts) || posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts found</p>";
        return;
      }

      posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post-card");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p><strong>Category:</strong> ${post.category || "N/A"}</p>
          <p>${post.body.substring(0, 100)}...</p>
          ${post.image ? `<img src="${post.image}" />` : ""}
          <div class="actions">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </div>
        `;
        div.querySelector(".edit").addEventListener("click", () => editPost(post._id));
        div.querySelector(".delete").addEventListener("click", () => deletePost(post._id));
        postsContainer.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      postsContainer.innerHTML = "<p style='color:red'>Error loading posts</p>";
    }
  }

  // ====== CREATE / UPDATE POST ======
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const postId = postForm.dataset.editingId;
    const endpoint = postId ? `${BASE_URL}/api/posts/${postId}` : `${BASE_URL}/api/posts`;
    const method = postId ? "PUT" : "POST";

    try {
      const formData = new FormData(postForm);
      formData.append("status", "published");

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        alert(postId ? "✅ Post updated!" : "✅ Post created!");
        postForm.reset();
        previewImg.style.display = "none";
        delete postForm.dataset.editingId;
        loadPosts();
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Request failed: " + err.message);
    }
  });

  // ====== EDIT POST ======
  async function editPost(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const post = await res.json();
      if (!post._id) return alert("Post not found");

      titleInput.value = post.title;
      bodyInput.value = post.body;
      urlInput.value = post.url;
      urlTextInput.value = post.urlText;
      categorySelect.value = post.category || "";
      if (post.image) {
        previewImg.src = post.image;
        previewImg.style.display = "block";
      } else {
        previewImg.style.display = "none";
      }
      postForm.dataset.editingId = id;
    } catch (err) {
      console.error(err);
      alert("Failed to load post for editing");
    }
  }

  // ====== DELETE POST ======
  async function deletePost(id) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // ====== INITIALIZE ======
  loadProfile();
  loadPosts();
});
