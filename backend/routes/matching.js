const express = require('express');
const { MatchingService } = require('../src/services/MatchingService');

const router = express.Router();
const matchingService = new MatchingService();

// Find matches for a user
router.get('/find/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const skillName = req.query.skill;
    const skillType = req.query.type;
    const minRating = req.query.min_rating ? parseFloat(req.query.min_rating) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const matches = await matchingService.findMatches({
      userId,
      skillName,
      skillType,
      minRating,
      limit
    });
    
    const formattedMatches = matches.map(match => ({
      user: {
        id: match.user.id,
        name: match.user.name,
        bio: match.user.bio,
        location: match.user.location,
        time_credits: match.user.time_credits
      },
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      commonSkills: match.commonSkills,
      complementarySkills: match.complementarySkills,
      rating: match.rating,
      reviewCount: match.reviewCount
    }));
    
    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get skill recommendations for a user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const recommendations = await matchingService.getSkillRecommendations(userId);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting skill recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;