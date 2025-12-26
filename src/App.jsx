import { Routes, Route } from 'react-router'; 
import { useContext } from 'react';
import { UserContext } from './contexts/UserContext';

import './index.css';

import NavBar from './components/NavBar/NavBar';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import AvailableCars from './components/AvailableCars/AvailableCars';
import CarDetails from './components/CarDetails/CarDetails'; 
import ListingForm from './components/ListingForm/ListingForm';

const App = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="app-wrapper">
      <NavBar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          {!user ? (
            <Route path='/' element={<Landing />} />
          ) : (
            <Route path='/' element={<Dashboard />} />
          )}
          
          <Route path='/listings' element={<AvailableCars />} />
          <Route path='/listings/:id' element={<CarDetails />} /> 
          <Route path='/sign-up' element={<SignUpForm />} />
          <Route path='/sign-in' element={<SignInForm />} />

          {/* Authenticated User Routes */}
          {user && (
            <>
              <Route path='/favs' element={<h1>Favorites</h1>} />
              <Route path='/profile' element={<h1>{user.username}</h1>} />
            </>
          )}

          {/* Admin Specific Routes */}
          {user && user.role === 'admin' && (
            <>
              <Route path='/listings/new' element={<ListingForm />} />
              <Route path='/listings/:id/edit' element={<ListingForm />} /> 
            </>
          )}

          {/* Fallback for unauthorized access or 404 */}
          <Route path='*' element={<h1>Page Not Found</h1>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;