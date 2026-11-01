// TaskFlow - Dashboard UI Logic

let currentEditingTaskId = null;
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authenticated
  if (!API.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  // Initialize UI
  setupUserHeader();
  loadDashboardData();
  setupEventListeners();
});

// Display logged in user info
function setupUserHeader() {
  const user = API.getUser();
  const userNameEl = document.getElementById('user-name-display');
  const welcomeUserEl = document.getElementById('welcome-user-name');
  const initialsEl = document.getElementById('user-avatar-initials');
  const dateEl = document.getElementById('current-date-display');

  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  if (user) {
    if (userNameEl) userNameEl.textContent = user.name;
    if (welcomeUserEl) welcomeUserEl.textContent = user.name;
    if (initialsEl) {
      const parts = (user.name || 'User').trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      initialsEl.textContent = initials;
    }
  }
}

// Load stats and tasks
async function loadDashboardData() {
  await Promise.all([loadStats(), loadTasks()]);
}

// Fetch and render stats cards
async function loadStats() {
  try {
    const res = await API.getStats();
    if (res.success && res.stats) {
      const total = res.stats.total || 0;
      const pending = res.stats.pending || 0;
      const inProgress = res.stats.inProgress || 0;
      const completed = res.stats.completed || 0;

      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-pending').textContent = pending;
      document.getElementById('stat-in-progress').textContent = inProgress;
      document.getElementById('stat-completed').textContent = completed;

      const completionRateEl = document.getElementById('completion-rate-display');
      if (completionRateEl) {
        if (total === 0) {
          completionRateEl.textContent = '0% Done';
        } else {
          const pct = Math.round((completed / total) * 100);
          completionRateEl.textContent = `${pct}% Done (${completed}/${total})`;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Fetch and render tasks with current filters
async function loadTasks() {
  const tasksGrid = document.getElementById('tasks-grid');
  const statusFilter = document.getElementById('filter-status').value;
  const priorityFilter = document.getElementById('filter-priority').value;
  const searchInput = document.getElementById('search-input').value;
  const sortBy = document.getElementById('filter-sort').value;

  try {
    tasksGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏳</div>
        <p>Loading your tasks...</p>
      </div>
    `;

    const res = await API.getTasks({
      status: statusFilter,
      priority: priorityFilter,
      search: searchInput,
      sortBy: sortBy
    });

    if (!res.data || res.data.length === 0) {
      tasksGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Get started by creating a new task or adjust your search filters.</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="openTaskModal()">+ Add Your First Task</button>
        </div>
      `;
      return;
    }

    tasksGrid.innerHTML = res.data.map(createTaskCardHtml).join('');
  } catch (error) {
    tasksGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Failed to load tasks</h3>
        <p>${error.message}</p>
        <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="loadTasks()">Try Again</button>
      </div>
    `;
  }
}

// Generate HTML for a single task card
function createTaskCardHtml(task) {
  const isCompleted = task.status === 'Completed';
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date';

  return `
    <div class="glass-panel task-card priority-${task.priority}" id="task-${task._id}">
      <div>
        <div class="task-header">
          <h4 class="task-title ${isCompleted ? 'completed' : ''}">${escapeHtml(task.title)}</h4>
        </div>

        <div class="task-badges">
          <span class="badge priority-${task.priority}">${task.priority}</span>
          <span class="badge status-${task.status.replace(/\s+/g, '')}">${task.status}</span>
        </div>

        <p class="task-desc">${escapeHtml(task.description || 'No description provided.')}</p>
      </div>

      <div class="task-footer">
        <span>📅 ${dueDateStr}</span>

        <div class="task-actions">
          <button class="icon-btn" title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}" onclick="toggleTaskStatus('${task._id}', '${task.status}')">
            ${isCompleted ? '↩️' : '✓'}
          </button>
          <button class="icon-btn" title="Edit Task" onclick="openEditTaskModal('${task._id}')">
            ✏️
          </button>
          <button class="icon-btn delete" title="Delete Task" onclick="deleteTask('${task._id}')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;
}

// Event Listeners for Filters, Search, Modal
function setupEventListeners() {
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      API.logout();
    });
  }

  // Filter changes
  document.getElementById('filter-status').addEventListener('change', () => loadTasks());
  document.getElementById('filter-priority').addEventListener('change', () => loadTasks());
  document.getElementById('filter-sort').addEventListener('change', () => loadTasks());

  // Search debounce
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadTasks();
    }, 350);
  });

  // Modal form submit
  const taskForm = document.getElementById('task-form');
  taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Close modal when clicking outside content
  const modalOverlay = document.getElementById('task-modal');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeTaskModal();
    }
  });

  const briefingModal = document.getElementById('briefing-modal');
  if (briefingModal) {
    briefingModal.addEventListener('click', (e) => {
      if (e.target === briefingModal) {
        closeDailyBriefingModal();
      }
    });
  }

  // Allow enter key on AI quick-add input
  const aiInput = document.getElementById('ai-quick-input');
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAiQuickAdd();
      }
    });
  }
}

// Open modal for Create
function openTaskModal() {
  currentEditingTaskId = null;
  document.getElementById('modal-title').textContent = 'Create New Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-status').value = 'Pending';
  document.getElementById('task-priority').value = 'Medium';
  resetAiBreakdownUI();
  document.getElementById('task-modal').classList.add('active');
}

// Open modal for Edit
async function openEditTaskModal(taskId) {
  try {
    const res = await API.getTask(taskId);
    if (!res.data) return;

    const task = res.data;
    currentEditingTaskId = task._id;

    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-desc-input').value = task.description || '';
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-priority').value = task.priority;
    
    if (task.dueDate) {
      document.getElementById('task-due-date').value = task.dueDate.split('T')[0];
    } else {
      document.getElementById('task-due-date').value = '';
    }

    resetAiBreakdownUI();
    document.getElementById('task-modal').classList.add('active');
  } catch (error) {
    showToast('Failed to fetch task details: ' + error.message, 'error');
  }
}

// Close Modal
function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('active');
  resetAiBreakdownUI();
  currentEditingTaskId = null;
}

// Handle Form Submission (Create or Update)
async function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('task-title-input').value.trim();
  const description = document.getElementById('task-desc-input').value.trim();
  const status = document.getElementById('task-status').value;
  const priority = document.getElementById('task-priority').value;
  const dueDate = document.getElementById('task-due-date').value || null;

  if (!title) {
    showToast('Please provide a task title', 'error');
    return;
  }

  const payload = { title, description, status, priority, dueDate };

  try {
    if (currentEditingTaskId) {
      await API.updateTask(currentEditingTaskId, payload);
      showToast('Task updated successfully!', 'success');
    } else {
      await API.createTask(payload);
      showToast('Task created successfully!', 'success');
    }

    closeTaskModal();
    await loadDashboardData();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Quick toggle status
async function toggleTaskStatus(taskId, currentStatus) {
  const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
  try {
    await API.updateTask(taskId, { status: newStatus });
    showToast(`Task marked as ${newStatus}`, 'success');
    await loadDashboardData();
  } catch (error) {
    showToast('Failed to update status: ' + error.message, 'error');
  }
}

// Delete task with confirmation
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
    return;
  }

  try {
    await API.deleteTask(taskId);
    showToast('Task deleted successfully', 'success');
    await loadDashboardData();
  } catch (error) {
    showToast('Failed to delete task: ' + error.message, 'error');
  }
}

// Helper utility to sanitize html text
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========================================================
// ⚡ Gemini AI Dashboard Handlers
// ========================================================

let currentAiBreakdown = null;

// Fill pre-made prompts into the AI quick input
function fillAiPrompt(promptText) {
  const input = document.getElementById('ai-quick-input');
  if (input) {
    input.value = promptText;
    input.focus();
  }
}

// 1. Natural Language Task Creation via Gemini
async function handleAiQuickAdd() {
  const input = document.getElementById('ai-quick-input');
  const difficultySelect = document.getElementById('ai-quick-difficulty');
  const dateInput = document.getElementById('ai-quick-date');
  const spinner = document.getElementById('ai-quick-spinner');
  const btn = document.getElementById('ai-quick-submit-btn');
  const btnText = document.getElementById('ai-quick-btn-text');

  const text = input ? input.value.trim() : '';
  if (!text) {
    showToast('Please type a task note or click an example prompt below', 'info');
    if (input) input.focus();
    return;
  }

  const userDifficulty = difficultySelect ? difficultySelect.value : 'Auto';
  const userDueDate = dateInput && dateInput.value ? dateInput.value : null;

  try {
    if (spinner) spinner.style.display = 'inline-block';
    if (btnText) btnText.textContent = 'Generating...';
    if (btn) btn.disabled = true;

    // Call Gemini parsing endpoint with text, difficulty, and target date
    const res = await API.aiParseTask({
      text,
      difficulty: userDifficulty,
      dueDate: userDueDate
    });

    if (!res.data) throw new Error('AI was unable to generate task.');

    const parsedTask = res.data;

    // Automatically create the parsed task with the rich description and smart date
    await API.createTask({
      title: parsedTask.title || text,
      description: parsedTask.description,
      priority: parsedTask.priority || (userDifficulty !== 'Auto' ? userDifficulty : 'Medium'),
      status: parsedTask.status || 'Pending',
      dueDate: parsedTask.dueDate || userDueDate || null
    });

    input.value = '';
    if (dateInput) dateInput.value = '';
    if (difficultySelect) difficultySelect.value = 'Auto';

    showToast(`✨ Smart-Add created: "${parsedTask.title}" (${parsedTask.priority} • Due ${parsedTask.dueDate || 'Soon'})`, 'success');
    await loadDashboardData();
  } catch (error) {
    showToast('AI Smart Add error: ' + error.message, 'error');
  } finally {
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = '✨ Smart Add';
    if (btn) btn.disabled = false;
  }
}

// 2. AI Task Breakdown & Subtasks inside Modal
async function triggerAiBreakdown() {
  const titleInput = document.getElementById('task-title-input');
  const descInput = document.getElementById('task-desc-input');
  const prioritySelect = document.getElementById('task-priority');
  const spinner = document.getElementById('ai-breakdown-spinner');
  const btn = document.getElementById('ai-breakdown-btn');
  const breakdownBox = document.getElementById('ai-breakdown-box');
  const breakdownContent = document.getElementById('ai-breakdown-content');

  const title = titleInput.value.trim();
  if (!title) {
    showToast('Please enter a Task Title first so Gemini can analyze it', 'info');
    titleInput.focus();
    return;
  }

  try {
    if (spinner) spinner.style.display = 'inline-block';
    if (btn) btn.disabled = true;

    const res = await API.aiBreakdown({
      title: title,
      description: descInput.value.trim(),
      priority: prioritySelect.value
    });

    if (!res.data) throw new Error('Could not generate breakdown');
    currentAiBreakdown = res.data;

    // Optionally update priority if suggested
    if (res.data.suggestedPriority) {
      prioritySelect.value = res.data.suggestedPriority;
    }

    // Render breakdown content
    const subtasksHtml = (res.data.subtasks || []).map(st => `
      <div class="ai-subtask-item">
        <span style="color: #a78bfa;">✦</span>
        <span>${escapeHtml(st)}</span>
      </div>
    `).join('');

    breakdownContent.innerHTML = `
      <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.6rem;">
        ${escapeHtml(res.data.summary || '')}
      </div>
      <div style="margin-bottom: 0.6rem;">
        ${subtasksHtml}
      </div>
      <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: #67e8f9; flex-wrap: wrap;">
        ${res.data.estimatedTime ? `<span>⏱️ Est. Time: ${escapeHtml(res.data.estimatedTime)}</span>` : ''}
        ${res.data.proTip ? `<span>💡 Pro Tip: ${escapeHtml(res.data.proTip)}</span>` : ''}
      </div>
    `;

    breakdownBox.style.display = 'block';
    showToast('✨ Gemini breakdown generated!', 'success');
  } catch (error) {
    showToast('Breakdown error: ' + error.message, 'error');
  } finally {
    if (spinner) spinner.style.display = 'none';
    if (btn) btn.disabled = false;
  }
}

// Apply suggested subtasks directly to Description textarea
function applyAiBreakdown() {
  if (!currentAiBreakdown || !currentAiBreakdown.subtasks) return;

  const descInput = document.getElementById('task-desc-input');
  let currentDesc = descInput.value.trim();

  const formattedSubtasks = currentAiBreakdown.subtasks
    .map(st => `- [ ] ${st}`)
    .join('\n');

  const addition = `\n\n### Checklist & Subtasks (Generated by Gemini):\n${formattedSubtasks}\n\n*Acceptance Criteria:* ${currentAiBreakdown.acceptanceCriteria || 'All checklist items verified.'}`;

  descInput.value = currentDesc ? `${currentDesc}\n${addition}` : addition.trim();
  showToast('Subtasks applied to description!', 'success');
}

