import React, { useState } from 'react';

const UserCard = ({ user, onConnect, currentUserId }) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [message, setMessage] = useState('');

  const handleConnect = () => {
    if (!selectedSkill) return;
    onConnect(user.id, selectedSkill, message);
    setShowConnectModal(false);
    setMessage('');
    setSelectedSkill('');
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-purple-100 text-purple-700';
      case 'expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white font-bold mr-4">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{user.name || 'Unnamed User'}</h2>
            <p className="text-sm text-gray-600">{user.location || 'Location not specified'}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {user.time_credits || 0} credits
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{user.bio || 'No bio provided'}</p>

        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">OFFERING</p>
            <p className="text-lg font-bold text-green-700">{user.skills_offer?.length || 0}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600 font-medium">SEEKING</p>
            <p className="text-lg font-bold text-orange-700">{user.skills_seek?.length || 0}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h3>
            {user.skills_offer && user.skills_offer.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.skills_offer.slice(0, 3).map(skill => (
                  <span 
                    key={`${skill.skill_id || skill.skill_name}-offer-${user.id}`}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${skill.proficiency_level ? getProficiencyColor(skill.proficiency_level) : 'bg-green-100 text-green-700'}`}
                  >
                    {skill.skill_name}
                    {skill.proficiency_level && ` (${skill.proficiency_level})`}
                  </span>
                ))}
                {user.skills_offer.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.skills_offer.length - 3} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills offered</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Sought:</h3>
            {user.skills_seek && user.skills_seek.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.skills_seek.slice(0, 3).map(skill => (
                  <span 
                    key={`${skill.skill_id || skill.skill_name}-seek-${user.id}`}
                    className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {skill.skill_name}
                  </span>
                ))}
                {user.skills_seek.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.skills_seek.length - 3} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills sought</p>
            )}
          </div>
        </div>

        {currentUserId && currentUserId !== user.id && user.skills_offer?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Request Skill Exchange
            </button>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Request Skill Exchange with {user.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which skill would you like to learn?
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a skill...</option>
                {user.skills_offer?.map(skill => (
                  <option key={skill.skill_id} value={skill.skill_id}>
                    {skill.skill_name} {skill.proficiency_level && `(${skill.proficiency_level})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you're interested or what you can offer in return..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!selectedSkill}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserCard;