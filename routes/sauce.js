//Import the main express module from the express package
const express = require('express');

//Import the authorization and multer middlewares  
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

//Use the express.Router method to create an express router  
const router = express.Router();

//Import the sauce controllers
const sauceCtrl = require('../controllers/sauce');

//Define the routing managers for the sauce routes
//Pass the authotization middleware as a second argument of the routes to protect
//Pass the multer middleware after the authorization one in order to authenticate the image files
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getSauceById);
router.get('/', auth, sauceCtrl.getSauces);
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

//Export the router in order to make it available for the express application
module.exports = router;