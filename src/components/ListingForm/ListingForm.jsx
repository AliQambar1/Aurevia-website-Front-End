import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createListing } from '../../services/listingService';
import {
  cloudinaryUploadUrl,
  uploadPreset
} from '../../services/cloudinaryService';

const ListingForm = ({ onSuccess }) => {
  const navigate = useNavigate();

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
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // Upload ONE image to Cloudinary
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
      // Upload all images to Cloudinary first
      console.log('Uploading images to Cloudinary...');
      const imageUrls = await Promise.all(
        selectedFiles.map(file => handleUpload(file))
      );
      console.log('Images uploaded:', imageUrls);

      // Build payload for FastAPI
      const payload = new FormData();
      payload.append('make', formData.make);
      payload.append('model_year', formData.model_year);
      payload.append('mileage', formData.mileage);
      payload.append('spec', formData.spec);
      payload.append('exterior', formData.exterior);
      payload.append('interior', formData.interior);
      payload.append('price', formData.price);
      payload.append('status', formData.status);

  
      payload.append('images', JSON.stringify(imageUrls));

      if (formData.notes) {
        payload.append('notes', formData.notes);
      }

      // 3️⃣ Save listing to backend
      console.log('Saving listing to backend...');
      await createListing(payload);

      console.log('Listing saved successfully!');
      if (onSuccess) onSuccess();
      navigate('/');
    } catch (error) {
      console.error('Error details:', error);
      setErrorMsg(
        error.message || 'Failed to upload images or save listing. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}
    >
      <h3>Add New Car</h3>

      <input name="make" placeholder="Make" onChange={handleChange} required />

      <input
        name="model_year"
        type="number"
        placeholder="Year"
        onChange={handleChange}
        required
      />

      <input
        name="mileage"
        type="number"
        placeholder="Mileage"
        onChange={handleChange}
        required
      />

      <select name="spec" value={formData.spec} onChange={handleChange}>
        <option value="GCC">GCC</option>
        <option value="US">US</option>
        <option value="EU">EU</option>
      </select>

      <input
        name="exterior"
        placeholder="Exterior Color"
        onChange={handleChange}
        required
      />

      <input
        name="interior"
        placeholder="Interior Color"
        onChange={handleChange}
        required
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
        onChange={handleChange}
        required
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        required
      />

      <textarea
        name="notes"
        placeholder="Additional Notes"
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={isUploading}
        style={{
          backgroundColor: isUploading ? '#ccc' : '#28a745',
          color: '#fff',
          padding: '10px',
          border: 'none',
          cursor: isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        {isUploading ? 'Uploading Images...' : 'Save Listing'}
      </button>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </form>
  );
};

export default ListingForm;