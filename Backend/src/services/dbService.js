const { getPool, mssql } = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const persistentStorePath = path.join(__dirname, '../../../database/persistent_store.json');

// Default initial state fallback data
let fallbackStore = {
  AdminUsers: [
    {
      Id: 1,
      Name: 'TVS Administrator',
      Email: 'admin@tvsss.co.in',
      PasswordHash: bcrypt.hashSync('Admin@TVSS2026', 10),
      IsActive: true,
      CreatedAt: new Date().toISOString()
    }
  ],
  Media: [
    {
      Id: 1,
      Title: 'TVS Sensing Solutions at EV India Expo 2026',
      ShortDescription: 'Showcasing custom EV sensors, AVAS sound generators, and battery monitoring modules.',
      MediaType: 'Image',
      FilePath: '/Uploads/media/ev_expo.jpg',
      ThumbnailPath: '/Uploads/media/ev_expo.jpg',
      ExternalLink: null,
      PublishDate: new Date().toISOString(),
      Status: 'Published',
      IsPublished: true,
      CreatedAt: new Date().toISOString(),
      CreatedBy: 'TVS Administrator'
    }
  ],
  CareerJobs: [
    {
      Id: 1,
      JobTitle: 'Senior Sensor R&D Engineer',
      Department: 'Engineering & R&D',
      Location: 'Madurai, Tamil Nadu',
      EmploymentType: 'Full Time',
      JobDescription: 'Lead design and prototyping of Next-Gen Hall-effect position sensors and automotive current transducers.',
      Eligibility: 'B.E / M.Tech in ECE / EEE / Mechatronics',
      RequiredSkills: 'IATF 16949, CAD, Hall Effect Sensors, Oscilloscopes',
      Responsibilities: 'Design PCB layouts, optimize magnetic circuit performance.',
      ExperienceRequired: '3 - 6 Years',
      NumberOfVacancies: 2,
      SalaryInformation: 'As per Industry Standards',
      ClosingDate: new Date('2026-12-31').toISOString(),
      ApplicationDeadline: new Date('2026-12-31').toISOString(),
      Status: 'Active',
      IsActive: true,
      CreatedAt: new Date().toISOString(),
      CreatedBy: 'TVS Administrator'
    }
  ],
  CareerApplications: [],
  Enquiries: []
};

// Persistent File Storage loader/saver
function loadPersistentStore() {
  try {
    if (fs.existsSync(persistentStorePath)) {
      const fileData = fs.readFileSync(persistentStorePath, 'utf8');
      const json = JSON.parse(fileData);
      if (json && typeof json === 'object') {
        fallbackStore = { ...fallbackStore, ...json };
        console.log('✓ Loaded persistent database store from disk:', persistentStorePath);
      }
    }
  } catch (err) {
    console.error('[Persistent Store Load Warning]:', err.message);
  }
}

function savePersistentStore() {
  try {
    const dir = path.dirname(persistentStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(persistentStorePath, JSON.stringify(fallbackStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[Persistent Store Save Error]:', err.message);
  }
}

loadPersistentStore();

// ==========================================
// 1. AUTHENTICATION SERVICE
// ==========================================
async function getAdminByEmail(email) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Email', mssql.NVarChar(150), email.trim().toLowerCase())
        .query('SELECT * FROM dbo.AdminUsers WHERE LOWER(Email) = @Email AND IsActive = 1');
      return res.recordset[0] || null;
    } catch (err) {
      console.error('[SQL Error getAdminByEmail]:', err.message);
    }
  }
  return fallbackStore.AdminUsers.find(u => u.Email.toLowerCase() === email.trim().toLowerCase() && u.IsActive) || null;
}

async function updateAdminPassword(id, passwordHash) {
  const pool = await getPool();
  if (pool) {
    try {
      await pool.request()
        .input('Id', mssql.Int, id)
        .input('PasswordHash', mssql.NVarChar(mssql.MAX), passwordHash)
        .query('UPDATE dbo.AdminUsers SET PasswordHash = @PasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE Id = @Id');
      return true;
    } catch (err) {
      console.error('[SQL Error updateAdminPassword]:', err.message);
    }
  }
  const u = fallbackStore.AdminUsers.find(user => user.Id === id);
  if (u) { u.PasswordHash = passwordHash; savePersistentStore(); }
  return true;
}

async function seedInitialAdmin() {
  const pool = await getPool();
  if (pool) {
    try {
      const existing = await pool.request()
        .input('Email', mssql.NVarChar(150), 'admin@tvsss.co.in')
        .query('SELECT Id FROM dbo.AdminUsers WHERE LOWER(Email) = @Email');
      
      if (existing.recordset.length === 0) {
        const passHash = bcrypt.hashSync('Admin@TVSS2026', 10);
        await pool.request()
          .input('Name', mssql.NVarChar(100), 'TVS Administrator')
          .input('Email', mssql.NVarChar(150), 'admin@tvsss.co.in')
          .input('PasswordHash', mssql.NVarChar(mssql.MAX), passHash)
          .query('INSERT INTO dbo.AdminUsers (Name, Email, PasswordHash, IsActive) VALUES (@Name, @Email, @PasswordHash, 1)');
        console.log('✓ Initial Administrator seeded into MS SQL Server (admin@tvsss.co.in)');
      }
    } catch (err) {
      console.error('[SQL Error seedInitialAdmin]:', err.message);
    }
  }
}

