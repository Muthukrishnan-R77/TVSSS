const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const careerRoutes = require('./routes/careerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { checkConnection, dbConfig } = require('./config/database');
const { rootUploadsDir } = require('./middleware/uploadMiddleware');

const app = express();

// Enable CORS for frontend clients
app.use(cors({
  origin: function (origin, callback) {
    // Allow request with no origin (like mobile apps, curl, postman) or any localhost port
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads and root website/admin files
const rootWebDir = path.join(__dirname, '../../');
app.use('/Uploads', express.static(rootUploadsDir));
app.use('/uploads', express.static(rootUploadsDir));
app.use(express.static(rootWebDir));

// Health Check Endpoints
app.get('/api/health', (req, res) => {
  return res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/database', (req, res) => {
  const isConnected = checkConnection();
  return res.json({
    success: isConnected,
    message: isConnected ? 'MS SQL Server connected successfully' : 'MS SQL Server disconnected or pending connection',
    database: dbConfig.database,
    server: dbConfig.server
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin/media', mediaRoutes);

app.use('/api/careers', careerRoutes);
app.use('/api/admin/careers', careerRoutes);

app.use('/api/career-applications', applicationRoutes);
app.use('/api/admin/career-applications', applicationRoutes);

app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin/enquiries', enquiryRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// 404 & Global Error Handlers (compatible with Express v5 path-to-regexp)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
