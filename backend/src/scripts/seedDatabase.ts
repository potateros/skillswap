import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { SkillCategory } from '../entities/SkillCategory';
import { Skill } from '../entities/Skill';
import { UserSkill } from '../entities/UserSkill';
import { SkillExchangeRequest } from '../entities/SkillExchangeRequest';
import { Review } from '../entities/Review';
import { TimeTransaction } from '../entities/TimeTransaction';
import { seedUsers } from '../seeders/userSeeder';
import logger from '../utils/logger';

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

const skillsData = [
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

  // Additional skills for the realistic user data
  { name: 'TypeScript', category: 'Technology', description: 'Typed superset of JavaScript' },
  { name: 'Web Development', category: 'Technology', description: 'Frontend and backend web development' },
  { name: 'PostgreSQL', category: 'Technology', description: 'Advanced relational database management' },
  { name: 'Mobile Development', category: 'Technology', description: 'iOS and Android app development' },
  { name: 'Blockchain', category: 'Technology', description: 'Blockchain technology and cryptocurrencies' },
  { name: 'DevOps', category: 'Technology', description: 'Development operations and deployment' },
  { name: 'Cloud Computing', category: 'Technology', description: 'AWS, Azure, and Google Cloud platforms' },
  { name: 'Kubernetes', category: 'Technology', description: 'Container orchestration platform' },
  { name: 'Unity', category: 'Technology', description: 'Game development engine and tools' },
  { name: 'C#', category: 'Technology', description: 'Microsoft .NET programming language' },
  { name: '3D Modeling', category: 'Creative Arts', description: '3D design and modeling' },
  { name: 'Adobe Photoshop', category: 'Creative Arts', description: 'Professional image editing software' },
  { name: 'Figma', category: 'Creative Arts', description: 'Collaborative design and prototyping tool' },
  { name: 'Photo Editing', category: 'Creative Arts', description: 'Digital photo enhancement and retouching' },
  { name: 'Adobe Lightroom', category: 'Creative Arts', description: 'Photo editing and organization software' },
  { name: 'Portrait Photography', category: 'Creative Arts', description: 'Professional portrait photography' },
  { name: 'Content Creation', category: 'Creative Arts', description: 'Digital content creation and strategy' },
  { name: 'Storytelling', category: 'Creative Arts', description: 'Narrative structure and creative writing' },
  { name: 'Adobe Premiere', category: 'Creative Arts', description: 'Professional video editing software' },
  { name: 'Color Grading', category: 'Creative Arts', description: 'Video color correction and enhancement' },
  { name: 'Music Production', category: 'Creative Arts', description: 'Audio recording and music production' },
  { name: 'Audio Engineering', category: 'Creative Arts', description: 'Sound recording and mixing' },
  { name: 'Guitar', category: 'Creative Arts', description: 'Guitar playing and music theory' },
  { name: 'Piano', category: 'Creative Arts', description: 'Piano performance and music theory' },
  { name: 'Product Management', category: 'Business', description: 'Product strategy and development' },
  { name: 'Excel', category: 'Business', description: 'Advanced spreadsheet analysis and modeling' },
  { name: 'Investment', category: 'Business', description: 'Investment strategy and portfolio management' },
  { name: 'Accounting', category: 'Business', description: 'Financial accounting and bookkeeping' },
  { name: 'Finance', category: 'Business', description: 'Financial planning and analysis' },
  { name: 'Business Planning', category: 'Business', description: 'Strategic business planning and development' },
  { name: 'Strategic Planning', category: 'Business', description: 'Long-term strategy and goal setting' },
  { name: 'Trading', category: 'Business', description: 'Stock and cryptocurrency trading' },
  { name: 'Cryptocurrency', category: 'Business', description: 'Digital currency and blockchain investments' },
  { name: 'Smart Contracts', category: 'Technology', description: 'Blockchain smart contract development' },
  { name: 'DeFi', category: 'Technology', description: 'Decentralized finance applications' },
  { name: 'English Tutoring', category: 'Languages', description: 'English language instruction and grammar' },
  { name: 'Writing', category: 'Languages', description: 'Creative and professional writing' },
  { name: 'Yoga', category: 'Wellness', description: 'Yoga practice and instruction' },
  { name: 'Meditation', category: 'Wellness', description: 'Mindfulness and meditation techniques' },
  { name: 'Nutrition', category: 'Wellness', description: 'Healthy eating and nutrition planning' },
  { name: 'Life Coaching', category: 'Wellness', description: 'Personal development and goal achievement' },
  { name: 'Ethical Hacking', category: 'Technology', description: 'Penetration testing and security assessment' },
  { name: 'Network Security', category: 'Technology', description: 'Network protection and security protocols' },
  { name: 'Linux', category: 'Technology', description: 'Linux system administration' },
  { name: 'Game Development', category: 'Technology', description: 'Video game design and programming' },
  { name: 'VR Development', category: 'Technology', description: 'Virtual reality application development' },
  { name: 'AI Programming', category: 'Technology', description: 'Artificial intelligence and machine learning' },
  { name: 'Programming', category: 'Technology', description: 'General programming concepts and practices' },
  { name: 'Design', category: 'Creative Arts', description: 'General design principles and aesthetics' },
  { name: 'Backend Development', category: 'Technology', description: 'Server-side development and APIs' },
  { name: 'React Native', category: 'Technology', description: 'Cross-platform mobile app development' },
  { name: 'iOS Development', category: 'Technology', description: 'Native iOS app development' }
];