// ==========================================
// 2. MEDIA SERVICE
// ==========================================
async function getAllMedia(options = {}) {
  const pool = await getPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM dbo.Media WHERE 1=1';
      const request = pool.request();

      if (options.isPublishedOnly) {
        query += ' AND (IsPublished = 1 OR Status = \'Published\')';
      }
      if (options.type && options.type !== 'all') {
        request.input('MediaType', mssql.NVarChar(50), options.type);
        query += ' AND LOWER(MediaType) = LOWER(@MediaType)';
      }
      if (options.search) {
        request.input('Search', mssql.NVarChar(250), `%${options.search}%`);
        query += ' AND (Title LIKE @Search OR ShortDescription LIKE @Search)';
      }

      query += ' ORDER BY PublishDate DESC, Id DESC';
      const res = await request.query(query);
      return res.recordset.map(formatMediaRecord);
    } catch (err) {
      console.error('[SQL Error getAllMedia]:', err.message);
    }
  }

  loadPersistentStore();
  let list = [...fallbackStore.Media];
  if (options.isPublishedOnly) list = list.filter(m => m.IsPublished || m.Status === 'Published');
  if (options.type && options.type !== 'all') list = list.filter(m => m.MediaType.toLowerCase() === options.type.toLowerCase());
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(m => m.Title.toLowerCase().includes(s) || (m.ShortDescription && m.ShortDescription.toLowerCase().includes(s)));
  }
  return list.sort((a,b) => new Date(b.PublishDate) - new Date(a.PublishDate)).map(formatMediaRecord);
}

async function getMediaById(id) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .query('SELECT * FROM dbo.Media WHERE Id = @Id');
      if (res.recordset[0]) return formatMediaRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error getMediaById]:', err.message);
    }
  }
  const item = fallbackStore.Media.find(m => m.Id === parseInt(id));
  return item ? formatMediaRecord(item) : null;
}

async function createMedia(data) {
  const pool = await getPool();
  const isPub = data.isPublished === true || data.isPublished === 'true' || data.status === 'Published';
  const statusStr = isPub ? 'Published' : 'Unpublished';

  if (pool) {
    try {
      const res = await pool.request()
        .input('Title', mssql.NVarChar(250), data.title)
        .input('ShortDescription', mssql.NVarChar(1000), data.shortDescription || null)
        .input('MediaType', mssql.NVarChar(50), data.mediaType || 'Image')
        .input('FileName', mssql.NVarChar(255), data.fileName || null)
        .input('FilePath', mssql.NVarChar(500), data.filePath || null)
        .input('ThumbnailPath', mssql.NVarChar(500), data.thumbnailPath || data.filePath || null)
        .input('ExternalLink', mssql.NVarChar(500), data.externalLink || null)
        .input('PublishDate', mssql.DateTime2, data.publishDate ? new Date(data.publishDate) : new Date())
        .input('Status', mssql.NVarChar(50), statusStr)
        .input('IsPublished', mssql.Bit, isPub ? 1 : 0)
        .input('CreatedBy', mssql.NVarChar(100), data.createdBy || 'Admin')
        .query(`
          INSERT INTO dbo.Media 
          (Title, ShortDescription, MediaType, FileName, FilePath, ThumbnailPath, ExternalLink, PublishDate, Status, IsPublished, CreatedBy)
          OUTPUT INSERTED.*
          VALUES (@Title, @ShortDescription, @MediaType, @FileName, @FilePath, @ThumbnailPath, @ExternalLink, @PublishDate, @Status, @IsPublished, @CreatedBy)
        `);
      return formatMediaRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error createMedia]:', err.message);
    }
  }

  const newId = fallbackStore.Media.length > 0 ? Math.max(...fallbackStore.Media.map(m => m.Id)) + 1 : 1;
  const newM = {
    Id: newId,
    Title: data.title,
    ShortDescription: data.shortDescription || null,
    MediaType: data.mediaType || 'Image',
    FileName: data.fileName || null,
    FilePath: data.filePath || null,
    ThumbnailPath: data.thumbnailPath || data.filePath || null,
    ExternalLink: data.externalLink || null,
    PublishDate: data.publishDate || new Date().toISOString(),
    Status: statusStr,
    IsPublished: isPub,
    CreatedAt: new Date().toISOString(),
    CreatedBy: data.createdBy || 'Admin'
  };
  fallbackStore.Media.push(newM);
  savePersistentStore();
  return formatMediaRecord(newM);
}

