const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log("=== API TESTS ===");

  try {
    const categories = await axios.get(`${API_URL}/categories`);
    console.log(`[GET /categories] OK. Got ${categories.data.length} categories.`);
  } catch (e) {
    console.error(`[GET /categories] FAILED:`, e.response ? e.response.status : e.message);
  }

  try {
    const events = await axios.get(`${API_URL}/events`);
    console.log(`[GET /events] OK. Got ${events.data.length} events.`);
  } catch (e) {
    console.error(`[GET /events] FAILED:`, e.response ? e.response.status : e.message);
  }

  try {
    const users = await axios.get(`${API_URL}/users`);
    console.log(`[GET /users] OK. Got ${users.data.length} users.`);
  } catch (e) {
    console.error(`[GET /users] FAILED:`, e.response ? e.response.status : e.message);
  }
}
runTests();
