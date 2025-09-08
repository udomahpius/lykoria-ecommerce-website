  const container = document.getElementById("postsContainer");

  async function loadPosts() {
    try {
      const posts = await getSheetData("Posts");
      const published = posts.filter(p => p[5] === "published"); // status = published

      if (!published.length) {
        container.innerHTML = "<p>No published posts yet.</p>";
        return;
      }

      container.innerHTML = published.map(post => `
        <div class="post-card">
          <img src="${post[2]}" alt="Post Image">
          <h3>${post[0]}</h3>
          <p>${post[1]}</p>
          <a href="${post[4]}" target="_blank">${post[3]}</a>
        </div>
      `).join("");

    } catch (err) {
      console.error("Error loading posts:", err);
      container.innerHTML = "<p>Failed to load posts.</p>";
    }
  }

  window.onload = loadPosts;