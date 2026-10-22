import axios from 'axios';

/**
 * Check if MySQL DB backend is healthy and reachable
 */
export async function checkDbHealth() {
  try {
    const res = await axios.get('/api/db/health');
    return res.data;
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetch all client tenant databases (aud_*)
 */
export async function fetchClientDatabases() {
  const res = await axios.get('/api/db/databases');
  return res.data?.databases || [];
}

/**
 * Fetch tables in a specific database
 */
export async function fetchTables(dbName) {
  const res = await axios.get(`/api/db/tables/${dbName}`);
  return res.data?.tables || [];
}

/**
 * Fetch live campaign counts and WhatsApp/SMS tables
 */
export async function fetchDbCampaigns(dbName) {
  const res = await axios.get(`/api/db/campaigns/${dbName}`);
  return res.data?.campaigns || [];
}

/**
 * Fetch attributes list for a client database
 */
export async function fetchDbAttributes(dbName) {
  const res = await axios.get(`/api/db/attributes/${dbName}`);
  return res.data?.attributes || [];
}
