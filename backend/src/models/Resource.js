const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    previewUrl: {
      type: String,
      default: '',
    },
    publicId: {
      // Cloudinary public_id for deletion
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: ['note', 'paper', 'video'],
        message: 'Type must be note, paper, or video',
      },
      required: [true, 'Resource type is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: '',
    },
    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Year',
      required: [true, 'Year reference is required'],
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast filtered queries
resourceSchema.index({ subjectId: 1 });
resourceSchema.index({ semesterId: 1 });
resourceSchema.index({ yearId: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ title: 'text', description: 'text' }); // full-text search

module.exports = mongoose.model('Resource', resourceSchema);
