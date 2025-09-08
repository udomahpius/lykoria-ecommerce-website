// js/editor.js
const previewBtn = document.getElementById('previewBtn');
const draftBtn = document.getElementById('draftBtn');
const publishBtn = document.getElementById('publishBtn');

// Add at the top of editor.js
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("You must log in first!");
  window.location.href = "login.html";
}


let editDraft = JSON.parse(sessionStorage.getItem('editDraft')) || null;

window.onload = () => {
    if (editDraft) {
        document.getElementById('image').value = editDraft[2];
        document.getElementById('title').value = editDraft[0];
        document.getElementById('body').value = editDraft[1];
        document.getElementById('buttonText').value = editDraft[3];
        document.getElementById('buttonUrl').value = editDraft[4];
    }
};

function getPostData() {
    return {
        image: document.getElementById('image').value,
        title: document.getElementById('title').value,
        body: document.getElementById('body').value,
        buttonText: document.getElementById('buttonText').value,
        buttonUrl: document.getElementById('buttonUrl').value,
        timestamp: new Date().toISOString()
    };
}

// Preview
previewBtn.addEventListener('click', () => {
    const post = getPostData();
    localStorage.setItem('previewPost', JSON.stringify(post));
    window.open('preview.html', '_blank');
});

// Save Draft
draftBtn.addEventListener('click', async () => {
    const post = getPostData();
    post.status = 'draft';

    if (editDraft) {
        await updateRow('Posts', editDraft.index + 2, [
            post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
        ]);
        alert('Draft updated!');
        sessionStorage.removeItem('editDraft');
        editDraft = null;
    } else {
        await appendRow('Posts', [
            post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
        ]);
        alert('Draft saved!');
    }
});

// Publish
publishBtn.addEventListener('click', async () => {
    const post = getPostData();
    post.status = 'published';

    if (editDraft) {
        await updateRow('Posts', editDraft.index + 2, [
            post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
        ]);
        alert('Post published!');
        sessionStorage.removeItem('editDraft');
        editDraft = null;
    } else {
        await appendRow('Posts', [
            post.title, post.body, post.image, post.buttonText, post.buttonUrl, post.status, post.timestamp
        ]);
        alert('Post published!');
    }
});
async function savePost(status) {
  const title = document.querySelector("#title").value;
  const body = document.querySelector("#body").value;
  const image = document.querySelector("#image").value;
  const buttonText = document.querySelector("#buttonText").value;
  const buttonUrl = document.querySelector("#buttonUrl").value;

  if (!title || !body || !image || !buttonText || !buttonUrl) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await appendRow("Posts", [
      title,
      body,
      image,
      buttonText,
      buttonUrl,
      status, // draft | preview | published
      new Date().toISOString()
    ]);

    alert(`Post saved as ${status}`);
    if (status === "preview") {
      window.location.href = "preview.html";
    }
    if (status === "published") {
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Error saving post:", err);
    alert("Failed to save post, please try again.");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}



// ✅ Protect page (only logged-in users allowed)
if (!user) {
  alert("You must log in first!");
  window.location.href = "login.html";
}

// Save post into Google Sheet
async function savePost(status) {
  const title = document.querySelector("#title").value;
  const body = document.querySelector("#body").value;
  const image = document.querySelector("#image").value;
  const buttonText = document.querySelector("#buttonText").value;
  const buttonUrl = document.querySelector("#buttonUrl").value;

  if (!title || !body || !image || !buttonText || !buttonUrl) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await appendRow("Posts", [
      title,
      body,
      image,
      buttonText,
      buttonUrl,
      status, // draft | preview | published
      new Date().toISOString()
    ]);

    alert(`Post saved as ${status}`);
    if (status === "preview") {
      window.location.href = "preview.html";
    }
    if (status === "published") {
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Error saving post:", err);
    alert("Failed to save post, please try again.");
  }
}

// ✅ Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    // No user session → redirect to login
    window.location.href = "../html/login.html";
    return;
  }

  // (Optional) show user name in UI
  const user = JSON.parse(currentUser);
  console.log("Logged in as:", user.firstName, user.lastName, user.email);

  // ✅ Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser"); // clear session
      window.location.href = "../html/login.html"; // redirect
    });
  }
});
