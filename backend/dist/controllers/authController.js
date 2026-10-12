"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPin = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../db/database");
const config_1 = require("../config");
const register = (req, res) => {
    try {
        const { email, password, fullName, phone, pinCode, panNumber, city = 'Mumbai', state = 'Maharashtra', postalCode = '400001', role = 'consumer' } = req.body;
        if (!email || !password || !fullName || !pinCode) {
            return res.status(400).json({ error: 'Missing mandatory fields: Full Legal Name, Email, Password, and 4-digit Security PIN' });
        }
        const existing = database_1.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
        }
        const userId = `usr_${Date.now()}`;
        const passwordHash = bcryptjs_1.default.hashSync(password, 10);
        const createdAt = new Date().toISOString();
        const usernameSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const upiId = `${usernameSlug}${config_1.CONFIG.DEFAULT_UPI_HANDLE}`;
        database_1.db.prepare(`
      INSERT INTO users (id, email, passwordHash, fullName, role, phone, avatarUrl, pinCode, is2FAEnabled, status, panNumber, aadhaarMasked, upiId, city, state, postalCode, kycStatus, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, '•••• •••• ' || substr(?, -4), ?, ?, ?, ?, 'verified', ?)
    `).run(userId, email, passwordHash, fullName, role, phone || '+91 98200 00000', `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`, pinCode, panNumber ? panNumber.toUpperCase() : 'ABCPS9940M', Date.now().toString(), upiId, city, state, postalCode, createdAt);
        // Create default Primary Savings Account with Indian IFSC
        const accId = `acc_${Date.now()}`;
        const accNum = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        database_1.db.prepare(`
      INSERT INTO accounts (id, userId, accountNumber, ifscCode, micrCode, upiId, accountType, accountName, balance, currency, isPrimary, status, interestRate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'savings', 'Obsidian Sovereign Savings Account', 25000.00, 'INR', 1, 'active', 4.5, ?)
    `).run(accId, userId, accNum, config_1.CONFIG.IFSC_CODE, config_1.CONFIG.MICR_CODE, upiId, createdAt);
        const payload = { id: userId, email, role, fullName };
        const token = jsonwebtoken_1.default.sign(payload, config_1.CONFIG.JWT_SECRET, { expiresIn: config_1.CONFIG.JWT_EXPIRES_IN });
        const newUser = database_1.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        return res.status(201).json({
            message: 'Account opened successfully with ₹25,000 initial balance and instant UPI handle!',
            token,
            user: { ...newUser, is2FAEnabled: Boolean(newUser.is2FAEnabled) }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Registration failed' });
    }
};
exports.register = register;
const login = (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter registered email ID and password' });
        }
        const user = database_1.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials. Please verify your email ID and password.' });
        }
        const isMatch = bcryptjs_1.default.compareSync(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials. Please verify your email ID and password.' });
        }
        if (user.status === 'frozen') {
            return res.status(403).json({ error: 'Account is frozen by Bank Compliance. Please visit your nearest branch or contact our RBI liaison desk.' });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.CONFIG.JWT_SECRET, { expiresIn: config_1.CONFIG.JWT_EXPIRES_IN });
        // Log audit
        database_1.db.prepare(`
      INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
      VALUES (?, ?, ?, 'LOGIN_SUCCESS', ?, 'Authenticated into Capital Core Web Portal (IST)', ?)
    `).run(`aud_${Date.now()}`, user.id, user.fullName, req.ip || '127.0.0.1 (IST)', new Date().toISOString());
        const { passwordHash, ...userClean } = user;
        return res.json({
            token,
            user: { ...userClean, is2FAEnabled: Boolean(userClean.is2FAEnabled) }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Login failed' });
    }
};
exports.login = login;
const getMe = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = database_1.db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!user)
            return res.status(404).json({ error: 'User profile not found' });
        const { passwordHash, ...userClean } = user;
        return res.json({ ...userClean, is2FAEnabled: Boolean(userClean.is2FAEnabled) });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getMe = getMe;
const verifyPin = (req, res) => {
    try {
        const { pin } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = database_1.db.prepare('SELECT pinCode FROM users WHERE id = ?').get(req.user.id);
        if (!user || user.pinCode !== pin) {
            return res.status(400).json({ valid: false, error: 'Incorrect 4-digit Security PIN code' });
        }
        return res.json({ valid: true });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.verifyPin = verifyPin;
