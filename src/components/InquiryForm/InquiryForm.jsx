// src/components/InquiryForm/InquiryForm.jsx
import { useState } from 'react';
import { createInquiry } from '../../services/inquiryService';

const InquiryForm = ({ listingId, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',    
    phone_number: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send listing_id + form data
      await createInquiry({ ...formData, listing_id: listingId });
      alert('Message sent successfully!');
      onClose(); 
    } catch (err) {
      console.error("Inquiry Error:", err);
      alert('Failed to send message.');
    }
  };

  return (
    <div className="inquiry-modal" style={{ marginTop: '10px', padding: '15px', background: '#f0f8ff', border: '1px solid #cce5ff', borderRadius: '5px' }}>
      <h4>Send Inquiry for this Car</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input name="full_name" placeholder="Your Name" onChange={handleChange} required />
        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
        <textarea name="message" placeholder="I am interested in this car..." onChange={handleChange} required />
        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="submit" style={{ flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px' }}>Send</button>
          <button type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm;