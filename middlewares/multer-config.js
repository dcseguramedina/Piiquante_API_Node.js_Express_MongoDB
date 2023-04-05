// Import tmulter package to handle incoming files (images) in HTTP requests
const multer = require('multer');

// Define type of files (nature and format) that will be use to generate files extensions
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Use diskStorage method to configure path and file name for incoming files
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Use single method to capture files of a certain type (passed as an argument)
// Save them to the server's filesystem using the configured storage
module.exports = multer({storage: storage}).single('image');