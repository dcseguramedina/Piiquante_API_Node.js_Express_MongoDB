//Import mongoose in order to create a model (data schema) for the user
const mongoose = require('mongoose');
//Import mongoose-unique-validator in order to improve error messages when saving unique data
const uniqueValidator = require('mongoose-unique-validator');

//Use the Schema() method to create a model for the database
//This model contains the required fields (type and character)
//Include the unique value, with the mongoose-unique-validator element passed as a plug-in to ensure that no two users can share the same email address
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

//Export the user model in order to make it available for the express application
module.exports = mongoose.model('User', userSchema);