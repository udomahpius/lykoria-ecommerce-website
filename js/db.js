const SHEET_URL = "https://script.google.com/macros/s/AKfycbyuXVMXjn7FOEgw8vWo8w1fuzq1iHjObRewgV7_C9kfaUNFcmg4BfKrBH1JV2J5U-VZUQ/exec";





// js/db.js

function getSheetData(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = "cb_" + Math.random().toString(36).substring(2);
    window[callbackName] = (res) => {
      delete window[callbackName];
      resolve(res.values || []);
    };
    const script = document.createElement("script");
    script.src = `${SHEET_URL}?sheet=${sheetName}&callback=${callbackName}`;
    script.onerror = () => reject("Failed to load sheet");
    document.body.appendChild(script);
  });
}

function appendRow(sheetName, rowData) {
  return new Promise((resolve, reject) => {
    const callbackName = "cb_" + Math.random().toString(36).substring(2);
    window[callbackName] = (res) => {
      delete window[callbackName];
      resolve(res);
    };
    const script = document.createElement("script");
    script.src = `${SHEET_URL}?sheet=${sheetName}&add=${encodeURIComponent(JSON.stringify(rowData))}&callback=${callbackName}`;
    script.onerror = () => reject("Failed to append row");
    document.body.appendChild(script);
  });
}

function updateRow(sheetName, rowId, rowData) {
  return new Promise((resolve, reject) => {
    const callbackName = "cb_" + Math.random().toString(36).substring(2);
    window[callbackName] = (res) => {
      delete window[callbackName];
      resolve(res);
    };
    const script = document.createElement("script");
    script.src = `${SHEET_URL}?sheet=${sheetName}&row=${rowId}&update=${encodeURIComponent(JSON.stringify(rowData))}&callback=${callbackName}`;
    script.onerror = () => reject("Failed to update row");
    document.body.appendChild(script);
  });
}

// Password hashing
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}
