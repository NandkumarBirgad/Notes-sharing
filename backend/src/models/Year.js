const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Year name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Year', yearSchema);
