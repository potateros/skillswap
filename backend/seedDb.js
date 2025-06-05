require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker'); // For generating diverse fake data

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const skillCategories = [
  { name: 'Technology', description: 'Programming, software development, and IT skills' },
  { name: 'Creative Arts', description: 'Design, art, music, and creative expression' },
  { name: 'Business', description: 'Marketing, management, and professional skills' },
  { name: 'Wellness', description: 'Health, fitness, and personal well-being' },
  { name: 'Languages', description: 'Language learning and tutoring' },
  { name: 'Education', description: 'Teaching and academic subjects' },
  { name: 'Crafts', description: 'Handmade crafts and traditional skills' },
  { name: 'Culinary', description: 'Cooking, baking, and food-related skills' },
  { name: 'Sports', description: 'Athletic skills and physical activities' },
  { name: 'Home & Garden', description: 'Home improvement, gardening, and maintenance' }
];

const skillsToSeed = [
  // Technology (10 skills)
  { name: 'JavaScript', category: 'Technology', description: 'Modern web development programming language' },
  { name: 'Python', category: 'Technology', description: 'Versatile programming language for data science and web development' },
  { name: 'React', category: 'Technology', description: 'Popular JavaScript library for building user interfaces' },
  { name: 'Node.js', category: 'Technology', description: 'JavaScript runtime for server-side development' },
  { name: 'Machine Learning', category: 'Technology', description: 'AI and data science fundamentals' },
  { name: 'AWS', category: 'Technology', description: 'Amazon Web Services cloud computing platform' },
  { name: 'Docker', category: 'Technology', description: 'Containerization and deployment technology' },
  { name: 'SQL Database', category: 'Technology', description: 'Database design and query optimization' },
  { name: 'Cybersecurity', category: 'Technology', description: 'Network security and data protection' },
  { name: 'Mobile App Development', category: 'Technology', description: 'iOS and Android app development' },

  // Creative Arts (10 skills)
  { name: 'Graphic Design', category: 'Creative Arts', description: 'Visual design and digital art creation' },
  { name: 'UI/UX Design', category: 'Creative Arts', description: 'User interface and experience design' },
  { name: 'Photography', category: 'Creative Arts', description: 'Digital and film photography techniques' },
  { name: 'Video Editing', category: 'Creative Arts', description: 'Post-production video editing and effects' },
  { name: 'Guitar Playing', category: 'Creative Arts', description: 'Acoustic and electric guitar performance' },
  { name: 'Piano Playing', category: 'Creative Arts', description: 'Classical and contemporary piano performance' },
  { name: 'Singing', category: 'Creative Arts', description: 'Vocal training and performance techniques' },
  { name: 'Painting', category: 'Creative Arts', description: 'Oil, acrylic, and watercolor painting techniques' },
  { name: 'Drawing', category: 'Creative Arts', description: 'Sketching and illustration techniques' },
  { name: 'Animation', category: 'Creative Arts', description: '2D and 3D animation creation' },

  // Business (10 skills)
  { name: 'Digital Marketing', category: 'Business', description: 'Online marketing strategies and campaigns' },
  { name: 'SEO', category: 'Business', description: 'Search engine optimization techniques' },
  { name: 'Project Management', category: 'Business', description: 'Planning, organizing, and managing projects' },
  { name: 'Public Speaking', category: 'Business', description: 'Presentation and communication skills' },
  { name: 'Leadership', category: 'Business', description: 'Team management and leadership development' },
  { name: 'Financial Planning', category: 'Business', description: 'Personal and business financial management' },
  { name: 'Sales Strategy', category: 'Business', description: 'Sales techniques and customer relationship management' },
  { name: 'Content Writing', category: 'Business', description: 'Blog writing and content marketing' },
  { name: 'Social Media Marketing', category: 'Business', description: 'Social platform strategy and management' },
  { name: 'Data Analysis', category: 'Business', description: 'Business intelligence and analytics' },

  // Wellness (10 skills)
  { name: 'Yoga', category: 'Wellness', description: 'Physical and mental wellness through yoga practice' },
  { name: 'Meditation', category: 'Wellness', description: 'Mindfulness and stress reduction techniques' },
  { name: 'Fitness Training', category: 'Wellness', description: 'Personal training and exercise coaching' },
  { name: 'Pilates', category: 'Wellness', description: 'Core strengthening and flexibility training' },
  { name: 'Nutrition Coaching', category: 'Wellness', description: 'Healthy eating and meal planning' },
  { name: 'Massage Therapy', category: 'Wellness', description: 'Therapeutic massage techniques' },
  { name: 'Mental Health Support', category: 'Wellness', description: 'Counseling and emotional wellness' },
  { name: 'Life Coaching', category: 'Wellness', description: 'Personal development and goal setting' },
  { name: 'Tai Chi', category: 'Wellness', description: 'Martial arts for balance and relaxation' },
  { name: 'Breathwork', category: 'Wellness', description: 'Breathing techniques for wellness' },

  // Languages (10 skills)
  { name: 'Spanish', category: 'Languages', description: 'Spanish language conversation and grammar' },
  { name: 'French', category: 'Languages', description: 'French language conversation and grammar' },
  { name: 'German', category: 'Languages', description: 'German language conversation and grammar' },
  { name: 'Mandarin Chinese', category: 'Languages', description: 'Mandarin language and writing system' },
  { name: 'Japanese', category: 'Languages', description: 'Japanese language and cultural context' },
  { name: 'Italian', category: 'Languages', description: 'Italian language and pronunciation' },
  { name: 'Portuguese', category: 'Languages', description: 'Portuguese language and culture' },
  { name: 'Arabic', category: 'Languages', description: 'Arabic language and script' },
  { name: 'Russian', category: 'Languages', description: 'Russian language and Cyrillic alphabet' },
  { name: 'Sign Language', category: 'Languages', description: 'American Sign Language communication' },

  // Education (10 skills)
  { name: 'Mathematics Tutoring', category: 'Education', description: 'Math instruction from basic to advanced levels' },
  { name: 'Physics Tutoring', category: 'Education', description: 'Physics concepts and problem-solving' },
  { name: 'Chemistry Tutoring', category: 'Education', description: 'Chemistry fundamentals and lab techniques' },
  { name: 'Creative Writing', category: 'Education', description: 'Fiction, poetry, and creative expression' },
  { name: 'History Teaching', category: 'Education', description: 'Historical knowledge and research methods' },
  { name: 'Biology Tutoring', category: 'Education', description: 'Life sciences and biological processes' },
  { name: 'English Tutoring', category: 'Education', description: 'Grammar, literature, and composition' },
  { name: 'Test Preparation', category: 'Education', description: 'SAT, GRE, and standardized test strategies' },
  { name: 'Study Skills', category: 'Education', description: 'Learning techniques and time management' },
  { name: 'Music Theory', category: 'Education', description: 'Musical composition and arrangement' },

  // Crafts (10 skills)
  { name: 'Knitting', category: 'Crafts', description: 'Traditional knitting patterns and techniques' },
  { name: 'Sewing', category: 'Crafts', description: 'Garment construction and alterations' },
  { name: 'Woodworking', category: 'Crafts', description: 'Furniture making and wood crafting' },
  { name: 'Pottery', category: 'Crafts', description: 'Ceramic arts and pottery wheel techniques' },
  { name: 'Jewelry Making', category: 'Crafts', description: 'Handmade jewelry design and creation' },
  { name: 'Embroidery', category: 'Crafts', description: 'Decorative needlework and fabric art' },
  { name: 'Candle Making', category: 'Crafts', description: 'Artisan candle creation and scenting' },
  { name: 'Leatherworking', category: 'Crafts', description: 'Leather goods and accessories crafting' },
  { name: 'Glass Blowing', category: 'Crafts', description: 'Glasswork and artistic glass creation' },
  { name: 'Soap Making', category: 'Crafts', description: 'Natural soap and bath product creation' },

  // Culinary (10 skills)
  { name: 'Cooking', category: 'Culinary', description: 'International cuisine and cooking techniques' },
  { name: 'Baking', category: 'Culinary', description: 'Bread, pastries, and dessert preparation' },
  { name: 'Wine Tasting', category: 'Culinary', description: 'Wine appreciation and pairing' },
  { name: 'Coffee Brewing', category: 'Culinary', description: 'Specialty coffee preparation and roasting' },
  { name: 'Cake Decorating', category: 'Culinary', description: 'Professional cake design and decoration' },
  { name: 'Fermentation', category: 'Culinary', description: 'Fermented foods and preservation techniques' },
  { name: 'Grilling & BBQ', category: 'Culinary', description: 'Outdoor cooking and smoking techniques' },
  { name: 'Cocktail Making', category: 'Culinary', description: 'Mixology and cocktail creation' },
  { name: 'Vegetarian Cooking', category: 'Culinary', description: 'Plant-based cuisine and nutrition' },
  { name: 'Food Photography', category: 'Culinary', description: 'Styling and photographing food' },

  // Sports (10 skills)
  { name: 'Tennis', category: 'Sports', description: 'Tennis techniques and strategy' },
  { name: 'Swimming', category: 'Sports', description: 'Swimming strokes and water safety' },
  { name: 'Basketball', category: 'Sports', description: 'Basketball fundamentals and team play' },
  { name: 'Soccer', category: 'Sports', description: 'Soccer skills and tactics' },
  { name: 'Rock Climbing', category: 'Sports', description: 'Indoor and outdoor climbing techniques' },
  { name: 'Cycling', category: 'Sports', description: 'Road and mountain biking skills' },
  { name: 'Running', category: 'Sports', description: 'Distance running and marathon training' },
  { name: 'Golf', category: 'Sports', description: 'Golf swing and course management' },
  { name: 'Martial Arts', category: 'Sports', description: 'Self-defense and martial arts disciplines' },
  { name: 'Skateboarding', category: 'Sports', description: 'Skateboarding tricks and techniques' },

  // Home & Garden (10 skills)
  { name: 'Gardening', category: 'Home & Garden', description: 'Plant care and garden design' },
  { name: 'Home Repair', category: 'Home & Garden', description: 'Basic home maintenance and fixes' },
  { name: 'Interior Design', category: 'Home & Garden', description: 'Home decorating and space planning' },
  { name: 'Plumbing', category: 'Home & Garden', description: 'Basic plumbing repairs and installation' },
  { name: 'Electrical Work', category: 'Home & Garden', description: 'Safe electrical repairs and wiring' },
  { name: 'Landscaping', category: 'Home & Garden', description: 'Outdoor space design and maintenance' },
  { name: 'Composting', category: 'Home & Garden', description: 'Organic waste recycling and soil health' },
  { name: 'House Cleaning', category: 'Home & Garden', description: 'Efficient cleaning and organization' },
  { name: 'Painting & Decorating', category: 'Home & Garden', description: 'Interior and exterior painting techniques' },
  { name: 'Pest Control', category: 'Home & Garden', description: 'Natural and safe pest management' }
];

