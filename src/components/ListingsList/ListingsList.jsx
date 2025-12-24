// src/components/ListingsList/ListingsList.jsx
import { useState, useEffect, useContext } from 'react';
import { getAllListings } from '../../services/listingService';
import InquiryForm from '../InquiryForm/InquiryForm';
import { UserContext } from '../../contexts/UserContext';

const ListingsList = () => {
  const [listings, setListings] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // Track which car details are open
  const [inquiryId, setInquiryId] = useState(null);   // Track which car is being inquired about
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getAllListings();
        setListings(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListings();
  }, []);

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="listings-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
      {listings.map((car) => {
        // Handle images logic (assuming images are stored as comma-separated string)
        const imageList = car.images ? car.images.split(',') : [];
        const mainImage = imageList.length > 0 ? imageList[0] : 'https://via.placeholder.com/300'; // Fallback image

        return (
          <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: '#fff' }}>
            
            {/* Main Image */}
            <img src={mainImage} alt={car.make} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
            
            {/* Basic Info */}
            <h3>{car.make}</h3>
            <p><strong>Year:</strong> {car.model_year}</p>
            <p><strong>Mileage:</strong> {car.mileage ? `${car.mileage} km` : 'N/A'}</p>
            <p style={{ color: '#28a745', fontSize: '1.2em', fontWeight: 'bold' }}>{car.price.toLocaleString()} SAR</p>

            {/* Show More Button */}
            <button 
              onClick={() => toggleDetails(car.id)}
              style={{ width: '100%', padding: '8px', marginTop: '10px', cursor: 'pointer' }}
            >
              {expandedId === car.id ? "Hide Details" : "Show More Details"}
            </button>

            {/* Expanded Details */}
            {expandedId === car.id && (
              <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <p><strong>Spec:</strong> {car.spec}</p>
                <p><strong>Exterior:</strong> {car.exterior}</p>
                <p><strong>Interior:</strong> {car.interior}</p>
                <p><strong>Notes:</strong> {car.notes}</p>
                
                {/* Show Extra Images */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginTop: '10px' }}>
                  {imageList.slice(1).map((img, idx) => (
                    <img key={idx} src={img} alt="detail" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Enquire Button (Only for users or non-admins if desired) */}
            <button 
              onClick={() => setInquiryId(car.id)}
              style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Enquire
            </button>

            {/* Inquiry Modal/Form */}
            {inquiryId === car.id && (
              <InquiryForm listingId={car.id} onClose={() => setInquiryId(null)} />
            )}

          </div>
        );
      })}
    </div>
  );
};

export default ListingsList;