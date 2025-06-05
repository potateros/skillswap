const express = require('express');
const { ReviewService } = require('../src/services/ReviewService');

const router = express.Router();
const reviewService = new ReviewService();

// Create a review
router.post('/', async (req, res) => {
  try {
    const { reviewerId, revieweeId, type, rating, comment, skillName } = req.body;

    // Validate input
    if (!reviewerId || !revieweeId || !type || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['teacher_review', 'student_review'].includes(type)) {
      return res.status(400).json({ error: 'Invalid review type' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await reviewService.createReview({
      reviewerId,
      revieweeId,
      type,
      rating,
      comment,
      skillName
    });
    
    res.status(201).json({ 
      success: true, 
      review: {
        id: review.id,
        type: review.type,
        rating: review.rating,
        comment: review.comment,
        skillName: review.skillName,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const asReviewee = req.query.as_reviewee !== 'false'; // Default to true
    
    const reviews = await reviewService.getUserReviews(userId, asReviewee);
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      type: review.type,
      rating: review.rating,
      comment: review.comment,
      skillName: review.skillName,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name
      },
      reviewee: {
        id: review.reviewee.id,
        name: review.reviewee.name
      }
    }));
    
    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get review statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const stats = await reviewService.getReviewStats(userId);
    
    res.json({ stats });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a specific skill
router.get('/skill/:skillName', async (req, res) => {
  try {
    const skillName = req.params.skillName;
    const type = req.query.type; // Optional filter by type
    
    const reviews = await reviewService.getSkillReviews(skillName, type);
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      type: review.type,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name
      },
      reviewee: {
        id: review.reviewee.id,
        name: review.reviewee.name
      }
    }));
    
    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error getting skill reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hide a review (only by reviewee)
router.patch('/:reviewId/hide', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await reviewService.hideReview(reviewId, userId);
    
    res.json({ success: true, message: 'Review hidden successfully' });
  } catch (error) {
    console.error('Error hiding review:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;