// src/api.js
const BASE_URL = "https://habesha-connect.onrender.com";

export async function getDbTest() {
  try {
    const response = await fetch(`${BASE_URL}/dbtest`);
    const data = await response.json();
    console.log("✅ Connected to backend:", data);
    return data;
  } catch (error) {
    console.error("❌ Error connecting to backend:", error);
  }
}
