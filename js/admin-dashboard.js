// admin-dashboard.js
(() => {
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";

  // --- elements ---
  const tokenAndRole = () => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").trim().toLowerCase();
    if (!token || role !== "admin") {
      alert("⚠️ Access denied. Admins only.");
      window.location.href = "login.html";
      return null;
    }
    return token;
  };

  const token = tokenAndRole();
  if (!token) return;

  const el = id => document.getElementById(id);
  const totalPostsEl = el("totalPosts");
  const totalViewsEl = el("totalViews");
  const totalReactionsEl = el("totalReactions");
  const totalOrdersEl = el("totalOrders");
  const totalRevenueEl = el("totalRevenue");
  const postsTableBody = el("postsTable");
  const postsChartCanvas = el("postsChart");
  const startDateInput = el("startDate");
  const endDateInput = el("endDate");
  const filterBtn = el("filterBtn");
  const clearBtn = el("clearBtn");
  const searchInput = el("searchInput");
  const rowsPerPageSelect = el("rowsPerPage");
  const pagerEl = el("pager");
  const exportCsvBtn = el("exportCsv");
  const downloadChartBtn = el("downloadChart");
  const welcomeTitle = el("welcomeTitle");
  const welcomeSubtitle = el("welcomeSubtitle");
  const logoutBtn = el("logoutBtn");

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });

  // Chart instance
  let postsChartInstance = null;

  // Pagination & state
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;
  const getRowsPerPage = () => parseInt(rowsPerPageSelect.value || "10", 10);

  // Helper: format date
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch { return "-" }
  }

  // Attempt to load profile (to show welcome)
  async function loadProfile() {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No profile");
      const user = await res.json();
      const name = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : (user.email || "Admin");
      welcomeTitle.textContent = `👋 Welcome back, ${name}`;
      welcomeSubtitle.textContent = `Logged in as admin — ${user.email || ""}`;
      // store small wins for offline
      if (user.firstName) localStorage.setItem("firstName", user.firstName);
      if (user.lastName) localStorage.setItem("lastName", user.lastName);
    } catch (err) {
      console.warn("Profile not available:", err);
      welcomeTitle.textContent = "👋 Welcome back";
      welcomeSubtitle.textContent = "Profile not available";
    }
  }

  // Attempt to fetch extra e-commerce data (orders, revenue) — non-fatal
  async function loadOrdersAndRevenue() {
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("orders endpoint not present");
      const orders = await res.json();
      // Example calculation — assumes orders is array of { total, createdAt, status }
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const revenue = Array.isArray(orders) ? orders.reduce((s,o)=>s + (Number(o.total)||0), 0) : 0;
      totalOrdersEl.textContent = totalOrders;
      totalRevenueEl.textContent = revenue ? `₦${revenue.toFixed(2)}` : "₦0.00";
    } catch (err) {
      console.debug("Orders endpoint not available:", err);
      totalOrdersEl.textContent = "-";
      totalRevenueEl.textContent = "-";
    }
  }

  // Load posts analytics
  async function fetchPostAnalytics(start, end) {
    try {
      let url = `${BASE_URL}/api/posts`;
      if (start && end) {
        // backend expected query format ?start=YYYY-MM-DD&end=YYYY-MM-DD
        const s = encodeURIComponent(start);
        const e = encodeURIComponent(end);
        url += `?start=${s}&end=${e}`;
      }

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch posts");

      const posts = await res.json();
      if (!Array.isArray(posts)) {
        throw new Error("Posts response not array");
      }

      allPosts = posts;
      applyFiltersAndRender();
      // basic totals
      const totalViews = posts.reduce((s,p)=>s + (Number(p.views)||0), 0);
      const totalReactions = posts.reduce((s,p)=>s + (Number(p.reactions)||0), 0);
      totalPostsEl.textContent = posts.length;
      totalViewsEl.textContent = totalViews;
      totalReactionsEl.textContent = totalReactions;

    } catch (err) {
      console.error("fetchPostAnalytics error:", err);
      postsTableBody.innerHTML = `<tr><td colspan="4" class="small">Failed to load posts analytics</td></tr>`;
      totalPostsEl.textContent = "0";
      totalViewsEl.textContent = "0";
      totalReactionsEl.textContent = "0";
      allPosts = [];
      filteredPosts = [];
      renderChart([], [], []);
    }
  }

  // Apply search + pagination
  function applyFiltersAndRender() {
    const q = (searchInput.value || "").trim().toLowerCase();
    if (q) {
      filteredPosts = allPosts.filter(p => (p.title || "").toLowerCase().includes(q));
    } else {
      filteredPosts = [...allPosts];
    }
    currentPage = 1;
    renderTable();
    renderChartFromFiltered();
  }

  function renderTable() {
    const rowsPerPage = getRowsPerPage();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageItems = filteredPosts.slice(startIdx, startIdx + rowsPerPage);

    if (!pageItems.length) {
      postsTableBody.innerHTML = `<tr><td colspan="4" class="small">No posts found</td></tr>`;
      renderPager();
      return;
    }

    postsTableBody.innerHTML = "";
    pageItems.forEach(post => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(post.title||"Untitled")}</strong><div class="small">${post.category||""}</div></td>
        <td>${Number(post.views)||0}</td>
        <td>${Number(post.reactions)||0}</td>
        <td class="small">${fmtDate(post.createdAt||post.updatedAt||"")}</td>
      `;
      postsTableBody.appendChild(tr);
    });

    renderPager();
  }

  function renderPager() {
    const rowsPerPage = getRowsPerPage();
    const pages = Math.max(1, Math.ceil(filteredPosts.length / rowsPerPage));
    pagerEl.innerHTML = "";
    for (let i=1;i<=pages;i++){
      const b = document.createElement("button");
      b.textContent = i;
      if (i===currentPage) b.classList.add("active");
      b.addEventListener("click", ()=> { currentPage = i; renderTable(); });
      pagerEl.appendChild(b);
    }
  }

  // Render chart from current filteredPosts
  function renderChartFromFiltered() {
    const labels = filteredPosts.map(p => p.title || "Untitled").slice(0, 50); // cap labels
    const views = filteredPosts.map(p => Number(p.views)||0).slice(0, 50);
    const reacts = filteredPosts.map(p => Number(p.reactions)||0).slice(0, 50);
    renderChart(labels, views, reacts);
  }

  function renderChart(labels, views, reacts) {
    if (!postsChartCanvas) return;
    if (postsChartInstance) postsChartInstance.destroy();
    postsChartInstance = new Chart(postsChartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Views', data: views, backgroundColor: 'rgba(37,99,235,0.75)' },
          { label: 'Reactions', data: reacts, backgroundColor: 'rgba(16,185,129,0.75)' }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: false }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Export displayed (filtered and paged) table to CSV
  function exportTableToCSV() {
    // use filteredPosts current page
    const rowsPerPage = getRowsPerPage();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageItems = filteredPosts.slice(startIdx, startIdx + rowsPerPage);

    const columns = ["title","category","views","reactions","date"];
    const csvRows = [columns.join(",")];
    pageItems.forEach(p => {
      const row = [
        `"${(p.title||"").replace(/"/g,'""')}"`,
        `"${(p.category||"")}"`,
        Number(p.views)||0,
        Number(p.reactions)||0,
        `"${fmtDate(p.createdAt||"")}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posts-analytics-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // download chart as PNG
  function downloadChartPNG() {
    if (!postsChartCanvas) return alert("Chart not ready");
    const link = document.createElement("a");
    link.href = postsChartCanvas.toDataURL("image/png", 1);
    link.download = `engagement-chart-${new Date().toISOString().slice(0,10)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // small escape helper
  function escapeHtml(s="") {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // initial load & attach handlers
  (function init() {
    // load profile and orders in background
    loadProfile().catch(()=>{});
    loadOrdersAndRevenue().catch(()=>{});

    // initial posts fetch (no dates)
    fetchPostAnalytics().catch(()=>{});

    // handlers
    filterBtn?.addEventListener("click", () => {
      currentPage = 1;
      const s = startDateInput.value;
      const e = endDateInput.value;
      fetchPostAnalytics(s,e).catch(()=>{});
    });

    clearBtn?.addEventListener("click", () => {
      startDateInput.value = ""; endDateInput.value = ""; searchInput.value = ""; rowsPerPageSelect.value = "10";
      currentPage = 1;
      fetchPostAnalytics().catch(()=>{});
    });

    searchInput?.addEventListener("input", () => {
      applyFiltersAndRender();
    });

    rowsPerPageSelect?.addEventListener("change", () => {
      currentPage = 1; renderTable();
    });

    exportCsvBtn?.addEventListener("click", exportTableToCSV);
    downloadChartBtn?.addEventListener("click", downloadChartPNG);

    // small live clock in welcome section
    setInterval(()=> {
      const t = new Date();
      welcomeSubtitle.textContent = `Server time: ${t.toLocaleString()}`;
    }, 1000);
  })();

  // expose for debugging
  window.__adminAnalytics = {
    fetchPostAnalytics, renderChart, getState: ()=>({allPosts,filteredPosts,currentPage})
  };
})();