async function updateMedia(id, data) {
  const pool = await getPool();
  const isPub = data.isPublished !== undefined ? (data.isPublished === true || data.isPublished === 'true') : (data.status ? data.status === 'Published' : undefined);

  if (pool) {
    try {
      const existing = await getMediaById(id);
      if (!existing) return null;

      const title = data.title !== undefined ? data.title : existing.title;
      const desc = data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription;
      const mType = data.mediaType !== undefined ? data.mediaType : existing.mediaType;
      const fPath = data.filePath !== undefined ? data.filePath : existing.filePath;
      const extLink = data.externalLink !== undefined ? data.externalLink : existing.externalLink;
      const pubDate = data.publishDate ? new Date(data.publishDate) : new Date(existing.publishDate);
      const pubStatus = isPub !== undefined ? (isPub ? 'Published' : 'Unpublished') : existing.status;
      const pubBit = isPub !== undefined ? (isPub ? 1 : 0) : (existing.isPublished ? 1 : 0);

      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .input('Title', mssql.NVarChar(250), title)
        .input('ShortDescription', mssql.NVarChar(1000), desc)
        .input('MediaType', mssql.NVarChar(50), mType)
        .input('FilePath', mssql.NVarChar(500), fPath)
        .input('ExternalLink', mssql.NVarChar(500), extLink)
        .input('PublishDate', mssql.DateTime2, pubDate)
        .input('Status', mssql.NVarChar(50), pubStatus)
        .input('IsPublished', mssql.Bit, pubBit)
        .query(`
          UPDATE dbo.Media
          SET Title = @Title, ShortDescription = @ShortDescription, MediaType = @MediaType,
              FilePath = @FilePath, ExternalLink = @ExternalLink, PublishDate = @PublishDate,
              Status = @Status, IsPublished = @IsPublished, UpdatedAt = SYSUTCDATETIME()
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);
      return formatMediaRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error updateMedia]:', err.message);
    }
  }

  const m = fallbackStore.Media.find(item => item.Id === parseInt(id));
  if (!m) return null;
  if (data.title !== undefined) m.Title = data.title;
  if (data.shortDescription !== undefined) m.ShortDescription = data.shortDescription;
  if (data.mediaType !== undefined) m.MediaType = data.mediaType;
  if (data.filePath !== undefined) m.FilePath = data.filePath;
  if (data.externalLink !== undefined) m.ExternalLink = data.externalLink;
  if (data.publishDate) m.PublishDate = new Date(data.publishDate).toISOString();
  if (isPub !== undefined) {
    m.IsPublished = isPub;
    m.Status = isPub ? 'Published' : 'Unpublished';
  }
  savePersistentStore();
  return formatMediaRecord(m);
}

async function deleteMedia(id) {
  const pool = await getPool();
  if (pool) {
    try {
      await pool.request().input('Id', mssql.Int, id).query('DELETE FROM dbo.Media WHERE Id = @Id');
      return true;
    } catch (err) {
      console.error('[SQL Error deleteMedia]:', err.message);
    }
  }
  const idx = fallbackStore.Media.findIndex(m => m.Id === parseInt(id));
  if (idx !== -1) {
    fallbackStore.Media.splice(idx, 1);
    savePersistentStore();
    return true;
  }
  return false;
}

function formatMediaRecord(m) {
  if (!m) return null;
  const isPub = m.IsPublished === true || m.IsPublished === 1 || m.Status === 'Published';
  return {
    id: m.Id,
    title: m.Title,
    shortDescription: m.ShortDescription,
    mediaType: m.MediaType || 'Image',
    fileName: m.FileName || null,
    filePath: m.FilePath || null,
    thumbnailPath: m.ThumbnailPath || m.FilePath || null,
    externalLink: m.ExternalLink || null,
    publishDate: m.PublishDate,
    status: isPub ? 'Published' : 'Unpublished',
    isPublished: isPub,
    createdAt: m.CreatedAt,
    createdBy: m.CreatedBy || 'Admin'
  };
}

// ==========================================
// 3. CAREER JOBS SERVICE
// ==========================================
async function getAllJobs(options = {}) {
  const pool = await getPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM dbo.CareerJobs WHERE 1=1';
      const request = pool.request();

      if (options.isActiveOnly) {
        query += ' AND (IsActive = 1 OR Status = \'Active\')';
      } else if (options.status && options.status !== 'all') {
        const s = String(options.status).trim().toLowerCase();
        if (s === 'active' || s === 'published' || s === 'open') {
          query += ' AND (IsActive = 1 OR Status = \'Active\')';
        } else if (s === 'closed' || s === 'inactive' || s === 'unpublished') {
          query += ' AND (IsActive = 0 OR Status = \'Closed\' OR Status = \'Unpublished\')';
        }
      }

      if (options.department && options.department !== 'all') {
        request.input('Dept', mssql.NVarChar(100), options.department);
        query += ' AND LOWER(Department) = LOWER(@Dept)';
      }

      if (options.search) {
        request.input('Search', mssql.NVarChar(250), `%${options.search}%`);
        query += ' AND (JobTitle LIKE @Search OR JobDescription LIKE @Search OR RequiredSkills LIKE @Search)';
      }

      query += ' ORDER BY CreatedAt DESC, Id DESC';
      const res = await request.query(query);
      return res.recordset.map(formatJobRecord);
    } catch (err) {
      console.error('[SQL Error getAllJobs]:', err.message);
    }
  }

  let list = [...fallbackStore.CareerJobs];
  loadPersistentStore();
  list = [...fallbackStore.CareerJobs];
  if (options.isActiveOnly) list = list.filter(c => c.IsActive || c.Status === 'Active');
  if (options.department && options.department !== 'all') list = list.filter(c => c.Department && c.Department.toLowerCase() === options.department.toLowerCase());
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(c => (c.JobTitle && c.JobTitle.toLowerCase().includes(s)) || (c.JobDescription && c.JobDescription.toLowerCase().includes(s)));
  }
  return list.sort((a,b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)).map(formatJobRecord);
}

async function getJobById(id) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .query('SELECT * FROM dbo.CareerJobs WHERE Id = @Id');
      if (res.recordset[0]) return formatJobRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error getJobById]:', err.message);
    }
  }
  const item = fallbackStore.CareerJobs.find(c => c.Id === parseInt(id));
  return item ? formatJobRecord(item) : null;
}

async function createJob(data) {
  const pool = await getPool();
  const isActiveFlag = data.isActive !== undefined ? (data.isActive === true || data.isActive === 'true' || data.isActive === 1) : (data.status ? (data.status === 'Active' || data.status === 'Published') : true);
  const statusStr = isActiveFlag ? 'Active' : (data.status || 'Closed');

  if (pool) {
    try {
      const res = await pool.request()
        .input('JobTitle', mssql.NVarChar(200), data.jobTitle || data.title)
        .input('Department', mssql.NVarChar(100), data.department || 'Engineering & R&D')
        .input('Location', mssql.NVarChar(100), data.location || 'Madurai, Tamil Nadu')
        .input('EmploymentType', mssql.NVarChar(50), data.employmentType || 'Full Time')
        .input('JobDescription', mssql.NVarChar(mssql.MAX), data.jobDescription)
        .input('Eligibility', mssql.NVarChar(mssql.MAX), data.eligibility || data.qualification || null)
        .input('RequiredSkills', mssql.NVarChar(mssql.MAX), data.requiredSkills || null)
        .input('Responsibilities', mssql.NVarChar(mssql.MAX), data.responsibilities || null)
        .input('ExperienceRequired', mssql.NVarChar(mssql.MAX), data.experienceRequired || null)
        .input('NumberOfVacancies', mssql.Int, parseInt(data.numberOfVacancies || data.vacancies || 1))
        .input('SalaryInformation', mssql.NVarChar(100), data.salaryInformation || 'As per Industry Standards')
        .input('ClosingDate', mssql.DateTime2, data.closingDate || data.applicationDeadline ? new Date(data.closingDate || data.applicationDeadline) : null)
        .input('ApplicationDeadline', mssql.DateTime2, data.applicationDeadline || data.closingDate ? new Date(data.applicationDeadline || data.closingDate) : null)
        .input('Status', mssql.NVarChar(50), statusStr)
        .input('IsActive', mssql.Bit, isActiveFlag ? 1 : 0)
        .input('CreatedBy', mssql.NVarChar(100), data.createdBy || 'Admin')
        .query(`
          INSERT INTO dbo.CareerJobs
          (JobTitle, Department, Location, EmploymentType, JobDescription, Eligibility, RequiredSkills, Responsibilities, ExperienceRequired, NumberOfVacancies, SalaryInformation, ClosingDate, ApplicationDeadline, Status, IsActive, CreatedBy)
          OUTPUT INSERTED.*
          VALUES (@JobTitle, @Department, @Location, @EmploymentType, @JobDescription, @Eligibility, @RequiredSkills, @Responsibilities, @ExperienceRequired, @NumberOfVacancies, @SalaryInformation, @ClosingDate, @ApplicationDeadline, @Status, @IsActive, @CreatedBy)
        `);
      return formatJobRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error createJob]:', err.message);
    }
  }

  const newId = fallbackStore.CareerJobs.length > 0 ? Math.max(...fallbackStore.CareerJobs.map(c => c.Id)) + 1 : 1;
  const newJ = {
    Id: newId,
    JobTitle: data.jobTitle || data.title,
    Department: data.department || 'Engineering & R&D',
    Location: data.location || 'Madurai, Tamil Nadu',
    EmploymentType: data.employmentType || 'Full Time',
    JobDescription: data.jobDescription,
    Eligibility: data.eligibility || data.qualification || null,
    RequiredSkills: data.requiredSkills || null,
    Responsibilities: data.responsibilities || null,
    ExperienceRequired: data.experienceRequired || null,
    NumberOfVacancies: parseInt(data.numberOfVacancies || data.vacancies || 1),
    SalaryInformation: data.salaryInformation || 'As per Industry Standards',
    ClosingDate: data.closingDate || data.applicationDeadline || null,
    ApplicationDeadline: data.applicationDeadline || data.closingDate || null,
    Status: statusStr,
    IsActive: isActiveFlag,
    CreatedAt: new Date().toISOString(),
    CreatedBy: data.createdBy || 'Admin'
  };
  fallbackStore.CareerJobs.push(newJ);
  savePersistentStore();
  return formatJobRecord(newJ);
}

async function updateJob(id, data) {
  const pool = await getPool();
  if (pool) {
    try {
      const existing = await getJobById(id);
      if (!existing) return null;

      const jTitle = data.jobTitle || data.title || existing.jobTitle;
      const dept = data.department !== undefined ? data.department : existing.department;
      const loc = data.location || existing.location;
      const empType = data.employmentType || existing.employmentType;
      const jDesc = data.jobDescription || existing.jobDescription;
      const elig = data.eligibility || data.qualification || existing.eligibility;
      const reqSkills = data.requiredSkills !== undefined ? data.requiredSkills : existing.requiredSkills;
      const resp = data.responsibilities !== undefined ? data.responsibilities : existing.responsibilities;
      const expReq = data.experienceRequired !== undefined ? data.experienceRequired : existing.experienceRequired;
      const vac = data.numberOfVacancies || data.vacancies || existing.numberOfVacancies;
      const sal = data.salaryInformation !== undefined ? data.salaryInformation : existing.salaryInformation;
      const deadline = data.closingDate || data.applicationDeadline ? new Date(data.closingDate || data.applicationDeadline) : (existing.closingDate ? new Date(existing.closingDate) : null);
      
      const isActiveFlag = data.isActive !== undefined ? (data.isActive === true || data.isActive === 'true' || data.isActive === 1) : (data.status ? (data.status === 'Active' || data.status === 'Published') : existing.isActive);
      const statusStr = isActiveFlag ? 'Active' : (data.status || 'Closed');

      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .input('JobTitle', mssql.NVarChar(200), jTitle)
        .input('Department', mssql.NVarChar(100), dept)
        .input('Location', mssql.NVarChar(100), loc)
        .input('EmploymentType', mssql.NVarChar(50), empType)
        .input('JobDescription', mssql.NVarChar(mssql.MAX), jDesc)
        .input('Eligibility', mssql.NVarChar(mssql.MAX), elig)
        .input('RequiredSkills', mssql.NVarChar(mssql.MAX), reqSkills)
        .input('Responsibilities', mssql.NVarChar(mssql.MAX), resp)
        .input('ExperienceRequired', mssql.NVarChar(mssql.MAX), expReq)
        .input('NumberOfVacancies', mssql.Int, parseInt(vac))
        .input('SalaryInformation', mssql.NVarChar(100), sal)
        .input('ClosingDate', mssql.DateTime2, deadline)
        .input('ApplicationDeadline', mssql.DateTime2, deadline)
        .input('Status', mssql.NVarChar(50), statusStr)
        .input('IsActive', mssql.Bit, isActiveFlag ? 1 : 0)
        .query(`
          UPDATE dbo.CareerJobs
          SET JobTitle = @JobTitle, Department = @Department, Location = @Location,
              EmploymentType = @EmploymentType, JobDescription = @JobDescription,
              Eligibility = @Eligibility, RequiredSkills = @RequiredSkills,
              Responsibilities = @Responsibilities, ExperienceRequired = @ExperienceRequired,
              NumberOfVacancies = @NumberOfVacancies, SalaryInformation = @SalaryInformation,
              ClosingDate = @ClosingDate, ApplicationDeadline = @ApplicationDeadline,
              Status = @Status, IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);
      return formatJobRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error updateJob]:', err.message);
    }
  }

  const c = fallbackStore.CareerJobs.find(item => item.Id === parseInt(id));
  if (!c) return null;
  if (data.jobTitle || data.title) c.JobTitle = data.jobTitle || data.title;
  if (data.department !== undefined) c.Department = data.department;
  if (data.jobDescription) c.JobDescription = data.jobDescription;
  if (data.isActive !== undefined) {
    c.IsActive = Boolean(data.isActive);
    c.Status = c.IsActive ? 'Active' : 'Closed';
  }
  savePersistentStore();
  return formatJobRecord(c);
}

