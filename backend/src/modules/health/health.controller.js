import mongoose from 'mongoose';
import connectDatabase from '../../config/database.js';

export function liveness(req, res) {
  return res.status(200).json({
    success: true,
    status: 'alive'
  });
}

export async function readiness(req, res) {
  try {
    await connectDatabase();
    return res.status(200).json({
      success: true,
      status: 'ready',
      dependencies: { database: 'connected' }
    });
  } catch (error) {
    console.error('MongoDB readiness check failed:', error);
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      dependencies: {
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    });
  }
}
