document.addEventListener("DOMContentLoaded", () => {
  // ====== BASE URL ======
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

function getTokenAndRole() {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").trim().toLowerCase();

  console.log("DEBUG token:", token);
  console.log("DEBUG role:", role);

  if (!token) {
    alert("⚠️ Token missing! Redirecting to login.");
    window.location.href = "login.html";
    return null;
  }

  // Only redirect if the role really isn't admin
  if (role !== "admin") {
    alert(`⚠️ Access denied. Role is '${role}', not admin.`);
    window.location.href = "login.html";
    return null;
  }

  return token;
}

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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });

  // ====== IMAGE PREVIEW ======
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) {
      previewImg.style.display = "none";
      previewImg.src = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      imageInput.value = "";
      previewImg.style.display = "none";
      previewImg.src = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // ====== WELCOME MESSAGE ======
  async function showWelcome() {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch user profile.");
      const data = await res.json();

      const first = data.firstName || "";
      const last = data.lastName || "";
      if (first || last) {
        welcomeMessage.textContent = `👋 Welcome back, ${first} ${last}`;
      } else {
        welcomeMessage.textContent = "👋 Welcome back, Admin!";
      }
    } catch {
      welcomeMessage.textContent = "👋 Welcome back!";
    }
  }

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

  // ====== LOAD POSTS ======
  async function loadPosts() {
    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
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
      const formData = new FormData();
      formData.append("title", titleInput.value);
      formData.append("body", bodyInput.value);
      formData.append("url", urlInput.value);
      formData.append("urlText", urlTextInput.value);
      formData.append("category", categorySelect.value);
      formData.append("status", "published");
      if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        alert(postId ? "Post updated!" : "Post created!");
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

  // ====== EDIT / DELETE POSTS ======
  async function editPost(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  async function deletePost(id) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Post deleted!");
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
  showWelcome();
  loadPosts();
});
