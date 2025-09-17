// ====== API BASE ======
const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/api/posts`;   // works in dev + production

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

// ====== CHECK LOGIN ======
function checkToken() {
  const TOKEN = localStorage.getItem("token");
  if (!TOKEN) {
    alert("You must log in first!");
    window.location.href = "login.html";
    return null;
  }
  return TOKEN;
}

// ====== IMAGE PREVIEW ======
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// ====== CREATE / UPDATE POST ======
postForm.addEventListener("submit", async e => {
  e.preventDefault();
  const TOKEN = checkToken();
  if (!TOKEN) return;

  const postId = postForm.dataset.editingId;
  const endpoint = postId ? `${API_URL}/${postId}` : API_URL;
  const method = postId ? "PUT" : "POST";

  try {
    // Use FormData for text + file in one request
    const formData = new FormData();
    formData.append("title", titleInput.value);
    formData.append("body", bodyInput.value);
    formData.append("url", urlInput.value);
    formData.append("urlText", urlTextInput.value);
    formData.append("category", categorySelect.value);
    formData.append("status", "published");

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    const res = await fetch(endpoint, {
      method,
      headers: { "Authorization": `Bearer ${TOKEN}` },
      body: formData
    });

    if (res.status === 401) {
      alert("Unauthorized! Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

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
    console.error("Request failed:", err);
    alert("Request failed: " + err.message);
  }
});

// ====== LOAD POSTS ======
async function loadPosts() {
  const TOKEN = checkToken();
  if (!TOKEN) return;

  try {
    const res = await fetch(API_URL, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    if (res.status === 401) {
      alert("Unauthorized! Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const posts = await res.json();
    if (!Array.isArray(posts)) {
      postsContainer.innerHTML = "<p>Error loading posts</p>";
      return;
    }

    postsContainer.innerHTML = "";
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <h3>${post.title}</h3>
        <img src="${post.image || ''}" alt="" style="max-width:200px; display:${post.image ? "block" : "none"}">
        <p>${post.body}</p>
        <small>Category: ${post.category}</small><br>
        <a href="${post.url}" target="_blank">${post.urlText || "Read more"}</a>
        <div class="actions">
          <button onclick="editPost('${post._id}')">✏️ Edit</button>
          <button onclick="deletePost('${post._id}')">🗑️ Delete</button>
        </div>
      `;
      postsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading posts:", err);
    postsContainer.innerHTML = "<p>Failed to load posts</p>";
  }
}

// ====== EDIT POST ======
async function editPost(id) {
  const TOKEN = checkToken();
  if (!TOKEN) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    const post = await res.json();
    if (!post || !post._id) return alert("Post not found");

    titleInput.value = post.title;
    bodyInput.value = post.body;
    urlInput.value = post.url;
    urlTextInput.value = post.urlText;
    categorySelect.value = post.category;

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
  const TOKEN = checkToken();
  if (!TOKEN) return;

  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${TOKEN}` }
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

// ====== INIT ======
loadPosts();
