const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Add a new unique skill
// POST /api/skills
router.post('/', async (req, res) => {
  const { name, categoryId, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Skill name is required.' });
  }

  try {
    const client = await pool.connect();
    try {
      // Insert skill if it doesn't exist, or do nothing if it does (ON CONFLICT DO NOTHING)
      // Return the skill, whether it was newly inserted or already existed.
      const result = await client.query(
        `WITH ins AS (
           INSERT INTO skills (name, category_id, description) VALUES ($1, $2, $3)
           ON CONFLICT (name) DO NOTHING
           RETURNING id, name, category_id, description, created_at
         )
         SELECT id, name, category_id, description, created_at FROM ins
         UNION ALL
         SELECT id, name, category_id, description, created_at FROM skills WHERE name = $1 AND NOT EXISTS (SELECT 1 FROM ins);`,
        [name.trim(), categoryId || null, description || null]
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error adding skill:', err.stack);
    res.status(500).json({ error: 'Failed to add skill.' });
  }
});

// Get all unique skills
// GET /api/skills
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT s.id, s.name, s.description, s.created_at,
               sc.id AS category_id, sc.name AS category_name
        FROM skills s
        LEFT JOIN skill_categories sc ON s.category_id = sc.id
        ORDER BY sc.name, s.name ASC
      `);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error fetching skills:', err.stack);
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// Get all skill categories
// GET /api/skills/categories
router.get('/categories', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM skill_categories ORDER BY name ASC');
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error fetching skill categories:', err.stack);
    res.status(500).json({ error: 'Failed to fetch skill categories.' });
  }
});

// Add a new skill category
// POST /api/skills/categories
router.post('/categories', async (req, res) => {
  const { name, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO skill_categories (name, description) VALUES ($1, $2) RETURNING *',
        [name.trim(), description || null]
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Category already exists.' });
    }
    console.error('Error adding skill category:', err.stack);
    res.status(500).json({ error: 'Failed to add skill category.' });
  }
});

// Get skills by category
// GET /api/skills/by-category/:categoryId
router.get('/by-category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT s.*, sc.name AS category_name
         FROM skills s
         JOIN skill_categories sc ON s.category_id = sc.id
         WHERE s.category_id = $1
         ORDER BY s.name ASC`,
        [categoryId]
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error fetching skills for category ${categoryId}:`, err.stack);
    res.status(500).json({ error: 'Failed to fetch skills for category.' });
  }
});

module.exports = router;
