// js/login.js
document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const users = await getSheetData("Users");
    const dataRows = users.slice(1);

    const hashedPassword = await hashPassword(password);
    const user = dataRows.find(u => u[2] === email && u[3] === hashedPassword);

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    const currentUser = { firstName: user[0], lastName: user[1], email: user[2] };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert(`Welcome, ${user[0]}! Redirecting to editor...`);
    window.location.href = "editor.html";

  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed, please try again.");
  }
});
