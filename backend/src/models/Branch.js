const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: '📚',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

branchSchema.index({ order: 1 });

module.exports = mongoose.model('Branch', branchSchema);
