const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tasks.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT NOT NULL DEFAULT '#4f46e5',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'blocked', 'completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('High', 'Medium', 'Low')),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    due_date TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS task_dependencies (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (task_id, depends_on_task_id),
    CHECK(task_id != depends_on_task_id)
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
  CREATE INDEX IF NOT EXISTS idx_deps_task ON task_dependencies(task_id);
  CREATE INDEX IF NOT EXISTS idx_deps_prereq ON task_dependencies(depends_on_task_id);
`);

// Helper function: Recalculate and update task blocked status based on prerequisites
function syncTaskBlockedStatus(taskId) {
  // Check if this task has any incomplete prerequisites
  const incompletePrereqs = db.prepare(`
    SELECT t.id, t.title, t.status
    FROM task_dependencies td
    JOIN tasks t ON td.depends_on_task_id = t.id
    WHERE td.task_id = ? AND t.status != 'completed'
  `).all(taskId);

  const currentTask = db.prepare('SELECT id, status FROM tasks WHERE id = ?').get(taskId);
  if (!currentTask) return;

  if (incompletePrereqs.length > 0) {
    // Has unmet prerequisites -> Must be marked as blocked
    if (currentTask.status !== 'blocked') {
      db.prepare("UPDATE tasks SET status = 'blocked', updated_at = datetime('now') WHERE id = ?").run(taskId);
    }
  } else {
    // All prerequisites completed (or no dependencies)
    // If it was blocked, automatically transition to 'todo'
    if (currentTask.status === 'blocked') {
      db.prepare("UPDATE tasks SET status = 'todo', updated_at = datetime('now') WHERE id = ?").run(taskId);
    }
  }
}

// Helper: When a task changes status, sync all dependent tasks that depend on it
function syncDependentTasks(changedTaskId) {
  const dependents = db.prepare(`
    SELECT task_id FROM task_dependencies WHERE depends_on_task_id = ?
  `).all(changedTaskId);

  for (const dep of dependents) {
    syncTaskBlockedStatus(dep.task_id);
  }
}

// Seed initial projects, categories, and tasks with realistic dependencies
const projectCount = db.prepare('SELECT COUNT(*) AS count FROM projects').get().count;
if (projectCount === 0) {
  // 1. Projects
  const insProject = db.prepare('INSERT INTO projects (name, description, color) VALUES (?, ?, ?)');
  const p1 = insProject.run('Core Infrastructure & APIs', 'Backend microservices, database clusters, and secure gateway deployment', '#2563eb');
  const p2 = insProject.run('Web App Client Redesign', 'Design system implementation, high-performance UI components, and client portals', '#059669');

  const p1Id = p1.lastInsertRowid;
  const p2Id = p2.lastInsertRowid;

  // 2. Categories
  const insCategory = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
  const cBackend = insCategory.run('Backend', '#3b82f6').lastInsertRowid;
  const cDevOps = insCategory.run('DevOps', '#6366f1').lastInsertRowid;
  const cSecurity = insCategory.run('Security', '#e11d48').lastInsertRowid;
  const cFrontend = insCategory.run('Frontend', '#10b981').lastInsertRowid;
  const cDesign = insCategory.run('Design', '#8b5cf6').lastInsertRowid;

  // 3. Tasks for Project 1
  const insTask = db.prepare(`
    INSERT INTO tasks (project_id, title, description, status, priority, category_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const t1 = insTask.run(p1Id, 'Provision Cloud Database Instance', 'Deploy resilient PostgreSQL/SQLite cluster with automated snapshots', 'completed', 'High', cDevOps, today).lastInsertRowid;
  const t2 = insTask.run(p1Id, 'Run Database Schema Migrations', 'Apply versioned DDL migrations for user, team, and permission models', 'in_progress', 'High', cBackend, tomorrow).lastInsertRowid;
  const t3 = insTask.run(p1Id, 'Deploy Authentication & JWT Service', 'OAuth2 token issuance, session refresh, and role verification endpoints', 'blocked', 'High', cBackend, nextWeek).lastInsertRowid;
  const t4 = insTask.run(p1Id, 'Configure Gateway Rate Limiting', 'Setup token bucket limits and DDoS edge filtering rules', 'todo', 'Medium', cSecurity, nextWeek).lastInsertRowid;

  // 4. Dependencies for Project 1:
  // Task 2 depends on Task 1 (t1 is completed, so t2 is in_progress)
  // Task 3 depends on Task 2 (t2 is in_progress, so t3 is BLOCKED!)
  // Task 4 depends on Task 3 (t3 is blocked, so t4 depends on it)
  const insDep = db.prepare('INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)');
  insDep.run(t2, t1);
  insDep.run(t3, t2);
  insDep.run(t4, t3);

  // 5. Tasks for Project 2
  const t5 = insTask.run(p2Id, 'Design Token System & Typography Specs', 'Define spacing scales, border radiuses, and semantic color palette', 'completed', 'High', cDesign, today).lastInsertRowid;
  const t6 = insTask.run(p2Id, 'Build Accessible Modal & Dialog Primitives', 'Trap focus, aria-modal support, and keyboard event routing', 'in_progress', 'Medium', cFrontend, tomorrow).lastInsertRowid;
  const t7 = insTask.run(p2Id, 'Implement Project Workflow & Dependency Matrix', 'Interactive blocked status tracking and visual dependency chips', 'blocked', 'High', cFrontend, nextWeek).lastInsertRowid;

  insDep.run(t6, t5);
  insDep.run(t7, t6);

  // Run initial status sync
  [t1, t2, t3, t4, t5, t6, t7].forEach(id => syncTaskBlockedStatus(id));
}

module.exports = {
  db,
  syncTaskBlockedStatus,
  syncDependentTasks
};
