const express = require('express');
const router = express.Router();
const { db, syncTaskBlockedStatus, syncDependentTasks } = require('../db');

// Helper: Fetch a single task by ID with its full relational data (project, category, dependencies, dependents)
function getTaskDetails(id) {
  const task = db.prepare(`
    SELECT 
      t.id,
      t.project_id,
      p.name AS project_name,
      p.color AS project_color,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.category_id,
      c.name AS category_name,
      c.color AS category_color,
      t.due_date,
      t.created_at,
      t.updated_at
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(id);

  if (!task) return null;

  // Prerequisites (tasks this task depends on)
  const dependencies = db.prepare(`
    SELECT 
      t.id, 
      t.title, 
      t.status,
      t.priority
    FROM task_dependencies td
    JOIN tasks t ON td.depends_on_task_id = t.id
    WHERE td.task_id = ?
    ORDER BY t.id ASC
  `).all(id);

  // Dependent tasks (tasks blocked by this task)
  const dependents = db.prepare(`
    SELECT 
      t.id, 
      t.title, 
      t.status,
      t.priority
    FROM task_dependencies td
    JOIN tasks t ON td.task_id = t.id
    WHERE td.depends_on_task_id = ?
    ORDER BY t.id ASC
  `).all(id);

  const incompletePrereqs = dependencies.filter(d => d.status !== 'completed');

  return {
    ...task,
    dependencies,
    dependents,
    has_unmet_dependencies: incompletePrereqs.length > 0,
    unmet_prerequisites: incompletePrereqs
  };
}

// Check for circular dependency using DFS
function causesCycle(taskId, prerequisiteId) {
  if (taskId === prerequisiteId) return true;
  const visited = new Set();
  const queue = [prerequisiteId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === taskId) return true;
    if (!visited.has(current)) {
      visited.add(current);
      const upstream = db.prepare('SELECT depends_on_task_id FROM task_dependencies WHERE task_id = ?').all(current);
      for (const row of upstream) {
        queue.push(row.depends_on_task_id);
      }
    }
  }
  return false;
}

// GET /api/tasks - list tasks with filtering, search & dependency details
router.get('/', (req, res) => {
  try {
    const { project_id, status, category_id, priority, search, sort } = req.query;

    const conditions = [];
    const params = [];

    if (project_id && project_id !== 'all') {
      const pid = parseInt(project_id, 10);
      if (!isNaN(pid)) {
        conditions.push('t.project_id = ?');
        params.push(pid);
      }
    }

    if (status && ['todo', 'in_progress', 'blocked', 'completed'].includes(status)) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (category_id && category_id !== 'all') {
      const cid = parseInt(category_id, 10);
      if (!isNaN(cid)) {
        conditions.push('t.category_id = ?');
        params.push(cid);
      }
    }

    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      conditions.push('t.priority = ?');
      params.push(priority);
    }

    if (search && search.trim()) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern);
    }

    let sql = `
      SELECT 
        t.id,
        t.project_id,
        p.name AS project_name,
        p.color AS project_color,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.category_id,
        c.name AS category_name,
        c.color AS category_color,
        t.due_date,
        t.created_at,
        t.updated_at
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN categories c ON t.category_id = c.id
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort order
    switch (sort) {
      case 'status':
        sql += ` ORDER BY 
          CASE t.status 
            WHEN 'blocked' THEN 1 
            WHEN 'in_progress' THEN 2 
            WHEN 'todo' THEN 3 
            WHEN 'completed' THEN 4 
          END ASC, t.created_at DESC`;
        break;
      case 'priority':
        sql += ` ORDER BY 
          CASE t.priority 
            WHEN 'High' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Low' THEN 3 
          END ASC, t.created_at DESC`;
        break;
      case 'due_date':
        sql += ` ORDER BY 
          CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, 
          t.due_date ASC, t.created_at DESC`;
        break;
      case 'created_asc':
        sql += ' ORDER BY t.created_at ASC';
        break;
      case 'created_desc':
      default:
        sql += ' ORDER BY t.created_at DESC';
        break;
    }

    const tasks = db.prepare(sql).all(...params);

    // Efficiently batch-load dependencies for all returned tasks
    const allTaskIds = tasks.map(t => t.id);
    let depsMap = new Map();
    let dependentsMap = new Map();

    if (allTaskIds.length > 0) {
      const placeholders = allTaskIds.map(() => '?').join(',');

      const allDeps = db.prepare(`
        SELECT td.task_id, t.id AS prereq_id, t.title AS prereq_title, t.status AS prereq_status
        FROM task_dependencies td
        JOIN tasks t ON td.depends_on_task_id = t.id
        WHERE td.task_id IN (${placeholders})
      `).all(...allTaskIds);

      for (const row of allDeps) {
        if (!depsMap.has(row.task_id)) depsMap.set(row.task_id, []);
        depsMap.get(row.task_id).push({
          id: row.prereq_id,
          title: row.prereq_title,
          status: row.prereq_status
        });
      }

      const allDependents = db.prepare(`
        SELECT td.depends_on_task_id, t.id AS dep_id, t.title AS dep_title, t.status AS dep_status
        FROM task_dependencies td
        JOIN tasks t ON td.task_id = t.id
        WHERE td.depends_on_task_id IN (${placeholders})
      `).all(...allTaskIds);

      for (const row of allDependents) {
        if (!dependentsMap.has(row.depends_on_task_id)) dependentsMap.set(row.depends_on_task_id, []);
        dependentsMap.get(row.depends_on_task_id).push({
          id: row.dep_id,
          title: row.dep_title,
          status: row.dep_status
        });
      }
    }

    const enriched = tasks.map(t => {
      const dependencies = depsMap.get(t.id) || [];
      const dependents = dependentsMap.get(t.id) || [];
      const incompletePrereqs = dependencies.filter(d => d.status !== 'completed');

      return {
        ...t,
        dependencies,
        dependents,
        has_unmet_dependencies: incompletePrereqs.length > 0,
        unmet_prerequisites: incompletePrereqs
      };
    });

    res.json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });

    const task = getTaskDetails(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/tasks - create new task with project and dependencies
router.post('/', (req, res) => {
  try {
    let { project_id, title, description, priority, category_id, due_date, status, depends_on_ids } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }
    title = title.trim();

    // Verify Project
    let projId = parseInt(project_id, 10);
    if (isNaN(projId)) {
      const firstProj = db.prepare('SELECT id FROM projects ORDER BY id ASC LIMIT 1').get();
      if (!firstProj) return res.status(400).json({ success: false, error: 'No projects available' });
      projId = firstProj.id;
    } else {
      const proj = db.prepare('SELECT id FROM projects WHERE id = ?').get(projId);
      if (!proj) return res.status(400).json({ success: false, error: 'Specified project does not exist' });
    }

    if (!['High', 'Medium', 'Low'].includes(priority)) priority = 'Medium';
    description = typeof description === 'string' ? description.trim() : '';

    let catId = null;
    if (category_id) {
      const parsedCat = parseInt(category_id, 10);
      if (!isNaN(parsedCat) && db.prepare('SELECT id FROM categories WHERE id = ?').get(parsedCat)) {
        catId = parsedCat;
      }
    }

    let dueDateVal = null;
    if (due_date && typeof due_date === 'string' && due_date.trim()) {
      dueDateVal = due_date.trim();
    }

    let initialStatus = ['todo', 'in_progress', 'completed'].includes(status) ? status : 'todo';

    // Insert task
    const insertStmt = db.prepare(`
      INSERT INTO tasks (project_id, title, description, status, priority, category_id, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const result = insertStmt.run(projId, title, description, initialStatus, priority, catId, dueDateVal);
    const newTaskId = Number(result.lastInsertRowid);

    // Save dependencies
    if (Array.isArray(depends_on_ids) && depends_on_ids.length > 0) {
      const insDep = db.prepare('INSERT OR IGNORE INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)');
      const checkTask = db.prepare('SELECT id FROM tasks WHERE id = ?');
      for (const prereqId of depends_on_ids) {
        const pId = parseInt(prereqId, 10);
        if (!isNaN(pId) && pId !== newTaskId && checkTask.get(pId)) {
          insDep.run(newTaskId, pId);
        }
      }
    }

    // Sync status: if any prereq is not completed, auto-set to 'blocked'
    syncTaskBlockedStatus(newTaskId);

    const createdTask = getTaskDetails(newTaskId);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/status - update workflow status with dependency guard
router.patch('/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });

    const { status } = req.body;
    if (!['todo', 'in_progress', 'blocked', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be todo, in_progress, blocked, or completed.' });
    }

    const task = getTaskDetails(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Dependency Rule: If task has incomplete prerequisites, it cannot be completed or moved to in_progress
    if ((status === 'completed' || status === 'in_progress') && task.has_unmet_dependencies) {
      const prereqTitles = task.unmet_prerequisites.map(p => `"#${p.id} ${p.title}"`).join(', ');
      return res.status(409).json({
        success: false,
        blocked: true,
        error: `Cannot set status to "${status}". This task is blocked until prerequisite tasks are completed: ${prereqTitles}`
      });
    }

    db.prepare("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);

    // If status was changed, propagate to dependent tasks (e.g. unblocking them if completed)
    syncDependentTasks(id);

    const updatedTask = getTaskDetails(id);
    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, error: 'Failed to update task status' });
  }
});

// PATCH /api/tasks/:id - full update (title, desc, priority, category, status, dependencies)
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });

    const existing = getTaskDetails(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });

    const { title, description, priority, category_id, project_id, due_date, status, depends_on_ids } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      params.push(title.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(typeof description === 'string' ? description.trim() : '');
    }

    if (priority !== undefined) {
      if (!['High', 'Medium', 'Low'].includes(priority)) {
        return res.status(400).json({ success: false, error: 'Priority must be High, Medium, or Low' });
      }
      updates.push('priority = ?');
      params.push(priority);
    }

    if (project_id !== undefined) {
      const pid = parseInt(project_id, 10);
      if (!isNaN(pid) && db.prepare('SELECT id FROM projects WHERE id = ?').get(pid)) {
        updates.push('project_id = ?');
        params.push(pid);
      }
    }

    if (category_id !== undefined) {
      if (category_id === null || category_id === '') {
        updates.push('category_id = NULL');
      } else {
        const cid = parseInt(category_id, 10);
        if (!isNaN(cid) && db.prepare('SELECT id FROM categories WHERE id = ?').get(cid)) {
          updates.push('category_id = ?');
          params.push(cid);
        }
      }
    }

    if (due_date !== undefined) {
      if (due_date === null || due_date === '') {
        updates.push('due_date = NULL');
      } else {
        updates.push('due_date = ?');
        params.push(due_date.trim());
      }
    }

    if (status !== undefined) {
      if (!['todo', 'in_progress', 'blocked', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      // Check dependency guard if moving to completed or in_progress
      if ((status === 'completed' || status === 'in_progress') && existing.has_unmet_dependencies) {
        return res.status(409).json({
          success: false,
          blocked: true,
          error: `Task is blocked by incomplete prerequisites and cannot be marked ${status}.`
        });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      params.push(id);
      db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    // Update dependencies if provided
    if (Array.isArray(depends_on_ids)) {
      // Check cycle detection
      for (const pId of depends_on_ids) {
        const parsedPrereq = parseInt(pId, 10);
        if (causesCycle(id, parsedPrereq)) {
          return res.status(400).json({
            success: false,
            error: `Circular dependency detected: Task #${id} cannot depend on Task #${parsedPrereq}.`
          });
        }
      }

      // Reset and rebuild dependencies
      db.prepare('DELETE FROM task_dependencies WHERE task_id = ?').run(id);
      const insDep = db.prepare('INSERT OR IGNORE INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)');
      const checkTask = db.prepare('SELECT id FROM tasks WHERE id = ?');
      for (const pId of depends_on_ids) {
        const parsed = parseInt(pId, 10);
        if (!isNaN(parsed) && parsed !== id && checkTask.get(parsed)) {
          insDep.run(id, parsed);
        }
      }
    }

    // Synchronize blocked status
    syncTaskBlockedStatus(id);
    syncDependentTasks(id);

    const updatedTask = getTaskDetails(id);
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });

    const task = getTaskDetails(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Find all tasks that were blocked by this task before deletion
    const affectedDependents = db.prepare(`
      SELECT task_id FROM task_dependencies WHERE depends_on_task_id = ?
    `).all(id);

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    // Re-sync dependents now that prerequisite is removed
    for (const dep of affectedDependents) {
      syncTaskBlockedStatus(dep.task_id);
    }

    res.json({ success: true, message: `Task #${id} deleted`, deletedTask: task });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

module.exports = router;
