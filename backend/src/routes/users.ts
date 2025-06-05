import { Router } from 'express';
import { UserService } from '../services/UserService';
import { SkillService } from '../services/SkillService';
import { validationMiddleware } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimitConfig } from '../middleware/security';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dto/UserDTO';
import { CreateUserSkillDTO } from '../dto/UserSkillDTO';
import { CreateSkillExchangeRequestDTO, UpdateSkillExchangeRequestDTO } from '../dto/SkillExchangeRequestDTO';

const router = Router();
const userService = new UserService();
const skillService = new SkillService();

// User Login
router.post('/login', 
  authRateLimitConfig,
  validationMiddleware(LoginUserDTO),
  asyncHandler(async (req, res) => {
    const user = await userService.loginUser(req.body);
    res.json(user);
  })
);

// User Registration
router.post('/', 
  authRateLimitConfig,
  validationMiddleware(CreateUserDTO),
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  })
);

// Get all users
router.get('/', 
  asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
  })
);

// Get user by ID
router.get('/:userId',
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await userService.getUserById(userId);
    res.json(user);
  })
);

// Update user profile
router.put('/:userId',
  validationMiddleware(UpdateUserDTO),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await userService.updateUser(userId, req.body);
    res.json(user);
  })
);

// Get user skills
router.get('/:userId/skills',
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const skills = await skillService.getUserSkills(userId);
    
    // Transform to match frontend expectations
    const transformedSkills = skills.map(userSkill => ({
      id: userSkill.id,
      skill_id: userSkill.skill.id,
      skill_name: userSkill.skill.name,
      skill_description: userSkill.skill.description,
      type: userSkill.type,
      proficiency_level: userSkill.proficiency_level,
      years_experience: userSkill.years_experience,
      description: userSkill.description,
      category_name: userSkill.skill.category?.name
    }));
    
    res.json(transformedSkills);
  })
);

// Add skill to user
router.post('/:userId/skills',
  validationMiddleware(CreateUserSkillDTO),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userSkill = await skillService.addUserSkill(userId, req.body);
    res.status(201).json(userSkill);
  })
);

// Search users by skill
router.get('/search/by-skill',
  asyncHandler(async (req, res) => {
    const { skillName, type } = req.query;
    
    if (!skillName || typeof skillName !== 'string') {
      return res.status(400).json({ error: 'skillName query parameter is required' });
    }
    
    if (type && typeof type === 'string' && type !== 'offer' && type !== 'seek') {
      return res.status(400).json({ error: "Optional type parameter must be 'offer' or 'seek'" });
    }
    
    const results = await skillService.searchUsersBySkill(skillName, type as string);
    res.json(results);
  })
);

// Exchange request endpoints would go here
// For now, keeping them simple without full implementation
router.post('/:userId/exchange-requests',
  validationMiddleware(CreateSkillExchangeRequestDTO),
  asyncHandler(async (req, res) => {
    // TODO: Implement with ExchangeRequestService
    res.status(501).json({ error: 'Exchange requests not implemented yet' });
  })
);

router.get('/:userId/exchange-requests',
  asyncHandler(async (req, res) => {
    // TODO: Implement with ExchangeRequestService
    res.status(501).json({ error: 'Exchange requests not implemented yet' });
  })
);

router.put('/:userId/exchange-requests/:requestId',
  validationMiddleware(UpdateSkillExchangeRequestDTO),
  asyncHandler(async (req, res) => {
    // TODO: Implement with ExchangeRequestService
    res.status(501).json({ error: 'Exchange requests not implemented yet' });
  })
);

export default router;