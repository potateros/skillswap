import React, { useState, useEffect } from 'react';
import UserCard from './UserCard';

const SmartMatching = ({ currentUser, onSendRequest }) => {
  const [matches, setMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skillName: '',
    skillType: '',
    minRating: ''
  });

  useEffect(() => {
    if (currentUser) {
      findMatches();
      getRecommendations();
    }
  }, [currentUser]);

  const findMatches = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.skillName) queryParams.append('skill', filters.skillName);
      if (filters.skillType) queryParams.append('type', filters.skillType);
      if (filters.minRating) queryParams.append('min_rating', filters.minRating);
      queryParams.append('limit', '10');

      const response = await fetch(`/api/matching/find/${currentUser.id}?${queryParams}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    try {
      const response = await fetch(`/api/matching/recommendations/${currentUser.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setLoading(true);
    findMatches();
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Matching Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">AI-Powered Matching</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Smart algorithm active</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Filter
            </label>
            <input
              type="text"
              value={filters.skillName}
              onChange={(e) => handleFilterChange('skillName', e.target.value)}
              placeholder="e.g., JavaScript, Piano"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Type
            </label>
            <select
              value={filters.skillType}
              onChange={(e) => handleFilterChange('skillType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="offer">Skills They Teach</option>
              <option value="seek">Skills They Learn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Find Matches
            </button>
          </div>
        </div>

        {/* Skill Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💡 Recommended Skills for You
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange('skillName', skill)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Matches Results */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Your Best Matches ({matches.length})
          </h3>
          
          {matches.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <div>No matches found with current filters.</div>
              <div className="text-sm mt-1">Try adjusting your search criteria or explore recommended skills.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <div key={match.user.id} className="relative">
                  {/* Match Score Badge */}
                  <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}% Match
                  </div>
                  
                  {/* Enhanced User Card */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.user.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{match.user.name}</h3>
                        <div className="text-sm text-gray-600">{match.user.location}</div>
                        {match.rating > 0 && (
                          <div className="flex items-center space-x-1 text-sm">
                            <span className="text-yellow-400">⭐</span>
                            <span>{match.rating}</span>
                            <span className="text-gray-500">({match.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {match.user.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {match.user.bio}
                      </p>
                    )}

                    {/* Match Reasons */}
                    {match.matchReasons.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Why it's a good match:</div>
                        <ul className="text-xs space-y-1">
                          {match.matchReasons.slice(0, 3).map((reason, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span className="text-gray-600">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills Preview */}
                    <div className="mb-3">
                      {match.complementarySkills.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-green-700 mb-1">Perfect Skill Match:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.complementarySkills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.commonSkills.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-blue-700 mb-1">Shared Interests:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.commonSkills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Credits */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Credits: {match.user.time_credits}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onSendRequest && onSendRequest(match.user)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Connect & Exchange Skills
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMatching;