const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Year name is required'],
      trim: true,
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
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch reference is required'],
    },
  },
  { timestamps: true }
);

yearSchema.index({ branchId: 1 });
yearSchema.index({ branchId: 1, order: 1 });

module.exports = mongoose.model('Year', yearSchema);
