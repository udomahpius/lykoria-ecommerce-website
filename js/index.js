// js/index.js
async function loadPosts() {
    const data = await getSheetData('Posts');
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    data.filter(post => post[5] === 'published')
        .forEach(post => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${post[2]}" alt="${post[0]}">
                <h2>${post[0]}</h2>
                <p>${post[1]}</p>
                <a href="${post[4]}" class="btn">${post[3]}</a>
            `;
            container.appendChild(card);
        });
}

window.onload = loadPosts;
