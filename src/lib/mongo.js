import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment");
}
if (!dbName) {
  throw new Error("Missing MONGODB_DB in environment");
}

let cached = global._mongoClientPromise;

if (!cached) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
  });
  cached = client.connect();
  global._mongoClientPromise = cached;
}

export async function getDb() {
  const client = await cached;
  return client.db(dbName);
}
