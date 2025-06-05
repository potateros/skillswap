import React, { useState, useEffect } from 'react';

const ReviewsManager = ({ currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'given'
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    revieweeId: '',
    type: 'teacher_review',
    rating: 5,
    comment: '',
    skillName: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchReviews();
      fetchReviewStats();
    }
  }, [currentUser, activeTab]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/user/${currentUser.id}?as_reviewee=${activeTab === 'received'}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats/${currentUser.id}`);
      const data = await response.json();
      setReviewStats(data.stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleWriteReview = async () => {
    if (!newReview.revieweeId || !newReview.rating) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerId: currentUser.id,
          ...newReview
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Review submitted successfully!');
        setShowWriteReview(false);
        setNewReview({
          revieweeId: '',
          type: 'teacher_review',
          rating: 5,
          comment: '',
          skillName: ''
        });
        fetchReviews();
        fetchReviewStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };

  const renderRatingStars = (rating, onChange) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        className={`text-2xl hover:text-yellow-400 transition-colors ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </button>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
        <button
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Write Review
        </button>
      </div>

      {/* Review Stats */}
      {reviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reviewStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Overall Rating</div>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{reviewStats.asTeacher.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">As Teacher</div>
            <div className="text-xs text-gray-500">{reviewStats.asTeacher.totalReviews} reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{reviewStats.asStudent.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">As Student</div>
            <div className="text-xs text-gray-500">{reviewStats.asStudent.totalReviews} reviews</div>
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID to Review
              </label>
              <input
                type="number"
                value={newReview.revieweeId}
                onChange={(e) => setNewReview({...newReview, revieweeId: e.target.value})}
                placeholder="Enter user ID"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Type
              </label>
              <select
                value={newReview.type}
                onChange={(e) => setNewReview({...newReview, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="teacher_review">Teacher Review</option>
                <option value="student_review">Student Review</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Name (Optional)
            </label>
            <input
              type="text"
              value={newReview.skillName}
              onChange={(e) => setNewReview({...newReview, skillName: e.target.value})}
              placeholder="e.g., JavaScript, Piano, Yoga"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {renderRatingStars(newReview.rating, (rating) => setNewReview({...newReview, rating}))}
              <span className="ml-2 text-sm text-gray-600">({newReview.rating}/5)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              placeholder="Share your experience..."
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWriteReview}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowWriteReview(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'received'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews About Me ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'given'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews I've Written
        </button>
      </div>

      {/* Reviews List */}
      <div>
        {reviews.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {activeTab === 'received' 
              ? "No reviews received yet. Start teaching skills to get reviews!"
              : "You haven't written any reviews yet. Share your learning experiences!"
            }
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-800">
                      {activeTab === 'received' ? review.reviewer.name : review.reviewee.name}
                    </div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {review.type === 'teacher_review' ? 'Teacher' : 'Student'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </div>
                </div>
                
                {review.skillName && (
                  <div className="text-sm text-gray-600 mb-2">
                    Skill: <span className="font-medium">{review.skillName}</span>
                  </div>
                )}
                
                {review.comment && (
                  <div className="text-gray-700">
                    {review.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;