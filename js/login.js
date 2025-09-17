// ====== LOGIN FORM ======
const BASE_URL = "https://adminblog-zk87.onrender.com";
API_URL = `${BASE_URL}/api/login`; 
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Handle server/network errors
    if (!res.ok) {
      let msg;
      try {
        const errorData = await res.json();
        msg = errorData.error || "Login failed.";
      } catch {
        msg = await res.text();
      }
      alert("Login failed: " + msg);
      return;
    }

    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem("token", data.token); // store JWT
      alert("✅ Login successful!");
      window.location.href = "admin.html"; // redirect to dashboard
    } else {
      alert(data.error || "Invalid email or password.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("⚠️ Unable to login. Please try again later.");
  }
});
