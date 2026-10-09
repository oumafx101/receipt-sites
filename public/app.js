* {
  box-sizing: border-box;
}

:root {
  --bg: #f3f7ff;
  --panel: #ffffff;
  --panel-alt: #f6f8ff;
  --primary: #3b82f6;
  --primary-dark: #1d4ed8;
  --accent: #10b981;
  --text: #14213d;
  --muted: #667085;
  --border: #dfe9f5;
  --danger: #ef4444;
  --shadow: 0 20px 45px rgba(17, 24, 39, 0.08);
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #edf5ff 0%, #f8fbff 100%);
  color: var(--text);
}

button,
input,
select,
textarea {
  font: inherit;
}

.page-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--primary);
  font-weight: 700;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 2.2vw, 2.8rem);
}

.layout {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 24px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.form-panel {
  padding: 24px;
}

.panel-heading {
  margin-bottom: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 600;
}

.full-span {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel-alt);
  padding: 12px 14px;
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}

.primary-btn,
.secondary-btn,
.action-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.primary-btn:hover,
.secondary-btn:hover,
.action-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  background: #edf3ff;
  color: var(--text);
}

.dashboard-panel {
  padding: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f8ff 0%, #eef4ff 100%);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card.accent {
  background: linear-gradient(135deg, #ecfdf5 0%, #dffcf5 100%);
}

.stat-card span {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}

.stat-card strong {
  font-size: clamp(1.3rem, 2vw, 2rem);
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(200px, 0.8fr);
  gap: 16px;
  margin-bottom: 22px;
}

.list-header {
  margin-bottom: 16px;
}

.receipt-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.receipt-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 16px;
}

.receipt-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receipt-topline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.receipt-name {
  font-weight: 800;
  font-size: 1.08rem;
}

.tag {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #edf3ff;
  color: var(--primary-dark);
}

.receipt-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--muted);
  font-size: 0.84rem;
}

.receipt-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  padding: 8px 12px;
  font-size: 0.82rem;
}

.action-btn.edit {
  background: #edf3ff;
  color: var(--primary-dark);
}

.action-btn.delete {
  background: #fff1f2;
  color: var(--danger);
}

.empty-state {
  background: var(--panel-alt);
  border: 1px dashed var(--border);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .topbar,
  .form-actions,
  .receipt-item,
  .receipt-topline,
  .filters,
  .summary-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .receipt-item {
    padding: 16px;
  }
}