const seedUsers = async (count = 15) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      email: faker.internet.email(),
      password: `password${i + 1}`,
      name: faker.person.fullName(),
      bio: faker.lorem.paragraph(),
      location: faker.location.city() + ', ' + faker.location.state(),
      time_credits: faker.number.int({ min: 5, max: 25 })
    });
  }
  return users;
};

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting database seeding...');

    // Clear existing data (optional, but good for repeatable seeds)
    // Be careful with this in a real environment!
    console.log('Clearing existing data...');
    await client.query('DELETE FROM user_reviews;');
    await client.query('DELETE FROM skill_exchange_requests;');
    await client.query('DELETE FROM user_skills;');
    await client.query('DELETE FROM users;');
    await client.query('DELETE FROM skills;');
    await client.query('DELETE FROM skill_categories;');
    // Reset sequences for IDs if you are deleting all rows
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE skills_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE skill_categories_id_seq RESTART WITH 1;');
    console.log('Existing data cleared.');


    // 1. Seed Skill Categories
    const seededCategoryIds = {};
    console.log(`Seeding ${skillCategories.length} skill categories...`);
    for (const category of skillCategories) {
      const res = await client.query(
        'INSERT INTO skill_categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id, name',
        [category.name, category.description]
      );
      if (res.rows[0]) {
        seededCategoryIds[res.rows[0].name] = res.rows[0].id;
      }
    }
    console.log('Skill categories seeded.');

    // 2. Seed Skills
    const seededSkillIds = {}; // To store name -> id mapping
    console.log(`Seeding ${skillsToSeed.length} skills...`);
    for (const skill of skillsToSeed) {
      const categoryId = seededCategoryIds[skill.category];
      const res = await client.query(
        'INSERT INTO skills (name, category_id, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id, name',
        [skill.name, categoryId, skill.description]
      );
      if (res.rows[0]) {
        seededSkillIds[res.rows[0].name] = res.rows[0].id;
      }
    }
    console.log('Skills seeded.');
    const skillIdsArray = Object.values(seededSkillIds);

    // 3. Seed Users
    const usersData = await seedUsers(15); // Create 15 users
    const seededUserIds = [];
    console.log(`Seeding ${usersData.length} users...`);
    for (const user of usersData) {
      const res = await client.query(
        'INSERT INTO users (email, password, name, bio, location, time_credits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user.email, user.password, user.name, user.bio, user.location, user.time_credits]
      );
      seededUserIds.push(res.rows[0].id);
    }
    console.log('Users seeded.');

    // 4. Seed User Skills (Offer and Seek)
    console.log('Seeding user skills (offers and seeks)...');
    const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    
    for (const userId of seededUserIds) {
      const numSkillsToOffer = faker.number.int({ min: 2, max: 6 });
      const numSkillsToSeek = faker.number.int({ min: 1, max: 4 });
      const userSkillsSet = new Set(); // To avoid duplicate skill type for a user

      // Add skills to offer
      for (let i = 0; i < numSkillsToOffer; i++) {
        const skillId = faker.helpers.arrayElement(skillIdsArray);
        if (!userSkillsSet.has(`${skillId}-offer`)) {
          try {
            await client.query(
              'INSERT INTO user_skills (user_id, skill_id, type, proficiency_level, years_experience, description) VALUES ($1, $2, $3, $4, $5, $6)',
              [
                userId, 
                skillId, 
                'offer',
                faker.helpers.arrayElement(proficiencyLevels),
                faker.number.int({ min: 1, max: 15 }),
                faker.lorem.sentence()
              ]
            );
            userSkillsSet.add(`${skillId}-offer`);
          } catch (e) {
            if (e.code !== '23505') { // Ignore duplicate key errors if any slip through logic
                console.error(`Error seeding user_skill (offer) for user ${userId}, skill ${skillId}: ${e.message}`);
            }
          }
        }
      }

      // Add skills to seek
      for (let i = 0; i < numSkillsToSeek; i++) {
        const skillId = faker.helpers.arrayElement(skillIdsArray);
         if (!userSkillsSet.has(`${skillId}-seek`)) {
          try {
            await client.query(
              'INSERT INTO user_skills (user_id, skill_id, type, description) VALUES ($1, $2, $3, $4)',
              [
                userId, 
                skillId, 
                'seek',
                faker.lorem.sentence()
              ]
            );
            userSkillsSet.add(`${skillId}-seek`);
          } catch (e) {
             if (e.code !== '23505') { // Ignore duplicate key errors
                console.error(`Error seeding user_skill (seek) for user ${userId}, skill ${skillId}: ${e.message}`);
            }
          }
        }
      }
    }
    console.log('User skills seeded.');

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during database seeding:', err.stack);
  } finally {
    client.release();
    await pool.end(); // Close the pool
  }
}

seedDatabase().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
