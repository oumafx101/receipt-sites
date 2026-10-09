# ReceiptHub

A full-stack receipt management app with MongoDB and JWT authentication.

## Features
- Secure user registration and login
- JWT-based authentication for all receipt APIs
- Add, edit, delete, search, and filter receipts
- Dashboard with totals and top category summary
- Responsive web UI

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- HTML + CSS + JavaScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/receipt-db
JWT_SECRET=change_this_to_a_secure_secret
```

3. Start the app:
```bash
npm start
```

Then open http://localhost:3000

## API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/receipts`
- `GET /api/receipts/summary`
- `POST /api/receipts`
- `PUT /api/receipts/:id`
- `DELETE /api/receipts/:id`

All receipt routes require a bearer token.
