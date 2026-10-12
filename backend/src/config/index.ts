import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const CONFIG = {
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
