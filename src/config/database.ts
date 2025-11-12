import { MongoClient, Db } from 'mongodb';

let db: Db;
let client: MongoClient;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library';
  
  client = new MongoClient(uri);
  await client.connect();
  
  db = client.db();
  
  console.log('Connected to MongoDB');
  
  return db;
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}