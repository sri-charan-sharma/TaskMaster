const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/categories - get all categories with task counts
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.color,
        c.created_at,
        COUNT(t.id) AS total_tasks,
        COALESCE(SUM(CASE WHEN t.status != 'completed' THEN 1 ELSE 0 END), 0) AS pending_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    const categories = stmt.all();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/categories - add a new category
router.post('/', (req, res) => {
  try {
    let { name, color } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }
    name = name.trim();

    // Validate color hex
    if (!color || typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color.trim())) {
      color = '#6366f1';
    } else {
      color = color.trim();
    }

    // Check duplicate name
    const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(name);
    if (existing) {
      return res.status(409).json({ success: false, error: 'A category with this name already exists' });
    }

    const insertStmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
    const result = insertStmt.run(name, color);

    const newCategory = db.prepare(`
      SELECT 
        c.id, c.name, c.color, c.created_at, 
        0 AS total_tasks, 0 AS pending_tasks, 0 AS completed_tasks
      FROM categories c
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

// DELETE /api/categories/:id - remove category
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const cat = db.prepare('SELECT id, name FROM categories WHERE id = ?').get(id);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Detach any tasks assigned to this category
    db.prepare('UPDATE tasks SET category_id = NULL WHERE category_id = ?').run(id);

    // Delete category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Category "${cat.name}" deleted. Any associated tasks were kept as uncategorized.`,
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

module.exports = router;
