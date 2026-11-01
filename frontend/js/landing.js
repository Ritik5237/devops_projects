// TaskFlow - Clean Task Manager Landing Page Controller

document.addEventListener('DOMContentLoaded', () => {
  initMockupFilters();
});

// Interactive Mockup Task Data (Simple, Real-World Productivity Tasks)
const sampleTasks = [
  {
    id: 1,
    title: 'Finalize Q4 project milestones & deliverables',
    desc: 'Align team goals, establish sprint timelines, and assign core owners for quarterly deliverables.',
    status: 'In Progress',
    priority: 'High',
    due: 'Due tomorrow',
    icon: '🎯'
  },
  {
    id: 2,
    title: 'Prepare presentation for stakeholder review',
    desc: 'Consolidate slide deck with key performance metrics, customer feedback, and delivery status.',
    status: 'Pending',
    priority: 'High',
    due: 'Due in 2 days',
    icon: '📊'
  },
  {
    id: 3,
    title: 'Review user feedback on new mobile UI',
    desc: 'Go through usability survey responses, categorize top requests, and flag UX bottlenecks.',
    status: 'Completed',
    priority: 'Medium',
    due: 'Completed yesterday',
    icon: '✨'
  },
  {
    id: 4,
    title: 'Update API documentation & integration guides',
    desc: 'Add endpoint authentication examples, payload schemas, and error code troubleshooting tips.',
    status: 'In Progress',
    priority: 'Medium',
    due: 'Due in 3 days',
    icon: '📝'
  },
  {
    id: 5,
    title: 'Conduct weekly 1-on-1 team check-ins',
    desc: 'Review weekly blockers, align on sprint priorities, and discuss career progression goals.',
    status: 'Pending',
    priority: 'Low',
    due: 'Due in 4 days',
    icon: '👥'
  },
  {
    id: 6,
    title: 'Publish customer release notes v1.2',
    desc: 'Highlight recent speed improvements, bug fixes, and security patches in the product blog.',
    status: 'Completed',
    priority: 'Low',
    due: 'Completed 2 days ago',
    icon: '🚀'
  }
];

function renderMockTasks(filter = 'All') {
  const container = document.getElementById('mockup-tasks-container');
  if (!container) return;

  const filtered = sampleTasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'High') return task.priority === 'High';
    return task.status === filter;
  });

  container.innerHTML = filtered.map(task => `
    <div class="mock-task-card priority-${task.priority}">
      <div class="mock-task-header">
        <span class="mock-task-icon">${task.icon}</span>
        <div class="mock-task-badges">
          <span class="badge priority-${task.priority}">${task.priority}</span>
          <span class="badge status-${task.status.replace(/\s+/g, '')}">${task.status}</span>
        </div>
      </div>
      <h4 class="mock-task-title ${task.status === 'Completed' ? 'completed' : ''}">${task.title}</h4>
      <p class="mock-task-desc">${task.desc}</p>
      <div class="mock-task-footer">
        <span class="mock-task-due">📅 ${task.due}</span>
        <span class="mock-task-tag">${task.status}</span>
      </div>
    </div>
  `).join('');
}

function initMockupFilters() {
  renderMockTasks('All');
  const filterChips = document.querySelectorAll('.mock-filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');
      renderMockTasks(filter);
    });
  });
}


