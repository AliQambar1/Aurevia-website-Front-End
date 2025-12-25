import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import ListingForm from '../ListingForm/ListingForm';
import './Dashboard.css'; // Add this import

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="dashboard-container">
      <h1>Welcome, {user?.username}</h1>
      <p>Manage your car inventory and view user activity here.</p>

      {user?.role === 'admin' && (
        <section className="admin-section">
          <h3>Admin Panel</h3>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Car Listing'}
          </button>

          {showForm && (
            <div style={{ marginTop: '20px' }}>
              <ListingForm onSuccess={() => setShowForm(false)} />
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Dashboard;