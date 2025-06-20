const express = require('express');
const mongoose = require('mongoose');
const router = require('./src/routes/allroutes');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config();


const app = express();
const port = process.env.PORT || 7001;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logging with Morgan (place before routes)
app.use(morgan(':method :url :status'));

// Base route
app.get('/', (req, res) => {
  res.json('Server running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.DBURL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('Successfully Connected to MongoDB to live prod');
  })
  .catch((err) => {
    console.error('MongoDB Connection Failure', err);
    process.exit(1); // Exit process if unable to connect
  });




app.use(cookieParser());
app.use(router);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An error occurred', error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

