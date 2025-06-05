import React, { useState, useEffect } from 'react';

const SearchFilters = ({ 
  searchTerm, 
  searchType, 
  isSearching, 
  onSearchTermChange, 
  onSearchTypeChange, 
  onSearch 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/skills/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onSearch(e);
  };

  const handleClearFilters = () => {
    onSearchTermChange('');
    onSearchTypeChange('both');
    setSelectedCategory('');
    setProficiencyLevel('');
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
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Discover Skills & Connect</h2>
      
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

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Search Skills
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="e.g., JavaScript, Cooking, Yoga..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="both">Teaching & Learning</option>
              <option value="offer">Teaching Only</option>
              <option value="seek">Learning Only</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Level
            </label>
            <select
              id="proficiency"
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end space-x-3">
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
            >
              {isSearching ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {searchTerm && !isSearching && (
        <div className="mt-4 text-sm text-gray-600">
          <span>Press "Search" to find users with "{searchTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;