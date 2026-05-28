const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const yearRoutes = require('./routes/yearRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ─── Security & Logging ────────────────────────────────────────────────────
app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const rawFrontendUrl = process.env.FRONTEND_URL;
const frontendUrl = rawFrontendUrl ? rawFrontendUrl.replace(/\/$/, '') : null;

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman, same-origin)
    if (!origin) return cb(null, true);
    
    // Allow localhost in development or production
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    
    // Automatically allow any Vercel subdomain or matches FRONTEND_URL
    if (origin.endsWith('.vercel.app') || (frontendUrl && origin === frontendUrl)) {
      return cb(null, true);
    }
    
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Uploads (local storage) ───────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Study Portal API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});


// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/years', yearRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/search', searchRoutes);

// ─── 404 & Error Handlers ──────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
