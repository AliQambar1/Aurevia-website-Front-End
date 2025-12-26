import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import api from '../../services/api';
import { 
  createInquiry, 
  getListingInquiries, 
  updateInquiry, 
  deleteInquiry 
} from '../../services/inquiryService';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    full_name: '',
    phone_number: '',
    message: ''
  });
  
  const [inquiries, setInquiries] = useState([]);
  const [editingInquiry, setEditingInquiry] = useState(null);

  useEffect(() => {
    loadCarDetails();
    if (user) {
      loadInquiries();
    }
  }, [id, user]);

  const loadCarDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/listings/${id}`);
      const carData = response.data;
      
      console.log('=== CAR DETAILS DEBUG ===');
      console.log('Full response:', carData);
      console.log('Images field:', carData.images);
      console.log('Images type:', typeof carData.images);
      console.log('Is array:', Array.isArray(carData.images));
      
      // Handle if images is a string (parse it)
      if (typeof carData.images === 'string') {
        console.log('⚠️ Images is a string, parsing...');
        try {
          carData.images = JSON.parse(carData.images);
          console.log('Parsed images:', carData.images);
        } catch (e) {
          console.error(' Failed to parse images:', e);
          carData.images = [];
        }
      }
      
      // Ensure images is always an array
      if (!Array.isArray(carData.images)) {
        console.log(' Images is not an array, converting...');
        carData.images = carData.images ? [carData.images] : [];
      }
      
      // Filter out empty or invalid URLs
      carData.images = carData.images.filter(img => img && typeof img === 'string' && img.length > 0);
      
      console.log('Final images:', carData.images);
      console.log('Images count:', carData.images.length);
      console.log('========================');
      
      setCar(carData);
    } catch (err) {
      setError('Failed to load car details');
      console.error(' Error loading car:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      const data = await getListingInquiries(id);
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setInquiries([]);
    }
  };

  const handleDeleteCar = async () => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await api.delete(`/api/listings/${id}`);
      alert('Car deleted successfully');
      navigate('/listings');
    } catch (err) {
      alert('Failed to delete car');
      console.error(err);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to send an inquiry');
      return;
    }
    
    try {
      await createInquiry({
        listing_id: parseInt(id),
        ...inquiryForm
      });
      
      alert('Inquiry sent successfully!');
      setInquiryForm({ full_name: '', phone_number: '', message: '' });
      setShowInquiryForm(false);
      
      if (user) {
        loadInquiries();
      }
    } catch (err) {
      alert('Failed to send inquiry');
      console.error('Error sending inquiry:', err);
    }
  };

  const handleUpdateInquiry = async (inquiryId) => {
    try {
      await updateInquiry(inquiryId, editingInquiry);
      alert('Inquiry updated successfully');
      setEditingInquiry(null);
      loadInquiries();
    } catch (err) {
      alert('Failed to update inquiry');
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      await deleteInquiry(inquiryId);
      alert('Inquiry deleted successfully');
      loadInquiries();
    } catch (err) {
      alert('Failed to delete inquiry');
      console.error(err);
    }
  };

  const nextImage = () => {
    if (car?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === car.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (car?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? car.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="car-details-container">
        <div className="loading">Loading car details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="car-details-container">
        <div className="error">{error}</div>
        <button className="btn-back" onClick={() => navigate('/listings')}>
          ← Back to Listings
        </button>
      </div>
    );
  }
  
  if (!car) {
    return (
      <div className="car-details-container">
        <div className="error">Car not found</div>
        <button className="btn-back" onClick={() => navigate('/listings')}>
          ← Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="car-details-container">
      <button className="btn-back" onClick={() => navigate('/listings')}>
        ← Back to Listings
      </button>

      <div className="car-details-content">
        {/* Left Side - Images */}
        <div className="car-images-section">
          <div className="main-image-container">
            {car.images && Array.isArray(car.images) && car.images.length > 0 ? (
              <>
                <img 
                  src={car.images[currentImageIndex]} 
                  alt={`${car.make} ${car.model_year}`}
                  className="main-car-image"
                  onError={(e) => {
                    console.error(' Failed to load image:', car.images[currentImageIndex]);
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                  }}
                />
                {car.images.length > 1 && (
                  <>
                    <button className="img-nav-btn prev" onClick={prevImage}>‹</button>
                    <button className="img-nav-btn next" onClick={nextImage}>›</button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image-placeholder">
                <p>No Images Available</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>
                  Debug: {JSON.stringify(car.images)}
                </p>
              </div>
            )}
          </div>
          
          {car.images && Array.isArray(car.images) && car.images.length > 1 && (
            <div className="thumbnail-container">
              {car.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  onError={(e) => {
                    console.error('Failed to load thumbnail:', img);
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div className="car-info-section">
          <h1 className="car-title">{car.make} - {car.model_year}</h1>
          <p className="car-price">${car.price.toLocaleString()}</p>
          
          <div className="car-specs-grid">
            <div className="spec-item">
              <span className="spec-label">Specification:</span>
              <span className="spec-value">{car.spec}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Exterior:</span>
              <span className="spec-value">{car.exterior}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Interior:</span>
              <span className="spec-value">{car.interior}</span>
            </div>
            {car.mileage && (
              <div className="spec-item">
                <span className="spec-label">Mileage:</span>
                <span className="spec-value">{car.mileage.toLocaleString()} km</span>
              </div>
            )}
            <div className="spec-item">
              <span className="spec-label">Status:</span>
              <span className="spec-value status-badge">{car.status}</span>
            </div>
          </div>

          {car.notes && (
            <div className="car-notes">
              <h3>Additional Notes</h3>
              <p>{car.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {user?.role === 'admin' ? (
              <>
                <button 
                  className="btn btn-update"
                  onClick={() => navigate(`/listings/${id}/edit`)}
                >
                  Update Car
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={handleDeleteCar}
                >
                  Delete Car
                </button>
              </>
            ) : (
              <button 
                className="btn btn-inquire"
                onClick={() => setShowInquiryForm(!showInquiryForm)}
              >
                {showInquiryForm ? 'Cancel' : 'Inquire About This Car'}
              </button>
            )}
          </div>

          {/* Inquiry Form */}
          {showInquiryForm && user?.role !== 'admin' && (
            <form className="inquiry-form" onSubmit={handleInquirySubmit}>
              <h3>Send an Inquiry</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={inquiryForm.full_name}
                onChange={(e) => setInquiryForm({...inquiryForm, full_name: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={inquiryForm.phone_number}
                onChange={(e) => setInquiryForm({...inquiryForm, phone_number: e.target.value})}
                required
              />
              <textarea
                placeholder="Your message..."
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                required
                rows="4"
              />
              <button type="submit" className="btn btn-submit">Send Inquiry</button>
            </form>
          )}
        </div>
      </div>

      {/* Inquiries Section */}
      {user && inquiries.length > 0 && (
        <div className="inquiries-section">
          <h2>
            {user.role === 'admin' 
              ? `Customer Inquiries (${inquiries.length})` 
              : `Your Inquiries (${inquiries.length})`
            }
          </h2>
          <div className="inquiries-list">
            {inquiries.map((inq) => (
              <div key={inq.id} className="inquiry-card">
                {editingInquiry?.id === inq.id ? (
                  <div className="inquiry-edit-form">
                    <input
                      type="text"
                      value={editingInquiry.full_name}
                      onChange={(e) => setEditingInquiry({...editingInquiry, full_name: e.target.value})}
                    />
                    <input
                      type="tel"
                      value={editingInquiry.phone_number}
                      onChange={(e) => setEditingInquiry({...editingInquiry, phone_number: e.target.value})}
                    />
                    <textarea
                      value={editingInquiry.message}
                      onChange={(e) => setEditingInquiry({...editingInquiry, message: e.target.value})}
                      rows="3"
                    />
                    <div className="inquiry-actions">
                      <button 
                        className="btn btn-save"
                        onClick={() => handleUpdateInquiry(inq.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={() => setEditingInquiry(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="inquiry-header">
                      <h4>{inq.full_name}</h4>
                      <span className="inquiry-date">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="inquiry-phone">📞 {inq.phone_number}</p>
                    <p className="inquiry-message">{inq.message}</p>
                    
                    <div className="inquiry-actions">
                      {inq.user_id === user?.id && user?.role !== 'admin' && (
                        <>
                          <button 
                            className="btn btn-edit"
                            onClick={() => setEditingInquiry(inq)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-delete-inquiry"
                            onClick={() => handleDeleteInquiry(inq.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      
                      {user?.role === 'admin' && inq.user_id !== user?.id && (
                        <button 
                          className="btn btn-delete-inquiry"
                          onClick={() => handleDeleteInquiry(inq.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetails;