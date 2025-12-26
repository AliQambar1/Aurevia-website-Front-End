import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createListing, updateListing } from '../../services/listingService';
import api from '../../services/api';
import {
  cloudinaryUploadUrl,
  uploadPreset
} from '../../services/cloudinaryService';

const ListingForm = ({ onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    make: '',
    model_year: '',
    mileage: '',
    spec: 'GCC',
    exterior: '',
    interior: '',
    price: '',
    notes: '',
    status: 'Available'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      loadCarData();
    }
  }, [id]);

const loadCarData = async () => {
  try {
    setIsLoading(true);
    const response = await api.get(`/api/listings/${id}`);
    const car = response.data;
    
    console.log(' Loaded car data:', car);
    console.log(' Raw images:', car.images);
    console.log(' Images type:', typeof car.images);
    
    setFormData({
      make: car.make || '',
      model_year: car.model_year || '',
      mileage: car.mileage || '',
      spec: car.spec || 'GCC',
      exterior: car.exterior || '',
      interior: car.interior || '',
      price: car.price || '',
      notes: car.notes || '',
      status: car.status || 'Available'
    });
    
    // ⭐ CRITICAL FIX: Handle images properly
    let loadedImages = [];
    
    if (car.images) {
      if (typeof car.images === 'string') {
        // If it's a string, try to parse it
        console.log(' Images is string, parsing...');
        try {
          loadedImages = JSON.parse(car.images);
        } catch (e) {
          console.error(' Failed to parse images:', e);
          loadedImages = [];
        }
      } else if (Array.isArray(car.images)) {
        // If it's already an array, check if it's valid
        console.log(' Images is array');
        
        // Check if it's an array of characters (the bug!)
        if (car.images.length > 10 && car.images.every(item => typeof item === 'string' && item.length === 1)) {
          // It's an array of characters! Join them back
          console.log(' Fixing character array...');
          const joinedString = car.images.join('');
          console.log('Joined string:', joinedString);
          
          try {
            // Remove curly braces if present
            const cleanString = joinedString.replace(/^{|}$/g, '');
            // Split by comma to get individual URLs
            loadedImages = cleanString.split(',').map(url => url.trim()).filter(url => url.length > 0);
            console.log('Fixed images:', loadedImages);
          } catch (e) {
            console.error('Failed to fix images:', e);
            loadedImages = [];
          }
        } else {
          // It's a normal array of URLs
          loadedImages = car.images.filter(img => img && typeof img === 'string' && img.startsWith('http'));
        }
      }
    }
    
    console.log(' Final loaded images:', loadedImages);
    console.log(' Images count:', loadedImages.length);
    setExistingImages(loadedImages);
  } catch (error) {
    console.error('Failed to load car data:', error);
    setErrorMsg('Failed to load car data');
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);

    const response = await fetch(cloudinaryUploadUrl, {
      method: 'POST',
      body: data
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsUploading(true);

    try {
      let imageUrls = [];

      // Upload new images if selected
      if (selectedFiles.length > 0) {
        console.log('Uploading new images to Cloudinary...');
        const newImageUrls = await Promise.all(
          selectedFiles.map(file => handleUpload(file))
        );
        
        if (newImageUrls.length === 0) {
          throw new Error('Failed to upload images to Cloudinary');
        }
        
        console.log('Successfully uploaded new images:', newImageUrls);
        imageUrls = [...existingImages, ...newImageUrls];
      } else {
        // Use existing images (create a copy to ensure it's a proper array)
        imageUrls = Array.isArray(existingImages) ? [...existingImages] : [];
      }

      // Validation
      if (imageUrls.length === 0 && !isEditMode) {
        setErrorMsg('Please select at least one image');
        setIsUploading(false);
        return;
      }

      console.log('Final image URLs:', imageUrls);
      console.log('Images is array:', Array.isArray(imageUrls));
      console.log('Images length:', imageUrls.length);

      if (isEditMode) {
        // UPDATE LOGIC - Send as JSON
        const payload = {
          make: formData.make.trim(),
          model_year: parseInt(formData.model_year),
          mileage: parseInt(formData.mileage) || 0,
          spec: formData.spec,
          exterior: formData.exterior.trim(),
          interior: formData.interior.trim(),
          price: parseFloat(formData.price),
          status: formData.status,
          images: imageUrls,  // Array of URL strings
          notes: formData.notes ? formData.notes.trim() : ''
        };

        console.log('=== UPDATE PAYLOAD ===');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        console.log('Images in payload:', payload.images);
        console.log('======================');
        
        const result = await updateListing(id, payload);
        
        console.log('Update result:', result);
        alert('Car updated successfully!');
        navigate(`/listings/${id}`);
      } else {
        // CREATE LOGIC - Send as FormData
        const payload = new FormData();
        payload.append('make', formData.make.trim());
        payload.append('model_year', formData.model_year);
        payload.append('mileage', formData.mileage || '0');
        payload.append('spec', formData.spec);
        payload.append('exterior', formData.exterior.trim());
        payload.append('interior', formData.interior.trim());
        payload.append('price', formData.price);
        payload.append('status', formData.status);
        payload.append('images', JSON.stringify(imageUrls));

        if (formData.notes) {
          payload.append('notes', formData.notes.trim());
        }

        console.log('Creating new listing...');
        await createListing(payload);
        
        console.log('Listing created successfully!');
        alert('Car added successfully!');
        if (onSuccess) onSuccess();
        navigate('/listings');
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          `Failed to ${isEditMode ? 'update' : 'create'} listing. Please try again.`;
      
      setErrorMsg(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Loading car data...</h3>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        background: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
        {isEditMode ? 'Update Car' : 'Add New Car'}
      </h3>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Make *
        </label>
        <input 
          name="make" 
          placeholder="e.g., Ferrari" 
          value={formData.make}
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Year *
        </label>
        <input
          name="model_year"
          type="number"
          placeholder="e.g., 2020"
          value={formData.model_year}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Mileage (km)
        </label>
        <input
          name="mileage"
          type="number"
          placeholder="e.g., 2222"
          value={formData.mileage}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Specification *
        </label>
        <select 
          name="spec" 
          value={formData.spec} 
          onChange={handleChange}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        >
          <option value="GCC">GCC</option>
          <option value="US">US</option>
          <option value="EU">EU</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Exterior Color *
        </label>
        <input
          name="exterior"
          placeholder="e.g., White"
          value={formData.exterior}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Interior Color *
        </label>
        <input
          name="interior"
          placeholder="e.g., Black"
          value={formData.interior}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Price (USD) *
        </label>
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="e.g., 232323"
          value={formData.price}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Status *
        </label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleChange}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
        >
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Reserved">Reserved</option>
        </select>
      </div>

      {isEditMode && existingImages.length > 0 && (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Current Images ({existingImages.length})
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            flexWrap: 'wrap',
            padding: '1rem',
            background: 'white',
            borderRadius: '8px'
          }}>
            {existingImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img 
                  src={img} 
                  alt={`Car ${idx + 1}`} 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          {isEditMode ? 'Add More Images (optional)' : 'Upload Images *'}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          required={!isEditMode && existingImages.length === 0}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '2px solid #e0e0e0',
            background: 'white'
          }}
        />
        {selectedFiles.length > 0 && (
          <p style={{ marginTop: '0.5rem', color: '#5227ff', fontWeight: '600' }}>
            {selectedFiles.length} new image(s) selected
          </p>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Additional Notes
        </label>
        <textarea
          name="notes"
          placeholder="Any additional information..."
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '2px solid #e0e0e0',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={isUploading}
          style={{
            flex: 1,
            backgroundColor: isUploading ? '#ccc' : '#5227ff',
            color: '#fff',
            padding: '0.875rem',
            border: 'none',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          {isUploading 
            ? 'Processing...' 
            : (isEditMode ? 'Update Car' : 'Add Car')
          }
        </button>

        <button
          type="button"
          onClick={() => navigate(isEditMode ? `/listings/${id}` : '/listings')}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <p style={{ 
          color: '#ef4444', 
          background: '#fee',
          padding: '1rem',
          borderRadius: '8px',
          margin: '0'
        }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
};

export default ListingForm;