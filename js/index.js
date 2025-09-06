const previewContainer = document.querySelector(".final-preview");

function renderPreview() {
  const data = JSON.parse(localStorage.getItem("blogData")) || [];

  previewContainer.innerHTML = data
    .map((post) => {
      return `
        <div class="post">
          ${post.image ? `<img src="${post.image.url}" alt="${post.image.name}" style="max-width:100%; margin-bottom:10px;" />` : ""}
          ${post.title ? `<h2>${post.title}</h2>` : ""}
          ${post.body ? `<p>${post.body}</p>` : ""}
          ${post.link ? `<a href="${post.link}" target="_blank" class="preview-link">Explore More</a>` : ""}
        </div>
      `;
    })
    .join("");
}

// ✅ Flexbox for multiple items
previewContainer.style.display = "flex";
previewContainer.style.flexWrap = "wrap";
previewContainer.style.gap = "20px";

renderPreview();

window.addEventListener("storage", (event) => {
  if (event.key === "blogData") {
    renderPreview();
  }
});
