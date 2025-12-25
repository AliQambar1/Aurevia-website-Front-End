import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../../contexts/UserContext';
import StaggeredMenu from './StaggeredMenu';
import { getAvailableCount } from '../../services/listingService';
import logoImg from "../../assets/logo.png"; 

const NavBar = () => {
  const { user, handleSignout } = useContext(UserContext); 
  const [availableCount, setAvailableCount] = useState(0);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchAvailableCount = useCallback(async () => {
    try {
      const count = await getAvailableCount();
      setAvailableCount(count);
    } catch (error) {
      setAvailableCount(0); 
    }
  }, []);

  useEffect(() => {
    fetchAvailableCount();
    
    // Refresh count periodically (e.g., every 60 seconds)
    const interval = setInterval(fetchAvailableCount, 60000);
    return () => clearInterval(interval);
  }, [fetchAvailableCount, user]);

  // Construct menu items dynamically based on authentication state and role
  const getMenuItems = () => {
    if (!user) {
      // Guest Menu
      return [
        { label: 'Sign In', ariaLabel: 'Sign in', link: '/sign-in' },
        { label: 'Sign Up', ariaLabel: 'Create account', link: '/sign-up' },
      ];
    }

    // Authenticated Menu
    const items = [
      { 
        label: `Cars ${availableCount > 0 ? `(${availableCount})` : ''}`, 
        ariaLabel: 'View cars', 
        link: '/listings' 
      }
    ];

    // Admin-specific items
    if (user.role === 'admin') {
      items.push({ label: 'Add New Car', ariaLabel: 'Add car', link: '/listings/new' });
    }

    // Sign out is always at the bottom
    items.push({ label: 'Sign Out', ariaLabel: 'Logout', link: '#', onClick: handleSignout });
    
    return items;
  };

  return (
    <nav>
      <StaggeredMenu
        position="right"
        colors={['#000000', '#1a1a1a']} 
        items={getMenuItems()}
        displaySocials={false} 
        logoUrl={logoImg} 
        menuButtonColor="#000000" 
        openMenuButtonColor="#000000"
        accentColor="#000000" 
        isFixed={true}
      />
    </nav>
  );
};

export default NavBar;