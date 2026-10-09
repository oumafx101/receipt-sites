const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleRegister = document.getElementById('toggleRegister');
const toggleLogin = document.getElementById('toggleLogin');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

const receiptForm = document.getElementById('receiptForm');
const formTitle = document.getElementById('formTitle');
const merchantInput = document.getElementById('merchant');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const paymentMethodInput = document.getElementById('paymentMethod');
const dateInput = document.getElementById('date');
const noteInput = document.getElementById('note');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const receiptList = document.getElementById('receiptList');

const totalReceiptsEl = document.getElementById('totalReceipts');
const totalSpentEl = document.getElementById('totalSpent');
const topCategoryEl = document.getElementById('topCategory');

let receipts = [];
let editingId = null;
let currentUser = null;
let authToken = null;

function init() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');

  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    showAppScreen();
    loadReceipts();
    loadSummary();
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  authScreen.classList.add('active');
  appScreen.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
}

function showAppScreen() {
  authScreen.classList.remove('active');
  appScreen.classList.add('active');
  if (currentUser) {
    userName.textContent = `Welcome, ${currentUser.name}!`;
  }
}

toggleRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.remove('active');
  registerForm.classList.add('active');
});

toggleLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.remove('active');
  loginForm.classList.add('active');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }

    const data = await response.json();
    authToken = data.token;
    currentUser = data.user;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loginForm.reset();
    showAppScreen();
    await loadReceipts();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }

    const data = await response.json();
    authToken = data.token;
    currentUser = data.user;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    registerForm.reset();
    showAppScreen();
    await loadReceipts();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  authToken = null;
  currentUser = null;
  receipts = [];
  showAuthScreen();
});

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthScreen();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'API request failed');
  }

  return response.json();
}

async function loadReceipts() {
  try {
    receipts = await apiCall('/api/receipts');
    renderReceipts();
    updateSummary();
  } catch (error) {
    receiptList.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function loadSummary() {
  try {
    const summary = await apiCall('/api/receipts/summary');
    totalReceiptsEl.textContent = summary.totalReceipts ?? 0;
    totalSpentEl.textContent = formatCurrency(summary.totalSpent ?? 0);
    topCategoryEl.textContent = summary.categories?.[0]?.name ?? '—';
  } catch (error) {
    console.error(error);
  }
}

function updateSummary() {
  const totalReceipts = receipts.length;
  const totalSpent = receipts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const categoryMap = receipts.reduce((map, item) => {
    const name = item.category || 'Other';
    map[name] = (map[name] || 0) + Number(item.amount || 0);
    return map;
  }, {});

  totalReceiptsEl.textContent = totalReceipts;
  totalSpentEl.textContent = formatCurrency(totalSpent);

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
  topCategoryEl.textContent = topCategory ? topCategory[0] : '—';
}

function getFilteredReceipts() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  return receipts.filter((receipt) => {
    const matchesCategory = selectedCategory === 'all' || receipt.category === selectedCategory;
    const searchableText = `${receipt.merchant} ${receipt.note || ''}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    return matchesCategory && matchesSearch;
  });
}

function renderReceipts() {
  const filtered = getFilteredReceipts();

  if (!filtered.length) {
    receiptList.innerHTML = '<div class="empty-state">No receipts match your filters.</div>';
    return;
  }

  receiptList.innerHTML = filtered
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((receipt) => `
      <article class="receipt-item">
        <div class="receipt-main">
          <div class="receipt-topline">
            <div class="receipt-name">${escapeHtml(receipt.merchant)}</div>
            <span class="tag">${escapeHtml(receipt.category)}</span>
          </div>
          <div class="receipt-meta">
            <span>${formatCurrency(receipt.amount)}</span>
            <span>${formatDate(receipt.date)}</span>
            <span>${escapeHtml(receipt.paymentMethod || 'Cash')}</span>
          </div>
          <div class="receipt-meta">
            ${receipt.note ? `<span>${escapeHtml(receipt.note)}</span>` : '<span>No notes</span>'}
          </div>
        </div>
        <div class="receipt-actions">
          <button class="action-btn edit" type="button" data-action="edit" data-id="${receipt._id}">Edit</button>
          <button class="action-btn delete" type="button" data-action="delete" data-id="${receipt._id}">Delete</button>
        </div>
      </article>
    `)
    .join('');
}

receiptForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    merchant: merchantInput.value,
    amount: amountInput.value,
    category: categoryInput.value,
    paymentMethod: paymentMethodInput.value,
    date: dateInput.value,
    note: noteInput.value
  };

  try {
    if (editingId) {
      await apiCall(`/api/receipts/${editingId}`, 'PUT', payload);
    } else {
      await apiCall('/api/receipts', 'POST', payload);
    }

    resetForm();
    await loadReceipts();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
});

function resetForm() {
  receiptForm.reset();
  editingId = null;
  formTitle.textContent = 'Add receipt';
  cancelEditBtn.style.display = 'none';
}

function prepareEditReceipt(id) {
  const receipt = receipts.find((item) => item._id === id);
  if (!receipt) return;

  editingId = id;
  formTitle.textContent = 'Edit receipt';
  cancelEditBtn.style.display = 'inline-flex';

  merchantInput.value = receipt.merchant || '';
  amountInput.value = receipt.amount ?? '';
  categoryInput.value = receipt.category || '';
  paymentMethodInput.value = receipt.paymentMethod || 'Cash';
  dateInput.value = receipt.date ? receipt.date.split('T')[0] : '';
  noteInput.value = receipt.note || '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDeleteReceipt(id) {
  const shouldDelete = window.confirm('Delete this receipt?');
  if (!shouldDelete) return;

  try {
    await apiCall(`/api/receipts/${id}`, 'DELETE');
    if (editingId === id) resetForm();
    await loadReceipts();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
}

searchInput.addEventListener('input', renderReceipts);
categoryFilter.addEventListener('change', renderReceipts);
resetFilterBtn.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = 'all';
  renderReceipts();
});
cancelEditBtn.addEventListener('click', resetForm);

receiptList.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const id = target.dataset.id;
  const action = target.dataset.action;

  if (action === 'edit') prepareEditReceipt(id);
  if (action === 'delete') handleDeleteReceipt(id);
});

cancelEditBtn.style.display = 'none';
init();

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
