import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import ListingForm from '../ListingForm/ListingForm';

const Dashboard = () => {
  // Access the logged-in user from context
  const { user } = useContext(UserContext);
  // State to toggle the visibility of the Add Listing form
  const [showForm, setShowForm] = useState(false);

  return (
    <main style={{ padding: '20px' }}>
      <h1>Welcome, {user?.username}</h1>
      <p>Manage your car inventory and view user activity here.</p>

      <hr />

      {/* Only show administrative actions if the user role is 'admin' */}
      {user?.role === 'admin' ? (
        <section style={{ marginTop: '20px' }}>
          <h3>Admin Panel</h3>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : 'Add New Car Listing'}
          </button>

          {/* Render the form only when showForm is true */}
          {showForm && (
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px' }}>
              <ListingForm onSuccess={() => setShowForm(false)} />
            </div>
          )}
        </section>
      ) : (
        <p>You are logged in as a standard user.</p>
      )}
    </main>
  );
};

export default Dashboard;