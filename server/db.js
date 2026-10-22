import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const defaultPassword = process.env.DB_PASSWORD || 'A7kP9xQ2mN5vR8tY3cL6wZ1sH4jF0bX8#';
const defaultUser = process.env.DB_USER || 'res_cain2973';

/**
 * Primary MySQL Connection Pool (Tenant DB - 35.196.56.95)
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '35.196.56.95',
  user: defaultUser,
  password: defaultPassword,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

/**
 * Master MySQL Connection Pool (Master DB - 34.73.164.14)
 */
export const masterPool = mysql.createPool({
  host: process.env.DB_MASTER_HOST || '34.73.164.14',
  user: defaultUser,
  password: defaultPassword,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
});

/**
 * Job DB Connection Pool (Job DB - 35.231.232.10)
 */
export const jobPool = mysql.createPool({
  host: process.env.DB_JOB_HOST || '35.231.232.10',
  user: defaultUser,
  password: defaultPassword,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
});

/**
 * Test DB Connection status
 */
export async function testConnection(targetPool = pool, hostName = 'Tenant DB') {
  try {
    const connection = await targetPool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: `Connected successfully to ${hostName} (${targetPool.pool.config.connectionConfig.host})` };
  } catch (error) {
    return { success: false, message: `Failed to connect to ${hostName}: ${error.message}` };
  }
}

/**
 * List all client audience databases (matching aud_*)
 */
export async function getClientDatabases() {
  const [rows] = await pool.query(`SHOW DATABASES LIKE 'aud_%'`);
  return rows.map((r) => Object.values(r)[0]);
}

/**
 * Get all tables in a specific database
 */
export async function getTablesInDatabase(databaseName) {
  const safeDb = databaseName.replace(/[^a-zA-Z0-9_]/g, '');
  const [rows] = await pool.query(`SHOW TABLES FROM \`${safeDb}\``);
  return rows.map((r) => Object.values(r)[0]);
}

/**
 * Query Campaign details from a specific database
 */
export async function getCampaignMetrics(databaseName) {
  const safeDb = databaseName.replace(/[^a-zA-Z0-9_]/g, '');
  const [tables] = await pool.query(`SHOW TABLES FROM \`${safeDb}\` LIKE 'Camp_%'`);
  const campTableNames = tables.map((t) => Object.values(t)[0]);

  const campaignStats = [];
  for (const tableName of campTableNames.slice(0, 20)) {
    try {
      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM \`${safeDb}\`.\`${tableName}\``);
      const totalRecords = countResult[0]?.total || 0;
      
      const isWA = tableName.endsWith('_WA');
      const isSMS = tableName.endsWith('_S');
      
      campaignStats.push({
        table: tableName,
        channel: isWA ? 'WhatsApp' : isSMS ? 'SMS/Email' : 'Campaign',
        records: totalRecords,
      });
    } catch (e) {
      console.warn(`Could not read ${tableName}:`, e.message);
    }
  }

  return campaignStats;
}
