const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      // No need for useNewUrlParser or useUnifiedTopology in Mongoose 6+
      serverSelectionTimeoutMS: 10000, // fail fast if cannot connect
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // exit process if DB connection fails
  }
};

module.exports = connectDatabase;

