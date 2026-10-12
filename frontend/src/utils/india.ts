/**
 * Indian Market Localization Utilities & Standards
 * Compliant with RBI guidelines and Indian Financial System conventions.
 */

// All 28 States & 8 Union Territories in India
export const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export const INDIAN_BANKING_CONSTANTS = {
  BANK_NAME: 'Capital Core Private Bank (India) Limited',
  SHORT_NAME: 'Capital Core Bank',
  HEADQUARTERS: 'Capital Core Towers, Nariman Point, Mumbai - 400021, Maharashtra',
  BRANCH_NAME: 'Nariman Point Flagship Branch, Mumbai',
  IFSC_CODE: 'CAPC0001049',
  MICR_CODE: '400240012',
  ROUTING_CODE: 'CAPC-IN-MUM',
  RBI_REGISTRATION_NO: 'RBI/2026/CC-PB-0941',
  DICGC_INSURANCE_LIMIT: '₹5,00,000 per depositor',
  GSTIN: '27AAACC4920M1Z8',
  CIN: 'U65191MH2026PLC994012',
  HELPLINE_TOLL_FREE: '1800 209 8800',
  SUPPORT_EMAIL: 'support@capitalcore.in',
  DEFAULT_UPI_HANDLE: '@capitalcore',
  FD_RATE_SENIOR_CITIZEN: '7.75% p.a.',
  FD_RATE_GENERAL: '7.25% p.a.',
  SAVINGS_RATE: '4.50% p.a.'
};

/**
 * Formats a monetary number into Indian Rupees (INR - ₹)
 * Supports standard Indian comma separation (e.g. ₹1,49,999 or ₹12,50,000)
 * and compact representation (e.g. ₹2.48 L, ₹1.45 Cr)
 */
export function formatINR(
  amount: number,
  options?: { compact?: boolean; hideDecimals?: boolean; showSymbol?: boolean }
): string {
  const { compact = false, hideDecimals = false, showSymbol = true } = options || {};
  const symbol = showSymbol ? '₹' : '';

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }

  // Handle Compact notation for Indian numbering (Lakhs & Crores)
  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 10000000) {
      // 1 Crore = 10,000,000
      const cr = (abs / 10000000).toFixed(2);
      return `${sign}${symbol}${cr} Cr`;
    } else if (abs >= 100000) {
      // 1 Lakh = 100,000
      const lk = (abs / 100000).toFixed(2);
      return `${sign}${symbol}${lk} L`;
    } else if (abs >= 1000) {
      const k = (abs / 1000).toFixed(1);
      return `${sign}${symbol}${k} K`;
    }
  }

  // Standard Indian Currency Number Formatting
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const fixed = hideDecimals ? Math.round(absVal).toString() : absVal.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');

  // Indian numbering regex: last 3 digits, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = hideDecimals || !decimalPart
    ? formattedInteger
    : `${formattedInteger}.${decimalPart}`;

  return `${isNegative ? '-' : ''}${symbol}${result}`;
}

/**
 * Formats date string into Indian Standard format: DD/MM/YYYY or DD/MM/YYYY, hh:mm A IST
 */
export function formatDateIST(dateStr: string, includeTime = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  const strHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm} IST`;
}

/**
 * Validations for Indian Forms
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  // Allows 10 digits starting with 6, 7, 8, or 9, or with +91 / 91 / 0 prefix
  const match = cleaned.match(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?([6789]\d{9})$/);
  return Boolean(match);
}

export function isValidIndianPINCode(pin: string): boolean {
  // 6 digits, first digit cannot be 0
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function isValidPAN(pan: string): boolean {
  // 5 letters, 4 digits, 1 letter (e.g. ABCPS1234F)
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

export function isValidIFSC(ifsc: string): boolean {
  // 4 letters, 0, 6 letters/digits (e.g. CAPC0001049)
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
}

export function isValidUPI(vpa: string): boolean {
  // username@provider (e.g. user@capitalcore or user@okaxis)
  return /^[\w.-]+@[\w.-]+$/.test(vpa.trim());
}
