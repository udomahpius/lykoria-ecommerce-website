import { addPost, clearPosts, updatePost } from "../js/db.js";
const setArrayObj = [];
let inputImgElement = document.getElementById("inputFile");
let inputTileField = document.querySelector(".inputText");
let textareaElement = document.querySelector("#bodyTextArea");
let inputUrl = document.querySelector(".inputUrl");
let categoryField = document.querySelector(".categoryField");
let saveDraftBtn = document.querySelector(".saveDraftBtn");
const imgElement = document.getElementById("uploadFileEle");
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
let selectedImage = null; // store latest image

inputImgElement.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Convert file to Base64 string
    const base64String = await fileToBase64(file);

    // Save in memory so we can push into IndexedDB later
    selectedImage = {
      name: file.name,
      url: base64String,
      type: file.type,
      size: file.size
    };

    // Show preview
    imgElement.src = base64String;
    imgElement.style.display = "block";
  }
});

saveDraftBtn.addEventListener("click", () => {
  const file = inputImgElement.files[0];
  const fileUrl = file ? URL.createObjectURL(file) : null;

  if (!inputTileField.value.trim()) {
    alert("Please add a blog title!");
    return;
  }
  if (!textareaElement.value.trim()) {
    alert("Please add blog content!");
    return;
  }
  if (!categoryField.value) {
    alert("Please select a category!");
    return;
  }

  // const newPost = {
  //   id: Date.now(),
  //   title: inputTileField.value.trim(),
  //   body: textareaElement.value.trim(),
  //   image: file ? { name: file.name, url: fileUrl } : null,
  //   link: inputUrl.value.trim(),
  //   category: categoryField.value,
  //   status: "draft"
  // };
const newPost = {
  id: Date.now(),
  title: inputTileField.value.trim(),
  body: textareaElement.value.trim(),
  image: selectedImage,   // <-- use Base64 image here
  link: inputUrl.value.trim(),
  category: categoryField.value,
  status: "draft",
  createdAt: new Date()
};

  setArrayObj.push(newPost);
  console.log("Draft saved:", newPost);

  inputImgElement.value = "";
  inputTileField.value = "";
  textareaElement.value = "";
  inputUrl.value = "";
  categoryField.value = "";

  alert("Post saved as Draft!");
});
import { savePost } from "../js/db.js";


saveDraftBtn.addEventListener("click", async () => {
  const file = inputImgElement.files[0];
  const fileUrl = file ? URL.createObjectURL(file) : null;

  if (!inputTileField.value.trim()) {
    alert("Please add a blog title!");
    return;
  }
  if (!textareaElement.value.trim()) {
    alert("Please add blog content!");
    return;
  }
  if (!categoryField.value) {
    alert("Please select a category!");
    return;
  }

  const newPost = {
    id: Date.now(),
    title: inputTileField.value.trim(),
    body: textareaElement.value.trim(),
    image: file ? { name: file.name, url: fileUrl } : null,
    link: inputUrl.value.trim(),
    category: categoryField.value,
    status: "draft"
  };

  try {
    await savePost(newPost);
    console.log("Draft saved:", newPost);

    // Reset form
    inputImgElement.value = "";
    inputTileField.value = "";
    textareaElement.value = "";
    inputUrl.value = "";
    categoryField.value = "";

    selectedImage = null;
imgElement.src = "";
imgElement.style.display = "none";
inputImgElement.value = "";


    alert("Post saved as Draft!");
  } catch (e) {
    console.error("Error saving draft:", e);
  }
});
// If editing a draft
const draftToEdit = localStorage.getItem("editDraft");
if (draftToEdit) {
  const draft = JSON.parse(draftToEdit);
  inputTileField.value = draft.title;
  textareaElement.value = draft.body;
  if (draft.link) inputUrl.value = draft.link;
  if (draft.category) categoryField.value = draft.category;
  if (draft.image) {
    imgElement.src = draft.image.url;
    imgElement.style.display = "block";
  }
  // remove after loading
  localStorage.removeItem("editDraft");
}

let currentPost = {
  image: null,
  title: "",
  body: "",
  link: "",
  status: "draft"
};

let editMode = false;
let editId = null;

// Save or Update
// async function savePost(status = "draft") {
//   if (!currentPost.title || !currentPost.body) {
//     window.alert("Add at least a title and body before posting!");
//     return;
//   }

//   currentPost.status = status;

//   if (editMode && editId !== null) {
//     await updatePost({ ...currentPost, id: editId, updatedAt: Date.now() });
//     window.alert(`Post updated as ${status}!`);
//   } else {
//     await addPost({ ...currentPost, createdAt: Date.now() });
//     window.alert(`Post saved as ${status}!`);
//   }

//   resetEditor();
// }

// Expose buttons
export function saveAsDraft() {
  savePost("draft");
}
export function publishPost() {
  savePost("published");
}
export async function clearItems() {
  await clearPosts();
  window.alert("All posts deleted!");
}

// Load post into editor
export function loadPostForEdit(post) {
  editMode = true;
  editId = post.id;

  if (post.image) {
    document.getElementById("uploadFileEle").src = post.image.url;
    document.getElementById("uploadFileEle").style.display = "block";
    currentPost.image = post.image;
  }

  document.querySelector(".inputText").value = post.title || "";
  currentPost.title = post.title || "";

  document.querySelector("#bodyTextArea").value = post.body || "";
  currentPost.body = post.body || "";

  document.querySelector(".inputUrl").value = post.link || "";
  currentPost.link = post.link || "";

  currentPost.status = post.status || "draft";

  window.alert("Editing post ID " + post.id + " (Status: " + currentPost.status + ")");
}

function resetEditor() {
  currentPost = { image: null, title: "", body: "", link: "", status: "draft" };
  editMode = false;
  editId = null;

  document.getElementById("uploadFileEle").src = "";
  document.querySelector(".inputText").value = "";
  document.querySelector("#bodyTextArea").value = "";
  document.querySelector(".inputUrl").value = "";
}

// expose to window
window.saveAsDraft = saveAsDraft;
window.publishPost = publishPost;
window.clearItems = clearItems;
window.loadPostForEdit = loadPostForEdit;



// remove item with x icon
document.querySelector(".iconClearimg").addEventListener("click", () =>{
  imgElement.src = []
})

document.querySelector(".iconClearTitleFunction").addEventListener("click", () =>{
inputTileField.value = []
})
document.querySelector(".iconClearbodyTextArea").addEventListener("click", () =>{
  textareaElement.value = []
})
document.querySelector(".iconClearLinkBtn").addEventListener("click", () =>{
  inputUrl.value = []
})