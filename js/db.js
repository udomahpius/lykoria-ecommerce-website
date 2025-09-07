const DB_NAME = "blogDB";
const DB_VERSION = 1;
let db;

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxxuC84xr7TMOpNkbTdDSfwEWXkqEFbXlrf6eVXsCO0wiUtOElJpBXJjzuwiaqAVrgXXA/exec"; // Replace

// Initialize DB
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "email" });
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => reject(event.target.error);
  });
}

// Save user
export async function saveUser(user) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readwrite");
    tx.objectStore("users").put(user);
    tx.oncomplete = () => resolve();
    tx.onerror = (err) => reject(err);
  });
}

// Get user by email
export async function getUserByEmail(email) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");
    const request = store.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


// Save user (signup)
// export async function saveUser(user) {
//   await initDB();
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("users", "readwrite");
//     tx.objectStore("users").put(user);
//     tx.oncomplete = () => resolve();
//     tx.onerror = (err) => reject(err);
//   });
// }

// Save post
export async function savePost(post) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    const store = tx.objectStore("posts");
    const req = store.put(post);

    req.onsuccess = async () => {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          body: JSON.stringify(post),
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("Failed to sync post to Google Sheets:", err);
      }
      resolve(post);
    };

    req.onerror = (err) => reject(err);
  });
}

// Save user
// export async function saveUser(user) {
//   await initDB();
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("users", "readwrite");
//     const store = tx.objectStore("users");
//     const req = store.put(user);

//     req.onsuccess = async () => {
//       try {
//         await fetch(GOOGLE_SHEET_URL, {
//           method: "POST",
//           body: JSON.stringify(user),
//           headers: { "Content-Type": "application/json" }
//         });
//       } catch (err) {
//         console.error("Failed to sync user to Google Sheets:", err);
//       }
//       resolve(user);
//     };

//     req.onerror = (err) => reject(err);
//   });
// }

// Fetch posts from IndexedDB
export async function getAllPosts() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readonly");
    const store = tx.objectStore("posts");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = (err) => reject(err);
  });
}

// Delete all posts
export async function clearPosts() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    const store = tx.objectStore("posts");
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = (err) => reject(err);
  });
}

// Category functions
export async function saveCategory(name) {
  await initDB();
  const tx = db.transaction("categories", "readwrite");
  const store = tx.objectStore("categories");
  const req = store.put({ id: Date.now(), name });

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve();
    req.onerror = (err) => reject(err);
  });
}

export async function getCategories() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readonly");
    const store = tx.objectStore("categories");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = (err) => reject(err);
  });
}
