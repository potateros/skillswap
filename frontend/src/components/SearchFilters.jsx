import React from 'react';

const SearchFilters = ({ 
  searchTerm, 
  searchType, 
  isSearching, 
  onSearchTermChange, 
  onSearchTypeChange, 
  onSearch 
}) => {
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onSearch(e);
  };

  const handleClearFilters = () => {
    onSearchTermChange('');
    onSearchTypeChange('both');
  };

  const featuredSkills = [
    'JavaScript', 'Python', 'React', 'Cooking', 'Yoga', 
    'Graphic Design', 'Piano Playing', 'Spanish', 'Photography'
  ];

  const handleFeaturedSkillClick = (skill) => {
    onSearchTermChange(skill);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Skills & Connect</h2>
      
      {/* Featured Skills */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Popular Skills</h3>
        <div className="flex flex-wrap gap-2">
          {featuredSkills.map(skill => (
            <button
              key={skill}
              onClick={() => handleFeaturedSkillClick(skill)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Simplified Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search for a skill (e.g., JavaScript, Cooking, Yoga)..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          <div className="w-48">
            <select
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="both">All</option>
              <option value="offer">Teachers</option>
              <option value="seek">Learners</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;