// Reset breakdown UI state
function resetAiBreakdownUI() {
  currentAiBreakdown = null;
  const breakdownBox = document.getElementById('ai-breakdown-box');
  const breakdownContent = document.getElementById('ai-breakdown-content');
  if (breakdownBox) breakdownBox.style.display = 'none';
  if (breakdownContent) breakdownContent.innerHTML = '';
}

// 3. AI Morning Standup Briefing Modal
async function openDailyBriefingModal() {
  const modal = document.getElementById('briefing-modal');
  const loading = document.getElementById('briefing-loading');
  const body = document.getElementById('briefing-body');

  modal.classList.add('active');
  loading.style.display = 'block';
  body.style.display = 'none';

  try {
    const res = await API.aiGetBriefing();
    if (!res.data) throw new Error('Unable to generate daily briefing');

    const briefing = res.data;

    document.getElementById('briefing-greeting').textContent = briefing.greeting || 'Hello Developer!';
    document.getElementById('briefing-headline').textContent = briefing.headline || 'Sprint Focus Overview';

    const prioritiesList = document.getElementById('briefing-priorities');
    prioritiesList.innerHTML = (briefing.topPriorities || [])
      .map(p => `<li>${escapeHtml(p)}</li>`)
      .join('');

    document.getElementById('briefing-tip').textContent = briefing.quickAdvice || 'Stay focused on high-priority deliverables.';
    document.getElementById('briefing-energy').textContent = briefing.energyLevel || 'High Focus';

    loading.style.display = 'none';
    body.style.display = 'block';
  } catch (error) {
    loading.innerHTML = `
      <p style="color: #f87171;">⚠️ Failed to load briefing: ${escapeHtml(error.message)}</p>
      <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="openDailyBriefingModal()">Retry</button>
    `;
  }
}

function closeDailyBriefingModal() {
  const modal = document.getElementById('briefing-modal');
  if (modal) modal.classList.remove('active');
}

// ========================================================
// 👤 Edit Profile Modal Handlers
// ========================================================

function openEditProfileModal() {
  const modal = document.getElementById('profile-modal');
  const user = API.getUser();
  if (!modal || !user) return;

  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  const previewName = document.getElementById('profile-preview-name');
  const previewEmail = document.getElementById('profile-preview-email');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const currentPass = document.getElementById('profile-current-password');
  const newPass = document.getElementById('profile-new-password');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (previewName) previewName.textContent = user.name || 'User';
  if (previewEmail) previewEmail.textContent = user.email || '';
  if (currentPass) currentPass.value = '';
  if (newPass) newPass.value = '';

  if (avatarPreview) {
    const parts = (user.name || 'User').trim().split(/\s+/);
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    avatarPreview.textContent = initials;
  }

  modal.classList.add('active');
}

function closeEditProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.remove('active');
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  const currentPassInput = document.getElementById('profile-current-password');
  const newPassInput = document.getElementById('profile-new-password');
  const btn = document.getElementById('save-profile-btn');
  const spinner = document.getElementById('save-profile-spinner');
  const text = document.getElementById('save-profile-text');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const currentPassword = currentPassInput ? currentPassInput.value : '';
  const newPassword = newPassInput ? newPassInput.value : '';

  if (!name || !email) {
    showToast('Name and email cannot be empty', 'error');
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showToast('New password must be at least 6 characters long', 'error');
    return;
  }

  try {
    if (spinner) spinner.style.display = 'inline-block';
    if (text) text.textContent = 'Saving...';
    if (btn) btn.disabled = true;

    const payload = { name, email };
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    const res = await API.updateProfile(payload);
    showToast('Profile updated successfully!', 'success');
    setupUserHeader();
    closeEditProfileModal();
  } catch (error) {
    showToast('Failed to update profile: ' + error.message, 'error');
  } finally {
    if (spinner) spinner.style.display = 'none';
    if (text) text.textContent = 'Save Changes';
    if (btn) btn.disabled = false;
  }
}


