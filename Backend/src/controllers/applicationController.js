const dbService = require('../services/dbService');
const path = require('path');
const fs = require('fs');
const { rootUploadsDir } = require('../middleware/uploadMiddleware');

async function submitApplication(req, res, next) {
  try {
    const {
      applicantName, fullName, name, email, phone, phoneNumber,
      currentLocation, qualification, experience, coverLetter, coverNote, message,
      jobId
    } = req.body || {};

    const nameVal = applicantName || fullName || name;
    const emailVal = email;
    const phoneVal = phone || phoneNumber;

    if (!nameVal || !emailVal || !phoneVal) {
      return res.status(400).json({
        success: false,
        message: 'Applicant Name, Email, and Phone Number are required.'
      });
    }

    let resumeFileName = null;
    let resumeFilePath = null;
    if (req.file) {
      resumeFileName = req.file.originalname;
      resumeFilePath = '/Uploads/resumes/' + req.file.filename;
    }

    const application = await dbService.createApplication({
      jobId,
      applicantName: nameVal,
      email: emailVal,
      phone: phoneVal,
      currentLocation,
      qualification,
      experience,
      coverLetter: coverLetter || coverNote || message,
      resumeFileName,
      resumeFilePath
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your career application has been submitted successfully.',
      id: application.id,
      application
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationsList(req, res, next) {
  try {
    const status = req.query.status;
    const jobId = req.query.jobId;
    const search = req.query.search;

    const list = await dbService.getAllApplications({
      status,
      jobId,
      search
    });

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const app = await dbService.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Career application not found' });
    }
    return res.json(app);
  } catch (err) {
    next(err);
  }
}

async function updateApplication(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { applicationStatus, status, adminRemarks } = req.body;

    const updated = await dbService.updateApplicationStatus(
      id,
      applicationStatus || status,
      adminRemarks
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Career application not found' });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteApplication(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const success = await dbService.deleteApplication(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Career application not found' });
    }
    return res.json({ success: true, message: 'Career application deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function downloadResume(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const app = await dbService.getApplicationById(id);

    if (!app || (!app.resumeFilePath && !app.resumeFileName)) {
      return res.status(404).json({ success: false, message: 'Resume file reference not found for this application' });
    }

    const relPath = app.resumeFilePath || app.resumeFileName;
    const filename = path.basename(relPath);
    let absolutePath = path.join(rootUploadsDir, 'resumes', filename);

    if (!fs.existsSync(absolutePath)) {
      absolutePath = path.join(rootUploadsDir, filename);
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Resume file does not exist on server storage' });
    }

    const originalName = app.resumeFileName || filename;
    const isDownload = req.query.download === 'true';

    if (isDownload) {
      return res.download(absolutePath, originalName);
    } else {
      return res.sendFile(absolutePath);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitApplication,
  getApplicationsList,
  getApplicationById,
  updateApplication,
  deleteApplication,
  downloadResume
};
