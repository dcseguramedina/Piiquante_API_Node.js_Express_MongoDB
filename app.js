//Import the main express module from the express package
const express = require('express'); 
//Import the package mongoose to facilite interactions with the database
const mongoose = require('mongoose'); 

//Import the routes for the sauce and the user
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//Import the path package to access the path of the server
const path = require('path');

//Use require('dotenv').config() to process environment variables
require('dotenv').config();

//Use the express method to create an express applicaton
const app = express();

//Connect the application to the database
mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Add headers to the response object in order to avoid CORS errors
app.use((req, res, next) => {
  //Allows to access to the API from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  //Allows to add the mentioned headers to the requests sent to the API (Origin, X-Requested-With, etc.)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //Allows to send requests with the mentioned methods (GET, POST, etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//Use express.json() to parse the request body
app.use(express.json());

//Import the routing managers for the sause, the user and the images (to manage the images resource statically)
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

//Export the application in order to make it available for the server
module.exports = app;