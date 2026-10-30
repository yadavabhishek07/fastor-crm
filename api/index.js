const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  // Ensure database is connected before handling serverless request
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection failed in serverless handler:', err.message);
    }
  }

  return app(req, res);
};
