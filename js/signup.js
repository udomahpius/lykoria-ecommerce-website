// js/signup.js
document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.querySelector("#firstName").value.trim();
  const lastName = document.querySelector("#lastName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const users = await getSheetData("Users");
    const dataRows = users.slice(1);

    if (dataRows.some(u => u[2] === email)) {
      alert("This email is already registered!");
      return;
    }

    const hashedPassword = await hashPassword(password);
    await appendRow("Users", [firstName, lastName, email, hashedPassword]);

    alert("Signup successful! Redirecting to login...");
    window.location.href = "login.html";

  } catch (err) {
    console.error("Signup failed:", err);
    alert("Signup failed, please try again.");
  }
});
