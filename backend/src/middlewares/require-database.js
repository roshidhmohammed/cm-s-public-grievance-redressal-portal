import connectDatabase from '../config/database.js';

async function requireDatabase(req, res, next) {
  try {
    await connectDatabase();
    return next();
  } catch (error) {
    console.error('MongoDB connection failed while handling a request:', error);
    return res.status(503).json({
      success: false,
      message: 'Database is unavailable. Please try again shortly.'
    });
  }
}

export default requireDatabase;
