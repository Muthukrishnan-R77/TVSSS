const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { seedInitialAdmin } = require('../services/dbService');

async function runSeed() {
  console.log('Seeding initial administrator user...');
  await seedInitialAdmin();
  console.log('Done.');
  process.exit(0);
}

runSeed();
