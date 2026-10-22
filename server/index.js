import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  testConnection, 
  getClientDatabases, 
  getTablesInDatabase, 
  getCampaignMetrics,
  pool,
  masterPool,
  jobPool
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check & Primary Tenant DB test endpoint
app.get('/api/db/health', async (req, res) => {
  const result = await testConnection(pool, 'Tenant DB (Primary)');
  res.json(result);
});

// 2. Test All 3 Server Connections at once
app.get('/api/db/test-all', async (req, res) => {
  const [tenantRes, masterRes, jobRes] = await Promise.all([
    testConnection(pool, 'Tenant DB (35.196.56.95)'),
    testConnection(masterPool, 'Master DB (34.73.164.14)'),
    testConnection(jobPool, 'Job DB (35.231.232.10)')
  ]);

  res.json({
    tenant: tenantRes,
    master: masterRes,
    job: jobRes
  });
});

// 3. List all client databases (e.g. aud_bb073c1c_...)
app.get('/api/db/databases', async (req, res) => {
  try {
    const databases = await getClientDatabases();
    res.json({ success: true, count: databases.length, databases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get tables for a specific database
app.get('/api/db/tables/:dbName', async (req, res) => {
  try {
    const { dbName } = req.params;
    const tables = await getTablesInDatabase(dbName);
    res.json({ success: true, database: dbName, count: tables.length, tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get Campaign metrics & table counts for a database
app.get('/api/db/campaigns/:dbName', async (req, res) => {
  try {
    const { dbName } = req.params;
    const campaigns = await getCampaignMetrics(dbName);
    res.json({ success: true, database: dbName, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Query custom data / attributes from a database
app.get('/api/db/attributes/:dbName', async (req, res) => {
  try {
    const safeDb = req.params.dbName.replace(/[^a-zA-Z0-9_]/g, '');
    const [attributes] = await pool.query(`SELECT * FROM \`${safeDb}\`.dataattributes LIMIT 50`);
    res.json({ success: true, database: safeDb, attributes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MySQL API Backend Server running on http://localhost:${PORT}`);
});
