//Import the main express module from the express package
const express = require('express');

//Import the user controllers
const userCtrl = require('../controllers/user');

//Use the express.Router method to create an express router  
const router = express.Router();

//Define the routing managers for the user routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

//Export the router in order to make it available for the express application
module.exports = router;