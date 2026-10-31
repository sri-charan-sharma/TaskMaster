const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./src/db');
const tasksRouter = require('./src/routes/tasks');
const categoriesRouter = require('./src/routes/categories');
const projectsRouter = require('./src/routes/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);

// GET /api/stats - Workspace & Workflow overview
app.get('/api/stats', (req, res) => {
  try {
    const statsRow = db.prepare(`
      SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed,
        COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress,
        COALESCE(SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked,
        COALESCE(SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END), 0) AS todo
      FROM tasks
    `).get();

    const projRow = db.prepare('SELECT COUNT(*) AS total_projects FROM projects').get();

    const total = statsRow.total;
    const completed = statsRow.completed;
    const in_progress = statsRow.in_progress;
    const blocked = statsRow.blocked;
    const todo = statsRow.todo;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        in_progress,
        blocked,
        todo,
        completionRate,
        totalProjects: projRow.total_projects
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Fallback to index.html for single-page application routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`TaskMaster Pro Server is running!`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`API endpoints: http://localhost:${PORT}/api/tasks`);
  console.log(`===============================================`);
});
