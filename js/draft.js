const API_URL = "http://localhost:5000/api/posts";
const token = localStorage.getItem("token");
const draftContainer = document.getElementById("draftContainer");

// Load Draft Posts
async function loadDrafts() {
  try {
    const res = await fetch(API_URL);
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
        ${post.image ? `<img src="${post.image}" alt="preview">` : ""}
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

// Publish Draft
async function publishPost(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
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

// Delete Draft
async function deletePost(id) {
  if (!confirm("Are you sure you want to delete this draft?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
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

// Initial load
loadDrafts();
