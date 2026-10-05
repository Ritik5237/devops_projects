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
  if (userNameEl && user) {
    userNameEl.textContent = user.name;
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
      document.getElementById('stat-total').textContent = res.stats.total || 0;
      document.getElementById('stat-pending').textContent = res.stats.pending || 0;
      document.getElementById('stat-in-progress').textContent = res.stats.inProgress || 0;
      document.getElementById('stat-completed').textContent = res.stats.completed || 0;
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
}

// Open modal for Create
function openTaskModal() {
  currentEditingTaskId = null;
  document.getElementById('modal-title').textContent = 'Create New Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-status').value = 'Pending';
  document.getElementById('task-priority').value = 'Medium';
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

    document.getElementById('task-modal').classList.add('active');
  } catch (error) {
    showToast('Failed to fetch task details: ' + error.message, 'error');
  }
}

// Close Modal
function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('active');
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
