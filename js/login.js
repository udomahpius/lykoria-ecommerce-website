// login.js
const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
const LOGIN_URL = `${BASE_URL}/api/login`;

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msgEl = document.getElementById("msg");

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  msgEl.style.color = "blue";
  msgEl.innerText = "⏳ Logging in...";
  loginBtn.disabled = true;

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      msgEl.style.color = "red";
      msgEl.innerText = data.error || "❌ Login failed.";
      loginBtn.disabled = false;
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);

      // decode JWT
      let role = "user";
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        role = payload.role || "user";
        localStorage.setItem("firstName", payload.firstName || "");
        localStorage.setItem("lastName", payload.lastName || "");
        localStorage.setItem("email", payload.email || "");
      } catch {}

      localStorage.setItem("role", role);

      msgEl.style.color = "green";
      msgEl.innerText = "✅ Login successful! Redirecting...";

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "admin.html"; // ✅ admin dashboard
        } else {
          window.location.href = "admin-dashboard.html"; // ✅ normal user homepage
        }
      }, 1000);
    }
  } catch (err) {
    console.error("Login error:", err);
    msgEl.style.color = "red";
    msgEl.innerText = "❌ Network error, please try again!";
  } finally {
    loginBtn.disabled = false;
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  login();
});
