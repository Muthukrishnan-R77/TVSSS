const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const { getPool, dbConfig } = require('./config/database');
const { seedInitialAdmin } = require('./services/dbService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('====================================================');
  console.log('Starting TVS Sensing Solutions Node + MS SQL Backend');
  console.log('====================================================');

  try {
    // Attempt DB connection and seed initial admin user
    const pool = await getPool();
    if (pool) {
      await seedInitialAdmin();
    }
  } catch (err) {
    console.log('[Server Startup Notice] Database init notice:', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log('============================================================');
    console.log(' ✓ TVS SENSING SOLUTIONS SERVER RUNNING');
    console.log('============================================================');
    console.log(` - Website (Frontend):      http://localhost:${PORT}/`);
    console.log(` - Admin Portal:            http://localhost:${PORT}/admin/login.html`);
    console.log(` - Careers (Job Openings):  http://localhost:${PORT}/careers/`);
    console.log(` - Media & Exhibitions:     http://localhost:${PORT}/media/`);
    console.log(` - Health Check API:        http://localhost:${PORT}/api/health`);
    console.log('============================================================');
    console.log(`✓ MS SQL Server Target: ${dbConfig.server}:${dbConfig.port} / Database: ${dbConfig.database}`);
    console.log(`✓ Uploads Directory: ${path.join(__dirname, '../../Uploads')}`);
    console.log('============================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the existing process or use another PORT.`);
    } else {
      console.error('❌ Server error:', err.message);
    }
  });
}

startServer();
