import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Skill } from '../entities/Skill';
import { UserSkill, SkillType, ProficiencyLevel } from '../entities/UserSkill';
import { Review, ReviewType } from '../entities/Review';
import { TimeTransaction, TransactionType, TransactionStatus } from '../entities/TimeTransaction';

const REALISTIC_USERS = [
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    password: 'password123',
    bio: 'Software engineer with 8 years experience. Love teaching programming and learning about design.',
    location: 'San Francisco, CA',
    time_credits: 45,
    skills: {
      offer: [
        { name: 'JavaScript', proficiency: 5 },
        { name: 'React', proficiency: 5 },
        { name: 'Node.js', proficiency: 4 },
        { name: 'TypeScript', proficiency: 4 }
      ],
      seek: [
        { name: 'UI/UX Design', proficiency: 1 },
        { name: 'Product Management', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    password: 'password123',
    bio: 'Professional graphic designer and illustrator. Always excited to share creative knowledge!',
    location: 'Austin, TX',
    time_credits: 32,
    skills: {
      offer: [
        { name: 'Graphic Design', proficiency: 5 },
        { name: 'UI/UX Design', proficiency: 4 },
        { name: 'Adobe Photoshop', proficiency: 5 },
        { name: 'Figma', proficiency: 4 }
      ],
      seek: [
        { name: 'Web Development', proficiency: 1 },
        { name: 'Digital Marketing', proficiency: 2 }
      ]
    }
  },
  {
    name: 'David Chen',
    email: 'david.chen@email.com',
    password: 'password123',
    bio: 'Data scientist and machine learning enthusiast. Love exploring AI applications.',
    location: 'Seattle, WA',
    time_credits: 67,
    skills: {
      offer: [
        { name: 'Python', proficiency: 5 },
        { name: 'Machine Learning', proficiency: 4 },
        { name: 'Data Analysis', proficiency: 5 },
        { name: 'SQL', proficiency: 4 }
      ],
      seek: [
        { name: 'Cloud Computing', proficiency: 2 },
        { name: 'DevOps', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    password: 'password123',
    bio: 'Marketing professional and social media strategist. Happy to help with business growth!',
    location: 'New York, NY',
    time_credits: 28,
    skills: {
      offer: [
        { name: 'Digital Marketing', proficiency: 5 },
        { name: 'Social Media Marketing', proficiency: 5 },
        { name: 'Content Writing', proficiency: 4 },
        { name: 'SEO', proficiency: 3 }
      ],
      seek: [
        { name: 'Video Editing', proficiency: 1 },
        { name: 'Photography', proficiency: 2 }
      ]
    }
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    password: 'password123',
    bio: 'Full-stack developer and tech entrepreneur. Building the future, one app at a time.',
    location: 'Portland, OR',
    time_credits: 15,
    skills: {
      offer: [
        { name: 'Web Development', proficiency: 5 },
        { name: 'JavaScript', proficiency: 4 },
        { name: 'PostgreSQL', proficiency: 4 },
        { name: 'Product Management', proficiency: 3 }
      ],
      seek: [
        { name: 'Mobile Development', proficiency: 1 },
        { name: 'Blockchain', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    password: 'password123',
    bio: 'Professional photographer and visual storyteller. Passionate about capturing moments.',
    location: 'Los Angeles, CA',
    time_credits: 41,
    skills: {
      offer: [
        { name: 'Photography', proficiency: 5 },
        { name: 'Photo Editing', proficiency: 4 },
        { name: 'Adobe Lightroom', proficiency: 5 },
        { name: 'Portrait Photography', proficiency: 5 }
      ],
      seek: [
        { name: 'Video Editing', proficiency: 2 },
        { name: 'Web Development', proficiency: 1 }
      ]
    }
  },
  {
    name: 'James Lee',
    email: 'james.lee@email.com',
    password: 'password123',
    bio: 'DevOps engineer and cloud architecture specialist. Making systems scalable and reliable.',
    location: 'Denver, CO',
    time_credits: 53,
    skills: {
      offer: [
        { name: 'DevOps', proficiency: 5 },
        { name: 'Cloud Computing', proficiency: 5 },
        { name: 'Docker', proficiency: 4 },
        { name: 'Kubernetes', proficiency: 4 }
      ],
      seek: [
        { name: 'Machine Learning', proficiency: 1 },
        { name: 'Python', proficiency: 2 }
      ]
    }
  },
  {
    name: 'Lisa Martinez',
    email: 'lisa.martinez@email.com',
    password: 'password123',
    bio: 'Language teacher and cultural exchange enthusiast. Connecting people through communication.',
    location: 'Miami, FL',
    time_credits: 36,
    skills: {
      offer: [
        { name: 'Spanish', proficiency: 5 },
        { name: 'English Tutoring', proficiency: 4 },
        { name: 'Public Speaking', proficiency: 4 },
        { name: 'Writing', proficiency: 4 }
      ],
      seek: [
        { name: 'French', proficiency: 1 },
        { name: 'Guitar', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Ryan Cooper',
    email: 'ryan.cooper@email.com',
    password: 'password123',
    bio: 'Mobile app developer and UX enthusiast. Creating intuitive digital experiences.',
    location: 'Chicago, IL',
    time_credits: 22,
    skills: {
      offer: [
        { name: 'Mobile Development', proficiency: 5 },
        { name: 'React Native', proficiency: 4 },
        { name: 'iOS Development', proficiency: 4 },
        { name: 'UI/UX Design', proficiency: 3 }
      ],
      seek: [
        { name: 'Backend Development', proficiency: 2 },
        { name: 'Game Development', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Anna Petrov',
    email: 'anna.petrov@email.com',
    password: 'password123',
    bio: 'Finance professional and investment advisor. Helping people make smart money decisions.',
    location: 'Boston, MA',
    time_credits: 59,
    skills: {
      offer: [
        { name: 'Finance', proficiency: 5 },
        { name: 'Excel', proficiency: 5 },
        { name: 'Investment', proficiency: 4 },
        { name: 'Accounting', proficiency: 3 }
      ],
      seek: [
        { name: 'Data Analysis', proficiency: 2 },
        { name: 'Programming', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@email.com',
    password: 'password123',
    bio: 'Music producer and sound engineer. Bringing artists\' visions to life through audio.',
    location: 'Nashville, TN',
    time_credits: 18,
    skills: {
      offer: [
        { name: 'Music Production', proficiency: 5 },
        { name: 'Audio Engineering', proficiency: 5 },
        { name: 'Guitar', proficiency: 4 },
        { name: 'Piano', proficiency: 3 }
      ],
      seek: [
        { name: 'Video Editing', proficiency: 1 },
        { name: 'Digital Marketing', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Jennifer Kim',
    email: 'jennifer.kim@email.com',
    password: 'password123',
    bio: 'Yoga instructor and wellness coach. Promoting health and mindfulness in daily life.',
    location: 'San Diego, CA',
    time_credits: 73,
    skills: {
      offer: [
        { name: 'Yoga', proficiency: 5 },
        { name: 'Meditation', proficiency: 4 },
        { name: 'Nutrition', proficiency: 3 },
        { name: 'Life Coaching', proficiency: 4 }
      ],
      seek: [
        { name: 'Business Planning', proficiency: 1 },
        { name: 'Social Media Marketing', proficiency: 2 }
      ]
    }
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    password: 'password123',
    bio: 'Cybersecurity expert and ethical hacker. Keeping the digital world safe.',
    location: 'Washington, DC',
    time_credits: 31,
    skills: {
      offer: [
        { name: 'Cybersecurity', proficiency: 5 },
        { name: 'Ethical Hacking', proficiency: 4 },
        { name: 'Network Security', proficiency: 4 },
        { name: 'Linux', proficiency: 4 }
      ],
      seek: [
        { name: 'Cloud Computing', proficiency: 2 },
        { name: 'Blockchain', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Sophie Anderson',
    email: 'sophie.anderson@email.com',
    password: 'password123',
    bio: 'Video content creator and storyteller. Helping brands connect with their audience.',
    location: 'Phoenix, AZ',
    time_credits: 44,
    skills: {
      offer: [
        { name: 'Video Editing', proficiency: 5 },
        { name: 'Content Creation', proficiency: 4 },
        { name: 'Storytelling', proficiency: 4 },
        { name: 'Adobe Premiere', proficiency: 5 }
      ],
      seek: [
        { name: 'Animation', proficiency: 1 },
        { name: 'Color Grading', proficiency: 2 }
      ]
    }
  },
  {
    name: 'Kevin Wang',
    email: 'kevin.wang@email.com',
    password: 'password123',
    bio: 'Game developer and interactive media designer. Creating immersive digital experiences.',
    location: 'San Jose, CA',
    time_credits: 26,
    skills: {
      offer: [
        { name: 'Game Development', proficiency: 5 },
        { name: 'Unity', proficiency: 4 },
        { name: 'C#', proficiency: 4 },
        { name: '3D Modeling', proficiency: 3 }
      ],
      seek: [
        { name: 'VR Development', proficiency: 1 },
        { name: 'AI Programming', proficiency: 2 }
      ]
    }
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    password: 'password123',
    bio: '',
    location: '',
    time_credits: 8,
    skills: {
      offer: [],
      seek: [
        { name: 'Programming', proficiency: 1 },
        { name: 'Design', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Tom Mitchell',
    email: 'tom.mitchell@email.com',
    password: 'password123',
    bio: 'New to the platform, eager to learn!',
    location: 'Houston, TX',
    time_credits: 3,
    skills: {
      offer: [],
      seek: [
        { name: 'Guitar', proficiency: 1 },
        { name: 'Cooking', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Nina Patel',
    email: 'nina.patel@email.com',
    password: 'password123',
    bio: 'Business consultant and process optimization specialist.',
    location: 'Atlanta, GA',
    time_credits: 91,
    skills: {
      offer: [
        { name: 'Business Planning', proficiency: 5 },
        { name: 'Project Management', proficiency: 4 },
        { name: 'Strategic Planning', proficiency: 5 },
        { name: 'Leadership', proficiency: 4 }
      ],
      seek: [
        { name: 'Digital Marketing', proficiency: 2 },
        { name: 'Data Analysis', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Luke Harrison',
    email: 'luke.harrison@email.com',
    password: 'password123',
    bio: 'Blockchain enthusiast and cryptocurrency trader.',
    location: 'Las Vegas, NV',
    time_credits: 12,
    skills: {
      offer: [
        { name: 'Blockchain', proficiency: 4 },
        { name: 'Cryptocurrency', proficiency: 4 },
        { name: 'Trading', proficiency: 3 }
      ],
      seek: [
        { name: 'Smart Contracts', proficiency: 2 },
        { name: 'DeFi', proficiency: 1 }
      ]
    }
  },
  {
    name: 'Maya Singh',
    email: 'maya.singh@email.com',
    password: 'password123',
    bio: '',
    location: 'Minneapolis, MN',
    time_credits: 4,
    skills: {
      offer: [],
      seek: []
    }
  }
];

async function seedUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const skillRepository = AppDataSource.getRepository(Skill);
    const userSkillRepository = AppDataSource.getRepository(UserSkill);
    const reviewRepository = AppDataSource.getRepository(Review);
    const transactionRepository = AppDataSource.getRepository(TimeTransaction);

    console.log('🌱 Starting user seeding...');

    // Clear existing data in the correct order to respect foreign key constraints
    // Use query builder approach to handle foreign keys properly
    const connection = AppDataSource;

    // Option 1: Delete using query builder (safer for foreign keys)
    await connection.createQueryBuilder().delete().from('time_transactions').execute();
    await connection.createQueryBuilder().delete().from('reviews').execute();
    await connection.createQueryBuilder().delete().from('skill_exchange_requests').execute();
    await connection.createQueryBuilder().delete().from('user_skills').execute();
    await connection.createQueryBuilder().delete().from('users').execute();

    console.log('📊 Existing user data cleared');

    const createdUsers: User[] = [];

    // Create users and their skills
    for (const userData of REALISTIC_USERS) {
      // Create user
      const user = new User();
      user.name = userData.name;
      user.email = userData.email;
      user.password = userData.password;
      user.bio = userData.bio;
      user.location = userData.location;
      user.time_credits = userData.time_credits;

      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${savedUser.name} (${savedUser.time_credits} credits)`);

      // Add skills
      for (const skillType of ['offer', 'seek'] as const) {
        for (const skillData of userData.skills[skillType]) {
          const skill = await skillRepository.findOne({
            where: { name: skillData.name }
          });

          if (skill) {
            const userSkill = new UserSkill();
            userSkill.user = savedUser;
            userSkill.skill = skill;
            userSkill.type = skillType as SkillType;
            // Map numeric proficiency to enum values
            const proficiencyMap: { [key: number]: ProficiencyLevel } = {
              1: ProficiencyLevel.BEGINNER,
              2: ProficiencyLevel.INTERMEDIATE,
              3: ProficiencyLevel.INTERMEDIATE,
              4: ProficiencyLevel.ADVANCED,
              5: ProficiencyLevel.EXPERT
            };
            userSkill.proficiency_level = proficiencyMap[skillData.proficiency] || ProficiencyLevel.INTERMEDIATE;

            await userSkillRepository.save(userSkill);
          }
        }
      }
    }

    console.log(`✅ Created ${createdUsers.length} users with skills`);

    // Generate realistic reviews
    const reviewData = [
      { reviewerId: 0, revieweeId: 1, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: 'Maria is an amazing design teacher! Very patient and knowledgeable.', skillName: 'UI/UX Design' },
      { reviewerId: 1, revieweeId: 0, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: 'Alex explained JavaScript concepts so clearly. Highly recommended!', skillName: 'JavaScript' },
      { reviewerId: 2, revieweeId: 0, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: 'Great React tutorial, learned a lot about hooks and state management.', skillName: 'React' },
      { reviewerId: 3, revieweeId: 4, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: 'Michael helped me understand full-stack development concepts really well.', skillName: 'Web Development' },
      { reviewerId: 4, revieweeId: 3, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: "Sarah's marketing strategies are top-notch. Saw immediate results!", skillName: 'Digital Marketing' },
      { reviewerId: 5, revieweeId: 6, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: 'James made DevOps seem less intimidating. Great teacher!', skillName: 'DevOps' },
      { reviewerId: 6, revieweeId: 2, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: "David's Python teaching methodology is excellent. Complex topics made simple.", skillName: 'Python' },
      { reviewerId: 7, revieweeId: 10, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: 'Carlos taught me guitar basics in a fun and engaging way.', skillName: 'Guitar' },
      { reviewerId: 8, revieweeId: 1, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: "Maria's design feedback was incredibly valuable for my project.", skillName: 'Graphic Design' },
      { reviewerId: 9, revieweeId: 11, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: "Jennifer's yoga sessions are transformative. Highly recommended!", skillName: 'Yoga' },
      { reviewerId: 10, revieweeId: 13, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: "Sophie's video editing tips really improved my content quality.", skillName: 'Video Editing' },
      { reviewerId: 11, revieweeId: 9, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: 'Anna explained financial concepts in a very understandable way.', skillName: 'Finance' },
      { reviewerId: 12, revieweeId: 14, type: ReviewType.TEACHER_REVIEW, rating: 5, comment: "Kevin's game development insights were exactly what I needed.", skillName: 'Game Development' },
      { reviewerId: 1, revieweeId: 5, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: "Emma's photography workshop was inspiring and practical.", skillName: 'Photography' },
      { reviewerId: 13, revieweeId: 12, type: ReviewType.TEACHER_REVIEW, rating: 4, comment: "Robert's cybersecurity course opened my eyes to digital security.", skillName: 'Cybersecurity' }
    ];

    for (const reviewInfo of reviewData) {
      if (createdUsers[reviewInfo.reviewerId] && createdUsers[reviewInfo.revieweeId]) {
        const review = new Review();
        review.reviewer = createdUsers[reviewInfo.reviewerId];
        review.reviewee = createdUsers[reviewInfo.revieweeId];
        review.type = reviewInfo.type;
        review.rating = reviewInfo.rating;
        review.comment = reviewInfo.comment;
        review.skillName = reviewInfo.skillName;

        await reviewRepository.save(review);
      }
    }

    console.log(`⭐ Created ${reviewData.length} reviews`);

    // Generate some sample transactions
    const transactionData = [
      { userId: 0, type: TransactionType.TOPUP, amount: 25, description: 'Credit card top-up' },
      { userId: 1, type: TransactionType.TOPUP, amount: 30, description: 'Credit card top-up' },
      { userId: 2, type: TransactionType.TOPUP, amount: 50, description: 'Credit card top-up' },
      { userId: 0, type: TransactionType.SPEND, amount: 5, description: 'Payment for UI/UX Design lesson with Maria' },
      { userId: 1, type: TransactionType.EARN, amount: 5, description: 'Earned from teaching UI/UX Design to Alex' },
      { userId: 3, type: TransactionType.SPEND, amount: 8, description: 'Payment for Web Development consultation' },
      { userId: 4, type: TransactionType.EARN, amount: 8, description: 'Earned from Web Development consultation' },
      { userId: 11, type: TransactionType.TOPUP, amount: 40, description: 'Credit card top-up' }
    ];

    for (const txData of transactionData) {
      if (createdUsers[txData.userId]) {
        const transaction = new TimeTransaction();
        transaction.user = createdUsers[txData.userId];
        transaction.type = txData.type;
        transaction.amount = txData.amount;
        transaction.balanceBefore = createdUsers[txData.userId].time_credits;
        transaction.balanceAfter = txData.type === TransactionType.SPEND
          ? createdUsers[txData.userId].time_credits - txData.amount
          : createdUsers[txData.userId].time_credits + txData.amount;
        transaction.status = TransactionStatus.COMPLETED;
        transaction.description = txData.description;
        transaction.transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await transactionRepository.save(transaction);
      }
    }

    console.log(`💳 Created ${transactionData.length} sample transactions`);
    console.log('🎉 User seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

export { seedUsers };
