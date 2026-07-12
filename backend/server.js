require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware with CSP and Resource Policy configurations
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["*"],
      scriptSrc: ["*", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["*", "'unsafe-inline'"],
      imgSrc: ["*", "data:", "blob:"],
      connectSrc: ["*"],
      fontSrc: ["*"],
      objectSrc: ["'none'"],
      mediaSrc: ["*"],
      frameSrc: ["*"],
      workerSrc: ["*", "blob:"],
    },
  },
}));

// Enable CORS for your frontend origin
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Rate limiting to prevent brute force and DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Serve static files from the React/Vite build folder
app.use(express.static(path.join(__dirname, 'Dex Elearning/dist')));


// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});