async function deleteJob(id) {
  const pool = await getPool();
  if (pool) {
    try {
      await pool.request().input('Id', mssql.Int, id).query('DELETE FROM dbo.CareerJobs WHERE Id = @Id');
      return true;
    } catch (err) {
      console.error('[SQL Error deleteJob]:', err.message);
    }
  }
  const idx = fallbackStore.CareerJobs.findIndex(c => c.Id === parseInt(id));
  if (idx !== -1) {
    fallbackStore.CareerJobs.splice(idx, 1);
    savePersistentStore();
    return true;
  }
  return false;
}

function formatJobRecord(c) {
  if (!c) return null;
  const isAct = c.IsActive === true || c.IsActive === 1 || c.Status === 'Active';
  const deadline = c.ClosingDate || c.ApplicationDeadline || null;
  return {
    id: c.Id,
    jobId: c.Id,
    jobTitle: c.JobTitle,
    title: c.JobTitle,
    department: c.Department || 'Engineering',
    location: c.Location || 'Madurai, Tamil Nadu',
    employmentType: c.EmploymentType || 'Full Time',
    jobDescription: c.JobDescription,
    eligibility: c.Eligibility,
    qualification: c.Eligibility,
    requiredSkills: c.RequiredSkills,
    responsibilities: c.Responsibilities,
    experienceRequired: c.ExperienceRequired,
    numberOfVacancies: c.NumberOfVacancies || 1,
    vacancies: c.NumberOfVacancies || 1,
    salaryInformation: c.SalaryInformation,
    closingDate: deadline,
    applicationDeadline: deadline,
    status: isAct ? 'Active' : 'Closed',
    isActive: isAct,
    createdAt: c.CreatedAt,
    createdBy: c.CreatedBy || 'Admin'
  };
}

