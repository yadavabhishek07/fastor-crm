const Enquiry = require('../models/Enquiry');

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
      message: 'Enquiry submitted successfully.',
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

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

const claimEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const counselorId = req.user._id;

    // Atomic findOneAndUpdate prevents race conditions between multiple counselors
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
        message: 'Could not claim this enquiry.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry claimed successfully.',
      enquiry
    });
  } catch (error) {
    next(error);
  }
};

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

    if (
      enquiry.claimedBy &&
      enquiry.claimedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This enquiry is claimed by another counselor.'
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
