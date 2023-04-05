// Import main express module from the express package
const express = require('express'); 
// Import package mongoose to facilite interactions with the database
const mongoose = require('mongoose'); 

// Import routes for sauce and user
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Import path package to access the path of the server
const path = require('path');

// Use require('dotenv').config() to process environment variables
require('dotenv').config();

// Create an express applicaton
const app = express();

// Connect the application to the database
mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Add headers to the response object in order to avoid CORS errors
app.use((req, res, next) => {
  // Allows access to the API from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Allows mentioned headers to the requests sent to the API (Origin, X-Requested-With, etc.)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // Allows mentioned HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Use express.json() parser for request body
app.use(express.json());

// Declare routes for sauces, auth and images
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Export the application in order to make it available for the server
module.exports = app;