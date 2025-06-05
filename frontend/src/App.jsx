import React, { useState, useEffect } from 'react';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import SkillsManager from './components/SkillsManager';
import UserCard from './components/UserCard';
import SearchFilters from './components/SearchFilters';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('both');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSkillsManager, setShowSkillsManager] = useState(false);
  const [currentUserSkills, setCurrentUserSkills] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'profile', 'requests'
  const [userRequests, setUserRequests] = useState([]);
  const API_BASE_URL = '/api';

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const processSearchResults = (results) => {
    if (!results || results.length === 0) {
      return [];
    }
    const usersMap = new Map();
    results.forEach(result => {
      if (!usersMap.has(result.user_id)) {
        usersMap.set(result.user_id, {
          id: result.user_id,
          name: result.user_name,
          email: result.email,
          bio: result.user_bio || '',
          location: result.location || '',
          time_credits: result.time_credits || 0,
          skills_offer: [],
          skills_seek: [],
        });
      }
      const user = usersMap.get(result.user_id);
      if (result.skill_type === 'offer') {
        user.skills_offer.push({ 
          skill_name: result.skill_name, 
          skill_id: result.skill_id,
          proficiency_level: result.proficiency_level,
          years_experience: result.years_experience
        });
      } else if (result.skill_type === 'seek') {
        user.skills_seek.push({ 
          skill_name: result.skill_name, 
          skill_id: result.skill_id 
        });
      }
    });
    return Array.from(usersMap.values());
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    setSearchResults(null);
    try {
      let url = `${API_BASE_URL}/users/search/by-skill?skillName=${encodeURIComponent(searchTerm.trim())}`;
      if (searchType !== 'both') {
        url += `&type=${searchType}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      const data = await response.json();
      setSearchResults(processSearchResults(data));
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
      showNotification('Search failed. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchUsersWithSkills = async () => {
    try {
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      if (!usersResponse.ok) throw new Error(`Failed to fetch users: ${usersResponse.status}`);
      const usersData = await usersResponse.json();

      const usersWithSkills = await Promise.all(
        usersData.map(async (user) => {
          const skillsResponse = await fetch(`${API_BASE_URL}/users/${user.id}/skills`);
          if (!skillsResponse.ok) {
            console.error(`Failed to fetch skills for user ${user.id}: ${skillsResponse.status}`);
            return { ...user, skills_offer: [], skills_seek: [] };
          }
          const skillsData = await skillsResponse.json();
          const skills_offer = skillsData.filter(s => s.type === 'offer');
          const skills_seek = skillsData.filter(s => s.type === 'seek');
          return { ...user, skills_offer, skills_seek };
        })
      );
      setUsers(usersWithSkills);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification('Failed to load users. Please refresh the page.', 'error');
    }
  };

  const fetchCurrentUserSkills = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/skills`);
      if (response.ok) {
        const skills = await response.json();
        setCurrentUserSkills(skills);
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  const fetchUserRequests = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/exchange-requests`);
      if (response.ok) {
        const requests = await response.json();
        setUserRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await fetchUsersWithSkills();
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCurrentUserSkills(currentUser.id);
      fetchUserRequests(currentUser.id);
    }
  }, [currentUser]);

  const handleUserRegistration = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setCurrentUser(newUser);
        setShowRegistration(false);
        showNotification(`Welcome to SkillSwap, ${newUser.name}!`);
        await fetchUsersWithSkills();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUserLogin = async (loginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setShowLogin(false);
        showNotification(`Welcome back, ${user.name}!`);
        await fetchUsersWithSkills();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSkillAdded = async (skill) => {
    await fetchCurrentUserSkills(currentUser.id);
    await fetchUsersWithSkills();
    showNotification('Skill added successfully!');
  };

  const handleConnect = async (providerId, skillId, message) => {
    if (!currentUser) {
      showNotification('Please register to connect with other users.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/exchange-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: providerId,
          skillRequestedId: skillId,
          message: message
        }),
      });

      if (response.ok) {
        showNotification('Connection request sent successfully!');
        await fetchUserRequests(currentUser.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send request');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleRequestUpdate = async (requestId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/exchange-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        showNotification(`Request ${status} successfully!`);
        await fetchUserRequests(currentUser.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading SkillSwap...</p>
        </div>
      </div>
    );
  }

  const usersToDisplay = searchResults !== null ? searchResults : users;
  const displayMessage = searchResults !== null && searchResults.length === 0 ? "No users found matching your search." : "No users found.";
  const featuredSkills = ['JavaScript', 'Cooking', 'Yoga', 'Graphic Design', 'Python'];

  const handleFeaturedSkillClick = (skill) => {
    setSearchTerm(skill);
    setActiveTab('discover');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-blue-600">SkillSwap</h1>
              <p className="text-gray-600 hidden md:block">Connect, Learn, and Share Skills</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{currentUser.name}</p>
                    <p className="text-sm text-gray-600">{currentUser.time_credits} credits</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowRegistration(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Join SkillSwap
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          {currentUser && (
            <nav className="mt-4 border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discover'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'requests'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Requests ({userRequests.length})
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section for Non-Users */}
        {!currentUser && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Share Skills, Build Community</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with people in your community to teach and learn new skills. 
              From coding to cooking, yoga to languages - there's always someone to learn from.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {(!currentUser || activeTab === 'discover') && (
          <>
            {/* Featured Skills */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Popular Skills</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {featuredSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleFeaturedSkillClick(skill)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-full font-medium transition-colors duration-200"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <SearchFilters
              searchTerm={searchTerm}
              searchType={searchType}
              isSearching={isSearching}
              onSearchTermChange={setSearchTerm}
              onSearchTypeChange={setSearchType}
              onSearch={handleSearch}
            />

            {/* Users Grid */}
            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching users...</p>
              </div>
            ) : usersToDisplay.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{displayMessage}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersToDisplay.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Profile Tab */}
        {currentUser && activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                  <p className="text-gray-600">{currentUser.email}</p>
                  <p className="text-gray-600">{currentUser.location}</p>
                  <p className="text-sm text-gray-500 mt-2">{currentUser.bio}</p>
                </div>
                <button
                  onClick={() => setShowSkillsManager(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Manage Skills
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Skills I Offer ({currentUserSkills.filter(s => s.type === 'offer').length})</h3>
                  <div className="space-y-2">
                    {currentUserSkills.filter(s => s.type === 'offer').map(skill => (
                      <div key={skill.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-green-800">{skill.skill_name}</span>
                          <div className="flex flex-wrap gap-1">
                            {skill.proficiency_level && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {skill.proficiency_level}
                              </span>
                            )}
                            {skill.years_experience && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {skill.years_experience}y
                              </span>
                            )}
                          </div>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-green-700 mt-1">{skill.description}</p>
                        )}
                      </div>
                    ))}
                    {currentUserSkills.filter(s => s.type === 'offer').length === 0 && (
                      <p className="text-gray-500 italic">No skills offered yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-3">Skills I Want to Learn ({currentUserSkills.filter(s => s.type === 'seek').length})</h3>
                  <div className="space-y-2">
                    {currentUserSkills.filter(s => s.type === 'seek').map(skill => (
                      <div key={skill.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <span className="font-medium text-orange-800">{skill.skill_name}</span>
                        {skill.description && (
                          <p className="text-sm text-orange-700 mt-1">{skill.description}</p>
                        )}
                      </div>
                    ))}
                    {currentUserSkills.filter(s => s.type === 'seek').length === 0 && (
                      <p className="text-gray-500 italic">No skills sought yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {currentUser && activeTab === 'requests' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Exchange Requests</h2>
            
            {userRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No skill exchange requests yet.</p>
                <p className="text-gray-400 text-sm mt-2">Connect with other users to start exchanging skills!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {request.request_type === 'sent' ? 'Request to' : 'Request from'} {request.other_user_name}
                        </h3>
                        <p className="text-sm text-gray-600">{request.other_user_email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        request.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Skill:</strong> {request.skill_requested_name}
                      </p>
                      {request.skill_offered_name && (
                        <p className="text-sm text-gray-700">
                          <strong>In exchange for:</strong> {request.skill_offered_name}
                        </p>
                      )}
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Message:</strong> {request.message}
                        </p>
                      )}
                    </div>

                    {request.request_type === 'received' && request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRequestUpdate(request.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestUpdate(request.id, 'declined')}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showLogin && (
        <UserLogin
          onLogin={handleUserLogin}
          onCancel={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegistration(true);
          }}
        />
      )}

      {showRegistration && (
        <UserRegistration
          onRegister={handleUserRegistration}
          onCancel={() => setShowRegistration(false)}
        />
      )}

      {showSkillsManager && currentUser && (
        <SkillsManager
          userId={currentUser.id}
          userSkills={currentUserSkills}
          onSkillAdded={handleSkillAdded}
          onClose={() => setShowSkillsManager(false)}
        />
      )}
    </div>
  );
}

export default App;
