const { GoogleGenAI } = require('@google/genai');

/**
 * Helper to get the GenAI client if GEMINI_API_KEY is configured
 */
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 1. AI Task Breakdown: Deconstruct a task into structured steps, criteria & suggestions
 */
async function breakdownTask({ title, description, priority }) {
  const ai = getGenAIClient();

  if (!ai) {
    return getMockTaskBreakdown(title, description, priority);
  }

  const prompt = `You are an expert agile project manager and productivity assistant.
Analyze this task and break it down into an actionable, professional plan.

Task Title: "${title}"
Current Description: "${description || 'None provided'}"
Current Priority: "${priority || 'Medium'}"

Respond ONLY with valid JSON (no markdown formatting, no code fences):
{
  "enhancedTitle": "Refined and clear action-oriented title",
  "summary": "Clear 2-sentence overview of the objective",
  "suggestedPriority": "High | Medium | Low",
  "subtasks": [
    "Step 1: Actionable step with clear outcome",
    "Step 2: Actionable step with clear outcome",
    "Step 3: Actionable step with clear outcome",
    "Step 4: Actionable step with clear outcome"
  ],
  "estimatedTime": "e.g., 2-3 hours",
  "acceptanceCriteria": "Clear condition that marks this task as successfully done",
  "proTip": "One high-value practical tip to succeed faster"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(`[GeminiService] Live API call failed (${err.message}). Using fallback engine.`);
    return getMockTaskBreakdown(title, description, priority);
  }
}

/**
 * 2. Natural Language Task Parser: Extract structured task details with rich description, difficulty, and dates
 */
async function parseNaturalLanguageTask(options) {
  const text = typeof options === 'string' ? options : (options.text || '');
  const userDifficulty = typeof options === 'object' ? options.difficulty : null;
  const userDueDate = typeof options === 'object' ? options.dueDate : null;

  const ai = getGenAIClient();

  if (!ai) {
    return getMockNaturalLanguageParse({ text, difficulty: userDifficulty, dueDate: userDueDate });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const prompt = `You are an elite agile engineering lead and productivity architect.
The user wants to schedule a task from this raw input: "${text}"
${userDifficulty && userDifficulty !== 'Auto' ? `User requested difficulty/priority: ${userDifficulty}` : ''}
${userDueDate ? `User requested due date: ${userDueDate}` : ''}
Today's Date: ${todayStr}

Your mission: Generate the BEST, most comprehensive, professional task definition.
1. Title: Crisp, clear, action-oriented (e.g. "Configure Multi-Stage Docker Build for TaskFlow").
2. Description: Do NOT write a trivial one-liner. Write an expert, structured Markdown description with:
   - Summary & Objective (1-2 sentences on what needs to be accomplished and why).
   - Implementation Checklist (- [ ] Step 1..., - [ ] Step 2..., - [ ] Step 3..., - [ ] Step 4...).
   - Acceptance Criteria (Clear definition of done).
3. Priority / Difficulty: "High" | "Medium" | "Low". (If user specified, respect it. If not, evaluate technical complexity: complex multi-system or security/infra = High, standard feature/refactor = Medium, minor tweak/doc = Low).
4. Status: "Pending" | "In Progress" | "Completed" (Default: "Pending").
5. Due Date: YYYY-MM-DD. (If user specified or mentioned a day/relative date, calculate that date. If no date was specified, intelligently calculate an appropriate target date: 1-2 days from today for urgent/high, 2-3 days for medium, 4-5 days for moderate).

Respond ONLY with valid JSON (no markdown formatting, no code fences):
{
  "title": "Clean, professional action title",
  "description": "Rich structured markdown description with objective, implementation checklist (- [ ] ...), and acceptance criteria",
  "priority": "High | Medium | Low",
  "status": "Pending",
  "dueDate": "YYYY-MM-DD"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(`[GeminiService] Live API call failed (${err.message}). Using fallback parser.`);
    return getMockNaturalLanguageParse({ text, difficulty: userDifficulty, dueDate: userDueDate });
  }
}

/**
 * 3. Daily Focus Briefing: Summarize active tasks into a prioritized morning standup
 */
