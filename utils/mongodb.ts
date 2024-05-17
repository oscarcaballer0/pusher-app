import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL!);

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  const db = client.db("test");
  return { db, client };
}