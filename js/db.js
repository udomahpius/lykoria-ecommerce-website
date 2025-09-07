// db.js
const DB_NAME = "blogDB";
const DB_VERSION = 1;
let db;

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxh60DmdP8lgOHmU9Tl9PxrZ1ND2YC3KxN5N25M8SPj1x2rgMlfpn0I62CYNhmGXd8Q/exec "; // Replace with your script

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

// ==================== POSTS ====================

// Save new post
export async function savePost(post) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    tx.objectStore("posts").put(post);

    tx.oncomplete = async () => {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post),
        });
      } catch (err) {
        console.error("Failed to sync post to Google Sheets:", err);
      }
      resolve();
    };

    tx.onerror = (err) => reject(err);
  });
}


// Update existing post
export async function updatePost(post) {
  return savePost(post); // Same as savePost; it replaces by keyPath
}

// Get all posts
// export async function getPosts() {
//   await initDB();
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("posts", "readonly");
//     const store = tx.objectStore("posts");
//     const request = store.getAll();

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = (err) => reject(err);
//   });
// }
export async function getPosts() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readonly");
    const store = tx.objectStore("posts");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

// Delete post
export async function deletePost(id) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    tx.objectStore("posts").delete(id);

    tx.oncomplete = resolve;
    tx.onerror = (err) => reject(err);
  });
}

// Clear all posts
export async function clearPosts() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    tx.objectStore("posts").clear();

    tx.oncomplete = resolve;
    tx.onerror = (err) => reject(err);
  });
}


// ==================== USERS ====================

// Save new user
export async function saveUser(user) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readwrite");
    tx.objectStore("users").put(user);

    tx.oncomplete = async () => {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
      } catch (err) {
        console.error("Failed to sync user to Google Sheets:", err);
      }
      resolve();
    };

    tx.onerror = (err) => reject(err);
  });
}

// Get user by email
export async function getUserByEmail(email) {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readonly");
    const request = tx.objectStore("users").get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (err) => reject(err);
  });
}

// ==================== CATEGORIES ====================

// Save category
export async function saveCategory(name) {
  await initDB();
  const category = { id: Date.now(), name };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readwrite");
    tx.objectStore("categories").put(category);

    tx.oncomplete = resolve;
    tx.onerror = (err) => reject(err);
  });
}

// Get all categories
export async function getCategories() {
  await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readonly");
    const request = tx.objectStore("categories").getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (err) => reject(err);
  });
}

// export async function updatePost(post) {
//   const db = await initDB();
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("posts", "readwrite");
//     tx.objectStore("posts").put(post);
//     tx.oncomplete = () => resolve();
//     tx.onerror = err => reject(err);
//   });
// }

