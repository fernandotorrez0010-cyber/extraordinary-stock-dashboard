// src/utils/cloudinaryService.js
// Cloudinary unsigned upload — no backend needed.
// Set these in your .env file:
//   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET';
const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

/**
 * Upload a file to Cloudinary.
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder (e.g. "kyc/uid123")
 * @param {function} onProgress - optional (percent: number) => void
 * @returns {Promise<string>} - secure_url of uploaded file
 */
export const uploadToCloudinary = (file, folder = 'uploads', onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const resourceType = file.type.startsWith('video') ? 'video' : 'auto';
    const url = `${BASE_URL}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve(res.secure_url);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload error — check Cloudinary config'));
    xhr.send(formData);
  });
};

/**
 * Upload multiple files in parallel
 * @param {Array<{file: File, folder: string}>} items
 * @returns {Promise<string[]>} array of secure_urls
 */
export const uploadMultiple = (items) =>
  Promise.all(items.map(({ file, folder }) => uploadToCloudinary(file, folder)));