export async function seedDatabase() {
  let connection;

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      connection = await AppDataSource.initialize();
      logger.info('Database connection established for seeding');
    } else {
      connection = AppDataSource;
    }

    const categoryRepository = connection.getRepository(SkillCategory);
    const skillRepository = connection.getRepository(Skill);
    const userSkillRepository = connection.getRepository(UserSkill);
    const skillExchangeRequestRepository = connection.getRepository(SkillExchangeRequest);
    const reviewRepository = connection.getRepository(Review);
    const timeTransactionRepository = connection.getRepository(TimeTransaction);

    // Clear existing data in correct order (respecting foreign key constraints)
    logger.info('Clearing existing data before seeding...');

    // Start transaction for data clearing and seeding
    await connection.transaction(async manager => {
      // Use raw SQL to disable foreign key checks temporarily and clear data
      // This approach works better with PostgreSQL foreign key constraints

      // For PostgreSQL, we need to use CASCADE or disable triggers temporarily
      // First, let's try deleting with proper foreign key handling

      try {
        // Method 1: Use query builder to delete all records
        await manager.createQueryBuilder().delete().from('reviews').execute();
        await manager.createQueryBuilder().delete().from('time_transactions').execute();
        await manager.createQueryBuilder().delete().from('skill_exchange_requests').execute();
        await manager.createQueryBuilder().delete().from('user_skills').execute();
        await manager.createQueryBuilder().delete().from('skills').execute();
        await manager.createQueryBuilder().delete().from('skill_categories').execute();

        logger.info('Existing data cleared successfully using query builder');
      } catch (deleteError) {
        logger.warn('Query builder delete failed, trying TRUNCATE CASCADE approach');

        // Method 2: Use TRUNCATE with CASCADE as fallback
        await manager.query('SET session_replication_role = replica;'); // Disable triggers temporarily

        await manager.query('TRUNCATE TABLE reviews CASCADE;');
        await manager.query('TRUNCATE TABLE time_transactions CASCADE;');
        await manager.query('TRUNCATE TABLE skill_exchange_requests CASCADE;');
        await manager.query('TRUNCATE TABLE user_skills CASCADE;');
        await manager.query('TRUNCATE TABLE skills CASCADE;');
        await manager.query('TRUNCATE TABLE skill_categories CASCADE;');

        await manager.query('SET session_replication_role = DEFAULT;'); // Re-enable triggers

        logger.info('Existing data cleared successfully using TRUNCATE CASCADE');
      }

      // Seed categories
      logger.info('Seeding skill categories...');
      const categoryMap = new Map<string, SkillCategory>();

      for (const categoryData of skillCategories) {
        const category = manager.getRepository(SkillCategory).create(categoryData);
        const savedCategory = await manager.getRepository(SkillCategory).save(category);
        categoryMap.set(savedCategory.name, savedCategory);
        logger.debug(`Created category: ${savedCategory.name}`);
      }

      // Seed skills
      logger.info('Seeding skills...');
      const skillsToSave: Skill[] = [];

      for (const skillData of skillsData) {
        const category = categoryMap.get(skillData.category);
        if (!category) {
          logger.warn(`Category '${skillData.category}' not found for skill '${skillData.name}'. Skipping skill.`);
          continue;
        }

        const skill = manager.getRepository(Skill).create({
          name: skillData.name,
          description: skillData.description,
          category_id: category.id
        });
        skillsToSave.push(skill);
      }

      // Batch save skills for better performance
      if (skillsToSave.length > 0) {
        await manager.getRepository(Skill).save(skillsToSave);
        logger.info(`Created ${skillsToSave.length} skills`);
      }
    });

    // Seed realistic users with skills, reviews, and transactions
    logger.info('Seeding realistic users...');
    await seedUsers();

    logger.info('Database seeding completed successfully!');

  } catch (error) {
    logger.error('Error during database seeding:', error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        logger.error('Database connection refused. Please ensure the database server is running.');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        logger.error('Database tables do not exist. Please run migrations first.');
      } else if (error.message.includes('foreign key constraint')) {
        logger.error('Foreign key constraint violation. Check entity relationships.');
      }
    }

    throw error;
  } finally {
    // Only destroy connection if we initialized it in this function
    if (connection && AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy();
        logger.info('Database connection closed');
      } catch (destroyError) {
        logger.warn('Error closing database connection:', destroyError);
      }
    }
  }
}

// Execute seeding if this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Failed to seed database:', error);
      process.exit(1);
    });
}
