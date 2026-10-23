const dbService = require('../services/dbService');

async function getSummary(req, res, next) {
  try {
    const summary = await dbService.getDashboardSummary();
    return res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary
};
