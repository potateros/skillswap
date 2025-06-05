import { Router } from 'express';
import { SkillService } from '../services/SkillService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const skillService = new SkillService();

// Get all skills
router.get('/', 
  asyncHandler(async (req, res) => {
    const skills = await skillService.getAllSkills();
    
    // Transform to match frontend expectations
    const transformedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      created_at: skill.created_at,
      category_id: skill.category?.id,
      category_name: skill.category?.name
    }));
    
    res.json(transformedSkills);
  })
);

// Get all skill categories
router.get('/categories',
  asyncHandler(async (req, res) => {
    const categories = await skillService.getAllCategories();
    res.json(categories);
  })
);

// Get skills by category
router.get('/by-category/:categoryId',
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const skills = await skillService.getSkillsByCategory(categoryId);
    
    // Transform to match frontend expectations
    const transformedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category_name: skill.category?.name
    }));
    
    res.json(transformedSkills);
  })
);

// Create new skill - simplified for now
router.post('/',
  asyncHandler(async (req, res) => {
    // TODO: Implement proper skill creation with validation
    res.status(501).json({ error: 'Skill creation not implemented yet' });
  })
);

// Create new skill category - simplified for now
router.post('/categories',
  asyncHandler(async (req, res) => {
    // TODO: Implement proper category creation with validation
    res.status(501).json({ error: 'Category creation not implemented yet' });
  })
);

export default router;