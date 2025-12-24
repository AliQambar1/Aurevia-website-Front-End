import { useState } from 'react';
import { createListing } from '../../services/listingService';
import { useNavigate } from 'react-router';
import { cloudinaryUploadUrl } from '../../services/cloudinaryService';


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
  
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true)
    // setSelectedStatus(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(cloudinaryUploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();
      const fileCloudinaryURL = result.secure_url;
      console.log("File uploaded successfully:", fileCloudinaryURL);

    //   setUploadStatus({ ...uploadStatus, isUploading: false, success: true });
    setIsUploading(false)
    setSelectedFiles(null);
    return fileCloudinaryURL
} catch (error) {
    setIsUploading(false)
    console.error("Error uploading file:", error);
    //   setUploadStatus({ ...uploadStatus, isUploading: false, success: false });
    }
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsUploading(true); 

    try {
      const dataPayload = new FormData();
      let imageUrl = ''
     
      if (selectedFiles && selectedFiles.length > 0) {
        // const uploadPromises = Array.from(selectedFiles).map(file => 
        //   handleUpload(file)
        // );

        // Wait for all images to finish uploading
        // const imageUrls = await Promise.all(uploadPromises);

        // Append the resulting URL strings to dataPayload
        // imageUrls.forEach(url => {
        //   dataPayload.append('image_urls', url); 
        // });

        imageUrl = await handleUpload(selectedFiles)
      }

      // 2. Append standard text fields
      dataPayload.append('make', formData.make);
      dataPayload.append('model_year', parseInt(formData.model_year));
      dataPayload.append('mileage', parseInt(formData.mileage || 0));
      dataPayload.append('spec', formData.spec);
      dataPayload.append('exterior', formData.exterior);
      dataPayload.append('interior', formData.interior);
      dataPayload.append('price', parseFloat(formData.price));
      dataPayload.append('status', formData.status);
      dataPayload.append('images', imageUrl);
      if (formData.notes) dataPayload.append('notes', formData.notes);

      //final payload to your FastAPI Backend
      await createListing(dataPayload);
      
      if (onSuccess) onSuccess();
    //   window.location.reload(); 
      navigate('/');
      setIsUploading(false);
    // use the react router to navigate to a different page 
    } catch (err) {
      console.error("Submission Error:", err);
      setErrorMsg("Failed to upload images or save listing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
      <h3>Add New Car</h3>
      
      <input name="make" placeholder="Make" onChange={handleChange} required />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input name="model_year" type="number" placeholder="Year" onChange={handleChange} required style={{flex: 1}} />
        <input name="mileage" type="number" placeholder="Mileage (km)" onChange={handleChange} required style={{flex: 1}} />
      </div>

      <label>Specification:</label>
      <select name="spec" onChange={handleChange} value={formData.spec}>
        <option value="GCC">GCC</option>
        <option value="US">US</option>
        <option value="EU">EU</option>
      </select>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input name="exterior" placeholder="Exterior Color" onChange={handleChange} required style={{flex: 1}} />
        <input name="interior" placeholder="Interior Color" onChange={handleChange} required style={{flex: 1}} />
      </div>

      <input name="price" type="number" placeholder="Price" onChange={handleChange} required />
      
      <label>Car Images:</label>
      <input type="file" multiple onChange={handleFileChange} accept="image/*" required />

      <textarea name="notes" placeholder="Additional Notes" onChange={handleChange} />

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