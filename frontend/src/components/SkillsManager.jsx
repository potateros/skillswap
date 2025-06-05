import React, { useState, useEffect } from 'react';

const SkillsManager = ({ userId, userSkills, onSkillAdded, onClose }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    skillId: '',
    type: 'offer',
    proficiencyLevel: 'intermediate',
    yearsExperience: 1,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkillsAndCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredSkills(allSkills.filter(skill => skill.category_id === parseInt(selectedCategory)));
    } else {
      setFilteredSkills(allSkills);
    }
  }, [selectedCategory, allSkills]);

  const fetchSkillsAndCategories = async () => {
    try {
      const [skillsRes, categoriesRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/skills/categories')
      ]);
      
      if (skillsRes.ok && categoriesRes.ok) {
        const skillsData = await skillsRes.json();
        const categoriesData = await categoriesRes.json();
        setAllSkills(skillsData);
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching skills and categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.skillId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const selectedSkill = allSkills.find(s => s.id === parseInt(newSkill.skillId));
      const response = await fetch(`/api/users/${userId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillName: selectedSkill.name,
          type: newSkill.type,
          proficiencyLevel: newSkill.type === 'offer' ? newSkill.proficiencyLevel : null,
          yearsExperience: newSkill.type === 'offer' ? newSkill.yearsExperience : null,
          description: newSkill.description
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSkillAdded(result);
        setNewSkill({
          skillId: '',
          type: 'offer',
          proficiencyLevel: 'intermediate',
          yearsExperience: 1,
          description: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add skill');
      }
    } catch (err) {
      setError('Failed to add skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setNewSkill(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const userSkillIds = new Set(userSkills?.map(skill => skill.skill_id) || []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Your Skills</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill *
              </label>
              <select
                name="skillId"
                value={newSkill.skillId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a skill...</option>
                {filteredSkills.map(skill => (
                  <option 
                    key={skill.id} 
                    value={skill.id}
                    disabled={userSkillIds.has(skill.id)}
                  >
                    {skill.name} {userSkillIds.has(skill.id) ? '(Already added)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={newSkill.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="offer">I can teach this</option>
                <option value="seek">I want to learn this</option>
              </select>
            </div>

            {newSkill.type === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  name="proficiencyLevel"
                  value={newSkill.proficiencyLevel}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            )}
          </div>

          {newSkill.type === 'offer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsExperience"
                value={newSkill.yearsExperience}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={newSkill.description}
              onChange={handleChange}
              placeholder={newSkill.type === 'offer' ? 
                'Describe your experience and what you can teach...' : 
                'What specifically would you like to learn?'
              }
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newSkill.skillId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Adding...' : 'Add Skill'}
          </button>
        </form>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Your Current Skills</h3>
          {userSkills && userSkills.length > 0 ? (
            <div className="space-y-2">
              {userSkills.map(skill => (
                <div key={skill.id} className={`p-3 rounded-lg border ${
                  skill.type === 'offer' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{skill.skill_name}</span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        skill.type === 'offer' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {skill.type === 'offer' ? 'Teaching' : 'Learning'}
                      </span>
                      {skill.proficiency_level && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {skill.proficiency_level}
                        </span>
                      )}
                      {skill.years_experience && (
                        <span className="ml-2 text-xs text-gray-600">
                          {skill.years_experience}y exp
                        </span>
                      )}
                    </div>
                  </div>
                  {skill.description && (
                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No skills added yet. Add your first skill above!</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;