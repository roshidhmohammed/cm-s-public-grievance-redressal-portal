import mongoose from 'mongoose';
import { mongoUri } from './env.js';

let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  const pendingConnection = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 0
  }).then(() => {
    console.log('Connected to MongoDB');
    connectionPromise = undefined;
    return mongoose;
  }).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  connectionPromise = pendingConnection;
  return pendingConnection;
}

export default connectDatabase;
