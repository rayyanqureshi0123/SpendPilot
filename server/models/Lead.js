const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  companyName: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    trim: true,
    default: '',
  },
  teamSize: {
    type: Number,
    required: true,
  },
  auditResult: {
    type: Object, // We save the entire JSON output from the audit engine
    required: true,
  },
  shareId: {
    type: String,
    required: true,
    unique: true, // Used for the public, anonymized sharing URL
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Lead', LeadSchema);
