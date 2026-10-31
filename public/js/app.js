/**
 * TaskMaster - Project Workflow & Task Dependency Controller
 * Manages projects, multi-stage workflow statuses, and automated dependency resolution
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    projects: [],
    activeProjectId: 'all', // 'all' or numeric ID
    tasks: [],
    categories: [],
    stats: { total: 0, completed: 0, in_progress: 0, blocked: 0, todo: 0, completionRate: 0 },
    filters: {
      status: 'all',      // 'all' | 'todo' | 'in_progress' | 'blocked' | 'completed'
      category_id: 'all',
      priority: 'all',
      search: '',
      sort: 'created_desc'
    },
    isLoading: false
  };

  // DOM Elements
  const el = {
    // Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    moonIcon: document.getElementById('moonIcon'),
    sunIcon: document.getElementById('sunIcon'),

    // Top Stats
    globalSummaryText: document.getElementById('globalSummaryText'),

    // Projects Panel
    projectSelectorStrip: document.getElementById('projectSelectorStrip'),
    allProjectsCount: document.getElementById('allProjectsCount'),
    activeProjectTitle: document.getElementById('activeProjectTitle'),
    activeProjectDesc: document.getElementById('activeProjectDesc'),
    activeProjectPct: document.getElementById('activeProjectPct'),
    deleteActiveProjectBtn: document.getElementById('deleteActiveProjectBtn'),

    // Workflow Progress Bar & Metrics
    progCompleted: document.getElementById('progCompleted'),
    progInProgress: document.getElementById('progInProgress'),
    progBlocked: document.getElementById('progBlocked'),
    progTodo: document.getElementById('progTodo'),
    metricTodo: document.getElementById('metricTodo'),
    metricInProgress: document.getElementById('metricInProgress'),
    metricBlocked: document.getElementById('metricBlocked'),
    metricCompleted: document.getElementById('metricCompleted'),
    metricTotal: document.getElementById('metricTotal'),

    // Status Filter Tabs
    statusButtons: document.querySelectorAll('.status-filter-group .status-btn'),
    countAll: document.getElementById('countAll'),
    countTodo: document.getElementById('countTodo'),
    countInProgress: document.getElementById('countInProgress'),
    countBlocked: document.getElementById('countBlocked'),
    countCompleted: document.getElementById('countCompleted'),

    // Filters & Search
    searchInput: document.getElementById('searchInput'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    priorityFilterSelect: document.getElementById('priorityFilterSelect'),
    sortSelect: document.getElementById('sortSelect'),

    // Task List & States
    taskList: document.getElementById('taskList'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyHeading: document.getElementById('emptyHeading'),
    emptySub: document.getElementById('emptySub'),
    emptyActionBtn: document.getElementById('emptyActionBtn'),

    // Modals
    taskModal: document.getElementById('taskModal'),
    openTaskModalBtn: document.getElementById('openTaskModalBtn'),
    closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
    cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
    taskForm: document.getElementById('taskForm'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskFormMode: document.getElementById('taskFormMode'),
    editingTaskId: document.getElementById('editingTaskId'),
    modalTaskTitle: document.getElementById('modalTaskTitle'),
    modalTaskDesc: document.getElementById('modalTaskDesc'),
    modalTaskProject: document.getElementById('modalTaskProject'),
    modalTaskStatus: document.getElementById('modalTaskStatus'),
    modalTaskPriority: document.getElementById('modalTaskPriority'),
    modalTaskCategory: document.getElementById('modalTaskCategory'),
    modalTaskDueDate: document.getElementById('modalTaskDueDate'),
    dependencyCheckboxList: document.getElementById('dependencyCheckboxList'),

    projectModal: document.getElementById('projectModal'),
    openProjectModalBtn: document.getElementById('openProjectModalBtn'),
    closeProjectModalBtn: document.getElementById('closeProjectModalBtn'),
    cancelProjectModalBtn: document.getElementById('cancelProjectModalBtn'),
    projectForm: document.getElementById('projectForm'),
    newProjectName: document.getElementById('newProjectName'),
    newProjectDesc: document.getElementById('newProjectDesc'),
    projectColorPicker: document.getElementById('projectColorPicker'),
    selectedProjectColor: document.getElementById('selectedProjectColor'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // =========================================================================
  // Initialize App
  // =========================================================================
  initTheme();
  setupEventListeners();
  loadAllData();

  function initTheme() {
    const saved = localStorage.getItem('taskmaster_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'dark') {
      el.moonIcon.classList.remove('hidden');
      el.sunIcon.classList.add('hidden');
    } else {
      el.moonIcon.classList.add('hidden');
      el.sunIcon.classList.remove('hidden');
    }
  }

  function toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('taskmaster_theme', next);
    initTheme();
  }

  // =========================================================================
  // Data Loading & Syncing
  // =========================================================================
  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        refreshProjects(),
        refreshCategories(),
        refreshGlobalStats()
      ]);
      await loadTasks();
    } catch (err) {
      showToast('Error synchronizing workspace data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function refreshProjects() {
    try {
      const res = await API.getProjects();
      if (res.success) {
        state.projects = res.data;
        renderProjectTabs();
        populateModalProjectOptions();
        updateActiveProjectBanner();
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  async function refreshCategories() {
    try {
      const res = await API.getCategories();
      if (res.success) {
        state.categories = res.data;
        populateCategorySelects();
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function refreshGlobalStats() {
    try {
      const res = await API.getStats();
      if (res.success) {
        state.stats = res.data;
        renderGlobalStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function loadTasks() {
    try {
      const queryParams = {
        ...state.filters,
        project_id: state.activeProjectId
      };

      const res = await API.getTasks(queryParams);
      if (res.success) {
        state.tasks = res.data;
        renderTasks(res.data);
        updateActiveProjectBanner();
      }
    } catch (err) {
      showToast('Failed to load tasks', 'error');
    }
  }

  // =========================================================================
  // Rendering Views
  // =========================================================================
  function renderGlobalStats(stats) {
    el.globalSummaryText.textContent = `${stats.completed}/${stats.total} delivered (${stats.completionRate}%) • ${stats.blocked} blocked`;
  }

  function renderProjectTabs() {
    const strip = el.projectSelectorStrip;
    const allTab = strip.querySelector('[data-project="all"]');
    strip.innerHTML = '';
    strip.appendChild(allTab);

    let totalWorkspaceTasks = 0;

    state.projects.forEach(p => {
      totalWorkspaceTasks += p.total_tasks || 0;
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `project-tab ${state.activeProjectId == p.id ? 'active' : ''}`;
      tab.dataset.project = p.id;
      tab.innerHTML = `
        <span class="project-color-dot" style="background-color: ${escapeHtml(p.color)};"></span>
        <span>${escapeHtml(p.name)}</span>
        <span class="tab-count">${p.total_tasks || 0}</span>
      `;
      strip.appendChild(tab);
    });

    el.allProjectsCount.textContent = totalWorkspaceTasks;
  }

  function updateActiveProjectBanner() {
    let currentTasks = [];
    let title = 'All Projects Overview';
    let desc = 'Consolidated view across all workspace projects and automated dependency chains.';

    if (state.activeProjectId === 'all') {
      currentTasks = state.tasks;
      el.deleteActiveProjectBtn.classList.add('hidden');
    } else {
      const proj = state.projects.find(p => p.id == state.activeProjectId);
      if (proj) {
        title = proj.name;
        desc = proj.description || 'Active project workspace.';
        el.deleteActiveProjectBtn.classList.remove('hidden');
      }
      currentTasks = state.tasks;
    }

    el.activeProjectTitle.textContent = title;
    el.activeProjectDesc.textContent = desc;

    // Calculate metrics for current scope
    let total = currentTasks.length;
    let todo = currentTasks.filter(t => t.status === 'todo').length;
    let in_progress = currentTasks.filter(t => t.status === 'in_progress').length;
    let blocked = currentTasks.filter(t => t.status === 'blocked').length;
    let completed = currentTasks.filter(t => t.status === 'completed').length;
    let pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    el.metricTotal.textContent = total;
    el.metricTodo.textContent = todo;
    el.metricInProgress.textContent = in_progress;
    el.metricBlocked.textContent = blocked;
    el.metricCompleted.textContent = completed;
    el.activeProjectPct.textContent = `${pct}% Completed`;

    // Update segmented progress bar
    if (total > 0) {
      el.progCompleted.style.width = `${(completed / total) * 100}%`;
      el.progInProgress.style.width = `${(in_progress / total) * 100}%`;
      el.progBlocked.style.width = `${(blocked / total) * 100}%`;
      el.progTodo.style.width = `${(todo / total) * 100}%`;
    } else {
      el.progCompleted.style.width = '0%';
      el.progInProgress.style.width = '0%';
      el.progBlocked.style.width = '0%';
      el.progTodo.style.width = '0%';
    }

    // Update status buttons counts
    el.countAll.textContent = total;
    el.countTodo.textContent = todo;
    el.countInProgress.textContent = in_progress;
    el.countBlocked.textContent = blocked;
    el.countCompleted.textContent = completed;
  }

  function renderTasks(tasks) {
    const list = el.taskList;
    list.innerHTML = '';

    if (tasks.length === 0) {
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');

    tasks.forEach(task => {
      const row = document.createElement('div');
      row.className = `task-row ${task.status === 'blocked' ? 'is-blocked' : ''} ${task.status === 'completed' ? 'is-completed' : ''}`;
      row.dataset.id = task.id;

      // Status pill display name
      const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        blocked: 'Blocked',
        completed: 'Completed'
      };

      // Dependency Badges
      let dependencyBadges = '';
      if (task.dependencies && task.dependencies.length > 0) {
        if (task.has_unmet_dependencies) {
          const unmetList = task.unmet_prerequisites.map(p => `#${p.id}`).join(', ');
          const unmetTitles = escapeHtml(task.unmet_prerequisites.map(p => p.title).join(', '));
          dependencyBadges += `
            <span class="meta-chip chip-blocked-by" title="Blocked by uncompleted prerequisite: ${unmetTitles}">
              🔒 Blocked by ${unmetList}
            </span>
          `;
        } else {
          dependencyBadges += `
            <span class="meta-chip chip-prereqs-met" title="All ${task.dependencies.length} prerequisite(s) completed">
              ✦ Prereqs met (${task.dependencies.length}/${task.dependencies.length})
            </span>
          `;
        }
      }

      if (task.dependents && task.dependents.length > 0) {
        const depList = task.dependents.map(d => `#${d.id}`).join(', ');
        const depTitles = escapeHtml(task.dependents.map(d => d.title).join(', '));
        dependencyBadges += `
          <span class="meta-chip chip-blocks-other" title="Blocks tasks: ${depTitles}">
            ⛓️ Blocks ${depList}
          </span>
        `;
      }

      // Project tag (shown when viewing all projects)
      let projectTag = '';
      if (state.activeProjectId === 'all' && task.project_name) {
        projectTag = `
          <span class="meta-chip" style="border-left: 2px solid ${escapeHtml(task.project_color)}; font-weight: 600;">
            ${escapeHtml(task.project_name)}
          </span>
        `;
      }

      // Category tag
      let categoryTag = '';
      if (task.category_name) {
        categoryTag = `
          <span class="meta-chip" style="color: ${escapeHtml(task.category_color)};">
            ${escapeHtml(task.category_name)}
          </span>
        `;
      }

      // Priority tag
      const priorityClass = `chip-priority-${task.priority.toLowerCase()}`;
      const priorityTag = `
        <span class="meta-chip ${priorityClass}">
          ${escapeHtml(task.priority)}
        </span>
      `;

      // Due Date tag
      let dueDateTag = '';
      if (task.due_date) {
        const { label, isOverdue, isToday } = formatDueDate(task.due_date);
        let dueClass = '';
        if (isOverdue && task.status !== 'completed') dueClass = 'overdue';
        else if (isToday && task.status !== 'completed') dueClass = 'today';

        dueDateTag = `
          <span class="meta-chip chip-due ${dueClass}">
            ${escapeHtml(label)}
          </span>
        `;
      }

      row.innerHTML = `
        <!-- Quick Status Switcher Button -->
        <div class="task-status-control">
          <button 
            type="button" 
            class="status-badge-btn status-${task.status}" 
            data-action="cycle-status" 
            title="Click to advance status (To Do → In Progress → Completed)"
          >
            <span class="status-indicator-dot dot-${task.status}"></span>
            <span>${statusLabels[task.status] || task.status}</span>
          </button>
        </div>

        <div class="task-body">
          <div class="task-headline-row">
            <span class="task-id-tag">#${task.id}</span>
            <span class="task-name">${escapeHtml(task.title)}</span>
          </div>

          ${task.description ? `<p class="task-notes">${escapeHtml(task.description)}</p>` : ''}

          <div class="task-pill-rack">
            ${dependencyBadges}
            ${projectTag}
            ${categoryTag}
            ${priorityTag}
            ${dueDateTag}
          </div>
        </div>

        <div class="task-row-actions">
          <button type="button" class="row-action-btn" data-action="edit" title="Edit task and dependencies">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="row-action-btn delete" data-action="delete" title="Delete task">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            </svg>
          </button>
        </div>
      `;

      list.appendChild(row);
    });
  }

  function populateModalProjectOptions() {
    const sel = el.modalTaskProject;
    sel.innerHTML = '';
    state.projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });

    if (state.activeProjectId !== 'all') {
      sel.value = state.activeProjectId;
    }
  }

  function populateCategorySelects() {
    const renderOpts = (selectEl, defaultLabel = 'No Category') => {
      const curr = selectEl.value;
      selectEl.innerHTML = `<option value="">${defaultLabel}</option>`;
      state.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        selectEl.appendChild(opt);
      });
      selectEl.value = curr || '';
    };

    renderOpts(el.modalTaskCategory);
    renderOpts(el.categoryFilterSelect, 'All Categories');
  }

  function updateDependencyOptionsInModal(selectedProjectId, currentTaskId = null, activePrereqIds = []) {
    const container = el.dependencyCheckboxList;
    container.innerHTML = '';

    // Filter tasks that belong to the chosen project and are not the current task itself
    const candidateTasks = state.tasks.filter(t => t.project_id == selectedProjectId && t.id != currentTaskId);

    if (candidateTasks.length === 0) {
      container.innerHTML = '<span class="empty-deps-text">No other tasks exist in this project to set as prerequisites.</span>';
      return;
    }

    candidateTasks.forEach(t => {
      const label = document.createElement('label');
      label.className = 'dep-checkbox-item';
      const isChecked = activePrereqIds.includes(t.id);

      label.innerHTML = `
        <input type="checkbox" name="dep_prereq" value="${t.id}" ${isChecked ? 'checked' : ''}>
        <span><strong>#${t.id}</strong> ${escapeHtml(t.title)} (${t.status})</span>
      `;
      container.appendChild(label);
    });
  }

  function setLoading(loading) {
    state.isLoading = loading;
    if (loading) {
      el.loadingState.classList.remove('hidden');
      el.emptyState.classList.add('hidden');
    } else {
      el.loadingState.classList.add('hidden');
    }
  }

  // =========================================================================
  // Event Listeners & Interaction
  // =========================================================================
  function setupEventListeners() {
    // Theme
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Project tabs delegation
    el.projectSelectorStrip.addEventListener('click', (e) => {
      const tab = e.target.closest('.project-tab');
      if (!tab) return;
      el.projectSelectorStrip.querySelectorAll('.project-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      state.activeProjectId = tab.dataset.project;
      loadTasks();
    });

    // Delete active project
    el.deleteActiveProjectBtn.addEventListener('click', handleDeleteActiveProject);

    // Status filter buttons
    el.statusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.statusButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filters.status = btn.dataset.status;
        loadTasks();
      });
    });

    // Category filter
    el.categoryFilterSelect.addEventListener('change', (e) => {
      state.filters.category_id = e.target.value;
      loadTasks();
    });

    // Priority filter
    el.priorityFilterSelect.addEventListener('change', (e) => {
      state.filters.priority = e.target.value;
      loadTasks();
    });

    // Sort select
    el.sortSelect.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      loadTasks();
    });

    // Search bar with debounce
    let searchTimeout = null;
    el.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.filters.search = e.target.value.trim();
        loadTasks();
      }, 200);
    });

    // Empty state action
    el.emptyActionBtn.addEventListener('click', () => {
      openTaskModal('create');
    });

    // Task list row actions delegation
    el.taskList.addEventListener('click', handleTaskListAction);

    // Task Modal
    el.openTaskModalBtn.addEventListener('click', () => openTaskModal('create'));
    el.closeTaskModalBtn.addEventListener('click', closeTaskModal);
    el.cancelTaskModalBtn.addEventListener('click', closeTaskModal);
    el.taskForm.addEventListener('submit', handleTaskFormSubmit);

    // Project change in task modal updates available prerequisites
    el.modalTaskProject.addEventListener('change', (e) => {
      const currentTaskId = el.editingTaskId.value ? parseInt(el.editingTaskId.value, 10) : null;
      updateDependencyOptionsInModal(e.target.value, currentTaskId);
    });

    // Project Modal
    el.openProjectModalBtn.addEventListener('click', openProjectModal);
    el.closeProjectModalBtn.addEventListener('click', closeProjectModal);
    el.cancelProjectModalBtn.addEventListener('click', closeProjectModal);
    el.projectForm.addEventListener('submit', handleProjectFormSubmit);

    // Project color picker
    el.projectColorPicker.addEventListener('click', (e) => {
      const dot = e.target.closest('.color-dot-opt');
      if (!dot) return;
      el.projectColorPicker.querySelectorAll('.color-dot-opt').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      el.selectedProjectColor.value = dot.dataset.color;
    });

    // Modal background & ESC key
    [el.taskModal, el.projectModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        el.taskModal.classList.add('hidden');
        el.projectModal.classList.add('hidden');
      }
    });
  }

  // =========================================================================
  // Task Actions (Status Cycling, Dependency Guards, Deletion)
  // =========================================================================
  async function handleTaskListAction(e) {
    const row = e.target.closest('.task-row');
    if (!row) return;

    const taskId = parseInt(row.dataset.id, 10);
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Cycle Status button click (To Do -> In Progress -> Completed -> To Do)
    const cycleBtn = e.target.closest('[data-action="cycle-status"]');
    if (cycleBtn) {
      let nextStatus = 'in_progress';
      if (task.status === 'todo') nextStatus = 'in_progress';
      else if (task.status === 'in_progress') nextStatus = 'completed';
      else if (task.status === 'completed') nextStatus = 'todo';
      else if (task.status === 'blocked') nextStatus = 'in_progress'; // will be guarded if prereqs unmet

      try {
        const res = await API.updateTaskStatus(taskId, nextStatus);
        if (res.success) {
          showToast(`Task #${taskId} is now ${res.data.status}`, 'success');
          await Promise.all([
            loadTasks(),
            refreshProjects(),
            refreshGlobalStats()
          ]);
        }
      } catch (err) {
        if (err.data && err.data.blocked) {
          showToast(err.data.error, 'warning');
        } else {
          showToast(err.message || 'Status transition failed', 'error');
        }
      }
      return;
    }

    // Delete task
    const delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) {
      if (!confirm(`Delete task #${taskId} "${task.title}"?`)) return;

      try {
        const res = await API.deleteTask(taskId);
        if (res.success) {
          showToast(`Task #${taskId} deleted`, 'info');
          await Promise.all([
            loadTasks(),
            refreshProjects(),
            refreshGlobalStats()
          ]);
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete task', 'error');
      }
      return;
    }

    // Edit task
    const editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) {
      openTaskModal('edit', task);
      return;
    }
  }

  // =========================================================================
  // Modal Handlers: Tasks
  // =========================================================================
  function openTaskModal(mode = 'create', task = null) {
    el.taskForm.reset();
    populateModalProjectOptions();
    populateCategorySelects();

    if (mode === 'create') {
      el.taskModalTitle.textContent = 'New Task';
      el.taskFormMode.value = 'create';
      el.editingTaskId.value = '';
      el.modalTaskStatus.value = 'todo';
      el.modalTaskPriority.value = 'Medium';

      const initialProjId = state.activeProjectId !== 'all' ? state.activeProjectId : (state.projects[0] ? state.projects[0].id : '');
      el.modalTaskProject.value = initialProjId;
      updateDependencyOptionsInModal(initialProjId);
    } else if (mode === 'edit' && task) {
      el.taskModalTitle.textContent = `Edit Task #${task.id}`;
      el.taskFormMode.value = 'edit';
      el.editingTaskId.value = task.id;
      el.modalTaskTitle.value = task.title;
      el.modalTaskDesc.value = task.description || '';
      el.modalTaskProject.value = task.project_id;
      el.modalTaskStatus.value = task.status;
      el.modalTaskPriority.value = task.priority;
      el.modalTaskCategory.value = task.category_id || '';
      el.modalTaskDueDate.value = task.due_date || '';

      const activePrereqIds = task.dependencies ? task.dependencies.map(d => d.id) : [];
      updateDependencyOptionsInModal(task.project_id, task.id, activePrereqIds);
    }

    el.taskModal.classList.remove('hidden');
    el.modalTaskTitle.focus();
  }

  function closeTaskModal() {
    el.taskModal.classList.add('hidden');
  }

  async function handleTaskFormSubmit(e) {
    e.preventDefault();

    const mode = el.taskFormMode.value;
    const title = el.modalTaskTitle.value.trim();
    if (!title) return;

    const project_id = parseInt(el.modalTaskProject.value, 10);
    const description = el.modalTaskDesc.value.trim();
    const status = el.modalTaskStatus.value;
    const priority = el.modalTaskPriority.value;
    const category_id = el.modalTaskCategory.value || null;
    const due_date = el.modalTaskDueDate.value || null;

    // Selected prerequisite task IDs
    const checkedDeps = Array.from(el.dependencyCheckboxList.querySelectorAll('input[name="dep_prereq"]:checked'))
      .map(cb => parseInt(cb.value, 10));

    try {
      if (mode === 'create') {
        const res = await API.createTask({
          project_id,
          title,
          description,
          status,
          priority,
          category_id,
          due_date,
          depends_on_ids: checkedDeps
        });

        if (res.success) {
          showToast(`Task created! ${res.data.status === 'blocked' ? '🔒 Marked as Blocked by prerequisites.' : ''}`, 'success');
          closeTaskModal();
          await Promise.all([
            loadTasks(),
            refreshProjects(),
            refreshGlobalStats()
          ]);
        }
      } else {
        const id = parseInt(el.editingTaskId.value, 10);
        const res = await API.updateTask(id, {
          project_id,
          title,
          description,
          status,
          priority,
          category_id,
          due_date,
          depends_on_ids: checkedDeps
        });

        if (res.success) {
          showToast('Task updated successfully', 'success');
          closeTaskModal();
          await Promise.all([
            loadTasks(),
            refreshProjects(),
            refreshGlobalStats()
          ]);
        }
      }
    } catch (err) {
      if (err.data && err.data.blocked) {
        showToast(err.data.error, 'warning');
      } else {
        showToast(err.message || 'Operation failed', 'error');
      }
    }
  }

  // =========================================================================
  // Modal Handlers: Projects
  // =========================================================================
  function openProjectModal() {
    el.projectForm.reset();
    el.projectModal.classList.remove('hidden');
    el.newProjectName.focus();
  }

  function closeProjectModal() {
    el.projectModal.classList.add('hidden');
  }

  async function handleProjectFormSubmit(e) {
    e.preventDefault();
    const name = el.newProjectName.value.trim();
    if (!name) return;

    const description = el.newProjectDesc.value.trim();
    const color = el.selectedProjectColor.value;

    try {
      const res = await API.createProject({ name, description, color });
      if (res.success) {
        showToast(`Project "${name}" created!`, 'success');
        closeProjectModal();
        await refreshProjects();
        // Switch to the newly created project
        state.activeProjectId = res.data.id;
        renderProjectTabs();
        await loadTasks();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    }
  }

  async function handleDeleteActiveProject() {
    if (state.activeProjectId === 'all') return;
    const proj = state.projects.find(p => p.id == state.activeProjectId);
    if (!proj) return;

    if (!confirm(`Are you sure you want to delete project "${proj.name}" and all of its tasks? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await API.deleteProject(state.activeProjectId);
      if (res.success) {
        showToast(res.message, 'info');
        state.activeProjectId = 'all';
        await Promise.all([
          refreshProjects(),
          loadTasks(),
          refreshGlobalStats()
        ]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  }

  // =========================================================================
  // Toast Utilities
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;

    let icon = '';
    if (type === 'success') {
      icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'warning') {
      icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    } else if (type === 'error') {
      icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      icon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${icon}
      <span>${escapeHtml(message)}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.style.transition = 'all 150ms ease';
      setTimeout(() => toast.remove(), 160);
    }, 3800);
  }

  function formatDueDate(dateString) {
    if (!dateString) return { label: '', isOverdue: false, isToday: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dateString.split('-');
    const due = new Date(parts[0], parts[1] - 1, parts[2]);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true, isToday: false };
    } else if (diffDays === 0) {
      return { label: 'Due Today', isOverdue: false, isToday: true };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', isOverdue: false, isToday: false };
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { label: `${monthNames[due.getMonth()]} ${due.getDate()}`, isOverdue: false, isToday: false };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, m => map[m]);
  }
});
