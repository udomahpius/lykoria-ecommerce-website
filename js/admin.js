// ==========================
// CONFIG
// ==========================
const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
const API_URL = `${BASE_URL}/api/posts`;
const PROFILE_URL = `${BASE_URL}/api/profile`;

// ==========================
// TOKEN & ROLE CHECK
// ==========================
function getTokenAndRole() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "admin") {
    window.location.href = "login.html"; // silent redirect
    return null;
  }
  return token;
}

const token = getTokenAndRole();
if (!token) throw new Error("Admin access required");

// ==========================
// ELEMENTS
// ==========================
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

const logoutBtn = document.getElementById("logoutBtn");
const totalPostsEl = document.getElementById("totalPosts");
const totalViewsEl = document.getElementById("totalViews");
const totalReactionsEl = document.getElementById("totalReactions");
const postsTable = document.getElementById("postsTable");
const postsChartCtx = document.getElementById("postsChart")?.getContext("2d");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const filterBtn = document.getElementById("filterBtn");

let postsChart;

// ==========================
// LOGOUT
// ==========================
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

// ==========================
// IMAGE PREVIEW
// ==========================
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

// ==========================
// POST CREATE / UPDATE
// ==========================
postForm.addEventListener("submit", async e => {
  e.preventDefault();
  const TOKEN = getTokenAndRole();
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
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert(postId ? "Post updated!" : "Post created!");
      postForm.reset();
      previewImg.style.display = "none";
      delete postForm.dataset.editingId;
      await loadPosts();
      loadDashboard();
    } else {
      alert("Error: " + (data.error || "Something went wrong"));
    }
  } catch (err) {
    console.error(err);
    alert("Request failed: " + err.message);
  }
});

// ==========================
// EDIT POST
// ==========================
async function editPost(id) {
  const TOKEN = getTokenAndRole();
  if (!TOKEN) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
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

// ==========================
// DELETE POST
// ==========================
async function deletePost(id) {
  const TOKEN = getTokenAndRole();
  if (!TOKEN) return;
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    if (data.success) {
      alert("Post deleted!");
      await loadPosts();
      loadDashboard();
    } else {
      alert("Error: " + (data.error || "Something went wrong"));
    }
  } catch (err) {
    console.error(err);
    alert("Failed to delete post");
  }
}

// ==========================
// LOAD POSTS
// ==========================
async function loadPosts() {
  const TOKEN = getTokenAndRole();
  if (!TOKEN) return;

  try {
    const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${TOKEN}` } });
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
        ${post.image ? `<img src="${post.image}" width="150"/>` : ""}
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

// ==========================
// DASHBOARD / ANALYTICS
// ==========================
async function loadDashboard(startDate, endDate) {
  const TOKEN = getTokenAndRole();
  if (!TOKEN) return;

  try {
    let url = API_URL;
    if (startDate && endDate) url += `?start=${startDate}&end=${endDate}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const posts = await res.json();

    // Update totals
    totalPostsEl.textContent = posts.length;
    totalViewsEl.textContent = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    totalReactionsEl.textContent = posts.reduce((acc, p) => acc + (p.reactions || 0), 0);

    // Table
    postsTable.innerHTML = "";
    posts.forEach(post => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${post.title}</td><td>${post.views || 0}</td><td>${post.reactions || 0}</td><td>${new Date(post.createdAt).toLocaleDateString()}</td>`;
      postsTable.appendChild(tr);
    });

    // Chart
    const labels = posts.map(p => p.title);
    const viewsData = posts.map(p => p.views || 0);
    const reactionsData = posts.map(p => p.reactions || 0);

    if (postsChart) postsChart.destroy();
    if (postsChartCtx) {
      postsChart = new Chart(postsChartCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Views", data: viewsData, backgroundColor: "rgba(37, 99, 235, 0.7)" },
            { label: "Reactions", data: reactionsData, backgroundColor: "rgba(40, 167, 69, 0.7)" }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }
      });
    }

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

// ==========================
// CLOCK & WELCOME
// ==========================
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("welcomeClock").innerText = `🕒 ${timeString}`;
}

async function showWelcome() {
  try {
    const token = getTokenAndRole();
    if (!token) return;

    const res = await fetch(PROFILE_URL, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    welcomeMessage.textContent = `👋 Welcome back, ${data.firstName || "Admin"} ${data.lastName || ""}!`;
  } catch (err) {
    console.error(err);
    welcomeMessage.textContent = "👋 Welcome back!";
  }
}

// ==========================
// NAV TOGGLE
// ==========================
navToggle?.addEventListener("click", () => navMenu?.classList.toggle("show"));

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);

  showWelcome();
  loadPosts().then(() => loadDashboard());

  filterBtn?.addEventListener("click", () => {
    loadDashboard(startDateInput.value, endDateInput.value);
  });

  // Populate categories
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
  categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.key;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });
});
