import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
  JWT_EXPIRY: process.env.JWT_EXPIRY ?? '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  // Refresh Token Rotation: Industry best practice for long-lived sessions
  REFRESH_TOKEN_ROTATION_ENABLED: process.env.REFRESH_TOKEN_ROTATION_ENABLED !== 'false',
  // Token family is used to detect token reuse attacks
  MAX_TOKEN_FAMILY_AGE: Number(process.env.MAX_TOKEN_FAMILY_AGE) || 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "0.0.0.0"
};