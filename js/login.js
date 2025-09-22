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
  msgEl.style.color = "blue";
  msgEl.innerText = "⏳ Logging in...";
  loginBtn.disabled = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

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

    console.log("Login response:", res.status, data); // ✅ Debug

    if (!res.ok) {
      msgEl.style.color = "red";
      msgEl.innerText = data.error || "❌ Login failed.";
    } else if (data.token) {
      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Decode JWT to extract role (optional)
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        localStorage.setItem("role", payload.role || "user");
      } catch {
        localStorage.setItem("role", "user");
      }

      msgEl.style.color = "green";
      msgEl.innerText = "✅ Login successful! Redirecting...";

      // Redirect after short delay
      setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
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
  e.preventDefault(); // Prevent page reload
  login();
});
