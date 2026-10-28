import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "kenlivo";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (global._mongoClientPromise) return global._mongoClientPromise;
  const p = new MongoClient(uri).connect();
  if (process.env.NODE_ENV !== "production") {
    global._mongoClientPromise = p;
  }
  return p;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
