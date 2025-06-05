import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { SkillCategory } from '../entities/SkillCategory';
import { Skill } from '../entities/Skill';
import { User } from '../entities/User';
import { UserSkill, SkillType, ProficiencyLevel } from '../entities/UserSkill';
import { faker } from '@faker-js/faker';
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

  // Add more categories here...
  // For brevity, I'll include a few more key ones

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
];

export async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding');

    const categoryRepository = AppDataSource.getRepository(SkillCategory);
    const skillRepository = AppDataSource.getRepository(Skill);
    const userRepository = AppDataSource.getRepository(User);
    const userSkillRepository = AppDataSource.getRepository(UserSkill);

    // Clear existing data
    logger.info('Clearing existing data...');
    await userSkillRepository.delete({});
    await userRepository.delete({});
    await skillRepository.delete({});
    await categoryRepository.delete({});

    // Seed categories
    logger.info('Seeding skill categories...');
    const categoryMap = new Map<string, SkillCategory>();
    for (const categoryData of skillCategories) {
      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);
      categoryMap.set(savedCategory.name, savedCategory);
    }

    // Seed skills
    logger.info('Seeding skills...');
    const skillMap = new Map<string, Skill>();
    for (const skillData of skillsData) {
      const category = categoryMap.get(skillData.category);
      const skill = skillRepository.create({
        name: skillData.name,
        description: skillData.description,
        category_id: category?.id
      });
      const savedSkill = await skillRepository.save(skill);
      skillMap.set(savedSkill.name, savedSkill);
    }

    // Seed users
    logger.info('Seeding users...');
    const users: User[] = [];
    for (let i = 0; i < 15; i++) {
      const user = userRepository.create({
        email: faker.internet.email(),
        password: 'password123', // Will be hashed by entity hook
        name: faker.person.fullName(),
        bio: faker.lorem.paragraph(),
        location: `${faker.location.city()}, ${faker.location.state()}`,
        time_credits: faker.number.int({ min: 5, max: 25 })
      });
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
    }

    // Seed user skills
    logger.info('Seeding user skills...');
    const skillsArray = Array.from(skillMap.values());
    const proficiencyLevels = Object.values(ProficiencyLevel);
    
    for (const user of users) {
      const numSkillsToOffer = faker.number.int({ min: 2, max: 6 });
      const numSkillsToSeek = faker.number.int({ min: 1, max: 4 });
      const userSkillsSet = new Set<string>();

      // Add skills to offer
      for (let i = 0; i < numSkillsToOffer; i++) {
        const skill = faker.helpers.arrayElement(skillsArray);
        const key = `${skill.id}-${SkillType.OFFER}`;
        
        if (!userSkillsSet.has(key)) {
          const userSkill = userSkillRepository.create({
            user_id: user.id,
            skill_id: skill.id,
            type: SkillType.OFFER,
            proficiency_level: faker.helpers.arrayElement(proficiencyLevels),
            years_experience: faker.number.int({ min: 1, max: 15 }),
            description: faker.lorem.sentence()
          });
          
          try {
            await userSkillRepository.save(userSkill);
            userSkillsSet.add(key);
          } catch (error) {
            // Ignore unique constraint violations
          }
        }
      }

      // Add skills to seek
      for (let i = 0; i < numSkillsToSeek; i++) {
        const skill = faker.helpers.arrayElement(skillsArray);
        const key = `${skill.id}-${SkillType.SEEK}`;
        
        if (!userSkillsSet.has(key)) {
          const userSkill = userSkillRepository.create({
            user_id: user.id,
            skill_id: skill.id,
            type: SkillType.SEEK,
            description: faker.lorem.sentence()
          });
          
          try {
            await userSkillRepository.save(userSkill);
            userSkillsSet.add(key);
          } catch (error) {
            // Ignore unique constraint violations
          }
        }
      }
    }

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error during database seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  seedDatabase().catch(error => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
}