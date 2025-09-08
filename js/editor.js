// ==============================
// Protect page - only logged-in users
// ==============================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("You must log in first!");
  window.location.href = "login.html";
} else {
  const welcomeEl = document.getElementById("welcome");
  if (welcomeEl) welcomeEl.textContent = `Welcome, ${currentUser.firstName}!`;
}

// ==============================
// DOM elements
// ==============================
const previewBtn = document.getElementById("previewBtn");
const draftBtn = document.getElementById("draftBtn");
const publishBtn = document.getElementById("publishBtn");

// Load draft if editing
let editDraft = JSON.parse(sessionStorage.getItem("editDraft")) || null;
window.onload = () => {
  if (editDraft) {
    document.getElementById("title").value = editDraft[0];
    document.getElementById("body").value = editDraft[1];
    document.getElementById("image").value = editDraft[2];
    document.getElementById("buttonText").value = editDraft[3];
    document.getElementById("buttonUrl").value = editDraft[4];
  }
};

// ==============================
// Helpers
// ==============================
function getPostData() {
  return {
    title: document.getElementById("title").value,
    body: document.getElementById("body").value,
    image: document.getElementById("image").value,
    buttonText: document.getElementById("buttonText").value,
    buttonUrl: document.getElementById("buttonUrl").value,
    timestamp: new Date().toISOString()
  };
}

// ==============================
// Preview
// ==============================
previewBtn.addEventListener("click", () => {
  const post = getPostData();
  localStorage.setItem("previewPost", JSON.stringify(post));
  window.open("preview.html", "_blank");
});

// ==============================
// Save Draft
// ==============================
draftBtn.addEventListener("click", async () => {
  const post = getPostData();
  post.status = "draft";

  try {
    if (editDraft) {
      await updateRow("Posts", editDraft.index + 2, [
        post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
      ]);
      alert("Draft updated!");
      sessionStorage.removeItem("editDraft");
      editDraft = null;
    } else {
      await appendRow("Posts", [
        post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
      ]);
      alert("Draft saved!");
    }
  } catch (err) {
    console.error("Error saving draft:", err);
    alert("Failed to save draft, please try again.");
  }
});

// ==============================
// Publish
// ==============================
publishBtn.addEventListener("click", async () => {
  const post = getPostData();
  post.status = "published";

  try {
    if (editDraft) {
      await updateRow("Posts", editDraft.index + 2, [
        post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
      ]);
      alert("Post published!");
      sessionStorage.removeItem("editDraft");
      editDraft = null;
    } else {
      await appendRow("Posts", [
        post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
      ]);
      alert("Post published!");
    }
    window.location.href = "index.html";
  } catch (err) {
    console.error("Error publishing post:", err);
    alert("Failed to publish post, please try again.");
  }
});

// ==============================
// Logout
// ==============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}

// js/editor.js
// const currentUser = JSON.parse(localStorage.getItem("currentUser"));
// if (!currentUser) {
//   alert("You must log in first!");
//   window.location.href = "login.html";
// } else {
//   const welcomeEl = document.getElementById("welcome");
//   if (welcomeEl) welcomeEl.textContent = `Welcome, ${currentUser.firstName}!`;
// }

// ... include getPostData(), draft/publish handlers as discussed earlier
// ... use appendRow/updateRow from db.js for saving posts
