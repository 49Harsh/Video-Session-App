const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['admin', 'student']
  },
  unique_id: {
    type: String,
    required: true,
    unique: true
  },
  userurl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LiveSession', sessionSchema);
