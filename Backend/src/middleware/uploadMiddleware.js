const multer = require('multer');
const path = require('path');
const fs = require('fs');

const rootUploadsDir = path.join(__dirname, '../../../Uploads');
const mediaUploadsDir = path.join(rootUploadsDir, 'media');
const resumesUploadsDir = path.join(rootUploadsDir, 'resumes');

[rootUploadsDir, mediaUploadsDir, resumesUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'resumeFile' || req.baseUrl.includes('career-applications')) {
      cb(null, resumesUploadsDir);
    } else {
      cb(null, mediaUploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBasename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}_${cleanBasename}${ext}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.mov', '.pdf', '.doc', '.docx'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${ext}). Allowed: JPG, PNG, WEBP, MP4, PDF, DOC, DOCX`));
    }
  }
});

module.exports = {
  upload,
  rootUploadsDir,
  mediaUploadsDir,
  resumesUploadsDir
};
