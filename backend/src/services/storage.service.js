import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHttpError } from '../utils/api-response.js';

export const uploadDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));
await mkdir(uploadDirectory, { recursive: true });

export function resolveStoredFile(filename) {
  const safeFilename = path.basename(filename);
  const absolutePath = path.resolve(uploadDirectory, safeFilename);
  if (safeFilename !== filename || !absolutePath.startsWith(`${path.resolve(uploadDirectory)}${path.sep}`)) {
    throw createHttpError(400, 'Invalid attachment filename.');
  }
  return absolutePath;
}
