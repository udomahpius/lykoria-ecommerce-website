export let setArrayObj = JSON.parse(localStorage.getItem("blogData")) || [];

let currentPost = {
  image: null,
  title: "",
  body: "",
  link: ""
};

// Save one post
export function transferItem() {
  if (!currentPost.title || !currentPost.body) {
    window.alert("Add at least a title and body before posting!");
    return;
  }

  setArrayObj.push({ ...currentPost }); // push, don’t replace
  localStorage.setItem("blogData", JSON.stringify(setArrayObj));

  window.alert("Post saved!");

  // Reset currentPost for next post
  currentPost = { image: null, title: "", body: "", link: "" };

  // Reset preview fields in editor
  document.getElementById("uploadFileEle").src = "";
  document.querySelector(".inputText").value = "";
  document.querySelector("#bodyTextArea").value = "";
  document.querySelector(".inputUrl").value = "";
}

// Delete all posts
export function clearItems() {
  setArrayObj.length = 0;
  localStorage.removeItem("blogData");
  window.alert("All posts deleted!");
}

// ===== IMAGE =====
const inputImgElement = document.getElementById("inputFile");
const imgElement = document.getElementById("uploadFileEle");

inputImgElement.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;

      imgElement.src = base64Image;
      imgElement.style.display = "block";

      currentPost.image = {
        name: file.name,
        url: base64Image,
        type: file.type,
        size: file.size
      };
    };
    reader.readAsDataURL(file);
  }
});

// ===== TITLE =====
const inputTileField = document.querySelector(".inputText");
document.querySelector(".iconAddTitleFunction").addEventListener("click", () => {
  if (!inputTileField.value.trim()) {
    window.alert("Add your blog title!");
    return;
  }
  currentPost.title = inputTileField.value.trim();
  window.alert("Title added!");
});

// ===== BODY =====
const textareaElement = document.querySelector("#bodyTextArea");
document.querySelector(".iconAddbodyTextArea").addEventListener("click", () => {
  if (!textareaElement.value.trim()) {
    window.alert("Add your blog content!");
    return;
  }
  currentPost.body = textareaElement.value.trim();
  window.alert("Body added!");
});

// ===== LINK =====
const inputUrl = document.querySelector(".inputUrl");
document.querySelector(".addLink").addEventListener("click", (e) => {
  e.preventDefault();
  const linkAddress = inputUrl.value.trim();

  if (linkAddress === "" || !linkAddress.startsWith("http")) {
    window.alert("It must be a valid link (starting with http)");
    return;
  }

  currentPost.link = linkAddress;
  window.alert("Link added!");
});

// ✅ Sync editor when preview deletes posts
window.addEventListener("storage", (event) => {
  if (event.key === "blogData") {
    setArrayObj = JSON.parse(localStorage.getItem("blogData")) || [];
    console.log("Editor synced. Posts:", setArrayObj);
  }
});

// Expose functions
window.transferItem = transferItem;
window.clearItems = clearItems;
