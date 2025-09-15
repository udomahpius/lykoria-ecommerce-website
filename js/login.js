document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // If server sends invalid response
    if (!res.ok) {
      const errorMsg = await res.text();
      alert("Login failed: " + errorMsg);
      return;
    }

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token); // store token
      alert("Login successful!");
      window.location.href = "admin.html"; // 🔑 redirect here
    } else {
      alert(data.error || "Invalid email or password");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred while logging in");
  }
});
