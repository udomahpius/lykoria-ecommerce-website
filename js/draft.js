// js/draft.js
async function loadDrafts() {
    const data = await getSheetData('Posts');
    const draftContainer = document.getElementById('draftsContainer');
    draftContainer.innerHTML = '';

    const drafts = data.filter(post => post[5] === 'draft');

    drafts.forEach((draft, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${draft[0]}</h2>
            <p>${draft[1]}</p>
            <button onclick="editDraft(${i})">Edit</button>
            <button onclick="publishDraft(${i})">Publish</button>
        `;
        draftContainer.appendChild(card);
    });
}

function editDraft(index) {
    getSheetData('Posts').then((data) => {
        const drafts = data.filter(post => post[5] === 'draft');
        const draft = drafts[index];
        const rowIndex = data.indexOf(draft);
        sessionStorage.setItem('editDraft', JSON.stringify({ ...draft, index: rowIndex }));
        window.location.href = 'editor.html';
    });
}

function publishDraft(index) {
    getSheetData('Posts').then(async (data) => {
        const drafts = data.filter(post => post[5] === 'draft');
        const draft = drafts[index];
        const rowIndex = data.indexOf(draft);
        draft[5] = 'published';
        await updateRow('Posts', rowIndex + 2, draft);
        alert('Draft published!');
        loadDrafts();
    });
}

window.onload = loadDrafts;
