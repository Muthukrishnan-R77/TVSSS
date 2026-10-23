const dbService = require('../services/dbService');

async function getJobList(req, res, next) {
  try {
    const isAuth = Boolean(req.user);
    const publicOnly = req.query.publicOnly === 'true' || !isAuth;
    const department = req.query.department;
    const search = req.query.search;
    const status = req.query.status;

    const list = await dbService.getAllJobs({
      isActiveOnly: publicOnly,
      department,
      search,
      status
    });

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

async function getJobById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const job = await dbService.getJobById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }
    return res.json(job);
  } catch (err) {
    next(err);
  }
}

async function createJob(req, res, next) {
  try {
    const {
      jobTitle, title, department, location, employmentType, jobDescription,
      eligibility, qualification, requiredSkills, responsibilities, experienceRequired,
      numberOfVacancies, vacancies, salaryInformation, applicationDeadline, closingDate, isActive, status
    } = req.body;

    const actualTitle = jobTitle || title;
    if (!actualTitle || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Job title and description are required' });
    }

    const created = await dbService.createJob({
      jobTitle: actualTitle,
      department: department || 'Engineering & R&D',
      location: location || 'Madurai, Tamil Nadu',
      employmentType: employmentType || 'Full Time',
      jobDescription,
      eligibility: eligibility || qualification,
      requiredSkills,
      responsibilities,
      experienceRequired,
      numberOfVacancies: numberOfVacancies || vacancies || 1,
      salaryInformation: salaryInformation || 'As per Industry Standards',
      closingDate: closingDate || applicationDeadline,
      applicationDeadline: applicationDeadline || closingDate,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true' || isActive === 1) : (status ? (status === 'Active' || status === 'Published') : true),
      status: status || 'Active',
      createdBy: req.user ? req.user.name : 'Admin'
    });

    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updated = await dbService.updateJob(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const success = await dbService.deleteJob(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }
    return res.json({ success: true, message: 'Job opening deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function activateJob(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updated = await dbService.updateJob(id, { isActive: true, status: 'Active' });
    if (!updated) return res.status(404).json({ success: false, message: 'Job opening not found' });
    return res.json({ success: true, message: 'Job opening activated successfully', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deactivateJob(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updated = await dbService.updateJob(id, { isActive: false, status: 'Closed' });
    if (!updated) return res.status(404).json({ success: false, message: 'Job opening not found' });
    return res.json({ success: true, message: 'Job opening closed successfully', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getJobList,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  activateJob,
  deactivateJob
};