// ==========================================
// 4. CAREER APPLICATIONS SERVICE (STRICT DATA ISOLATION)
// ==========================================
async function getAllApplications(options = {}) {
  const pool = await getPool();
  if (pool) {
    try {
      let query = `
        SELECT a.*, j.JobTitle AS LinkedJobTitle, j.Department AS LinkedDept
        FROM dbo.CareerApplications a
        LEFT JOIN dbo.CareerJobs j ON a.JobId = j.Id
        WHERE 1=1
      `;
      const request = pool.request();

      if (options.status && options.status !== 'all') {
        request.input('Status', mssql.NVarChar(50), options.status);
        query += ' AND LOWER(a.ApplicationStatus) = LOWER(@Status)';
      }
      if (options.jobId && options.jobId !== 'all') {
        request.input('JobId', mssql.Int, parseInt(options.jobId));
        query += ' AND a.JobId = @JobId';
      }
      if (options.search) {
        request.input('Search', mssql.NVarChar(250), `%${options.search}%`);
        query += ' AND (a.ApplicantName LIKE @Search OR a.Email LIKE @Search OR a.Phone LIKE @Search OR j.JobTitle LIKE @Search)';
      }

      query += ' ORDER BY a.SubmittedAt DESC, a.Id DESC';
      const res = await request.query(query);
      return res.recordset.map(formatApplicationRecord);
    } catch (err) {
      console.error('[SQL Error getAllApplications]:', err.message);
    }
  }

  loadPersistentStore();
  let list = [...fallbackStore.CareerApplications];
  if (options.status && options.status !== 'all') list = list.filter(a => (a.ApplicationStatus || 'New').toLowerCase() === options.status.toLowerCase());
  if (options.jobId && options.jobId !== 'all') list = list.filter(a => a.JobId === parseInt(options.jobId));
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(a => (a.ApplicantName && a.ApplicantName.toLowerCase().includes(s)) || (a.Email && a.Email.toLowerCase().includes(s)));
  }
  return list.sort((a,b) => new Date(b.SubmittedAt || b.CreatedAt) - new Date(a.SubmittedAt || a.CreatedAt)).map(a => {
    const linkedJob = fallbackStore.CareerJobs.find(j => j.Id === a.JobId);
    return formatApplicationRecord({ ...a, LinkedJobTitle: linkedJob ? linkedJob.JobTitle : (a.LinkedJobTitle || null) });
  });
}

