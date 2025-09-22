// =================== CONFIG ===================
const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
const LOGIN_URL = `${BASE_URL}/api/login`;

// =================== ELEMENTS ===================
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msgEl = document.getElementById("msg");

// =================== LOGIN FUNCTION ===================
async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  msgEl.style.color = "blue";
  msgEl.innerText = "⏳ Logging in...";
  loginBtn.disabled = true;

  if (!email || !password) {
    msgEl.style.color = "red";
    msgEl.innerText = "❌ Email and password are required.";
    loginBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    console.log("Login response:", res.status, data);

    if (!res.ok) {
      msgEl.style.color = "red";
      msgEl.innerText = data.error || "❌ Login failed.";
    } else if (data.token) {
      localStorage.setItem("token", data.token);

      // decode JWT to get role
      let role = "user";
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        role = payload.role || "user";
      } catch {}

      localStorage.setItem("role", role);

      msgEl.style.color = "green";
      msgEl.innerText = "✅ Login successful! Redirecting...";

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "admin-dashboard.html";
        }
      }, 1000);
    } else {
      msgEl.style.color = "red";
      msgEl.innerText = "❌ Login failed: No token received.";
    }
  } catch (err) {
    console.error("Login error:", err);
    msgEl.style.color = "red";
    msgEl.innerText = "❌ Network error, please try again!";
  } finally {
    loginBtn.disabled = false;
  }
}

// =================== FORM SUBMISSION ===================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  login();
});
