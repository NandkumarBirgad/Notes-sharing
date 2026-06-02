require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Study Portal API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📖 Health: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
