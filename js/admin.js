// ====== API BASE ======
  const BASE_URL = "https://adminblog-1y6d.onrender.com";
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
    const formData = new FormData();
    formData.append("title", titleInput.value);
    formData.append("body", bodyInput.value);
    formData.append("url", urlInput.value);
    formData.append("urlText", urlTextInput.value);
    formData.append("category", categorySelect.value); // ✅ already lowercase
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
    categorySelect.value = post.category; // ✅ no need to .toLowerCase()

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

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const welcomeClock = document.getElementById('welcomeClock');


  // Mobile nav toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });


  // Live clock
  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("clock").innerHTML = `🕒 ${timeString}`;
  }

  // Fetch user profile and show welcome
  async function showWelcome() {
    try {
      const token = localStorage.getItem("token"); // Token saved after login
      if (!token) {
        welcomeMessage.textContent = "👋 Welcome back!";
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      const username =   `${data.firstName} ${data.lastName}` || "Admin";

      welcomeMessage.textContent = `👋 Welcome back, ${username}!`;
    } catch (error) {
      console.error("Error fetching user:", error);
      welcomeMessage.textContent = "👋 Welcome back!";
    }
  }

  // Init
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
  });

  // Run on page load
  document.addEventListener('DOMContentLoaded', () => {
    showWelcome();
    updateClock();
    setInterval(updateClock, 60000); // update every 1 min
  });





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

      // Clear old options except the first placeholder
      select.innerHTML = `<option value="">-- Select Category --</option>`;

      // Add categories dynamically
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.key;
        option.textContent = cat.label;
        select.appendChild(option);
      });
    });

