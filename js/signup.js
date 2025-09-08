document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.querySelector("#firstName").value.trim();
  const lastName = document.querySelector("#lastName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  try {
    const users = await getSheetData("Users");
    console.log("Users from sheet:", users);

    if (!users || users.length < 1) {
      alert("Database not ready.");
      return;
    }

    // ✅ Extract header row
    const headers = users[0].map(h => h.toLowerCase().trim());
    const emailIndex = headers.indexOf("email");

    if (emailIndex === -1) {
      alert("Sheet is missing an Email column!");
      return;
    }

    // ✅ Check if email already exists
    const exists = users.some((row, i) => i !== 0 && row[emailIndex] === email);

    if (exists) {
      alert("This email is already registered!");
      return;
    }

    // ✅ Append row in correct order based on headers
    const newRow = headers.map(h => {
      if (h === "first name") return firstName;
      if (h === "last name") return lastName;
      if (h === "email") return email;
      if (h === "password") return password;
      return ""; // fill blanks for other columns
    });

    console.log("Appending new user:", newRow);
    await appendRow("Users", newRow);

    alert("Signup successful! Please log in.");
    window.location.href = "../html/login.html";

  } catch (err) {
    console.error("Error during signup:", err);
    alert("Signup failed, please try again.");
  }
});
