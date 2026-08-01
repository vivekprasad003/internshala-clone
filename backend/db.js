const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.DATABASE_URL;

module.exports.connect = async () => {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database is connected");
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.log("Server will continue running without database connection");
  }
};