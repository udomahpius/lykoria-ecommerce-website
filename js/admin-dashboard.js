// ============================
// admin-dashboard.js
// ============================
(() => {
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

  // ============================
  // Auth check
  // ============================
  function getToken() {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || role !== "admin") {
      alert("⚠️ Access denied. Admins only.");
      window.location.href = "login.html";
      return null;
    }
    return token;
  }

  const token = getToken();
  if (!token) return;

  // ============================
  // Elements
  // ============================
  const el = id => document.getElementById(id);
  const ui = {
    totalPosts: el("totalPosts"),
    totalViews: el("totalViews"),
    totalReactions: el("totalReactions"),
    totalOrders: el("totalOrders"),
    totalRevenue: el("totalRevenue"),
    postsTable: el("postsTable"),
    postsChart: el("postsChart"),
    startDate: el("startDate"),
    endDate: el("endDate"),
    filterBtn: el("filterBtn"),
    clearBtn: el("clearBtn"),
    searchInput: el("searchInput"),
    rowsPerPage: el("rowsPerPage"),
    pager: el("pager"),
    exportCsv: el("exportCsv"),
    downloadChart: el("downloadChart"),
    welcomeTitle: el("welcomeTitle"),
    welcomeSubtitle: el("welcomeSubtitle"),
    logoutBtn: el("logoutBtn"),
  };

  ui.logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ============================
  // State
  // ============================
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;
  const getRowsPerPage = () => parseInt(ui.rowsPerPage.value || "10", 10);
  let postsChartInstance = null;

  // ============================
  // Helpers
  // ============================
  const fmtDate = iso => {
    try { return new Date(iso).toLocaleDateString(); }
    catch { return "-"; }
  };

  const escapeHtml = (s = "") =>
    String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  // ============================
  // API Calls
  // ============================
  async function fetchProfile() {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Profile not available");
    return res.json();
  }

  async function fetchOrders() {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  }

  async function fetchPosts(start, end) {
    let url = `${BASE_URL}/api/posts`;
    if (start && end) url += `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  }

  // ============================
  // Rendering
  // ============================
  function renderProfile(user) {
    const name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email || "Admin";
    ui.welcomeTitle.textContent = `👋 Welcome back, ${name}`;
    ui.welcomeSubtitle.textContent = `Logged in as admin — ${user.email || ""}`;
  }

  function renderOrders(orders) {
    const totalOrders = orders.length;
    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    ui.totalOrders.textContent = totalOrders;
    ui.totalRevenue.textContent = `₦${revenue.toFixed(2)}`;
  }

  function renderPosts(posts) {
    allPosts = Array.isArray(posts) ? posts : [];
    applyFiltersAndRender();

    ui.totalPosts.textContent = allPosts.length;
    ui.totalViews.textContent = allPosts.reduce((s, p) => s + (Number(p.views) || 0), 0);
    ui.totalReactions.textContent = allPosts.reduce((s, p) => s + (Number(p.reactions) || 0), 0);
  }

  function applyFiltersAndRender() {
    const q = (ui.searchInput.value || "").toLowerCase();
    filteredPosts = q
      ? allPosts.filter(p => (p.title || "").toLowerCase().includes(q))
      : [...allPosts];
    currentPage = 1;
    renderTable();
    renderChart();
  }

  function renderTable() {
    const rowsPerPage = getRowsPerPage();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageItems = filteredPosts.slice(startIdx, startIdx + rowsPerPage);

    ui.postsTable.innerHTML = pageItems.length
      ? pageItems.map(p => `
          <tr>
            <td><strong>${escapeHtml(p.title || "Untitled")}</strong><div class="small">${p.category || ""}</div></td>
            <td>${Number(p.views) || 0}</td>
            <td>${Number(p.reactions) || 0}</td>
            <td class="small">${fmtDate(p.createdAt || p.updatedAt || "")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="4" class="small">No posts found</td></tr>`;

    renderPager();
  }

  function renderPager() {
    const pages = Math.max(1, Math.ceil(filteredPosts.length / getRowsPerPage()));
    ui.pager.innerHTML = "";
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => { currentPage = i; renderTable(); });
      ui.pager.appendChild(btn);
    }
  }

  function renderChart() {
    if (!ui.postsChart) return;
    if (postsChartInstance) postsChartInstance.destroy();

    const labels = filteredPosts.map(p => p.title || "Untitled").slice(0, 50);
    const views = filteredPosts.map(p => Number(p.views) || 0).slice(0, 50);
    const reacts = filteredPosts.map(p => Number(p.reactions) || 0).slice(0, 50);

    postsChartInstance = new Chart(ui.postsChart, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Views", data: views, backgroundColor: "rgba(37,99,235,0.75)" },
          { label: "Reactions", data: reacts, backgroundColor: "rgba(16,185,129,0.75)" },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } },
    });
  }

  function exportCSV() {
    const rowsPerPage = getRowsPerPage();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageItems = filteredPosts.slice(startIdx, startIdx + rowsPerPage);

    const header = ["title", "category", "views", "reactions", "date"];
    const rows = pageItems.map(p => [
      `"${(p.title || "").replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      Number(p.views) || 0,
      Number(p.reactions) || 0,
      `"${fmtDate(p.createdAt || "")}"`,
    ]);

    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "posts.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadChart() {
    if (!ui.postsChart) return;
    const link = document.createElement("a");
    link.href = ui.postsChart.toDataURL("image/png", 1);
    link.download = "posts-chart.png";
    link.click();
  }

  // ============================
  // Init
  // ============================
  (async function init() {
    try {
      renderProfile(await fetchProfile());
    } catch { renderProfile({}); }

    try { renderOrders(await fetchOrders()); } catch { renderOrders([]); }
    try { renderPosts(await fetchPosts()); } catch { renderPosts([]); }

    // event listeners
    ui.filterBtn?.addEventListener("click", () => fetchPosts(ui.startDate.value, ui.endDate.value).then(renderPosts));
    ui.clearBtn?.addEventListener("click", () => { ui.startDate.value = ui.endDate.value = ui.searchInput.value = ""; ui.rowsPerPage.value = "10"; fetchPosts().then(renderPosts); });
    ui.searchInput?.addEventListener("input", applyFiltersAndRender);
    ui.rowsPerPage?.addEventListener("change", () => { currentPage = 1; renderTable(); });
    ui.exportCsv?.addEventListener("click", exportCSV);
    ui.downloadChart?.addEventListener("click", downloadChart);
  })();
})();
