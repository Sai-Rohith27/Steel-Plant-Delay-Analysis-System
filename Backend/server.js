import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { testConnection } from './config/db.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import delayRoutes from './routes/delays.js';
import equipmentRoutes from './routes/equipment.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import importRoutes from './routes/import.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ─── MIDDLEWARE ─────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── API ROUTES ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/delays', delayRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

// ─── HEALTH CHECK ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🏭 Vizag Steel Plant API is running',
    timestamp: new Date().toISOString()
  });
});

// ─── ERROR HANDLER ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error.' 
  });
});

// ─── START SERVER ──────────────────────────────────────
const startServer = async () => {
  const dbConnected = await testConnection();
  
  app.listen(PORT, () => {
    console.log(`\n🏭 ═══════════════════════════════════════════`);
    console.log(`   Vizag Steel Plant API Server`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`═══════════════════════════════════════════════\n`);
  });
};

startServer();
