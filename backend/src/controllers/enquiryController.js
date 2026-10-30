const Enquiry = require('../models/Enquiry');

// @desc    Submit public enquiry form (Prospective Client Lead)
// @route   POST /api/enquiries
// @access  Public (No authentication required)
const submitPublicEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, courseInterest, notes } = req.body;

    const enquiry = await Enquiry.create({
      name,
      email,
      phone: phone || '',
      courseInterest,
      notes: notes || '',
      status: 'unclaimed',
      claimedBy: null,
      claimedAt: null,
      source: req.body.source || 'online_form'
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! A counselor will reach out shortly.',
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all unclaimed (public) leads for CRM counselors
// @route   GET /api/enquiries/public
// @access  Private (Employee authentication required)
const getPublicEnquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {
      claimedBy: null,
      status: 'unclaimed'
    };

    if (req.query.course) {
      query.courseInterest = { $regex: req.query.course, $options: 'i' };
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(query),
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      enquiries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an enquiry to make it private to logged-in counselor
// @route   POST /api/enquiries/:id/claim
// @access  Private (Employee authentication required)
const claimEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const counselorId = req.user._id;

    // Atomic update to prevent race conditions when multiple counselors claim concurrently
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: id, claimedBy: null },
      {
        $set: {
          claimedBy: counselorId,
          claimedAt: new Date(),
          status: 'claimed'
        }
      },
      { new: true, runValidators: true }
    ).populate('claimedBy', 'name email');

    // If no document was updated, determine the exact conflict reason
    if (!enquiry) {
      const existing = await Enquiry.findById(id).populate('claimedBy', 'name email');
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry not found.'
        });
      }

      if (existing.claimedBy) {
        const isSelf = existing.claimedBy._id.toString() === counselorId.toString();
        return res.status(409).json({
          success: false,
          message: isSelf
            ? 'You have already claimed this enquiry.'
            : `Lead has already been claimed by another counselor (${existing.claimedBy.name || existing.claimedBy.email}).`,
          claimedBy: existing.claimedBy
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Unable to claim enquiry.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry successfully claimed and assigned to your account.',
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all leads claimed by the currently logged-in counselor
// @route   GET /api/enquiries/mine
// @access  Private (Employee authentication required)
const getMyClaimedEnquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {
      claimedBy: req.user._id
    };

    if (req.query.course) {
      query.courseInterest = { $regex: req.query.course, $options: 'i' };
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(query),
      Enquiry.find(query)
        .populate('claimedBy', 'name email')
        .sort({ claimedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      enquiries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Private (Employee authentication required)
const getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id).populate('claimedBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    // Access control: If claimed, only the claiming counselor or an admin can access
    if (
      enquiry.claimedBy &&
      enquiry.claimedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This enquiry is private to another counselor.'
      });
    }

    res.status(200).json({
      success: true,
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPublicEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyClaimedEnquiries,
  getEnquiryById
};
