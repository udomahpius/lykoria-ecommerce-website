const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Admin-only access
if (!token || role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "login.html";
}

// Elements
const logoutBtn = document.getElementById("logoutBtn");
const totalPostsEl = document.getElementById("totalPosts");
const totalViewsEl = document.getElementById("totalViews");
const totalReactionsEl = document.getElementById("totalReactions");
const postsTable = document.getElementById("postsTable");
const postsChartCtx = document.getElementById("postsChart").getContext("2d");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const filterBtn = document.getElementById("filterBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

let postsChart;

async function fetchPostAnalytics(startDate, endDate) {
  try {
    let url = `${BASE_URL}/api/posts`;
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();

    let totalViews = 0;
    let totalReactions = 0;
    postsTable.innerHTML = "";

    const labels = [];
    const viewsData = [];
    const reactionsData = [];

    posts.forEach(post => {
      totalViews += post.views || 0;
      totalReactions += post.reactions || 0;

      labels.push(post.title);
      viewsData.push(post.views || 0);
      reactionsData.push(post.reactions || 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${post.title}</td><td>${post.views || 0}</td><td>${post.reactions || 0}</td><td>${new Date(post.createdAt).toLocaleDateString()}</td>`;
      postsTable.appendChild(tr);
    });

    totalPostsEl.textContent = posts.length;
    totalViewsEl.textContent = totalViews;
    totalReactionsEl.textContent = totalReactions;

    // Update chart
    if (postsChart) postsChart.destroy();
    postsChart = new Chart(postsChartCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Views", data: viewsData, backgroundColor: "rgba(37, 99, 235, 0.7)" },
          { label: "Reactions", data: reactionsData, backgroundColor: "rgba(40, 167, 69, 0.7)" },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true } },
      }
    });

  } catch (err) {
    console.error("Error fetching post analytics:", err);
  }
}

// Initial fetch
fetchPostAnalytics();

// Filter button
filterBtn.addEventListener("click", () => {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  fetchPostAnalytics(startDate, endDate);
});
