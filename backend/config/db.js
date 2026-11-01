const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow_db';
  const localFallbackUri = 'mongodb://localhost:27017/taskflow_db';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3500
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Primary MongoDB connection failed (${error.message})`);
    
    // If primary was Atlas, try connecting to local mongod as fallback
    if (primaryUri !== localFallbackUri) {
      console.log('[Database] Attempting connection to local MongoDB (localhost:27017)...');
      try {
        const fallbackConn = await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 2500
        });
        console.log(`[Database] Connected to local fallback MongoDB: ${fallbackConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`[Database Error] Local MongoDB fallback also failed: ${localError.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_OFFLINE_BOOT) {
      console.error('[Database Fatal] Exiting because NODE_ENV=production. Whitelist your IP in Atlas or use local MongoDB.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
