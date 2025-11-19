import { MongoClient, Db } from 'mongodb';
import { env } from './env';

let db: Db;
let client: MongoClient;

/**
 * Connects to the MongoDB database using the provided URI in the environment variables.
 * If the database is already connected, returns the existing database instance.
 * @returns {Promise<Db>} a promise that resolves with the connected MongoDB database instance.
 */

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = env.MONGODB_URI;
  
  client = new MongoClient(uri);
  await client.connect();
  
  db = client.db();
  
  console.log('Connected to MongoDB');
  
  return db;
}

/**
 * Returns the connected MongoDB database instance.
 * @throws {Error} if the database is not initialized
 * @returns {Db} the connected MongoDB database instance
 */
export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Closes the MongoDB connection.
 * @returns {Promise<void>} a promise that resolves when the connection is closed
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}