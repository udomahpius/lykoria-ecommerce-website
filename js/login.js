// ============================
// login.js
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const msg = document.getElementById("msg");

  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
  const API_URL = `${BASE_URL}/api/login`;

  // ====== LOGIN FUNCTION ======
  async function login(e) {
    e.preventDefault();

    msg.style.color = "#555";
    msg.textContent = "⏳ Checking...";

    if (!email.value.trim() || !password.value.trim()) {
      msg.style.color = "red";
      msg.textContent = "❌ Email and password required!";
      return;
    }

    loginBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        msg.style.color = "green";
        msg.textContent = "✅ Login successful! Redirecting...";

        // Save token
        localStorage.setItem("token", data.token);

        // Default role
        let userRole = "user";

        // Decode token payload
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          if (payload.role) {
            userRole = payload.role.toLowerCase();
          }
        } catch (e) {
          console.warn("⚠️ Could not decode role from token:", e);
        }

        // Save role
        localStorage.setItem("role", userRole);

        // Redirect by role
        setTimeout(() => {
          if (userRole === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "index.html";
          }
        }, 1200);
      } else {
        msg.style.color = "red";
        msg.textContent = data.error || "❌ Invalid credentials!";
      }
    } catch (err) {
      console.error("Login error:", err);
      msg.style.color = "red";
      msg.textContent = "❌ Network error, try again!";
    } finally {
      loginBtn.disabled = false;
    }
  }

  // ====== EVENT LISTENERS ======
  loginBtn.addEventListener("click", login);
});
