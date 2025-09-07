import { savePost, clearPosts, getAllPosts } from "../js/db.js";

const inputImg = document.getElementById("inputFile");
const inputTitle = document.querySelector(".inputText");
const textarea = document.getElementById("bodyTextArea");
const inputUrl = document.querySelector(".inputUrl");
const categoryField = document.querySelector(".categoryField");
const saveDraftBtn = document.querySelector(".saveDraftBtn");
const imgPreview = document.getElementById("uploadFileEle");

// Redirect to login if not logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first!");
  window.location.href = "login.html";
}

// Keep latest selected image
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

// Handle image upload
inputImg.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedImage = { name: file.name, url: await fileToBase64(file) };
  imgPreview.src = selectedImage.url;
  imgPreview.style.display = "block";
});

// Save Draft
saveDraftBtn.addEventListener("click", async () => {
  if (!inputTitle.value.trim()) return alert("Add title!");
  if (!textarea.value.trim()) return alert("Add body!");
  if (!categoryField.value) return alert("Select category!");

  const newPost = {
    id: Date.now(),
    title: inputTitle.value.trim(),
    body: textarea.value.trim(),
    image: selectedImage,
    link: inputUrl.value.trim(),
    category: categoryField.value,
    status: "draft",
    createdAt: new Date()
  };

  await savePost(newPost);

  // Reset form
  selectedImage = null;
  imgPreview.src = "";
  imgPreview.style.display = "none";
  inputImg.value = "";
  inputTitle.value = "";
  textarea.value = "";
  inputUrl.value = "";
  categoryField.value = "";

  alert("Draft saved!");
});

// Expose to window for buttons
window.saveAsDraft = async () => {
  await saveDraftBtn.click();
};

window.clearItems = async () => {
  if (confirm("Delete all posts?")) {
    await clearPosts();
    alert("All posts deleted!");
  }
};