async function generateDailyBriefing(tasks = [], username = 'Developer') {
  const ai = getGenAIClient();

  if (!ai) {
    return getMockDailyBriefing(tasks, username);
  }

  const taskSummary = tasks.map((t, idx) => 
    `${idx + 1}. [${t.priority.toUpperCase()}] "${t.title}" (Status: ${t.status}, Due: ${t.dueDate ? t.dueDate.split('T')[0] : 'None'})`
  ).join('\n');

  const prompt = `You are an executive productivity coach conducting a daily morning standup briefing for ${username}.
Here are their current tasks:
${taskSummary || 'No active tasks at the moment.'}

Provide an inspiring, laser-focused daily plan.
Respond ONLY with valid JSON (no markdown formatting, no code fences):
{
  "greeting": "Warm greeting addressing ${username}",
  "headline": "Punchy 1-line theme for today",
  "topPriorities": [
    "Item 1: Crucial task to tackle first and why",
    "Item 2: Second priority",
    "Item 3: Third priority"
  ],
  "quickAdvice": "Actionable piece of productivity or engineering advice",
  "energyLevel": "High Focus | Steady Flow | High Urgency"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(`[GeminiService] Live API call failed (${err.message}). Using fallback briefing.`);
    return getMockDailyBriefing(tasks, username);
  }
}

// ---------------------------------------------------------
// Intelligent Fallback Engines (Active when offline or without API Key)
// ---------------------------------------------------------

function getMockTaskBreakdown(title, description, priority) {
  const isDevOps = /docker|k8s|kubernetes|jenkins|pipeline|ci\/cd|terraform|ansible/i.test(title);
  const isBug = /fix|bug|error|issue|crash|patch/i.test(title);

  let subtasks = [];
  if (isDevOps) {
    subtasks = [
      'Define requirements, architecture, and environment configurations',
      'Create and test local configuration / manifests',
      'Integrate automated checks into the deployment pipeline',
      'Perform sanity testing and verify health check endpoints'
    ];
  } else if (isBug) {
    subtasks = [
      'Reproduce the issue locally with a failing test case',
      'Trace root cause in application logs and stack traces',
      'Implement the code patch and verify edge cases',
      'Run complete test suite and deploy fix'
    ];
  } else {
    subtasks = [
      'Clarify scope, objectives, and acceptance criteria',
      'Execute core implementation in focused intervals',
      'Review output against requirements and verify quality',
      'Mark deliverable complete and document key notes'
    ];
  }

  return {
    enhancedTitle: title.trim(),
    summary: description && description.trim() 
      ? `Streamlined execution plan for "${title}": ${description.slice(0, 100)}`
      : `High-impact execution breakdown for "${title}" to ensure efficient delivery.`,
    suggestedPriority: priority || (isBug ? 'High' : 'Medium'),
    subtasks,
    estimatedTime: isDevOps ? '2-4 hours' : (isBug ? '1-2 hours' : '1-3 hours'),
    acceptanceCriteria: `All subtasks are validated and functional without open regressions.`,
    proTip: `Group dependent items together and verify progress using your TaskFlow dashboard. (Simulated AI mode: add GEMINI_API_KEY in .env for live Gemini 2.5)`
  };
}

function getMockNaturalLanguageParse(input) {
  const text = typeof input === 'string' ? input : (input.text || '');
  const userDifficulty = typeof input === 'object' && input.difficulty ? input.difficulty : null;
  const userDueDate = typeof input === 'object' && input.dueDate ? input.dueDate : null;

  const clean = text.trim();

  // 1. Difficulty / Priority determination
  let priority = userDifficulty && userDifficulty !== 'Auto' ? userDifficulty : 'Medium';
  if (!userDifficulty || userDifficulty === 'Auto') {
    if (/urgent|critical|asap|high|emergency|prod|production|security|k8s|kubernetes|cluster/i.test(clean)) {
      priority = 'High';
    } else if (/low|trivial|minor|whenever|readme|docs|comment/i.test(clean)) {
      priority = 'Low';
    } else {
      priority = 'Medium';
    }
  }

  // 2. Status determination
  let status = 'Pending';
  if (/in progress|doing|working on|active/i.test(clean)) status = 'In Progress';
  else if (/done|finished|completed/i.test(clean)) status = 'Completed';

  // 3. Due Date determination
  let dueDate = userDueDate || null;
  const today = new Date();
  if (!dueDate) {
    if (/today/i.test(clean)) {
      dueDate = today.toISOString().split('T')[0];
    } else if (/tomorrow/i.test(clean)) {
      const tmrw = new Date(today);
      tmrw.setDate(tmrw.getDate() + 1);
      dueDate = tmrw.toISOString().split('T')[0];
    } else if (/friday/i.test(clean)) {
      const fri = new Date(today);
      const day = fri.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      fri.setDate(fri.getDate() + diff);
      dueDate = fri.toISOString().split('T')[0];
    } else if (/monday/i.test(clean)) {
      const mon = new Date(today);
      const day = mon.getDay();
      const diff = (1 - day + 7) % 7 || 7;
      mon.setDate(mon.getDate() + diff);
      dueDate = mon.toISOString().split('T')[0];
    } else {
      // Smart default based on priority: High = +2 days, Medium = +3 days, Low = +5 days
      const daysToAdd = priority === 'High' ? 2 : (priority === 'Medium' ? 3 : 5);
      const defaultDate = new Date(today);
      defaultDate.setDate(defaultDate.getDate() + daysToAdd);
      dueDate = defaultDate.toISOString().split('T')[0];
    }
  }

  // 4. Clean Action Title
  let title = clean
    .replace(/\b(urgent|critical|high priority|low priority|medium priority|asap|today|tomorrow|by friday|on friday|by monday|on monday)\b/gi, '')
    .trim();
  if (!title) title = clean;
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // 5. Generate the Best Rich Description with Checklist
  const isDevOps = /docker|k8s|kubernetes|jenkins|pipeline|ci\/cd|terraform|ansible|helm|cloud/i.test(title);
  const isBug = /fix|bug|error|issue|crash|patch|auth|token/i.test(title);
  const isTest = /test|jest|unit|integration|coverage/i.test(title);

  let steps = [];
  let summary = '';
  let acceptanceCriteria = '';

  if (isDevOps) {
    summary = `Execute enterprise DevOps automation for "${title}" to ensure resilient, reproducible deployment.`;
    steps = [
      `Review configuration prerequisites and environment variables for ${title}`,
      `Author and validate local declarative manifests or configuration scripts`,
      `Integrate health checks and container readiness probes`,
      `Verify automated build, zero-downtime execution, and log monitoring`
    ];
    acceptanceCriteria = `Workload deploys cleanly, passes health probes on port 5050, and functions without manual intervention.`;
  } else if (isBug) {
    summary = `Root-cause and resolve technical defect for "${title}" to prevent regressions and restore stability.`;
    steps = [
      `Isolate and reproduce the failure case with automated test fixtures`,
      `Inspect application logs, network traces, and error payloads`,
      `Implement minimal, clean code fix adhering to security standards`,
      `Execute full regression test suite (25 tests) and verify patch`
    ];
    acceptanceCriteria = `Bug is resolved with passing automated test assertions and zero breaking side-effects.`;
  } else if (isTest) {
    summary = `Implement automated test coverage for "${title}" to ensure software reliability and prevent regressions.`;
    steps = [
      `Define test specifications covering positive paths, boundary conditions, and error states`,
      `Implement isolated test cases using Jest, Supertest, and mock fixtures`,
      `Validate assertion coverage across asynchronous flows and edge cases`,
      `Confirm 100% test pass rate in CI/CD pipeline`
    ];
    acceptanceCriteria = `All test suites pass cleanly with verifiable code coverage.`;
  } else {
    summary = `Comprehensive delivery plan for "${title}" structured for clear momentum and high-quality completion.`;
    steps = [
      `Clarify scope, key objectives, and required inputs for ${title}`,
      `Execute primary implementation in focused, structured milestones`,
      `Conduct sanity verification, edge case testing, and UI review`,
      `Finalize deliverable, record documentation notes, and mark completed`
    ];
    acceptanceCriteria = `All action items verified and signed off against acceptance requirements.`;
  }

  const formattedDescription = `### 🎯 Objective\n${summary}\n\n### 📋 Actionable Checklist\n${steps.map(s => `- [ ] ${s}`).join('\n')}\n\n### ✅ Acceptance Criteria\n${acceptanceCriteria}\n\n*Difficulty / Priority:* **${priority}** | *Target Due:* **${dueDate}**`;

  return {
    title,
    description: formattedDescription,
    priority,
    status,
    dueDate
  };
}

