const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'receipts.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readReceipts() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeReceipts(receipts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(receipts, null, 2));
}

function calculateSummary(receipts) {
  const totalSpent = receipts.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const categories = receipts.reduce((map, receipt) => {
    const category = receipt.category || 'Uncategorized';
    map[category] = (map[category] || 0) + Number(receipt.amount || 0);
    return map;
  }, {});

  return {
    totalReceipts: receipts.length,
    totalSpent: Number(totalSpent.toFixed(2)),
    categories: Object.entries(categories)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value),
    recent: [...receipts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Receipt API is running.' });
});

app.get('/api/receipts', (req, res) => {
  const receipts = readReceipts();
  res.json(receipts);
});

app.get('/api/receipts/summary', (req, res) => {
  const receipts = readReceipts();
  res.json(calculateSummary(receipts));
});

app.post('/api/receipts', (req, res) => {
  const receipts = readReceipts();
  const { merchant, amount, category, paymentMethod, date, note } = req.body;

  if (!merchant || !amount || !category || !date) {
    return res.status(400).json({ message: 'Merchant, amount, category, and date are required.' });
  }

  const newReceipt = {
    id: Date.now(),
    merchant: merchant.trim(),
    amount: Number(amount),
    category: category.trim(),
    paymentMethod: paymentMethod || 'Cash',
    date,
    note: note ? note.trim() : '',
    createdAt: new Date().toISOString()
  };

  receipts.push(newReceipt);
  writeReceipts(receipts);

  res.status(201).json(newReceipt);
});

app.put('/api/receipts/:id', (req, res) => {
  const receipts = readReceipts();
  const receiptId = Number(req.params.id);
  const index = receipts.findIndex((receipt) => Number(receipt.id) === receiptId);

  if (index === -1) {
    return res.status(404).json({ message: 'Receipt not found.' });
  }

  const { merchant, amount, category, paymentMethod, date, note } = req.body;

  if (!merchant || !amount || !category || !date) {
    return res.status(400).json({ message: 'Merchant, amount, category, and date are required.' });
  }

  receipts[index] = {
    ...receipts[index],
    merchant: merchant.trim(),
    amount: Number(amount),
    category: category.trim(),
    paymentMethod: paymentMethod || receipts[index].paymentMethod,
    date,
    note: note ? note.trim() : ''
  };

  writeReceipts(receipts);
  res.json(receipts[index]);
});

app.delete('/api/receipts/:id', (req, res) => {
  const receipts = readReceipts();
  const receiptId = Number(req.params.id);
  const filteredReceipts = receipts.filter((receipt) => Number(receipt.id) !== receiptId);

  if (filteredReceipts.length === receipts.length) {
    return res.status(404).json({ message: 'Receipt not found.' });
  }

  writeReceipts(filteredReceipts);
  res.json({ message: 'Receipt deleted successfully.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Receipt app listening at http://localhost:${PORT}`);
});
