// =================== LOGIN HANDLER ===================
const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
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
       window.location.href = "admin.html";
      msgEl.innerText = "✅ Login successful!";
      msgEl.style.color = "green";

      // ✅ Save token & role in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);

        // Decode JWT payload to extract role (client-side)
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        localStorage.setItem("role", payload.role || "user");
      }

      // ✅ Redirect based on role
      setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }, 1500);
    }
  } catch (err) {
    console.error("Login error:", err);
    msgEl.innerText = "⚠️ Failed to connect. Please try again.";
    msgEl.style.color = "red";
  } finally {
    btn.disabled = false;
  }
}
