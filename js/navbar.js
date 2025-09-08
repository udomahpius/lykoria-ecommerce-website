

// js/navbar.js
async function loadNavbar() {
  try {
    const res = await fetch('html/navbar.html');
    const html = await res.text();
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.prepend(container);

    // Add hamburger toggle
    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });

  } catch (err) {
    console.error("Failed to load navbar:", err);
  }
}

// Initialize
loadNavbar();

