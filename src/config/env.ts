import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
  JWT_EXPIRY: process.env.JWT_EXPIRY ?? '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "0.0.0.0"
};