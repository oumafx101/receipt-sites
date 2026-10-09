# ReceiptHub - Expense Tracker

A full-stack receipt management application with MongoDB and JSON Web Token authentication.

## Features
- User registration and login
- JWT-authenticated receipt API
- Add, edit, delete, search, and filter receipts
- Dashboard with totals and category breakdowns
- Responsive front-end

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- HTML + CSS + JavaScript

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/receipt-db
JWT_SECRET=replace_with_a_secure_secret
```

If you use MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string instead.

### 3. Run the app
```bash
npm start
```

Open `http://localhost:3000`

## API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/receipts`
- `GET /api/receipts/summary`
- `POST /api/receipts`
- `PUT /api/receipts/:id`
- `DELETE /api/receipts/:id`

## Notes
- All receipt routes require a bearer token.
- Passwords are hashed with bcryptjs.
- Data is stored per authenticated user in MongoDB.
