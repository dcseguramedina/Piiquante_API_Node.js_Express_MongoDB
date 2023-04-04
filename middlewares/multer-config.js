//Import the multer package to handle incoming files (images) in HTTP requests
const multer = require('multer');

//Define the type of the files (nature and format) that will allow to generate the file extension
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//Use diskStorage method to configure the path and file name for incoming files
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

//Use single method to capture files of a certain type (passed as an argument)
//Save them to the server's file system using the configured storage
module.exports = multer({storage: storage}).single('image');