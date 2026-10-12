"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.CONFIG = {
    PORT: process.env.PORT || 5001,
    JWT_SECRET: process.env.JWT_SECRET || 'capital_core_super_secret_jwt_key_2026_luxury_bank',
    JWT_EXPIRES_IN: 86400, // 24 hours
    BANK_NAME: 'Capital Core Private Bank (India) Limited',
    SHORT_NAME: 'Capital Core Bank',
    IFSC_CODE: 'CAPC0001049',
    MICR_CODE: '400240012',
    BRANCH_NAME: 'Nariman Point Flagship Branch, Mumbai 400021',
    DEFAULT_UPI_HANDLE: '@capitalcore',
    CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
};