function getMockDailyBriefing(tasks = [], username = 'Developer') {
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed');
  const pending = tasks.filter(t => t.status === 'Pending');
  const inProgress = tasks.filter(t => t.status === 'In Progress');

  const topPriorities = [];
  if (highPriority.length > 0) {
    topPriorities.push(`⚡ High Priority: Focus on "${highPriority[0].title}" first.`);
  }
  if (inProgress.length > 0) {
    topPriorities.push(`🔄 In Progress: Push "${inProgress[0].title}" across the finish line.`);
  }
  if (pending.length > 0) {
    topPriorities.push(`📋 Plan ahead: Review "${pending[0].title}" before starting your next sprint.`);
  }
  if (topPriorities.length === 0) {
    topPriorities.push('✨ Great job! All current high-priority tasks are completed or organized.');
  }

  return {
    greeting: `Hello, ${username}! Here is your AI Daily Focus Plan.`,
    headline: highPriority.length > 0 ? 'Target High-Impact Deliverables First' : 'Maintain Steady Velocity & Momentum',
    topPriorities,
    quickAdvice: 'Work in 45-minute focused blocks. Tackle urgent tasks before checking emails or alerts.',
    energyLevel: highPriority.length > 0 ? 'High Urgency' : 'Steady Flow'
  };
}

module.exports = {
  breakdownTask,
  parseNaturalLanguageTask,
  generateDailyBriefing
};
