const dbService = require('../services/dbService');

async function submitEnquiry(req, res, next) {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const enquiry = await dbService.createEnquiry({
      name,
      email,
      phone,
      company,
      subject: subject || 'Public Website Inquiry',
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received successfully.',
      id: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
      enquiry
    });
  } catch (err) {
    next(err);
  }
}

async function getEnquiriesList(req, res, next) {
  try {
    const status = req.query.status;
    const search = req.query.search;

    const list = await dbService.getAllEnquiries({
      status,
      search
    });

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

async function getEnquiryById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const enquiry = await dbService.getEnquiryById(id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    return res.json(enquiry);
  } catch (err) {
    next(err);
  }
}

async function updateEnquiry(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { status, enquiryStatus, adminRemarks } = req.body;

    const updated = await dbService.updateEnquiryStatus(
      id,
      status || enquiryStatus,
      adminRemarks
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteEnquiry(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const success = await dbService.deleteEnquiry(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    return res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitEnquiry,
  getEnquiriesList,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry
};