async function getApplicationById(id) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .query(`
          SELECT a.*, j.JobTitle AS LinkedJobTitle, j.Department AS LinkedDept
          FROM dbo.CareerApplications a
          LEFT JOIN dbo.CareerJobs j ON a.JobId = j.Id
          WHERE a.Id = @Id
        `);
      if (res.recordset[0]) return formatApplicationRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error getApplicationById]:', err.message);
    }
  }
  loadPersistentStore();
  const app = fallbackStore.CareerApplications.find(a => a.Id === parseInt(id));
  if (!app) return null;
  const linkedJob = fallbackStore.CareerJobs.find(j => j.Id === app.JobId);
  return formatApplicationRecord({ ...app, LinkedJobTitle: linkedJob ? linkedJob.JobTitle : (app.LinkedJobTitle || null) });
}

async function createApplication(data) {
  const pool = await getPool();

  if (pool) {
    try {
      const res = await pool.request()
        .input('JobId', mssql.Int, data.jobId ? parseInt(data.jobId) : null)
        .input('ApplicantName', mssql.NVarChar(150), data.applicantName || data.fullName || data.name)
        .input('Email', mssql.NVarChar(150), data.email)
        .input('Phone', mssql.NVarChar(30), data.phone || data.phoneNumber || null)
        .input('CurrentLocation', mssql.NVarChar(100), data.currentLocation || null)
        .input('Qualification', mssql.NVarChar(200), data.qualification || null)
        .input('Experience', mssql.NVarChar(100), data.experience || null)
        .input('CoverLetter', mssql.NVarChar(mssql.MAX), data.coverLetter || data.coverNote || data.message || null)
        .input('ResumeFileName', mssql.NVarChar(255), data.resumeFileName || null)
        .input('ResumeFilePath', mssql.NVarChar(500), data.resumeFilePath || null)
        .input('ApplicationStatus', mssql.NVarChar(50), 'New')
        .query(`
          INSERT INTO dbo.CareerApplications
          (JobId, ApplicantName, Email, Phone, CurrentLocation, Qualification, Experience, CoverLetter, ResumeFileName, ResumeFilePath, ApplicationStatus)
          OUTPUT INSERTED.*
          VALUES (@JobId, @ApplicantName, @Email, @Phone, @CurrentLocation, @Qualification, @Experience, @CoverLetter, @ResumeFileName, @ResumeFilePath, @ApplicationStatus)
        `);
      return formatApplicationRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error createApplication]:', err.message);
    }
  }

  const newId = fallbackStore.CareerApplications.length > 0 ? Math.max(...fallbackStore.CareerApplications.map(a => a.Id)) + 1 : 1;
  const newApp = {
    Id: newId,
    JobId: data.jobId ? parseInt(data.jobId) : null,
    ApplicantName: data.applicantName || data.fullName || data.name,
    Email: data.email,
    Phone: data.phone || data.phoneNumber || null,
    CurrentLocation: data.currentLocation || null,
    Qualification: data.qualification || null,
    Experience: data.experience || null,
    CoverLetter: data.coverLetter || data.coverNote || data.message || null,
    ResumeFileName: data.resumeFileName || null,
    ResumeFilePath: data.resumeFilePath || null,
    ApplicationStatus: 'New',
    AdminRemarks: null,
    SubmittedAt: new Date().toISOString()
  };
  fallbackStore.CareerApplications.push(newApp);
  savePersistentStore();
  return formatApplicationRecord(newApp);
}

