require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./models');
// Load DB (exports a configured sequelize instance)
const sequelize = require('./config/db');
// Ensure models are loaded (associations)
require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- Early CORS headers and debug logging ---
// Ensure CORS headers are present on every response (helps with OPTIONS/preflight and error paths)
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  // Log incoming origin for debugging deployed CORS issues
  console.log('[CORS DEBUG] incoming origin:', origin);
  // Reflect origin if present, otherwise allow all for non-browser clients
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Allow multiple frontend origins (comma-separated) via FRONTEND_ORIGINS env var.
// Defaults include local dev host used by Vite and the deployed frontend on Vercel.
// Include the deployed Vercel frontend origin (pentabot.vercel.app) by default so CORS works
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,https://pentabot.vercel.app').split(',').map(s => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
    // explicitly disallow origin (no error) so preflight response still returned
    return callback(null, false);
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
// Explicitly set CORS headers for allowed origins and handle OPTIONS preflight
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && FRONTEND_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    // short-circuit preflight
    return res.sendStatus(204);
  }
  next();
});
// Mount authentication routes (signup, signin, verify, logout, oauth)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== Database Configuration ====================
// `sequelize` is loaded above from ./config/db which already creates the connection.
// Test database connection and (optionally) sync models in development.
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    if (process.env.NODE_ENV !== 'production') {
      // Sync models in development only (be careful in production)
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

testConnection();

// ==================== Routes ====================
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PentaBot API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Import and use your routes
// Example:
// const authRoutes = require('./routes/auth');
// const chatRoutes = require('./routes/chat');
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);

// Socket.IO for notifications
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => console.log('User disconnected'));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('[CORS DEBUG] FRONTEND_ORIGINS =', (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,https://penta-bot.vercel.app'));
});

// Global error handlers to avoid process exit on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // don't exit; log so the request can return a 500 instead
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production you might want to restart the process; for development keep it alive for debugging
});