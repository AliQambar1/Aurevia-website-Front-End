// src/App.jsx

import { Routes, Route } from 'react-router'; // Import React Router
import { useContext } from 'react';
import { UserContext } from './contexts/UserContext';

// Import Layout Components
import NavBar from './components/NavBar/NavBar';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';

// Import Auth Components
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';

// Import Feature Components
import ListingsList from './components/ListingsList/ListingsList'; // NEW: Imported the listings gallery

const App = () => {
  const { user } = useContext(UserContext);

  return (
    <>
      <NavBar />

      <Routes>
        {
          user ?
          // Routes accessible only to logged-in users
          <>
            <Route path='/' element={<Dashboard/>}/>
            
            {/* NEW: Replaced placeholder '/products' with the actual Listings gallery */}
            <Route path='/listings' element={<ListingsList />}/> 
            
            <Route path='/favs' element={<h1>Favorites</h1>}/>
            <Route path='/profile' element={<h1>{user.username}</h1>}/>
            <Route path='/orders' element={<h1>ORDERS</h1>}/>
          </>
          :
          // Routes for guests (not logged in)
          <Route path='/' element={<Landing/>}/>
        }
        
        {/* Public Routes */}
        <Route path='/sign-up' element={<SignUpForm />} />
        <Route path='/sign-in' element={<SignInForm />} />
      </Routes>
    </>
  );
};

export default App;