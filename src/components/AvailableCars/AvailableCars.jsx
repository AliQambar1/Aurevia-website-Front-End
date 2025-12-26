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
      let data = await getAvailableListings();
      
      console.log(' Loaded available cars:', data);
      
      // Process images for each car
      data = data.map(car => {
        console.log(` Car ${car.id} - ${car.make} images:`, car.images);
        console.log(`Images type:`, typeof car.images);
        
        if (car.images) {
          // If images is a string, parse it
          if (typeof car.images === 'string') {
            console.log(` Car ${car.id}: Images is string, parsing...`);
            try {
              car.images = JSON.parse(car.images);
              console.log(`Parsed to:`, car.images);
            } catch (e) {
              console.error(` Failed to parse images for car ${car.id}:`, e);
              car.images = [];
            }
          }
          
          // If it's an array, check if it's character array (the bug!)
          if (Array.isArray(car.images)) {
            // Check if it's array of single characters
            if (car.images.length > 10 && car.images.every(item => typeof item === 'string' && item.length === 1)) {
              console.log(`Car ${car.id}: Fixing character array...`);
              
              // Join characters back to string
              const joined = car.images.join('');
              console.log(`Joined string:`, joined);
              
              // Remove curly braces
              const cleaned = joined.replace(/^{|}$/g, '');
              
              // Split by comma to get individual URLs
              car.images = cleaned.split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0 && url.startsWith('http'));
              
              console.log(`Fixed images for car ${car.id}:`, car.images);
            } else {
              // It's a normal array, just filter valid URLs
              car.images = car.images.filter(img => 
                img && typeof img === 'string' && img.startsWith('http')
              );
            }
          }
        } else {
          car.images = [];
        }
        
        console.log(`Final images for car ${car.id}:`, car.images, `(${car.images.length} images)`);
        
        return car;
      });
      
      console.log('All cars processed successfully');
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
                {car.images && Array.isArray(car.images) && car.images.length > 0 ? (
                  <img 
                    src={car.images[0]} 
                    alt={`${car.make} ${car.model_year}`} 
                    className="car-image"
                    onError={(e) => {
                      console.error(` Failed to load image for ${car.make}:`, car.images[0]);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="car-image-placeholder">
                    No Image
                    {car.images && (
                      <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                        Debug: {JSON.stringify(car.images).substring(0, 50)}...
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="car-details">
                <h3 className="car-title">
                  {car.make} - {car.model_year}
                </h3>
                
                <div className="car-specs">
                  <span className="spec-badge">{car.spec}</span>
                  <span className="spec-item">Exterior: {car.exterior}</span>
                  <span className="spec-item">Interior: {car.interior}</span>
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
