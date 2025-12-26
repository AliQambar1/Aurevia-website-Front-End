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
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('🔑 Decoded token:', decoded);
      
      
      return {
        id: parseInt(decoded.sub), //  Convert string to number
        role: decoded.role,
        username: decoded.username || `User ${decoded.sub}`, // Fallback if no username
        email: decoded.email
      };
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

  // Create state just like you normally would in any other component
  const [user, setUser] = useState(getUserFromToken());

  // Add handleSignout function
  const handleSignout = () => {
    // 1. Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear user state
    setUser(null);
    
    //  Navigate to home page
    navigate('/');
  };

  // Include handleSignout in the context value
  const value = { user, setUser, handleSignout };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}


export { UserProvider, UserContext };