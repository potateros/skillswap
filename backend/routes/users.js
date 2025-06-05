const express = require('express');
const router = express.Router();
const { Pool } = require('pg'); // Or import pool from a shared db connection module

// Assuming pool is configured similarly to server.js or passed around
// For simplicity in POC, re-creating a pool instance here.
// In a larger app, you'd typically have a shared db.js module.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// User Login
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, bio, location, time_credits, created_at FROM users WHERE email = $1 AND password = $2',
        [email, password] // In a real app, you'd hash the password and compare hashes
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error during login:', err.stack);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// User Registration
// POST /api/users
router.post('/', async (req, res) => {
  const { email, password, name, bio } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const client = await pool.connect();
    try {
      // In a real app, hash the password before storing it!
      // const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (email, password, name, bio, location, time_credits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, bio, location, time_credits, created_at',
        [email, password, name, bio, req.body.location || null, req.body.time_credits || 10] // Store plain password for POC only
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') { // Unique violation (e.g., email already exists)
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error('Error registering user:', err.stack);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Get all users (for MVP discovery)
// GET /api/users
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, email, name, bio, location, time_credits, created_at FROM users ORDER BY created_at DESC');
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error fetching users:', err.stack);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Add a skill to a user (offer or seek)
// POST /api/users/:userId/skills
router.post('/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const { skillName, type, proficiencyLevel, yearsExperience, description } = req.body;

  if (!skillName || !type) {
    return res.status(400).json({ error: 'Skill name and type (offer/seek) are required.' });
  }
  if (type !== 'offer' && type !== 'seek') {
    return res.status(400).json({ error: "Type must be 'offer' or 'seek'." });
  }
  if (proficiencyLevel && !['beginner', 'intermediate', 'advanced', 'expert'].includes(proficiencyLevel)) {
    return res.status(400).json({ error: "Proficiency level must be 'beginner', 'intermediate', 'advanced', or 'expert'." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Find or create the skill in the global 'skills' table
    let skillResult = await client.query(
      `WITH ins AS (
         INSERT INTO skills (name) VALUES ($1)
         ON CONFLICT (name) DO NOTHING
         RETURNING id, name
       )
       SELECT id, name FROM ins
       UNION ALL
       SELECT id, name FROM skills WHERE name = $1 AND NOT EXISTS (SELECT 1 FROM ins);`,
      [skillName.trim()]
    );

    const skillId = skillResult.rows[0].id;

    // 2. Add to user_skills table
    const userSkillResult = await client.query(
      'INSERT INTO user_skills (user_id, skill_id, type, proficiency_level, years_experience, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, skillId, type, proficiencyLevel || null, yearsExperience || null, description || null]
    );

    await client.query('COMMIT'); // Commit transaction
    res.status(201).json(userSkillResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    if (err.code === '23503') { // Foreign key violation (e.g. user_id doesn't exist)
        return res.status(404).json({ error: 'User not found.' });
    }
    if (err.code === '23505') { // Unique constraint violation (user already has this skill/type)
        return res.status(409).json({ error: 'User already has this skill listed for this type (offer/seek).'});
    }
    console.error(`Error adding skill to user ${userId}:`, err.stack);
    res.status(500).json({ error: 'Failed to add skill to user.' });
  } finally {
    client.release();
  }
});

// Get skills for a specific user
// GET /api/users/:userId/skills
router.get('/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT us.id, s.id AS skill_id, s.name AS skill_name, s.description AS skill_description,
                us.type, us.proficiency_level, us.years_experience, us.description,
                sc.name AS category_name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         LEFT JOIN skill_categories sc ON s.category_id = sc.id
         WHERE us.user_id = $1
         ORDER BY s.name, us.type`,
        [userId]
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error fetching skills for user ${userId}:`, err.stack);
    res.status(500).json({ error: 'Failed to fetch user skills.' });
  }
});

// Search users by skill
// GET /api/users/search/by-skill?skillName=...&type=...
router.get('/search/by-skill', async (req, res) => {
  const { skillName, type } = req.query;

  if (!skillName) {
    return res.status(400).json({ error: 'skillName query parameter is required.' });
  }
  if (type && type !== 'offer' && type !== 'seek') {
    return res.status(400).json({ error: "Optional type parameter must be 'offer' or 'seek'." });
  }

  try {
    const client = await pool.connect();
    try {
      let query = `
        SELECT u.id AS user_id, u.name AS user_name, u.email, u.bio AS user_bio, u.location,
               s.id AS skill_id, s.name AS skill_name, us.type AS skill_type,
               us.proficiency_level, us.years_experience, us.description AS skill_description,
               sc.name AS category_name
        FROM users u
        JOIN user_skills us ON u.id = us.user_id
        JOIN skills s ON us.skill_id = s.id
        LEFT JOIN skill_categories sc ON s.category_id = sc.id
        WHERE s.name ILIKE $1
      `;
      const queryParams = [`%${skillName}%`];

      if (type) {
        query += ` AND us.type = $2`;
        queryParams.push(type);
      }
      query += ` ORDER BY u.name, s.name;`;

      const result = await client.query(query, queryParams);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error searching users by skill:', err.stack);
    res.status(500).json({ error: 'Failed to search users by skill.' });
  }
});

// Get user profile by ID
// GET /api/users/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, bio, location, time_credits, created_at FROM users WHERE id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err.stack);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Update user profile
// PUT /api/users/:userId
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, bio, location } = req.body;
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET name = $1, bio = $2, location = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, name, bio, location, time_credits, updated_at',
        [name, bio, location, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error updating user ${userId}:`, err.stack);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Create skill exchange request
// POST /api/users/:userId/exchange-requests
router.post('/:userId/exchange-requests', async (req, res) => {
  const { userId } = req.params;
  const { providerId, skillOfferedId, skillRequestedId, message, creditsOffered } = req.body;

  if (!providerId || !skillRequestedId) {
    return res.status(400).json({ error: 'Provider ID and requested skill ID are required.' });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO skill_exchange_requests (requester_id, provider_id, skill_offered_id, skill_requested_id, message, credits_offered) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, providerId, skillOfferedId || null, skillRequestedId, message || null, creditsOffered || 1]
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating exchange request:', err.stack);
    res.status(500).json({ error: 'Failed to create exchange request.' });
  }
});

// Get exchange requests for a user
// GET /api/users/:userId/exchange-requests?type=sent|received
router.get('/:userId/exchange-requests', async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query; // 'sent' or 'received'

  try {
    const client = await pool.connect();
    try {
      let query, queryParams;
      
      if (type === 'sent') {
        query = `
          SELECT ser.*, 
                 u_provider.name AS provider_name, u_provider.email AS provider_email,
                 s_offered.name AS skill_offered_name, s_requested.name AS skill_requested_name
          FROM skill_exchange_requests ser
          LEFT JOIN users u_provider ON ser.provider_id = u_provider.id
          LEFT JOIN skills s_offered ON ser.skill_offered_id = s_offered.id
          LEFT JOIN skills s_requested ON ser.skill_requested_id = s_requested.id
          WHERE ser.requester_id = $1
          ORDER BY ser.created_at DESC
        `;
        queryParams = [userId];
      } else if (type === 'received') {
        query = `
          SELECT ser.*, 
                 u_requester.name AS requester_name, u_requester.email AS requester_email,
                 s_offered.name AS skill_offered_name, s_requested.name AS skill_requested_name
          FROM skill_exchange_requests ser
          LEFT JOIN users u_requester ON ser.requester_id = u_requester.id
          LEFT JOIN skills s_offered ON ser.skill_offered_id = s_offered.id
          LEFT JOIN skills s_requested ON ser.skill_requested_id = s_requested.id
          WHERE ser.provider_id = $1
          ORDER BY ser.created_at DESC
        `;
        queryParams = [userId];
      } else {
        // Get both sent and received
        query = `
          (SELECT ser.*, 'sent' as request_type,
                  u_provider.name AS other_user_name, u_provider.email AS other_user_email,
                  s_offered.name AS skill_offered_name, s_requested.name AS skill_requested_name
           FROM skill_exchange_requests ser
           LEFT JOIN users u_provider ON ser.provider_id = u_provider.id
           LEFT JOIN skills s_offered ON ser.skill_offered_id = s_offered.id
           LEFT JOIN skills s_requested ON ser.skill_requested_id = s_requested.id
           WHERE ser.requester_id = $1)
          UNION ALL
          (SELECT ser.*, 'received' as request_type,
                  u_requester.name AS other_user_name, u_requester.email AS other_user_email,
                  s_offered.name AS skill_offered_name, s_requested.name AS skill_requested_name
           FROM skill_exchange_requests ser
           LEFT JOIN users u_requester ON ser.requester_id = u_requester.id
           LEFT JOIN skills s_offered ON ser.skill_offered_id = s_offered.id
           LEFT JOIN skills s_requested ON ser.skill_requested_id = s_requested.id
           WHERE ser.provider_id = $1)
          ORDER BY created_at DESC
        `;
        queryParams = [userId];
      }

      const result = await client.query(query, queryParams);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error fetching exchange requests for user ${userId}:`, err.stack);
    res.status(500).json({ error: 'Failed to fetch exchange requests.' });
  }
});

// Update exchange request status
// PUT /api/users/:userId/exchange-requests/:requestId
router.put('/:userId/exchange-requests/:requestId', async (req, res) => {
  const { userId, requestId } = req.params;
  const { status } = req.body;

  if (!['pending', 'accepted', 'declined', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, declined, or completed.' });
  }

  try {
    const client = await pool.connect();
    try {
      // Check if user is the provider (only provider can update status)
      const result = await client.query(
        'UPDATE skill_exchange_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND provider_id = $3 RETURNING *',
        [status, requestId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Exchange request not found or you are not authorized to update it.' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error updating exchange request:', err.stack);
    res.status(500).json({ error: 'Failed to update exchange request.' });
  }
});

module.exports = router;
