import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { CONFIG } from './config';
import { initDatabase } from './db/database';

import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import cardRoutes from './routes/cardRoutes';
import loanRoutes from './routes/loanRoutes';
import billRoutes from './routes/billRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json());

// Initialize SQLite database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    bank: CONFIG.BANK_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(CONFIG.PORT, () => {
  console.log(`====================================================`);
  console.log(` 🏦 ${CONFIG.BANK_NAME} Core Engine Running `);
  console.log(` 🚀 API Server: http://localhost:${CONFIG.PORT}`);
  console.log(` 🟢 Healthcheck: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`====================================================`);
});
