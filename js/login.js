document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  try {
    const users = await getSheetData("Users");
    console.log("Users from sheet:", users);

    if (!users || users.length < 2) {
      alert("No users found in the database.");
      return;
    }

    // ✅ Extract header row (first row of sheet)
    const headers = users[0].map(h => h.toLowerCase().trim());
    const emailIndex = headers.indexOf("email");
    const passwordIndex = headers.indexOf("password");

    if (emailIndex === -1 || passwordIndex === -1) {
      alert("Sheet is missing Email or Password columns!");
      return;
    }

    // ✅ Look for matching user
    const user = users.find((row, i) => {
      if (i === 0) return false; // skip header row
      return row[emailIndex] === email && row[passwordIndex] === password;
    });

    if (user) {
      alert("Login successful!");
      window.location.href = "../html/dashboard.html"; // redirect to dashboard
    } else {
      alert("Invalid email or password.");
    }

  } catch (err) {
    console.error("Error during login:", err);
    alert("Login failed, please try again.");
  }
});
