import mongoose from 'mongoose';

export function liveness(req, res) {
  return res.status(200).json({
    success: true,
    status: 'alive'
  });
}

export function readiness(req, res) {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? 'ready' : 'not_ready',
    dependencies: {
      database: databaseReady ? 'connected' : 'disconnected'
    }
  });
}
