/**
 * Contact.js - Mongoose Model for Contact Form Submissions
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\d\s\+\-\(\)]+$/,
      'Please provide a valid phone number'
    ]
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'email_failed'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
contactSchema.index({ date: -1, status: 1 });

module.exports = mongoose.model('Contact', contactSchema);

