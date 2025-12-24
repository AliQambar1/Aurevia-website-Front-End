export const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; // Replace with your Cloudinary cloud name
export const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET; // Replace with your Cloudinary upload preset
export const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`; 