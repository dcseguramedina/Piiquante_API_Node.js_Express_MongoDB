const express = require('express');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getSauceById);
router.get('/', auth, sauceCtrl.getSauces);
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

module.exports = router;