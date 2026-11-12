import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { uploadDirectory } from '../services/storage.service.js';

const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, WebP, PDF, and Word documents are allowed.');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  }
});
