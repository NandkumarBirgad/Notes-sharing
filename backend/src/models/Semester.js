const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Year',
      required: [true, 'Year reference is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch reference is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

semesterSchema.index({ yearId: 1 });
semesterSchema.index({ branchId: 1 });

module.exports = mongoose.model('Semester', semesterSchema);
