import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

const port = Number(process.env.PORT || 8080);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

export const nodeEnv = process.env.NODE_ENV || 'development';
export { port };
export const mongoUri = process.env.MONGODB_URI;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
export const clientOrigin = process.env.CLIENT_ORIGIN;
export const cookieSameSite = process.env.COOKIE_SAME_SITE || (nodeEnv === 'production' ? 'none' : 'lax');
export const cookieSecure = process.env.COOKIE_SECURE === 'true' || nodeEnv === 'production';
export const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY
export const GEMINI_MODEL = process.env.GEMINI_MODEL

if (!['strict', 'lax', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be strict, lax, or none.');
}

if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE=none.');
}
