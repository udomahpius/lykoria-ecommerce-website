import { savePost, getPosts, updatePost, deletePost } from "../js/db.js";

const inputImgElement = document.getElementById("inputFile");
const inputTileField = document.querySelector(".inputText");
const textareaElement = document.querySelector("#bodyTextArea");
const inputUrl = document.querySelector(".inputUrl");
const categoryField = document.querySelector(".categoryField");
const saveDraftBtn = document.querySelector(".saveDraftBtn");
const publishBtn = document.querySelector(".publishBtn"); // new button
const clearAllBtn = document.querySelector(".clearAllBtn"); // delete all
const imgElement = document.getElementById("uploadFileEle");

let selectedImage = null;

// Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Image preview
inputImgElement.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const base64 = await fileToBase64(file);
  selectedImage = {
    name: file.name,
    url: base64,
    type: file.type,
    size: file.size,
  };
  imgElement.src = base64;
  imgElement.style.display = "block";
});

// Save draft
saveDraftBtn.addEventListener("click", async () => {
  if (!inputTileField.value.trim() || !textareaElement.value.trim()) {
    alert("Title and content required!");
    return;
  }

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};

  const newPost = {
    id: Date.now(),
    title: inputTileField.value.trim(),
    body: textareaElement.value.trim(),
    image: selectedImage,
    link: inputUrl.value.trim(),
    category: categoryField.value,
    status: "draft",
    createdAt: new Date(),
    author: {
      firstName: loggedUser.firstName || "Unknown",
      lastName: loggedUser.lastName || "",
      email: loggedUser.email || "",
    },
  };

  await savePost(newPost);
  alert("Post saved as Draft!");
  resetEditor();
});

// Publish post
publishBtn.addEventListener("click", async () => {
  if (!inputTileField.value.trim() || !textareaElement.value.trim()) {
    alert("Title and content required to publish!");
    return;
  }

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};

  const publishedPost = {
    id: Date.now(),
    title: inputTileField.value.trim(),
    body: textareaElement.value.trim(),
    image: selectedImage,
    link: inputUrl.value.trim(),
    category: categoryField.value,
    status: "published",
    createdAt: new Date(),
    publishedAt: new Date(),
    author: {
      firstName: loggedUser.firstName || "Unknown",
      lastName: loggedUser.lastName || "",
      email: loggedUser.email || "",
    },
  };

  await savePost(publishedPost);
  alert("Post published successfully!");
  resetEditor();

  // Optional: refresh Published page if open
  if (window.loadPublishedPosts) window.loadPublishedPosts();
});

// Clear all posts
clearAllBtn.addEventListener("click", async () => {
  const posts = await getPosts();
  for (let post of posts) {
    await deletePost(post.id);
  }
  alert("All posts deleted!");
  resetEditor();
});

// Reset editor form
function resetEditor() {
  selectedImage = null;
  imgElement.src = "";
  imgElement.style.display = "none";
  inputImgElement.value = "";
  inputTileField.value = "";
  textareaElement.value = "";
  inputUrl.value = "";
  categoryField.value = "";
}
