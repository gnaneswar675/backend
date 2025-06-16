const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://frontend-ii2y.onrender.com/", // 👈 use your actual frontend URL
  credentials: true, // 👈 add this if you’re using cookies or auth headers
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));

const PORT = process.env.PORT || 5000;

// First start the server
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server running on port ${PORT}`);
  
  // Then connect to MongoDB
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('\x1b[32m%s\x1b[0m', '📦 Connected to MongoDB');
    })
    .catch(err => {
      console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB connection error:', err);
      process.exit(1);
    });
});
