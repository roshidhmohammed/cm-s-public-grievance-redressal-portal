import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHttpError } from '../utils/api-response.js';

const localUploadDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));
export const uploadDirectory = process.env.UPLOAD_DIRECTORY
  ? path.resolve(process.env.UPLOAD_DIRECTORY)
  : process.env.VERCEL
    ? path.join(tmpdir(), 'public-grievance-uploads')
    : localUploadDirectory;

await mkdir(uploadDirectory, { recursive: true });

export function resolveStoredFile(filename) {
  const safeFilename = path.basename(filename);
  const absolutePath = path.resolve(uploadDirectory, safeFilename);
  if (safeFilename !== filename || !absolutePath.startsWith(`${path.resolve(uploadDirectory)}${path.sep}`)) {
    throw createHttpError(400, 'Invalid attachment filename.');
  }
  return absolutePath;
}
