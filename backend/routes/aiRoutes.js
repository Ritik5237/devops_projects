const express = require('express');
const {
  breakdownTask,
  parseTask,
  getDailyBriefing
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All AI endpoints require authentication
router.use(protect);

router.post('/breakdown', breakdownTask);
router.post('/parse-task', parseTask);
router.get('/briefing', getDailyBriefing);

module.exports = router;
