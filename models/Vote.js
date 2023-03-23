
const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
  like: { type: Number, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model('Vote', voteSchema);