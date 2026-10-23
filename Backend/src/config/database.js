const mssql = require('mssql');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Admin@TVSS2026',
  server: process.env.DB_SERVER || process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'TVSSensingSolutionsDB',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
    enableArithAbort: true,
    connectTimeout: 2500
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;
let isConnected = false;
let isConnecting = false;
let lastAttemptTime = 0;
let lastWarningLogTime = 0;
const RETRY_COOLDOWN_MS = 30000; // 30 seconds cooldown between reconnection attempts

async function getPool() {
  if (pool && isConnected) {
    return pool;
  }

  // If already connecting, avoid duplicate in-flight connection attempts
  if (isConnecting) {
    return null;
  }

  const now = Date.now();
  // If recent attempt failed, respect cooldown to prevent blocking requests
  if (!isConnected && (now - lastAttemptTime < RETRY_COOLDOWN_MS)) {
    return null;
  }

  lastAttemptTime = now;
  isConnecting = true;

  try {
    pool = await mssql.connect(dbConfig);
    isConnected = true;
    isConnecting = false;
    console.log(`✓ Connected to MS SQL Server instance: ${dbConfig.server}/${dbConfig.database}`);

    pool.on('error', err => {
      console.log(`[MS SQL Pool Error]: ${err.message}`);
      isConnected = false;
      pool = null;
    });

    await initTables(pool);
    return pool;
  } catch (err) {
    isConnected = false;
    isConnecting = false;
    pool = null;

    if (now - lastWarningLogTime >= RETRY_COOLDOWN_MS) {
      console.log(`[MS SQL Notice] Connection failed (${err.message}). Using persistent JSON store.`);
      lastWarningLogTime = now;
    }
    return null;
  }
}

async function initTables(activePool) {
  if (!activePool) return;
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../../database/schema.sql'), 'utf8');
    await activePool.request().query(schemaSql);
    console.log('✓ MS SQL Server tables verified/created successfully.');
  } catch (err) {
    console.error('[MS SQL Error] Schema initialization error:', err.message);
  }
}

function checkConnection() {
  return isConnected;
}

module.exports = {
  getPool,
  checkConnection,
  dbConfig,
  mssql
};
