import { useState, useEffect } from 'react';
import { getAvailableListings } from '../../services/listingService';
import './AvailableCars.css';

const AvailableCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableCars();
  }, []);

  const loadAvailableCars = async () => {
    try {
      setLoading(true);
      const data = await getAvailableListings();
      setCars(data);
    } catch (err) {
      setError('Failed to load available cars');
      console.error('Error loading available cars:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading available cars...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="available-cars-container">
      <h1 className="page-title">Available Cars</h1>
      
      {cars.length === 0 ? (
        <p className="no-cars">No cars available at the moment</p>
      ) : (
        <div className="cars-grid">
          {cars.map((car) => (
            <div key={car.id} className="car-card">
              <div className="car-image-container">
                {car.images && car.images.length > 0 ? (
                  <img 
                    src={car.images[0]} 
                    alt={`${car.make} ${car.model_year}`} 
                    className="car-image"
                  />
                ) : (
                  <div className="car-image-placeholder">No Image</div>
                )}
              </div>
              
              <div className="car-details">
                <h3 className="car-title">
                  {car.make} - {car.model_year}
                </h3>
                
                <div className="car-specs">
                  <span className="spec-badge">{car.spec}</span>
                  <span className="spec-item">Exterior: {car.exterior}</span>
                  <span className="spec-item">interior: {car.interior}</span>
                  {car.mileage && (
                    <span className="spec-item">Mileage: {car.mileage.toLocaleString()} km</span>
                  )}
                </div>

                {car.notes && (
                  <p className="car-notes">{car.notes}</p>
                )}
                
                <div className="car-footer">
                  <span className="car-price">${car.price.toLocaleString()}</span>
                  <span className="car-status available">Available</span>
                </div>
                
                <button 
                  className="btn-book"
                  onClick={() => window.location.href = `/listings/${car.id}`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCars;
