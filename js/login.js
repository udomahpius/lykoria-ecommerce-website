// =================== LOGIN HANDLER ===================
const BASE_URL = "http://localhost:5000";
const LOGIN_URL = `${BASE_URL}/api/login`;

async function login() {
  const msgEl = document.getElementById("msg");
  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  msgEl.innerText = "⏳ Logging in...";
  msgEl.style.color = "blue";

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",   // ✅ Important for CORS
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      msgEl.innerText = data.error || "⚠️ Login failed.";
      msgEl.style.color = "red";
    } else {
      msgEl.innerText = data.message || "✅ Login successful!";
      msgEl.style.color = "green";

      // ✅ store token if your backend returns it
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setTimeout(() => (window.location.href = "dashboard.html"), 2000);
    }
  } catch (err) {
    console.error("Login error:", err);
    msgEl.innerText = "⚠️ Failed to connect. Please try again.";
    msgEl.style.color = "red";
  } finally {
    btn.disabled = false;
  }
}
