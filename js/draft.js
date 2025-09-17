// ====== API BASE ======
const BASE_URL = "https://adminblog-zk87.onrender.com";

const API_URL = `${BASE_URL}/api/posts`;  // works in dev + Vercel
const draftContainer = document.getElementById("draftContainer");

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

// ====== LOAD DRAFT POSTS ======
async function loadDrafts() {
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

    draftContainer.innerHTML = "";
    const drafts = posts.filter(p => p.status === "draft");

    if (drafts.length === 0) {
      draftContainer.innerHTML = "<p>No drafts available.</p>";
      return;
    }

    drafts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        ${post.image ? `<img src="${post.image}" alt="preview" style="max-width:200px;">` : ""}
        ${post.url ? `<a href="${post.url}" target="_blank">${post.urlText || "Visit Link"}</a>` : ""}
        <div>
          <button class="publish" onclick="publishPost('${post._id}')">Publish</button>
          <button class="delete" onclick="deletePost('${post._id}')">Delete</button>
        </div>
      `;
      draftContainer.appendChild(div);
    });
  } catch (err) {
    document.getElementById("msg").innerText = "Error loading drafts: " + err.message;
  }
}

// ====== PUBLISH DRAFT ======
async function publishPost(id) {
  const TOKEN = checkToken();
  if (!TOKEN) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ status: "published" })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("msg").innerText = "Post published!";
      loadDrafts();
    } else {
      document.getElementById("msg").innerText = data.error || "Failed to publish.";
    }
  } catch (err) {
    document.getElementById("msg").innerText = "Error: " + err.message;
  }
}

// ====== DELETE DRAFT ======
async function deletePost(id) {
  const TOKEN = checkToken();
  if (!TOKEN) return;

  if (!confirm("Are you sure you want to delete this draft?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("msg").innerText = "Post deleted!";
      loadDrafts();
    } else {
      document.getElementById("msg").innerText = data.error || "Failed to delete.";
    }
  } catch (err) {
    document.getElementById("msg").innerText = "Error: " + err.message;
  }
}

// ====== INIT ======
loadDrafts();
