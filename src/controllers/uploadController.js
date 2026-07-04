import asyncHandler from 'express-async-handler';
import { uploadBuffer, isCloudinaryConfigured } from '../utils/cloudinary.js';

// GET /api/admin/upload/status
export const uploadStatus = asyncHandler(async (req, res) => {
  res.json({ configured: isCloudinaryConfigured() });
});

// POST /api/admin/upload  (multipart, field name: "file")
export const uploadImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    res.status(400);
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_* keys to the server .env, or paste an image URL instead.');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const result = await uploadBuffer(req.file.buffer, 'bruwon');
  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
});
