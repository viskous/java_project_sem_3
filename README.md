# Capital Core

A digital banking demo built with a Node.js + Express backend (SQLite database) and a Vite + TypeScript frontend, with a dark "obsidian" theme.

> **Demo project only.** This is not a real bank. All accounts, balances and cards are fictional, and no real money or personal data is involved.

## Features

- User registration and login with JWT authentication
- Money transfers with a transaction ledger
- Virtual and physical card issuance
- Savings vaults with APY
- Loan applications and approval queue
- Bill payment center
- Admin portal with audit logs and risk scoring
- 4-digit security PIN for high-value transfers

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, SQLite (`better-sqlite3`)
- **Frontend:** Vite, TypeScript
- **Security:** Helmet.js, API rate limiting, JWT

## Requirements

- Node.js **20 or 22 (LTS)**
- npm

> Node 24 may fail to install `better-sqlite3` because no prebuilt binary is available. On Windows, this then needs the Visual Studio C++ build tools. Using Node 22 LTS avoids this.

## Getting Started

### 1. Install and build

```bash
npm run setup
npm run build
```

### 2. Run

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Demo Accounts

Demo data is created automatically on first launch.

| Role | Email | Password | PIN |
|---|---|---|---|
| Consumer | `alex@capitalcore.com` | `password123` | `1234` |
| Business | `business@capitalcore.com` | `password123` | `9999` |
| Admin | `admin@capitalcore.com` | `adminpassword` | `0000` |

## Project Structure

```
backend/    Express API and SQLite database
frontend/   Web interface
```

## Troubleshooting

- **`concurrently` is not recognized:** run `npm install` in the root folder.
- **`better-sqlite3` is not a valid Win32 application:** delete `backend/node_modules`, switch to Node 22 LTS, and run `npm install` again.
- **`ECONNREFUSED` on `/api/...` requests:** the backend isn't running. Check the terminal for its error.