// ====== API BASE ======
const BASE_URL = "https://lykoria-ecommerce-website.onrender.com"; // 🔑 change to your Render URL in production
const API_URL = `${BASE_URL}/api/posts`;
const PROFILE_URL = `${BASE_URL}/api/profile`;

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
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const welcomeMessage = document.getElementById("welcomeMessage");

// ====== PROTECT ADMIN PAGE ======
(function protectAdminPage() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ You must log in first!");
    window.location.href = "login.html";
  }
})();


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

// ====== LOAD POSTS (Only logged-in user’s posts) ======
async function loadPosts() {
  const TOKEN = checkToken();
  if (!TOKEN) return;

  try {
    const res = await fetch(API_URL, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    const posts = await res.json();
    postsContainer.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      postsContainer.innerHTML = "<p>No posts found for your account.</p>";
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post-card");

      div.innerHTML = `
        <h3>${post.title}</h3>
        <p><strong>Category:</strong> ${post.category || "N/A"}</p>
        <p>${post.body.substring(0, 100)}...</p>
        ${post.image ? `<img src="${post.image}" width="150" />` : ""}
        <div class="actions">
          <button onclick="editPost('${post._id}')">Edit</button>
          <button onclick="deletePost('${post._id}')">Delete</button>
        </div>
      `;
      postsContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
    postsContainer.innerHTML = "<p style='color:red'>Error loading posts</p>";
  }
}

// ====== NAV TOGGLE ======
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});

// ====== CLOCK ======
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("clock").innerHTML = `🕒 ${timeString}`;
}

// ====== SHOW WELCOME ======
async function showWelcome() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      welcomeMessage.textContent = "👋 Welcome back!";
      return;
    }

    const response = await fetch(PROFILE_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const data = await response.json();
    const username = `${data.firstName} ${data.lastName}` || "Admin";

    welcomeMessage.textContent = `👋 Welcome back, ${username}!`;
  } catch (error) {
    console.error("Error fetching user:", error);
    welcomeMessage.textContent = "👋 Welcome back!";
  }
}

// ====== INIT ======
window.addEventListener("DOMContentLoaded", () => {
  // Insert clock
  const clockEl = document.createElement("div");
  clockEl.id = "clock";
  clockEl.style.textAlign = "center";
  clockEl.style.margin = "10px 0";
  clockEl.style.fontWeight = "bold";
  clockEl.style.fontSize = "2rem";
  document.body.prepend(clockEl);

  showWelcome();
  updateClock();
  setInterval(updateClock, 1000);
  loadPosts(); // load posts immediately
});

// ====== CATEGORIES ======
const categories = [
  { key: "health", label: "Health" },
  { key: "sports", label: "Sports" },
  { key: "business", label: "Business" },
  { key: "education", label: "Education" },
  { key: "entertainment", label: "Entertainment" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "politics", label: "Politics" },
  { key: "travel", label: "Travel" }
];

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("category");

  select.innerHTML = `<option value="">-- Select Category --</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.key;
    option.textContent = cat.label;
    select.appendChild(option);
  });
});
