"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const database_1 = require("./db/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const loanRoutes_1 = __importDefault(require("./routes/loanRoutes"));
const billRoutes_1 = __importDefault(require("./routes/billRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
app.use(express_1.default.json());
// Initialize SQLite database
(0, database_1.initDatabase)();
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/accounts', accountRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/cards', cardRoutes_1.default);
app.use('/api/loans', loanRoutes_1.default);
app.use('/api/bills', billRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        bank: config_1.CONFIG.BANK_NAME,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(config_1.CONFIG.PORT, () => {
    console.log(`====================================================`);
    console.log(` 🏦 ${config_1.CONFIG.BANK_NAME} Core Engine Running `);
    console.log(` 🚀 API Server: http://localhost:${config_1.CONFIG.PORT}`);
    console.log(` 🟢 Healthcheck: http://localhost:${config_1.CONFIG.PORT}/api/health`);
    console.log(`====================================================`);
});
