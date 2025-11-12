import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  PORT: Number(process.env.PORT) || 3000,
};