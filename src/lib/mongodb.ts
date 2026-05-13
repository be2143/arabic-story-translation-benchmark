import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

/**
 * Returns a shared MongoClient connection. Fails at request time if MONGODB_URI is missing
 * (so `next build` can run without env in CI if routes are not prerendered).
 */
export default function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(
      new Error("Missing MONGODB_URI. Add it to .env.local in the project root.")
    );
  }
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClientPromise;
}
