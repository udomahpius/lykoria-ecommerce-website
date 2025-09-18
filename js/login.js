const BASE_URL = "https://adminblog-zk87.onrender.com";
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
      msgEl.innerText = "✅ Login successful!";
      msgEl.style.color = "green";

      // Save JWT for authenticated requests
      localStorage.setItem("token", data.token);

      // Redirect to dashboard/home after login
      setTimeout(() => (window.location.href = "index.html"), 2000);
    }
  } catch (err) {
    msgEl.innerText = "⚠️ Failed to connect. Please try again.";
    msgEl.style.color = "red";
  } finally {
    btn.disabled = false;
  }
}
