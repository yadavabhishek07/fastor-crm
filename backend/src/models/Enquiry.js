const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    courseInterest: {
      type: String,
      required: [true, 'Course interest is required'],
      trim: true,
      maxlength: [120, 'Course interest cannot exceed 120 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['unclaimed', 'claimed'],
      default: 'unclaimed',
      index: true
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    claimedAt: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      default: 'online_form'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to optimize finding public / unclaimed leads
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ claimedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
