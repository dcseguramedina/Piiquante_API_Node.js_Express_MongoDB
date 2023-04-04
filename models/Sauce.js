//Import mongoose in order to create a model (data schema) for the sauce
const mongoose = require('mongoose');

//Use the Schema() method to create a model for the database
//This model contains the required fields (type and character)
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  usersLiked: { type: [String], required: true },
  usersDisliked: { type: [String], required: true },
});

//Export the sauce model to make it available for the express application
module.exports = mongoose.model('Sauce', sauceSchema);