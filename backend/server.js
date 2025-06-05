require('dotenv').config(); // Load .env file variables
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // For production with SSL
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to initialize database schema
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, -- In a real app, this would be a hashed password
        name VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        avatar_url TEXT,
        time_credits INTEGER DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add missing columns if they don't exist (for existing tables)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS time_credits INTEGER DEFAULT 10;
    `);
    console.log('Users table checked/created successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS skill_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Skill categories table checked/created successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category_id INTEGER REFERENCES skill_categories(id),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Skills table checked/created successfully.');

    // Create enum types with IF NOT EXISTS logic
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE skill_type_enum AS ENUM ('offer', 'seek');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE proficiency_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE request_status_enum AS ENUM ('pending', 'accepted', 'declined', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Enum types checked/created successfully.');
  } catch (err) {
    console.error('Error creating tables or enum types:', err.stack);
    throw err;
  }
  // Separate try-catch for user_skills because it depends on skill_type_enum
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        type skill_type_enum NOT NULL,
        proficiency_level proficiency_level_enum,
        years_experience INTEGER,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, skill_id, type)
      );
    `);
    console.log('User_skills table checked/created successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS skill_exchange_requests (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_offered_id INTEGER REFERENCES skills(id),
        skill_requested_id INTEGER NOT NULL REFERENCES skills(id),
        message TEXT,
        status request_status_enum DEFAULT 'pending',
        credits_offered INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Skill exchange requests table checked/created successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exchange_request_id INTEGER REFERENCES skill_exchange_requests(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reviewer_id, reviewee_id, exchange_request_id)
      );
    `);
    console.log('User reviews table checked/created successfully.');

  } catch (err) {
    console.error('Error creating tables:', err.stack);
  } finally {
    client.release();
  }
};

app.use(express.json()); // Middleware to parse JSON bodies

// Basic API root route
app.get('/', (req, res) => {
  res.send('P2P Skill Exchange API is running!');
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json({ message: 'Successfully connected to DB', time: result.rows[0].now });
    client.release();
  } catch (err) {
    console.error('Error connecting to DB', err.stack);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Placeholder for future routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const skillRoutes = require('./routes/skills');
app.use('/api/skills', skillRoutes);

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await initializeDatabase();
});
