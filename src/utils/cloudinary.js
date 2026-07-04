import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export function getCloudinary() {
  if (configured) return cloudinary;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  configured = true;
  return cloudinary;
}

export function isCloudinaryConfigured() {
  return !!getCloudinary();
}

// Upload a buffer to Cloudinary, return the secure URL.
export function uploadBuffer(buffer, folder = 'bruwon') {
  const cld = getCloudinary();
  if (!cld) return Promise.reject(new Error('Cloudinary is not configured on the server'));
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}
