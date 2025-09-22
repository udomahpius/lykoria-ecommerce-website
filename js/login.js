document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const msg = document.getElementById("msg");

  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
  const API_URL = `${BASE_URL}/api/login`;

  async function login() {
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

        // Decode role from token
        let userRole = "user";
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          userRole = payload.role || "user";
        } catch (e) {
          console.warn("Token decode failed:", e);
        }

        localStorage.setItem("role", userRole);

        // Redirect based on role
        setTimeout(() => {
          if (userRole === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "index.html";
          }
        }, 1500);
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

  loginBtn.addEventListener("click", login);
});
