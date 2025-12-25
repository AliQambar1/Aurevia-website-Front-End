// src/contexts/UserContext.jsx

import { createContext, useState } from 'react';
import { useNavigate } from 'react-router';

const UserContext = createContext();

function UserProvider({ children }) {
  const navigate = useNavigate();

  const getUserFromToken = () => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

  // Create state just like you normally would in any other component
  const [user, setUser] = useState(getUserFromToken());

  // ✅ Add handleSignout function
  const handleSignout = () => {
    // 1. Remove token from localStorage
    localStorage.removeItem('token');
    
    // 2. Clear user state
    setUser(null);
    
    // 3. Navigate to home page
    navigate('/');
  };

  const value = { user, setUser, handleSignout };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// When components need to use the value of the user context, they will need
// access to the UserContext object to know which context to access.
// Therefore, we export it here.
export { UserProvider, UserContext };