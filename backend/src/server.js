import mongoose from 'mongoose';
import app from './app.js';
import connectDatabase from './config/database.js';
import { port } from './config/env.js';

async function startServer() {
  await connectDatabase();

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing server`);
    server.close(async (error) => {
      if (error) {
        console.error('Error closing HTTP server:', error);
        process.exitCode = 1;
      }

      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting from MongoDB:', disconnectError);
        process.exitCode = 1;
      }
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});
