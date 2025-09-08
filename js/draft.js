const draftsContainer = document.getElementById("draftList");

async function loadDrafts() {
  try {
    const posts = await getSheetData("Posts");

    // Filter drafts
    const drafts = posts.filter(p => p[5] === "draft");

    if (!drafts.length) {
      draftsContainer.innerHTML = "<p>No drafts found.</p>";
      return;
    }

    draftsContainer.innerHTML = drafts.map((draft, index) => `
      <div class="post-card">
        <img src="${draft[2]}" alt="Draft Image">
        <h3>${draft[0]}</h3>
        <p>${draft[1]}</p>
        <button onclick="editDraft(${index})">Edit</button>
      </div>
    `).join("");

  } catch (err) {
    console.error("Error loading drafts:", err);
    draftsContainer.innerHTML = "<p>Failed to load drafts.</p>";
  }
}

function editDraft(index) {
  getSheetData("Posts").then(posts => {
    const draft = posts.filter(p => p[5] === "draft")[index];
    draft.rowIndex = index + 2; // rowIndex for updateRow
    sessionStorage.setItem("editDraft", JSON.stringify(draft));
    window.location.href = "editor.html";
  });
}

// Load drafts on page load
window.onload = loadDrafts;
