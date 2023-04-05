// Import the main module from express package
const express = require('express');

// Import authorization and multer middlewares  
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

// Create express.Router  
const router = express.Router();

// Import sauce controller
const sauceCtrl = require('../controllers/sauce');

// Define the sauce routes
// Declare authorization middleware as a second argument of routes
// Declare multer middleware after authorization in order to authenticate image files
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getSauceById);
router.get('/', auth, sauceCtrl.getSauces);
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

// Export router in order to make it available to the express application
module.exports = router;