// Get preview post from localStorage
const previewPost = JSON.parse(localStorage.getItem("previewPost"));
const container = document.getElementById("previewContainer");

if (!previewPost) {
  container.innerHTML = "<p>No post to preview.</p>";
} else {
  container.innerHTML = `
    <div class="post-card">
      <img src="${previewPost.image}" alt="Post Image">
      <h3>${previewPost.title}</h3>
      <p>${previewPost.body}</p>
      <a href="${previewPost.buttonUrl}" target="_blank">${previewPost.buttonText}</a>
    </div>
  `;
}

// Clear preview after displaying
localStorage.removeItem("previewPost");
