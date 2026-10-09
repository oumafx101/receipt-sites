require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/receipt-db', {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting app with MongoDB fallback. Set MONGODB_URI in .env for a real database connection.');
  });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, required: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Receipt API is running.' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/receipts', verifyToken, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId }).sort({ date: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch receipts', error: error.message });
  }
});

app.get('/api/receipts/summary', verifyToken, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId });

    const totalSpent = receipts.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
    const categories = receipts.reduce((map, receipt) => {
      const category = receipt.category || 'Uncategorized';
      map[category] = (map[category] || 0) + Number(receipt.amount || 0);
      return map;
    }, {});

    res.json({
      totalReceipts: receipts.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      categories: Object.entries(categories)
        .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value),
      recent: receipts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
});

app.post('/api/receipts', verifyToken, async (req, res) => {
  try {
    const { merchant, amount, category, paymentMethod, date, note } = req.body;

    if (!merchant || !amount || !category || !date) {
      return res.status(400).json({ message: 'Merchant, amount, category, and date are required' });
    }

    const receipt = await Receipt.create({
      userId: req.userId,
      merchant: merchant.trim(),
      amount: Number(amount),
      category: category.trim(),
      paymentMethod: paymentMethod || 'Cash',
      date: new Date(date),
      note: note ? note.trim() : ''
    });

    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create receipt', error: error.message });
  }
});

app.put('/api/receipts/:id', verifyToken, async (req, res) => {
  try {
    const { merchant, amount, category, paymentMethod, date, note } = req.body;

    if (!merchant || !amount || !category || !date) {
      return res.status(400).json({ message: 'Merchant, amount, category, and date are required' });
    }

    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.userId });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    receipt.merchant = merchant.trim();
    receipt.amount = Number(amount);
    receipt.category = category.trim();
    receipt.paymentMethod = paymentMethod || receipt.paymentMethod;
    receipt.date = new Date(date);
    receipt.note = note ? note.trim() : '';

    await receipt.save();
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update receipt', error: error.message });
  }
});

app.delete('/api/receipts/:id', verifyToken, async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete receipt', error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Receipt app listening at http://localhost:${PORT}`);
});
