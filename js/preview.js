// js/preview.js
const post = JSON.parse(localStorage.getItem('previewPost'));

if (post) {
    const container = document.getElementById('previewContainer');
    container.innerHTML = `
    <div class="card">
        <img src="${post.image}" alt="${post.title}">
        <h2>${post.title}</h2>
        <p>${post.body}</p>
        <a href="${post.buttonUrl}" class="btn">${post.buttonText}</a>
    </div>`;
}
