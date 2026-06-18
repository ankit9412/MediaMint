import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous downloads if desired, but typically we want to track
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  platform: {
    type: String,
  },
  type: {
    type: String,
    enum: ['video', 'audio'],
    required: true
  },
  quality: {
    type: String,
  },
  format: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  filePath: {
    type: String, // Local or cloud path once completed
  },
  fileSize: {
    type: Number,
  },
  error: {
    type: String,
  }
}, {
  timestamps: true
});

const Download = mongoose.model('Download', downloadSchema);
export default Download;
