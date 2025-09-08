const SHEET_URL = "https://script.google.com/macros/s/AKfycbyuXVMXjn7FOEgw8vWo8w1fuzq1iHjObRewgV7_C9kfaUNFcmg4BfKrBH1JV2J5U-VZUQ/exec";

// ✅ Get all rows (JSONP to avoid CORS issues)
function getSheetData(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = "cb_" + Math.random().toString(36).substr(2, 9);

    window[callbackName] = function(data) {
      delete window[callbackName];
      resolve(data.values || []);
    };

    const script = document.createElement("script");
    script.src = `${SHEET_URL}?sheet=${sheetName}&callback=${callbackName}`;
    script.onerror = () => reject("Failed to fetch data");
    document.body.appendChild(script);
  });
}
function appendRow(sheetName, rowData) {
  return new Promise((resolve, reject) => {
    const callbackName = "cb_" + Math.random().toString(36).substring(2);
    window[callbackName] = (response) => {
      delete window[callbackName];
      resolve(response);
    };
    const url = `${SHEET_URL}?sheet=${sheetName}&add=${encodeURIComponent(JSON.stringify(rowData))}&callback=${callbackName}`;
    const script = document.createElement("script");
    script.src = url;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// ✅ Append a new row (uses POST request)
// async function appendRow(sheetName, rowData) {
//   try {
//     const res = await fetch(`${SHEET_URL}?sheet=${sheetName}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ row: rowData })
//     });

//     return await res.json(); // { result: "success" }
//   } catch (err) {
//     console.error("appendRow error:", err);
//     throw err;
//   }
// }
