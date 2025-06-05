import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { SkillService } from '../services/SkillService';
import { ExchangeRequestService } from '../services/ExchangeRequestService';
import { validationMiddleware } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimitConfig } from '../middleware/security';
import { createSession, destroySession } from '../middleware/auth';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dto/UserDTO';
import { CreateUserSkillDTO } from '../dto/UserSkillDTO';
import { CreateSkillExchangeRequestDTO, UpdateSkillExchangeRequestDTO } from '../dto/SkillExchangeRequestDTO';

const router = Router();
const userService = new UserService();
const skillService = new SkillService();
const exchangeRequestService = new ExchangeRequestService();

// User Login
router.post('/login', 
  authRateLimitConfig,
  validationMiddleware(LoginUserDTO),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.loginUser(req.body);
    
    // Create session and set cookie
    const sessionId = createSession(user.id);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json(user);
  })
);

// User Registration
router.post('/', 
  authRateLimitConfig,
  validationMiddleware(CreateUserDTO),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    
    // Create session and set cookie for new users
    const sessionId = createSession(user.id);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json(user);
  })
);

// Get current user
router.get('/me',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
  })
);

// User Logout
router.post('/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      destroySession(sessionId);
      res.clearCookie('sessionId');
    }
    res.json({ message: 'Logged out successfully' });
  })
);

// Get all users
router.get('/', 
  asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(users);
  })
);

// Get all users with their skills (optimized endpoint)
router.get('/with-skills', 
  asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsersWithSkills();
    res.json(users);
  })
);

// Get user by ID
router.get('/:userId',
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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

// Create skill exchange request
router.post('/:userId/exchange-requests',
  validationMiddleware(CreateSkillExchangeRequestDTO),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const exchangeRequest = await exchangeRequestService.createExchangeRequest(userIdInt, req.body);
    res.status(201).json(exchangeRequest);
  })
);

// Get exchange requests for a user
router.get('/:userId/exchange-requests',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { type } = req.query; // 'sent' or 'received'

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const requests = await exchangeRequestService.getExchangeRequests(
      userIdInt, 
      type as 'sent' | 'received' | undefined
    );
    res.json(requests);
  })
);

// Update exchange request status
router.put('/:userId/exchange-requests/:requestId',
  validationMiddleware(UpdateSkillExchangeRequestDTO),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, requestId } = req.params;
    const userIdInt = parseInt(userId);
    const requestIdInt = parseInt(requestId);
    
    if (isNaN(userIdInt) || isNaN(requestIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID or request ID' });
    }

    const updatedRequest = await exchangeRequestService.updateExchangeRequest(
      requestIdInt, 
      userIdInt, 
      req.body
    );
    res.json(updatedRequest);
  })
);

export default router;