async function updateApplicationStatus(id, status, adminRemarks) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .input('ApplicationStatus', mssql.NVarChar(50), status)
        .input('AdminRemarks', mssql.NVarChar(mssql.MAX), adminRemarks !== undefined ? adminRemarks : null)
        .query(`
          UPDATE dbo.CareerApplications
          SET ApplicationStatus = @ApplicationStatus,
              AdminRemarks = ISNULL(@AdminRemarks, AdminRemarks),
              UpdatedAt = SYSUTCDATETIME()
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);
      return formatApplicationRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error updateApplicationStatus]:', err.message);
    }
  }

  const a = fallbackStore.CareerApplications.find(app => app.Id === parseInt(id));
  if (!a) return null;
  if (status) a.ApplicationStatus = status;
  if (adminRemarks !== undefined) a.AdminRemarks = adminRemarks;
  savePersistentStore();
  return formatApplicationRecord(a);
}

async function deleteApplication(id) {
  const pool = await getPool();
  if (pool) {
    try {
      await pool.request().input('Id', mssql.Int, id).query('DELETE FROM dbo.CareerApplications WHERE Id = @Id');
      return true;
    } catch (err) {
      console.error('[SQL Error deleteApplication]:', err.message);
    }
  }
  const idx = fallbackStore.CareerApplications.findIndex(a => a.Id === parseInt(id));
  if (idx !== -1) {
    fallbackStore.CareerApplications.splice(idx, 1);
    savePersistentStore();
    return true;
  }
  return false;
}

function formatApplicationRecord(a) {
  if (!a) return null;
  return {
    id: a.Id,
    applicationId: a.Id,
    jobId: a.JobId || null,
    applicantName: a.ApplicantName || a.FullName || '',
    fullName: a.ApplicantName || a.FullName || '',
    name: a.ApplicantName || a.FullName || '',
    email: a.Email || '',
    phone: a.Phone || a.PhoneNumber || '',
    phoneNumber: a.Phone || a.PhoneNumber || '',
    currentLocation: a.CurrentLocation || null,
    qualification: a.Qualification || null,
    experience: a.Experience || null,
    coverLetter: a.CoverLetter || a.CoverNote || null,
    coverNote: a.CoverLetter || a.CoverNote || null,
    resumeFileName: a.ResumeFileName || null,
    resumeFilePath: a.ResumeFilePath || null,
    applicationStatus: a.ApplicationStatus || 'New',
    status: a.ApplicationStatus || 'New',
    adminRemarks: a.AdminRemarks || null,
    jobTitle: a.LinkedJobTitle || a.JobTitle || 'General Application',
    appliedJob: a.LinkedJobTitle || a.JobTitle || 'General Application',
    submittedAt: a.SubmittedAt || a.CreatedAt || new Date().toISOString(),
    submittedDate: a.SubmittedAt || a.CreatedAt || new Date().toISOString()
  };
}

// ==========================================
// 5. ENQUIRIES SERVICE (STRICT DATA ISOLATION)
// ==========================================
async function getAllEnquiries(options = {}) {
  const pool = await getPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM dbo.Enquiries WHERE 1=1';
      const request = pool.request();

      if (options.status && options.status !== 'all') {
        request.input('Status', mssql.NVarChar(50), options.status);
        query += ' AND LOWER(EnquiryStatus) = LOWER(@Status)';
      }
      if (options.search) {
        request.input('Search', mssql.NVarChar(250), `%${options.search}%`);
        query += ' AND (Name LIKE @Search OR Email LIKE @Search OR Subject LIKE @Search OR Company LIKE @Search)';
      }

      query += ' ORDER BY SubmittedAt DESC, Id DESC';
      const res = await request.query(query);
      return res.recordset.map(formatEnquiryRecord);
    } catch (err) {
      console.error('[SQL Error getAllEnquiries]:', err.message);
    }
  }

  let list = [...fallbackStore.Enquiries];
  if (options.status && options.status !== 'all') list = list.filter(e => e.EnquiryStatus.toLowerCase() === options.status.toLowerCase());
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(e => e.Name.toLowerCase().includes(s) || e.Email.toLowerCase().includes(s) || e.Subject.toLowerCase().includes(s));
  }
  return list.sort((a,b) => new Date(b.SubmittedAt) - new Date(a.SubmittedAt)).map(formatEnquiryRecord);
}

async function getEnquiryById(id) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .query('SELECT * FROM dbo.Enquiries WHERE Id = @Id');
      if (res.recordset[0]) return formatEnquiryRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error getEnquiryById]:', err.message);
    }
  }
  const e = fallbackStore.Enquiries.find(item => item.Id === parseInt(id));
  return e ? formatEnquiryRecord(e) : null;
}

async function createEnquiry(data) {
  const pool = await getPool();

  if (pool) {
    try {
      const enquiryNum = 'ENQ-' + String(Date.now()).slice(-6);
      const res = await pool.request()
        .input('EnquiryNumber', mssql.NVarChar(50), enquiryNum)
        .input('Name', mssql.NVarChar(150), data.name)
        .input('Email', mssql.NVarChar(150), data.email)
        .input('Phone', mssql.NVarChar(30), data.phone || null)
        .input('Company', mssql.NVarChar(150), data.company || null)
        .input('Subject', mssql.NVarChar(250), data.subject || 'Website Inquiry')
        .input('Message', mssql.NVarChar(mssql.MAX), data.message)
        .input('EnquiryStatus', mssql.NVarChar(50), 'New')
        .query(`
          INSERT INTO dbo.Enquiries
          (EnquiryNumber, Name, Email, Phone, Company, Subject, Message, EnquiryStatus)
          OUTPUT INSERTED.*
          VALUES (@EnquiryNumber, @Name, @Email, @Phone, @Company, @Subject, @Message, @EnquiryStatus)
        `);
      return formatEnquiryRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error createEnquiry]:', err.message);
    }
  }

  const newId = fallbackStore.Enquiries.length > 0 ? Math.max(...fallbackStore.Enquiries.map(e => e.Id)) + 1 : 1;
  const newEnq = {
    Id: newId,
    EnquiryNumber: 'ENQ-' + String(newId).padStart(6, '0'),
    Name: data.name,
    Email: data.email,
    Phone: data.phone || null,
    Company: data.company || null,
    Subject: data.subject || 'Website Inquiry',
    Message: data.message,
    EnquiryStatus: 'New',
    AdminRemarks: null,
    SubmittedAt: new Date().toISOString()
  };
  fallbackStore.Enquiries.push(newEnq);
  savePersistentStore();
  return formatEnquiryRecord(newEnq);
}

async function updateEnquiryStatus(id, status, adminRemarks) {
  const pool = await getPool();
  if (pool) {
    try {
      const res = await pool.request()
        .input('Id', mssql.Int, id)
        .input('EnquiryStatus', mssql.NVarChar(50), status)
        .input('AdminRemarks', mssql.NVarChar(mssql.MAX), adminRemarks !== undefined ? adminRemarks : null)
        .query(`
          UPDATE dbo.Enquiries
          SET EnquiryStatus = @EnquiryStatus,
              AdminRemarks = ISNULL(@AdminRemarks, AdminRemarks),
              UpdatedAt = SYSUTCDATETIME()
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);
      return formatEnquiryRecord(res.recordset[0]);
    } catch (err) {
      console.error('[SQL Error updateEnquiryStatus]:', err.message);
    }
  }

  const e = fallbackStore.Enquiries.find(item => item.Id === parseInt(id));
  if (!e) return null;
  if (status) e.EnquiryStatus = status;
  if (adminRemarks !== undefined) e.AdminRemarks = adminRemarks;
  savePersistentStore();
  return formatEnquiryRecord(e);
}

