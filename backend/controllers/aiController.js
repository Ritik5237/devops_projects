const Task = require('../models/Task');
const geminiService = require('../services/geminiService');

/**
 * @desc    Generate AI breakdown and subtasks for a task
 * @route   POST /api/ai/breakdown
 * @access  Private
 */
exports.breakdownTask = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required for AI breakdown'
      });
    }

    const breakdown = await geminiService.breakdownTask({
      title: title.trim(),
      description: description || '',
      priority: priority || 'Medium'
    });

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Parse natural language text into a structured task
 * @route   POST /api/ai/parse-task
 * @access  Private
 */
exports.parseTask = async (req, res, next) => {
  try {
    const { text, difficulty, dueDate } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Natural language input text is required'
      });
    }

    const parsed = await geminiService.parseNaturalLanguageTask({
      text: text.trim(),
      difficulty: difficulty || null,
      dueDate: dueDate || null
    });

    res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI daily focus briefing for user's tasks
 * @route   GET /api/ai/briefing
 * @access  Private
 */
exports.getDailyBriefing = async (req, res, next) => {
  try {
    // Get current user's active tasks
    const activeTasks = await Task.find({
      user: req.user._id,
      status: { $ne: 'Completed' }
    }).sort({ priority: -1, dueDate: 1 }).limit(10);

    const briefing = await geminiService.generateDailyBriefing(
      activeTasks,
      req.user.name || 'Developer'
    );

    res.status(200).json({
      success: true,
      data: briefing
    });
  } catch (error) {
    next(error);
  }
};
