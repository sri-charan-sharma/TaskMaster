const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/projects - list projects with workflow progress metrics
router.get('/', (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.color,
        p.created_at,
        COUNT(t.id) AS total_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END), 0) AS todo_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `).all();

    const formatted = projects.map(p => ({
      ...p,
      progress_pct: p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid project ID' });

    const project = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.color,
        p.created_at,
        COUNT(t.id) AS total_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END), 0) AS todo_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(id);

    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    project.progress_pct = project.total_tasks > 0 ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0;
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/projects - create new project
router.post('/', (req, res) => {
  try {
    let { name, description, color } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    name = name.trim();
    description = typeof description === 'string' ? description.trim() : '';

    if (!color || typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color.trim())) {
      color = '#2563eb';
    } else {
      color = color.trim();
    }

    const stmt = db.prepare('INSERT INTO projects (name, description, color) VALUES (?, ?, ?)');
    const result = stmt.run(name, description, color);

    const newProject = {
      id: Number(result.lastInsertRowid),
      name,
      description,
      color,
      total_tasks: 0,
      completed_tasks: 0,
      in_progress_tasks: 0,
      blocked_tasks: 0,
      todo_tasks: 0,
      progress_pct: 0
    };

    res.status(201).json({ success: true, message: 'Project created successfully', data: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// DELETE /api/projects/:id - delete project
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid project ID' });

    const proj = db.prepare('SELECT id, name FROM projects WHERE id = ?').get(id);
    if (!proj) return res.status(404).json({ success: false, error: 'Project not found' });

    // Count how many projects remain - keep at least 1
    const totalProjects = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
    if (totalProjects <= 1) {
      return res.status(400).json({ success: false, error: 'Cannot delete the only existing project.' });
    }

    // Find all downstream tasks affected before project deletion
    const affectedDependents = db.prepare(`
      SELECT DISTINCT td.task_id 
      FROM task_dependencies td
      JOIN tasks t ON td.depends_on_task_id = t.id
      WHERE t.project_id = ?
    `).all(id);

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    // Re-evaluate downstream tasks that lost prerequisites
    const { syncTaskBlockedStatus } = require('../db');
    for (const dep of affectedDependents) {
      syncTaskBlockedStatus(dep.task_id);
    }

    res.json({ success: true, message: `Project "${proj.name}" and its tasks deleted.` });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

module.exports = router;