async function deleteEnquiry(id) {
  const pool = await getPool();
  if (pool) {
    try {
      await pool.request().input('Id', mssql.Int, id).query('DELETE FROM dbo.Enquiries WHERE Id = @Id');
      return true;
    } catch (err) {
      console.error('[SQL Error deleteEnquiry]:', err.message);
    }
  }
  const idx = fallbackStore.Enquiries.findIndex(e => e.Id === parseInt(id));
  if (idx !== -1) {
    fallbackStore.Enquiries.splice(idx, 1);
    savePersistentStore();
    return true;
  }
  return false;
}

function formatEnquiryRecord(e) {
  if (!e) return null;
  return {
    id: e.Id,
    enquiryNumber: e.EnquiryNumber || ('ENQ-' + String(e.Id).padStart(6, '0')),
    name: e.Name,
    email: e.Email,
    phone: e.Phone || null,
    company: e.Company || null,
    subject: e.Subject,
    message: e.Message,
    status: e.EnquiryStatus || e.Status || 'New',
    enquiryStatus: e.EnquiryStatus || e.Status || 'New',
    adminRemarks: e.AdminRemarks || null,
    submittedAt: e.SubmittedAt || e.CreatedAt || new Date().toISOString()
  };
}

// ==========================================
// 6. DASHBOARD SUMMARY AGGREGATIONS
// ==========================================
async function getDashboardSummary() {
  const pool = await getPool();
  if (pool) {
    try {
      const mediaCounts = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN IsPublished = 1 OR Status = 'Published' THEN 1 ELSE 0 END) as published
        FROM dbo.Media
      `);

      const jobCounts = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN IsActive = 1 OR Status = 'Active' THEN 1 ELSE 0 END) as active
        FROM dbo.CareerJobs
      `);

      const appCounts = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ApplicationStatus = 'New' THEN 1 ELSE 0 END) as newCount
        FROM dbo.CareerApplications
      `);

      const enqCounts = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN EnquiryStatus = 'New' THEN 1 ELSE 0 END) as newCount
        FROM dbo.Enquiries
      `);

      const recentMedia = await getAllMedia({});
      const recentCareers = await getAllJobs({});
      const recentApps = await getAllApplications({});
      const recentEnquiries = await getAllEnquiries({});

      return {
        totalMedia: mediaCounts.recordset[0].total || 0,
        publishedMedia: mediaCounts.recordset[0].published || 0,
        totalCareers: jobCounts.recordset[0].total || 0,
        activeCareers: jobCounts.recordset[0].active || 0,
        activeJobOpenings: jobCounts.recordset[0].active || 0,
        totalApplications: appCounts.recordset[0].total || 0,
        careerApplications: appCounts.recordset[0].total || 0,
        newApplications: appCounts.recordset[0].newCount || 0,
        totalEnquiries: enqCounts.recordset[0].total || 0,
        newEnquiries: enqCounts.recordset[0].newCount || 0,
        recentMedia: recentMedia.slice(0, 5),
        recentCareers: recentCareers.slice(0, 5),
        recentApplications: recentApps.slice(0, 5),
        recentEnquiries: recentEnquiries.slice(0, 5)
      };
    } catch (err) {
      console.error('[SQL Error getDashboardSummary]:', err.message);
    }
  }

  // Fallback calculations
  const mediaList = await getAllMedia({});
  const jobsList = await getAllJobs({});
  const appsList = await getAllApplications({});
  const enqsList = await getAllEnquiries({});

  return {
    totalMedia: mediaList.length,
    publishedMedia: mediaList.filter(m => m.isPublished).length,
    totalCareers: jobsList.length,
    activeCareers: jobsList.filter(j => j.isActive).length,
    activeJobOpenings: jobsList.filter(j => j.isActive).length,
    totalApplications: appsList.length,
    careerApplications: appsList.length,
    newApplications: appsList.filter(a => a.status === 'New').length,
    totalEnquiries: enqsList.length,
    newEnquiries: enqsList.filter(e => e.status === 'New').length,
    recentMedia: mediaList.slice(0, 5),
    recentCareers: jobsList.slice(0, 5),
    recentApplications: appsList.slice(0, 5),
    recentEnquiries: enqsList.slice(0, 5)
  };
}

module.exports = {
  getAdminByEmail,
  updateAdminPassword,
  seedInitialAdmin,
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getDashboardSummary
};
