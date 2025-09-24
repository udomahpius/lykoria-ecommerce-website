// =================== COUNTRY LIST ===================
const countries = [
  { name: "Afghanistan", code: "AF", flag: "🇦🇫" },
  { name: "Albania", code: "AL", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", flag: "🇩🇿" },
  { name: "Andorra", code: "AD", flag: "🇦🇩" },
  { name: "Angola", code: "AO", flag: "🇦🇴" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", flag: "🇦🇲" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "Austria", code: "AT", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", flag: "🇦🇿" },
  { name: "Bahamas", code: "BS", flag: "🇧🇸" },
  { name: "Bahrain", code: "BH", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩" },
  { name: "Barbados", code: "BB", flag: "🇧🇧" },
  { name: "Belarus", code: "BY", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", flag: "🇧🇪" },
  { name: "Belize", code: "BZ", flag: "🇧🇿" },
  { name: "Benin", code: "BJ", flag: "🇧🇯" },
  { name: "Bhutan", code: "BT", flag: "🇧🇹" },
  { name: "Bolivia", code: "BO", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦" },
  { name: "Botswana", code: "BW", flag: "🇧🇼" },
  { name: "Brazil", code: "BR", flag: "🇧🇷" },
  { name: "Brunei", code: "BN", flag: "🇧🇳" },
  { name: "Bulgaria", code: "BG", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫" },
  { name: "Burundi", code: "BI", flag: "🇧🇮" },
  { name: "Cambodia", code: "KH", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", flag: "🇨🇲" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Cape Verde", code: "CV", flag: "🇨🇻" },
  { name: "Central African Republic", code: "CF", flag: "🇨🇫" },
  { name: "Chad", code: "TD", flag: "🇹🇩" },
  { name: "Chile", code: "CL", flag: "🇨🇱" },
  { name: "China", code: "CN", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", flag: "🇨🇴" },
  { name: "Comoros", code: "KM", flag: "🇰🇲" },
  { name: "Congo", code: "CG", flag: "🇨🇬" },
  { name: "Congo (DRC)", code: "CD", flag: "🇨🇩" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷" },
  { name: "Croatia", code: "HR", flag: "🇭🇷" },
  { name: "Cuba", code: "CU", flag: "🇨🇺" },
  { name: "Cyprus", code: "CY", flag: "🇨🇾" },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", flag: "🇩🇰" },
  { name: "Djibouti", code: "DJ", flag: "🇩🇯" },
  { name: "Dominican Republic", code: "DO", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶" },
  { name: "Eritrea", code: "ER", flag: "🇪🇷" },
  { name: "Estonia", code: "EE", flag: "🇪🇪" },
  { name: "Eswatini", code: "SZ", flag: "🇸🇿" },
  { name: "Ethiopia", code: "ET", flag: "🇪🇹" },
  { name: "Fiji", code: "FJ", flag: "🇫🇯" },
  { name: "Finland", code: "FI", flag: "🇫🇮" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Gabon", code: "GA", flag: "🇬🇦" },
  { name: "Gambia", code: "GM", flag: "🇬🇲" },
  { name: "Georgia", code: "GE", flag: "🇬🇪" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", flag: "🇬🇭" },
  { name: "Greece", code: "GR", flag: "🇬🇷" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹" },
  { name: "Guinea", code: "GN", flag: "🇬🇳" },
  { name: "Haiti", code: "HT", flag: "🇭🇹" },
  { name: "Honduras", code: "HN", flag: "🇭🇳" },
  { name: "Hungary", code: "HU", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", flag: "🇮🇸" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { name: "Iran", code: "IR", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", flag: "🇮🇪" },
  { name: "Israel", code: "IL", flag: "🇮🇱" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", flag: "🇯🇲" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", flag: "🇰🇪" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼" },
  { name: "Lebanon", code: "LB", flag: "🇱🇧" },
  { name: "Liberia", code: "LR", flag: "🇱🇷" },
  { name: "Libya", code: "LY", flag: "🇱🇾" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺" },
  { name: "Madagascar", code: "MG", flag: "🇲🇬" },
  { name: "Malawi", code: "MW", flag: "🇲🇼" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾" },
  { name: "Mali", code: "ML", flag: "🇲🇱" },
  { name: "Malta", code: "MT", flag: "🇲🇹" },
  { name: "Mexico", code: "MX", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", flag: "🇲🇦" },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿" },
  { name: "Namibia", code: "NA", flag: "🇳🇦" },
  { name: "Nepal", code: "NP", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮" },
  { name: "Niger", code: "NE", flag: "🇳🇪" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬" },
  { name: "Norway", code: "NO", flag: "🇳🇴" },
  { name: "Oman", code: "OM", flag: "🇴🇲" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰" },
  { name: "Palestine", code: "PS", flag: "🇵🇸" },
  { name: "Panama", code: "PA", flag: "🇵🇦" },
  { name: "Paraguay", code: "PY", flag: "🇵🇾" },
  { name: "Peru", code: "PE", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", flag: "🇵🇭" },
  { name: "Poland", code: "PL", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", flag: "🇵🇹" },
  { name: "Qatar", code: "QA", flag: "🇶🇦" },
  { name: "Romania", code: "RO", flag: "🇷🇴" },
  { name: "Russia", code: "RU", flag: "🇷🇺" },
  { name: "Rwanda", code: "RW", flag: "🇷🇼" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦" },
  { name: "Senegal", code: "SN", flag: "🇸🇳" },
  { name: "Serbia", code: "RS", flag: "🇷🇸" },
  { name: "Seychelles", code: "SC", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱" },
  { name: "Singapore", code: "SG", flag: "🇸🇬" },
  { name: "Slovakia", code: "SK", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", flag: "🇸🇮" },
  { name: "Somalia", code: "SO", flag: "🇸🇴" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "South Korea", code: "KR", flag: "🇰🇷" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰" },
  { name: "Sudan", code: "SD", flag: "🇸🇩" },
  { name: "Sweden", code: "SE", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭" },
  { name: "Syria", code: "SY", flag: "🇸🇾" },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", flag: "🇹🇭" },
  { name: "Togo", code: "TG", flag: "🇹🇬" },
  { name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹" },
  { name: "Tunisia", code: "TN", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", flag: "🇹🇷" },
  { name: "Uganda", code: "UG", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "UZ", flag: "🇺🇿" },
  { name: "Venezuela", code: "VE", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳" },
  { name: "Yemen", code: "YE", flag: "🇾🇪" },
  { name: "Zambia", code: "ZM", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼" }
];

// =================== DOM READY ===================
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const phone = document.getElementById("phone");
  const region = document.getElementById("region");
  const roleSelect = document.getElementById("role"); // dropdown
  const signupBtn = document.getElementById("signupBtn");
  const msg = document.getElementById("msg");

  if (!firstName || !signupBtn) {
    console.error("❌ Signup form elements not found in DOM.");
    return;
  }

  // Populate country dropdown
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "🌍 Select your country";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  region.appendChild(placeholderOption);

  countries.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = `${c.flag} ${c.name}`;
    region.appendChild(opt);
  });

  // Config
  const BASE_URL = "https://lykoria-ecommerce-website.onrender.com";
  const API_URL = `${BASE_URL}/api/signup`;

  // ====== FORM VALIDATION ======
  function validateForm() {
    if (!firstName.value.trim() || !lastName.value.trim()) {
      return "First and last name are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) return "Enter a valid email.";

    if (password.value.trim().length < 6)
      return "Password must be at least 6 characters.";

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone.value.trim()))
      return "Enter a valid phone number (7–15 digits).";

    if (!region.value) return "Please select a region.";

    if (!roleSelect.value) return "Please select a role.";

    return null;
  }

  // ====== SIGNUP FUNCTION ======
  async function signup() {
    msg.style.color = "#555";
    msg.textContent = "⏳ Signing up...";

    const error = validateForm();
    if (error) {
      msg.style.color = "red";
      msg.textContent = "❌ " + error;
      return;
    }

    signupBtn.disabled = true;

    const role = roleSelect.value;

    try {
      const body = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
        phone: phone.value.trim(),
        region: region.value,
        role: role
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Save session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      msg.style.color = "green";
      msg.textContent = "✅ Signup successful! Redirecting...";

      setTimeout(() => {
        if (role.toLowerCase() === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1500);
    } catch (err) {
      console.error("❌ Signup Error:", err);
      msg.style.color = "red";
      msg.textContent = "❌ " + err.message;
    } finally {
      signupBtn.disabled = false;
    }
  }

  // ====== EVENT LISTENERS ======
  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signup();
  });
});
