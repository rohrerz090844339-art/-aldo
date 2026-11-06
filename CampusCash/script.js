(() => {
  const organizationDefault = 'CTU BSIT Society';
  let adminPortal = false;
  let logoClickCount = 0;
  let logoClickTimer = null;
  const LOGO_CLICKS_REQUIRED = 5;
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const dateTimeFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const iconMap = {
    dashboard: '⌂', balance: '₱', contributions: '↗', transactions: '⇄', expenses: '↘', budget: '◫',
    reports: '▥', announcements: '◉', profile: '◉', members: '♧', receipts: '▧',
    users: '♙', audit: '◷', settings: '⚙'
  };
  const studentNav = [
    ['dashboard', 'Dashboard'], ['balance', 'Fund balance'], ['contributions', 'Contributions'],
    ['transactions', 'Transaction history'], ['expenses', 'Expenses'], ['budget', 'Budget overview'],
    ['reports', 'Financial reports'], ['announcements', 'Announcements'], ['profile', 'My profile']
  ];
  const adminNav = [
    ['dashboard', 'Dashboard'], ['members', 'Member management'], ['contributions', 'Contribution management'],
    ['expenses', 'Expense management'], ['transactions', 'Transaction management'], ['budget', 'Budget management'],
    ['receipts', 'Receipt management'], ['reports', 'Financial reports'], ['announcements', 'Announcements'],
    ['users', 'User management'], ['audit', 'Audit trail'], ['settings', 'Settings']
  ];
  const initialDate = (day) => new Date(2026, 10, day, 9 + (day % 8), 20);
  const freshState = () => ({
    organization: organizationDefault,
    transactions: [
      { id: 'tx-1', date: initialDate(4).toISOString(), description: 'Campus welcome fundraiser', category: 'Fundraising', type: 'income', amount: 12500, member: 'Juan Dela Cruz', status: 'approved', receipt: '' },
      { id: 'tx-2', date: initialDate(3).toISOString(), description: 'T-shirt printing', category: 'Merchandise', type: 'expense', amount: 1500, member: 'Ana Reyes', status: 'approved', receipt: 'shirt-printing-receipt.pdf' },
      { id: 'tx-3', date: initialDate(1).toISOString(), description: 'November membership dues', category: 'Membership', type: 'contribution', amount: 500, member: 'Miguel Santos', status: 'approved', receipt: '' },
      { id: 'tx-4', date: initialDate(28).toISOString(), description: 'Tech talk venue reservation', category: 'Events', type: 'expense', amount: 2400, member: 'Juan Dela Cruz', status: 'approved', receipt: 'venue-invoice.jpg' },
      { id: 'tx-5', date: initialDate(26).toISOString(), description: 'Membership dues', category: 'Membership', type: 'contribution', amount: 1500, member: 'Maria Cruz', status: 'approved', receipt: '' },
      { id: 'tx-6', date: initialDate(22).toISOString(), description: 'Workshop materials', category: 'Events', type: 'expense', amount: 860, member: 'Ana Reyes', status: 'approved', receipt: '' },
      { id: 'tx-7', date: initialDate(19).toISOString(), description: 'Member contribution', category: 'Membership', type: 'contribution', amount: 950, member: 'Paolo Lim', status: 'approved', receipt: '' },
      { id: 'tx-8', date: initialDate(15).toISOString(), description: 'Design contest prize', category: 'Events', type: 'expense', amount: 1200, member: 'Juan Dela Cruz', status: 'approved', receipt: 'prize-receipt.pdf' },
      { id: 'tx-9', date: initialDate(11).toISOString(), description: 'Donation from alumni', category: 'Donation', type: 'income', amount: 3200, member: 'Alumni Association', status: 'approved', receipt: '' },
      { id: 'tx-10', date: initialDate(8).toISOString(), description: 'Organization dues', category: 'Membership', type: 'contribution', amount: 1250, member: 'Miguel Santos', status: 'approved', receipt: '' },
      { id: 'tx-11', date: initialDate(5).toISOString(), description: 'Intramurals banner printing reimbursement', category: 'Merchandise', type: 'expense', amount: 750, member: 'Miguel Santos', status: 'pending', receipt: 'banner-quote.pdf' }
    ],
    budgets: [
      { id: 'b-1', name: 'Events & workshops', allocated: 12000, category: 'Events' },
      { id: 'b-2', name: 'Merchandise', allocated: 6500, category: 'Merchandise' },
      { id: 'b-3', name: 'Operations', allocated: 5000, category: 'Operations' },
      { id: 'b-4', name: 'Outreach', allocated: 3500, category: 'Outreach' }
    ],
    members: [
      { id: 'm-1', name: 'Juan Dela Cruz', email: 'juan@email.com', role: 'Treasurer', status: 'Active' },
      { id: 'm-2', name: 'Ana Reyes', email: 'ana.reyes@email.com', role: 'President', status: 'Active' },
      { id: 'm-3', name: 'Miguel Santos', email: 'miguel.s@email.com', role: 'Member', status: 'Active' },
      { id: 'm-4', name: 'Maria Cruz', email: 'maria.cruz@email.com', role: 'Member', status: 'Active' },
      { id: 'm-5', name: 'Paolo Lim', email: 'paolo.lim@email.com', role: 'Member', status: 'Active' }
    ],
    announcements: [
      { id: 'a-1', title: 'November contribution reminder', body: 'Monthly organization dues are due by November 15. Please submit proof of payment through the Contributions page.', date: initialDate(5).toISOString(), status: 'Published' },
      { id: 'a-2', title: 'Tech talk budget approved', body: 'The venue and workshop materials budget has been approved. Receipts will be shared after the event.', date: initialDate(2).toISOString(), status: 'Published' },
      { id: 'a-3', title: 'Welcome week fundraiser results', body: 'Thank you to everyone who supported our welcome week fundraiser. The complete transaction record is available in the financial reports.', date: initialDate(1).toISOString(), status: 'Published' }
    ],
    proofs: [
      { id: 'proof-1', date: initialDate(5).toISOString(), member: 'Paolo Lim', email: 'paolo.lim@email.com', amount: 500, note: 'GCash Ref # 104928592 - Org Dues', file: 'gcash-receipt-500.jpg', status: 'Pending' }
    ],
    activities: [
      { id: 'log-1', date: initialDate(4).toISOString(), actor: 'Juan Dela Cruz', action: 'Recorded fundraiser income', detail: 'Campus welcome fundraiser · ₱12,500.00' },
      { id: 'log-2', date: initialDate(3).toISOString(), actor: 'Juan Dela Cruz', action: 'Uploaded a receipt', detail: 'T-shirt printing · shirt-printing-receipt.pdf' },
      { id: 'log-3', date: initialDate(2).toISOString(), actor: 'Ana Reyes', action: 'Published an announcement', detail: 'Tech talk budget approved' }
    ]
  });

  const state = loadState();
  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const authSwitch = document.getElementById('authSwitch');
  const registrationFields = document.getElementById('registrationFields');
  const confirmPasswordField = document.getElementById('confirmPasswordField');
  const authSubmit = document.getElementById('authSubmit');
  let authMode = 'login';
  const app = document.getElementById('app');
  const navigation = document.getElementById('navigation');
  const pageContent = document.getElementById('pageContent');
  const modalRoot = document.getElementById('modalRoot');
  const toast = document.getElementById('toast');
  let currentUser = null;
  let csrfToken = '';
  let currentView = 'dashboard';
  let toastTimer;
  let persistQueue = Promise.resolve();

  function loadState() {
    return freshState();
  }

  function persist(message = 'Changes saved in this browser.') {
    const snapshot = JSON.stringify({ state, currentUser });
    persistQueue = persistQueue.then(async () => {
      try {
        await apiRequest('save-state', { state: JSON.parse(snapshot).state, currentUser: JSON.parse(snapshot).currentUser });
        if (message) notify(message);
      } catch (error) {
        console.error('Unable to save CampusCash data:', error);
        notify(error.message || 'Could not save changes to the database.', true);
      }
    });
    return persistQueue;
  }

  async function apiRequest(action, data = null, method = 'POST') {
    const portal = adminPortal ? '&portal=admin' : '&portal=member';
    const headers = {};
    const options = { method, credentials: 'same-origin', headers };
    if (method === 'GET') {
      options.headers.Accept = 'application/json';
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.headers.Accept = 'application/json';
      if (action !== 'login' && action !== 'register') options.headers['X-CSRF-Token'] = csrfToken;
      options.body = JSON.stringify(data || {});
    }

    const response = await fetch(`api.php?action=${encodeURIComponent(action)}${portal}`, options);
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error('The server returned an invalid response. Check the PHP error log.');
    }
    if (!response.ok) throw new Error(result.error || `Database request failed (${response.status}).`);
    return result;
  }

  async function openWorkspace(result) {
    csrfToken = result.csrfToken;
    const response = await apiRequest('state', null, 'GET');
    csrfToken = response.csrfToken || csrfToken;
    currentUser = response.user;
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, response.state);
    loginError.textContent = '';
    loginScreen.hidden = true;
    app.hidden = false;
    currentView = 'dashboard';
    render();
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function moneyValue(value) { return money.format(Number(value) || 0); }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
  }
  function formatDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
  }
  function total(type) {
    return state.transactions.filter((item) => item.status === 'approved' && item.type === type).reduce((sum, item) => sum + Number(item.amount), 0);
  }
  function balance() { return total('income') + total('contribution') - total('expense'); }
  function approvedTransactions() { return state.transactions.filter((item) => item.status === 'approved'); }
  function sortedByDate(items) { return [...items].sort((a, b) => new Date(b.date) - new Date(a.date)); }
  function badge(status) {
    const key = String(status).toLowerCase();
    const style = ['income', 'approved', 'active', 'published'].includes(key) ? `badge-${key}` :
      ['expense', 'pending', 'review'].includes(key) ? `badge-${key}` :
      ['rejected', 'inactive'].includes(key) ? `badge-${key}` : 'badge-review';
    return `<span class="badge ${style}">${esc(status)}</span>`;
  }
  function metric(label, value, icon, foot = '') {
    return `<article class="metric-card"><div class="metric-top"><span>${esc(label)}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${esc(value)}</div><div class="metric-foot">${foot}</div></article>`;
  }
  function panel(title, content, subtitle = '', action = '') {
    return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">${esc(title)}</h2>${subtitle ? `<p class="panel-subtitle">${esc(subtitle)}</p>` : ''}</div>${action}</div>${content}</section>`;
  }
  function table(headers, rows, emptyText = 'Nothing here yet.') {
    return `<div class="table-wrap"><table><thead><tr>${headers.map((head) => `<th>${head}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td class="empty-state" colspan="${headers.length}">${esc(emptyText)}</td></tr>`}</tbody></table></div>`;
  }
  function transactionRows(items, options = {}) {
    return sortedByDate(items).map((item) => {
      const kind = item.type === 'expense' ? 'expense' : 'income';
      const amountPrefix = item.type === 'expense' ? '−' : '+';
      const rowActions = options.admin ? `<div class="row-actions">${item.status === 'pending' ? `<button class="button button-sm button-primary" data-action="approve" data-id="${esc(item.id)}">Approve</button>` : ''}<button class="icon-button" title="Delete transaction" aria-label="Delete transaction" data-action="delete-transaction" data-id="${esc(item.id)}">×</button></div>` : '—';
      const receipt = item.receipt ? `<a class="receipt-file" href="#" data-action="receipt" data-id="${esc(item.id)}">View receipt</a>` : '—';
      if (options.receipts) return `<tr><td>${esc(formatDate(item.date))}</td><td><span class="cell-primary">${esc(item.description)}</span></td><td>${esc(item.member || '—')}</td><td>${esc(moneyValue(item.amount))}</td><td>${receipt}</td><td>${badge(item.status)}</td><td>${rowActions}</td></tr>`;
      if (options.membership) return `<tr><td>${esc(formatDate(item.date))}</td><td><span class="cell-primary">${esc(item.member || 'Member')}</span></td><td>${esc(item.description)}</td><td>${esc(moneyValue(item.amount))}</td><td>${receipt}</td><td>${badge(item.status)}</td></tr>`;
      return `<tr><td>${esc(formatDate(item.date))}</td><td><div class="transaction-desc"><span class="transaction-mark">${item.type === 'expense' ? '↘' : item.type === 'contribution' ? '↗' : '₱'}</span><span><span class="cell-primary">${esc(item.description)}</span><small class="cell-secondary">${esc(item.category || 'General')}</small></span></div></td><td class="${kind === 'expense' ? 'negative' : 'positive'}">${amountPrefix}${esc(moneyValue(item.amount))}</td><td>${badge(item.type === 'contribution' ? 'Contribution' : item.type === 'expense' ? 'Expense' : 'Income')}</td>${options.status ? `<td>${badge(item.status)}</td>` : ''}${options.receiptColumn ? `<td>${receipt}</td>` : ''}${options.admin ? `<td>${rowActions}</td>` : ''}</tr>`;
    }).join('');
  }
  function recordActivity(action, detail) {
    state.activities.unshift({ id: makeId('log'), date: new Date().toISOString(), actor: currentUser?.name || 'System', action, detail });
  }
  function makeId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
  function notify(message, error = false) {
    toast.textContent = message;
    toast.classList.toggle('toast-error', error);
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }
  function button(label, action, style = 'button-primary', extra = '') {
    return `<button type="button" class="button ${style}" data-action="${esc(action)}" ${extra}>${label}</button>`;
  }
  function setNavigation() {
    const navItems = currentUser.role === 'admin' ? adminNav : studentNav;
    navigation.innerHTML = navItems.map(([view, label]) => `<button type="button" class="nav-link ${currentView === view ? 'active' : ''}" data-view="${view}"><span class="nav-icon">${iconMap[view] || '•'}</span><span>${label}</span></button>`).join('');
    document.getElementById('organizationName').textContent = state.organization;
    document.getElementById('organizationRole').textContent = currentUser.role === 'admin' ? 'Treasurer workspace' : 'Student workspace';
    document.getElementById('profileDisplayName').textContent = currentUser.name;
    document.getElementById('profileRoleLabel').textContent = currentUser.role === 'admin' ? 'Treasurer / administrator' : 'Student member';
    document.querySelector('.profile-initials').textContent = initials(currentUser.name);
    document.querySelector('.org-avatar').textContent = initials(state.organization);
    document.getElementById('currentBreadcrumb').textContent = [...studentNav, ...adminNav].find(([view]) => view === currentView)?.[1] || 'Dashboard';
  }
  function initials(name) { return String(name).split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase(); }

  function render() {
    if (!currentUser) return;
    setNavigation();
    const page = pages[currentView];
    if (!page || (page.adminOnly && currentUser.role !== 'admin')) {
      currentView = 'dashboard';
      setNavigation();
    }
    const config = pages[currentView];
    pageContent.innerHTML = `<div class="page-heading"><div><span class="section-eyebrow">${currentUser.role === 'admin' ? 'TREASURER WORKSPACE' : 'MEMBER WORKSPACE'}</span><h1>${config.title}</h1><p>${config.description}</p></div><div class="heading-actions">${config.actions ? config.actions() : ''}</div></div>${config.render()}`;
    pageContent.focus({ preventScroll: true });
  }

  const pages = {
    dashboard: {
      title: 'Good to see you, ' + 'there', description: 'Here’s what’s happening with your organization’s funds.', render: dashboardPage,
      get title() { return `Good to see you, ${currentUser.name.split(' ')[0]}`; }
    },
    balance: { title: 'Fund balance', description: 'A clear view of your organization’s current funds.', render: balancePage },
    contributions: { title: currentUser?.role === 'admin' ? 'Contributions' : 'Contributions', description: 'Track member dues, donations, and submitted payment proof.', actions: () => currentUser.role === 'admin' ? button('＋ Record contribution', 'add-contribution') : button('＋ Submit proof of payment', 'submit-proof', 'button-secondary'), render: contributionsPage },
    transactions: { title: 'Transaction history', description: 'A transparent record of all approved activity.', render: transactionsPage },
    expenses: { title: 'Expenses', description: 'Review how organization funds are being used.', actions: () => currentUser.role === 'admin' ? button('＋ Record expense', 'add-expense') : '', render: expensesPage },
    budget: { title: 'Budget overview', description: 'See allocated funds, spending, and what remains.', actions: () => currentUser.role === 'admin' ? button('＋ Add budget', 'add-budget', 'button-secondary') : '', render: budgetPage },
    reports: { title: 'Financial reports', description: 'Financial summaries for a transparent organization.', actions: () => `${button('↓ Export CSV', 'export-csv', 'button-secondary')}<button type="button" class="button button-primary" data-action="print-report">Print report</button>`, render: reportsPage },
    announcements: { title: 'Announcements', description: 'The latest financial updates from your organization.', actions: () => currentUser.role === 'admin' ? button('＋ New announcement', 'add-announcement') : '', render: announcementsPage },
    profile: { title: 'My profile', description: 'Manage your CampusCash account details.', actions: () => button('Edit profile', 'edit-profile', 'button-secondary'), render: profilePage },
    members: { title: 'Member management', description: 'Manage organization members and their access.', adminOnly: true, actions: () => button('＋ Add member', 'add-member'), render: membersPage },
    receipts: { title: 'Receipt management', description: 'Review submitted proof and keep transaction evidence organized.', adminOnly: true, render: receiptsPage },
    users: { title: 'User management', description: 'Review account access and member roles.', adminOnly: true, actions: () => button('＋ Add member', 'add-member'), render: usersPage },
    audit: { title: 'Audit trail', description: 'A chronological record of financial and administrative changes.', adminOnly: true, render: auditPage },
    settings: { title: 'Organization settings', description: 'Update organization details and workspace preferences.', adminOnly: true, actions: () => button('Edit organization', 'edit-organization', 'button-secondary'), render: settingsPage }
  };

  function dashboardPage() {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const monthItems = approvedTransactions().filter((item) => new Date(item.date) >= monthStart);
    const monthIncome = monthItems.filter((item) => item.type !== 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
    const monthExpenses = monthItems.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
    const pending = state.transactions.filter((item) => item.status === 'pending').length + state.proofs.filter((item) => item.status === 'Pending').length;
    const metrics = currentUser.role === 'admin'
      ? `<div class="overview-grid">${metric('Available balance', moneyValue(balance()), '₱', '<span class="positive">Live</span> · approved records')}${metric('Total contributions', moneyValue(total('contribution') + total('income')), '↗', `${state.members.length} members`)}${metric('Total expenses', moneyValue(total('expense')), '↘', 'Approved expenses')}${metric('Needs review', String(pending), '◷', pending ? '<span class="negative">Action needed</span>' : 'You’re all caught up')}</div>`
      : `<div class="overview-grid">${metric('Available balance', moneyValue(balance()), '₱', '<span class="positive">Current funds</span>')}${metric('Contributions', moneyValue(total('contribution') + total('income')), '↗', 'Member dues & income')}${metric('Expenses', moneyValue(total('expense')), '↘', 'Approved spending')}${metric('Budget remaining', moneyValue(remainingBudget()), '◫', 'Across all allocations')}</div>`;
    const recent = transactionRows(approvedTransactions().slice(0, 5));
    const recentTable = table(['DATE', 'TRANSACTION', 'AMOUNT', 'TYPE'], recent, 'Approved transactions will appear here.');
    const activityList = state.announcements.filter((item) => item.status === 'Published').slice(0, 3).map((item) => `<article class="feed-item"><span class="feed-marker">◉</span><div class="feed-content"><strong>${esc(item.title)}</strong><p>${esc(item.body)}</p><small>${esc(formatDate(item.date))}</small></div></article>`).join('');
    const adminNotice = currentUser.role === 'admin' && pending ? `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Items need your attention</h2><p class="panel-subtitle">Review contribution proof and pending transactions.</p></div>${button('Review receipts', 'go-receipts', 'button-secondary button-sm')}</div><p class="inline-note">${pending} item${pending === 1 ? '' : 's'} awaiting review.</p></section>` : '';
    return `${metrics}<div class="dashboard-grid">${panel('Fund activity', `<div class="chart-legend"><span class="legend-item"><i class="legend-dot"></i>Inflow</span><span class="legend-item"><i class="legend-dot expense"></i>Expenses</span></div>${chartMarkup()}`, 'Income and expenses over the last six months')}${panel('Available funds', `<div class="balance-label">CURRENT ORGANIZATION BALANCE</div><div class="balance-number">${esc(moneyValue(balance()))}</div><div class="balance-caption">Based on approved transactions</div><div class="balance-bottom"><span>Budget remaining</span><strong>${esc(moneyValue(remainingBudget()))}</strong></div>`, 'Updated from the transaction ledger', '')}</div><div class="dashboard-grid">${panel('Recent transactions', recentTable, 'Most recent approved activity', `<button type="button" class="text-button" data-action="go-transactions">View history →</button>`)}${panel('Organization updates', `<div class="feed-list">${activityList || '<div class="empty-state">No announcements yet.</div>'}</div>`, 'Latest announcements')}</div>${adminNotice}`;
  }
  function chartMarkup() {
    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      months.push({ month: date.getMonth(), year: date.getFullYear(), label: new Intl.DateTimeFormat('en', { month: 'short' }).format(date) });
    }
    const monthTotals = months.map((month) => {
      const items = approvedTransactions().filter((item) => {
        const date = new Date(item.date);
        return date.getMonth() === month.month && date.getFullYear() === month.year;
      });
      return { ...month, income: items.filter((item) => item.type !== 'expense').reduce((sum, item) => sum + Number(item.amount), 0), expense: items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0) };
    });
    const maximum = Math.max(1, ...monthTotals.flatMap((item) => [item.income, item.expense]));
    return `<div class="chart-area"><div class="chart-axis"><span>${esc(moneyValue(maximum))}</span><span>${esc(moneyValue(maximum / 2))}</span><span>₱0</span></div><div class="chart-grid"><span></span><span></span><span></span></div><div class="chart-bars">${monthTotals.map((item) => `<div class="chart-month"><div class="bar-pair"><i class="chart-bar" style="height:${Math.max(3, item.income / maximum * 100)}%" title="Inflow ${esc(moneyValue(item.income))}"></i><i class="chart-bar expense" style="height:${Math.max(3, item.expense / maximum * 100)}%" title="Expenses ${esc(moneyValue(item.expense))}"></i></div><small>${esc(item.label)}</small></div>`).join('')}</div></div>`;
  }
  function remainingBudget() { return state.budgets.reduce((sum, item) => sum + Number(item.allocated), 0) - total('expense'); }
  function balancePage() {
    const income = total('income') + total('contribution');
    return `<div class="overview-grid">${metric('Available balance', moneyValue(balance()), '₱', 'Funds ready to use')}${metric('Total money in', moneyValue(income), '↗', 'Contributions and income')}${metric('Total spent', moneyValue(total('expense')), '↘', 'Approved expenses')}${metric('Budget remaining', moneyValue(remainingBudget()), '◫', 'Across all categories')}</div><div class="split-grid">${panel('Where funds come from', table(['SOURCE', 'AMOUNT', 'RECORDS'], `<tr><td>Member contributions</td><td>${esc(moneyValue(total('contribution')))}</td><td>${state.transactions.filter((item) => item.type === 'contribution' && item.status === 'approved').length}</td></tr><tr><td>Other income & donations</td><td>${esc(moneyValue(total('income')))}</td><td>${state.transactions.filter((item) => item.type === 'income' && item.status === 'approved').length}</td></tr>`))}${panel('Balance calculation', `<div class="settings-row"><div><strong>Contributions & income</strong><small>Approved inflows</small></div><strong class="positive">+ ${esc(moneyValue(income))}</strong></div><div class="settings-row"><div><strong>Organization expenses</strong><small>Approved outflows</small></div><strong class="negative">− ${esc(moneyValue(total('expense')))}</strong></div><div class="balance-bottom"><span>Available balance</span><strong>${esc(moneyValue(balance()))}</strong></div>`, 'Calculated from the shared ledger')}</div>`;
  }
  function contributionsPage() {
    const items = state.transactions.filter((item) => item.type === 'contribution' || item.type === 'income');
    const proofCards = state.proofs.map((proof) => `<article class="feed-item"><span class="feed-marker">↗</span><div class="feed-content"><strong>${esc(proof.member)} · ${esc(moneyValue(proof.amount))}</strong><p>${esc(proof.note || 'Payment proof submitted for review.')}</p><small>${esc(formatDate(proof.date))} · ${esc(proof.file || 'No attachment')}</small></div>${badge(proof.status)}</article>`).join('');
    const rows = transactionRows(items, { membership: true });
    return `<div class="overview-grid">${metric('Total member contributions', moneyValue(total('contribution')), '↗', 'Approved dues & payments')}${metric('Other income', moneyValue(total('income')), '₱', 'Fundraisers and donations')}${metric('Approved records', String(items.filter((item) => item.status === 'approved').length), '✓', 'Visible to members')}${metric('Proof submissions', String(state.proofs.length), '▧', 'Member payment confirmations')}</div><div class="page-stack">${panel('Contribution records', table(['DATE', 'MEMBER', 'DESCRIPTION', 'AMOUNT', 'RECEIPT', 'STATUS'], rows, 'No contribution records yet.'), 'Approved contributions are visible to all organization members.')}${currentUser.role === 'admin' ? panel('Member payment proof', `<div class="feed-list">${proofCards || '<div class="empty-state">No payment proofs submitted.</div>'}</div>`, 'Confirm proof before recording it in the ledger.') : panel('Your payment proof', `<div class="feed-list">${proofCards || '<div class="empty-state">You have no payment proof submissions.</div>'}</div>`, 'Submitted proofs are reviewed by your treasurer.')}</div>`;
  }
  function transactionsPage() {
    const isAdmin = currentUser.role === 'admin';
    return panel(isAdmin ? 'All organization transactions' : 'All transactions', table(['DATE', 'DESCRIPTION', 'AMOUNT', 'TYPE', ...(isAdmin ? ['STATUS', 'RECEIPT', 'ACTIONS'] : [])], transactionRows(state.transactions, { admin: isAdmin, status: isAdmin, receiptColumn: isAdmin }), isAdmin ? 'No transactions yet.' : 'No approved transactions yet.'), isAdmin ? 'Approved and pending entries for your organization.' : 'Members can review approved records; only authorized officers record transactions.');
  }
  function expensesPage() {
    const expenses = state.transactions.filter((item) => item.type === 'expense');
    const rows = transactionRows(expenses, { admin: currentUser.role === 'admin', status: currentUser.role === 'admin', receiptColumn: currentUser.role === 'admin' });
    const headers = ['DATE', 'DESCRIPTION', 'AMOUNT', 'TYPE', ...(currentUser.role === 'admin' ? ['STATUS', 'RECEIPT', 'ACTIONS'] : [])];
    return `<div class="overview-grid">${metric('Approved expenses', moneyValue(total('expense')), '↘', 'Funds used')}${metric('Expense records', String(expenses.length), '▤', 'All recorded expenses')}${metric('Budget remaining', moneyValue(remainingBudget()), '◫', 'Across all categories')}${metric('Receipts attached', String(expenses.filter((item) => item.receipt).length), '▧', 'Supporting evidence')}</div>${panel('Expense records', table(headers, rows, 'No expense records yet.'), 'See what was purchased and which organization funds were used.')}`;
  }
  function budgetRows() {
    return state.budgets.map((item) => {
      const spent = state.transactions.filter((tx) => tx.type === 'expense' && tx.status === 'approved' && tx.category.toLowerCase() === item.category.toLowerCase()).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const pct = item.allocated > 0 ? Math.min(100, Math.round(spent / item.allocated * 100)) : 0;
      return `<div class="budget-row"><div class="budget-top"><strong>${esc(item.name)}</strong><span>${esc(moneyValue(spent))} <span class="cell-secondary" style="display:inline">of ${esc(moneyValue(item.allocated))}</span></span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-meta"><span>${pct}% used</span><span>${esc(moneyValue(Math.max(0, item.allocated - spent)))} remaining</span></div></div>`;
    }).join('');
  }
  function budgetPage() {
    return `<div class="overview-grid">${metric('Total allocated', moneyValue(state.budgets.reduce((sum, item) => sum + Number(item.allocated), 0)), '◫', `${state.budgets.length} budget categories`)}${metric('Spent to date', moneyValue(total('expense')), '↘', 'Approved expenses')}${metric('Remaining', moneyValue(remainingBudget()), '₱', 'Unspent allocation')}${metric('Available funds', moneyValue(balance()), '↗', 'Current organization balance')}</div>${panel('Category allocations', `<div>${budgetRows() || '<div class="empty-state">No budgets set. Add an allocation to get started.</div>'}</div>`, 'Track planned spending against actual approved expenses.')}`;
  }
  function reportsPage() {
    const approved = approvedTransactions();
    const contributions = total('contribution') + total('income');
    const expenses = total('expense');
    return `<div class="report-summary"><div class="report-stat"><small>Total income & contributions</small><strong class="positive">${esc(moneyValue(contributions))}</strong></div><div class="report-stat"><small>Total expenses</small><strong class="negative">${esc(moneyValue(expenses))}</strong></div><div class="report-stat"><small>Available balance</small><strong>${esc(moneyValue(balance()))}</strong></div></div><div class="page-stack" style="margin-top:15px">${panel('Income & expense trend', `<div class="chart-legend"><span class="legend-item"><i class="legend-dot"></i>Inflow</span><span class="legend-item"><i class="legend-dot expense"></i>Expenses</span></div>${chartMarkup()}`, 'Monthly totals from approved records')}${panel('Report detail', table(['DATE', 'TRANSACTION', 'AMOUNT', 'TYPE'], transactionRows(approved), 'No approved data to report.'), `${approved.length} approved financial records · generated ${esc(formatDate(new Date()))}`)}</div>`;
  }
  function announcementsPage() {
    const items = sortedByDate(state.announcements);
    return panel(currentUser.role === 'admin' ? 'Manage announcements' : 'Organization updates', items.map((item) => `<article class="announcement"><span class="announcement-icon">◉</span><div class="announcement-body"><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><small>${esc(formatDate(item.date))} · ${badge(item.status)}</small></div>${currentUser.role === 'admin' ? `<div class="announcement-actions"><button class="icon-button" title="Edit announcement" aria-label="Edit announcement" data-action="edit-announcement" data-id="${esc(item.id)}">✎</button><button class="icon-button" title="Delete announcement" aria-label="Delete announcement" data-action="delete-announcement" data-id="${esc(item.id)}">×</button></div>` : ''}</article>`).join('') || '<div class="empty-state">No announcements posted.</div>', currentUser.role === 'admin' ? 'Post timely financial updates for members.' : 'Updates from your organization officers.');
  }
  function membersPage() {
    const rows = state.members.map((member) => {
      const isAdminRow = member.account_role === 'admin';
      const roleBadge = isAdminRow
        ? `<span class="badge" style="color:#e8c679;border-color:rgba(232,198,121,.25);background:rgba(232,198,121,.08)">Treasurer (Admin)</span>`
        : esc(member.role);
      const rowActions = isAdminRow
        ? `<button class="button button-sm button-secondary" data-action="edit-profile">My account</button>`
        : `<div class="row-actions"><button class="icon-button" title="Edit member" aria-label="Edit member" data-action="edit-member" data-id="${esc(member.id)}">✎</button><button class="icon-button" title="Remove member" aria-label="Remove member" data-action="delete-member" data-id="${esc(member.id)}">×</button></div>`;
      return `<tr><td><div class="member-person"><span class="avatar-sm" ${isAdminRow ? 'style="border-color:rgba(232,198,121,.3);color:#e8c679;background:rgba(232,198,121,.08)"' : ''}>${esc(initials(member.name))}</span><span><strong>${esc(member.name)}</strong><small>${esc(member.email)}</small></span></div></td><td>${roleBadge}</td><td>${badge(member.status)}</td><td>${rowActions}</td></tr>`;
    }).join('');
    return `<div class="overview-grid">${metric('Organization members', String(state.members.length), '♧', 'Registered in this workspace')}${metric('Active', String(state.members.filter((member) => member.status === 'Active').length), '✓', 'With active access')}${metric('Contributions recorded', String(state.transactions.filter((item) => item.type === 'contribution').length), '↗', 'Member payment history')}${metric('Pending proof', String(state.proofs.filter((proof) => proof.status === 'Pending').length), '◷', 'Requires review')}</div>${panel('Organization members', table(['MEMBER', 'ROLE', 'STATUS', 'ACTIONS'], rows, 'No members added yet.'), 'Manage member details and organization roles.')}`;
  }
  function receiptsPage() {
    const rows = state.proofs.map((proof) => `<tr><td>${esc(formatDate(proof.date))}</td><td><span class="cell-primary">${esc(proof.member)}</span></td><td>${esc(moneyValue(proof.amount))}</td><td>${proof.file ? `<a class="receipt-file" href="#" data-action="proof-file" data-id="${esc(proof.id)}">${esc(proof.file)}</a>` : 'No file attached'}</td><td>${badge(proof.status)}</td><td><div class="row-actions">${proof.status === 'Pending' ? `<button class="button button-sm button-primary" data-action="approve-proof" data-id="${esc(proof.id)}">Approve</button>` : ''}<button class="icon-button" aria-label="Delete proof" data-action="delete-proof" data-id="${esc(proof.id)}">×</button></div></td></tr>`).join('');
    const txRows = transactionRows(state.transactions.filter((item) => item.receipt), { receipts: true, admin: true });
    return `<div class="page-stack">${panel('Member proof submissions', table(['SUBMITTED', 'MEMBER', 'AMOUNT', 'ATTACHMENT', 'STATUS', 'ACTIONS'], rows, 'No member payment proofs submitted.'), 'Approve a proof to record it as a contribution.')}${panel('Transaction receipts', table(['DATE', 'TRANSACTION', 'RECORDED BY', 'AMOUNT', 'RECEIPT', 'STATUS', 'ACTIONS'], txRows, 'No receipts attached to transaction records.'), 'Receipt files are referenced locally in this demo.')}</div>`;
  }
  function usersPage() {
    const rows = state.members.map((member) => {
      const isAdminRow = member.account_role === 'admin';
      const accessLabel = isAdminRow
        ? `<span class="badge" style="color:#e8c679;border-color:rgba(232,198,121,.25);background:rgba(232,198,121,.08)">Full Treasurer Access</span>`
        : badge(member.status);
      const actionBtn = isAdminRow
        ? `<button class="button button-sm button-secondary" data-action="edit-profile">My account</button>`
        : `<button class="button button-sm button-secondary" data-action="edit-member" data-id="${esc(member.id)}">Manage access</button>`;
      return `<tr><td><div class="member-person"><span class="avatar-sm" ${isAdminRow ? 'style="border-color:rgba(232,198,121,.3);color:#e8c679;background:rgba(232,198,121,.08)"' : ''}>${esc(initials(member.name))}</span><span><strong>${esc(member.name)}</strong><small>${esc(member.email)}</small></span></div></td><td>${esc(member.role || (isAdminRow ? 'Treasurer' : 'Member'))}</td><td>${accessLabel}</td><td>${actionBtn}</td></tr>`;
    }).join('');
    return panel('Accounts & permissions', table(['ACCOUNT', 'ROLE', 'ACCESS', 'ACTIONS'], rows, 'No accounts found.'), 'Treasurer access is for officers who manage financial records.');
  }
  function auditPage() {
    const items = sortedByDate(state.activities);
    return panel('Recent system activity', `<div class="activity-timeline">${items.map((item) => `<article class="activity-entry"><span class="activity-dot">✓</span><div class="activity-copy"><strong>${esc(item.action)}</strong><p>${esc(item.detail)}</p><small>${esc(item.actor)} · ${esc(formatDateTime(item.date))}</small></div></article>`).join('') || '<div class="empty-state">No activity recorded yet.</div>'}</div>`, 'Financial and administration actions are recorded here.');
  }
  function profilePage() {
    const myTransactions = state.transactions.filter((item) => item.member === currentUser.name);
    return `<div class="split-grid">${panel('Account details', `<div class="member-row"><span class="member-person"><span class="avatar-sm">${esc(initials(currentUser.name))}</span><span><strong>${esc(currentUser.name)}</strong><small>${esc(currentUser.email)}</small></span></span>${badge(currentUser.role === 'admin' ? 'Treasurer' : 'Member')}</div><div class="settings-row"><div><strong>Organization</strong><small>${esc(state.organization)}</small></div></div><div class="settings-row"><div><strong>Role-based access</strong><small>${currentUser.role === 'admin' ? 'Can manage organization financial records' : 'View-only financial access'}</small></div></div>`, 'Your CampusCash profile')}${panel('Your contribution activity', table(['DATE', 'DESCRIPTION', 'AMOUNT', 'STATUS'], transactionRows(myTransactions.filter((item) => item.type === 'contribution'), { status: true }), 'No contribution records for this account.'), 'Your contribution history')}</div>`;
  }
  function settingsPage() {
    return `<div class="split-grid">${panel('Organization profile', `<div class="settings-row"><div><strong>Organization name</strong><small>${esc(state.organization)}</small></div>${button('Edit', 'edit-organization', 'button-secondary button-sm')}</div><div class="settings-row"><div><strong>Workspace role</strong><small>Treasurer / administrator</small></div>${badge('Active')}</div><div class="settings-row"><div><strong>Member count</strong><small>${state.members.length} members</small></div><button class="text-button" data-view="members">Manage members →</button></div>`, 'Core information shared with members')}${panel('Prototype preferences', `<div class="settings-row"><div><strong>Store data in this browser</strong><small>This interactive prototype uses local browser storage, not a server database.</small></div><span class="badge badge-active">On</span></div><div class="settings-row"><div><strong>Reset demo data</strong><small>Restore the sample transactions, budgets, members, and announcements.</small></div>${button('Reset demo', 'reset-demo', 'button-danger button-sm')}</div>`, 'Demo environment')}</div>`;
  }

  function openModal(title, description, fields, submitLabel, submitAction, values = {}) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-header"><div><h2 id="modalTitle">${esc(title)}</h2><p>${esc(description)}</p></div><button class="modal-close" type="button" aria-label="Close dialog" data-action="close-modal">×</button></header><form class="modal-form" data-submit="${esc(submitAction)}">${fields.map((field) => renderField(field, values[field.name])).join('')}<div class="modal-actions"><button class="button button-quiet" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">${esc(submitLabel)}</button></div></form></section></div>`;
    modalRoot.querySelector('input,select,textarea')?.focus();
  }
  function normalizeOptions(rawOptions) {
    const list = typeof rawOptions === 'function' ? rawOptions() : rawOptions;
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (Array.isArray(item)) {
        return { value: String(item[0]), label: String(item[1] ?? item[0]) };
      }
      if (typeof item === 'object' && item !== null) {
        return { value: String(item.value ?? item.label ?? ''), label: String(item.label ?? item.value ?? '') };
      }
      return { value: String(item), label: String(item) };
    });
  }

  function renderField(field, value) {
    const val = value ?? field.value ?? '';
    const label = `<span>${esc(field.label)}</span>`;
    if (field.type === 'select') {
      const options = field.options || [];
      return `<label>${label}<select name="${esc(field.name)}" ${field.required ? 'required' : ''}>${options.map((option) => `<option value="${esc(option.value)}" ${String(val) === String(option.value) ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}</select></label>`;
    }
    if (field.type === 'textarea') return `<label>${label}<textarea name="${esc(field.name)}" maxlength="${field.maxlength || 500}" ${field.required ? 'required' : ''} placeholder="${esc(field.placeholder || '')}">${esc(val)}</textarea></label>`;
    return `<label>${label}<input name="${esc(field.name)}" type="${esc(field.type || 'text')}" value="${field.type === 'file' ? '' : esc(val)}" ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.step ? `step="${field.step}"` : ''} ${field.required ? 'required' : ''} ${field.accept ? `accept="${esc(field.accept)}"` : ''} placeholder="${esc(field.placeholder || '')}"></label>`;
  }
  const modalFields = {
    contribution: [
      { name: 'description', label: 'Contribution description', required: true, maxlength: 90, placeholder: 'e.g. November membership dues' },
      { name: 'amount', label: 'Amount (PHP)', type: 'number', min: '.01', step: '.01', required: true, placeholder: 'e.g. 500.00' },
      {
        name: 'member',
        label: 'Contributing member',
        type: 'select',
        required: true,
        options: () => {
          const names = state.members.map((m) => [m.name, `${m.name} (${m.role})`]);
          if (names.length === 0) names.push([currentUser?.name || 'Member', currentUser?.name || 'Member']);
          names.push(['Alumni / Donor', 'Alumni / External Donor']);
          return names;
        }
      },
      {
        name: 'category',
        label: 'Contribution category',
        type: 'select',
        required: true,
        options: [
          ['Membership', 'Membership dues'],
          ['Donation', 'Donation / Alumni gift'],
          ['Fundraising', 'Fundraising proceeds'],
          ['Merchandise', 'Merchandise payment'],
          ['Events', 'Event registration / tickets'],
          ['General', 'General contribution']
        ]
      },
      { name: 'date', label: 'Date received', type: 'date', value: () => new Date().toISOString().slice(0, 10), required: true },
      {
        name: 'status',
        label: 'Transaction status',
        type: 'select',
        options: [
          ['approved', 'Approved (official ledger entry)'],
          ['pending', 'Pending (awaiting verification)']
        ]
      },
      { name: 'receipt', label: 'Attach receipt / proof (optional)', type: 'file', accept: '.pdf,image/*' }
    ],
    expense: [
      { name: 'description', label: 'Expense description', required: true, maxlength: 90, placeholder: 'e.g. T-shirt printing / Venue reservation' },
      { name: 'amount', label: 'Amount (PHP)', type: 'number', min: '.01', step: '.01', required: true, placeholder: 'e.g. 1500.00' },
      {
        name: 'category',
        label: 'Budget category',
        type: 'select',
        required: true,
        options: () => {
          const list = state.budgets.map((b) => [b.category, `${b.name} (${b.category})`]);
          if (list.length === 0) {
            return [['Events', 'Events'], ['Merchandise', 'Merchandise'], ['Operations', 'Operations'], ['Outreach', 'Outreach'], ['General', 'General']];
          }
          return list;
        }
      },
      { name: 'member', label: 'Disbursed / Recorded by', value: () => currentUser.name },
      { name: 'date', label: 'Expense date', type: 'date', value: () => new Date().toISOString().slice(0, 10), required: true },
      {
        name: 'status',
        label: 'Transaction status',
        type: 'select',
        options: [
          ['approved', 'Approved (official expenditure)'],
          ['pending', 'Pending (reimbursement / pending receipt)']
        ]
      },
      { name: 'receipt', label: 'Attach official receipt (optional)', type: 'file', accept: '.pdf,image/*' }
    ],
    transaction: [
      { name: 'description', label: 'Description', required: true, maxlength: 90, placeholder: 'e.g. Workshop materials' },
      { name: 'amount', label: 'Amount (PHP)', type: 'number', min: '.01', step: '.01', required: true },
      { name: 'category', label: 'Budget category', type: 'select', required: true, options: [['Events', 'Events'], ['Merchandise', 'Merchandise'], ['Operations', 'Operations'], ['Outreach', 'Outreach'], ['General', 'General']] },
      { name: 'member', label: 'Recorded by', value: () => currentUser.name },
      { name: 'date', label: 'Date', type: 'date', value: () => new Date().toISOString().slice(0, 10), required: true },
      { name: 'receipt', label: 'Attach receipt (optional)', type: 'file', accept: '.pdf,image/*' }
    ],
    member: [
      { name: 'name', label: 'Full name', required: true, placeholder: 'e.g. Maria Santos' },
      { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'e.g. maria@school.edu' },
      {
        name: 'role',
        label: 'Organization role',
        type: 'select',
        required: true,
        options: [
          ['Member', 'Member'],
          ['Treasurer', 'Treasurer'],
          ['President', 'President'],
          ['Vice President', 'Vice President'],
          ['Secretary', 'Secretary'],
          ['Auditor', 'Auditor'],
          ['Officer', 'Officer']
        ]
      },
      {
        name: 'status',
        label: 'Account status',
        type: 'select',
        required: true,
        options: [
          ['Active', 'Active'],
          ['Inactive', 'Inactive']
        ]
      }
    ],
    budget: [
      { name: 'name', label: 'Budget allocation name', required: true, placeholder: 'e.g. Annual Tech Summit' },
      {
        name: 'category',
        label: 'Budget category',
        type: 'select',
        required: true,
        options: [
          ['Events', 'Events & workshops'],
          ['Merchandise', 'Merchandise & uniform'],
          ['Operations', 'Operations & logistics'],
          ['Outreach', 'Outreach & community'],
          ['General', 'General / contingency']
        ]
      },
      { name: 'allocated', label: 'Allocated amount (PHP)', type: 'number', min: '.01', step: '.01', required: true, placeholder: 'e.g. 10000.00' }
    ],
    announcement: [
      { name: 'title', label: 'Announcement title', required: true, maxlength: 90, placeholder: 'e.g. November General Assembly' },
      { name: 'body', label: 'Message', type: 'textarea', required: true, maxlength: 500, placeholder: 'Enter your announcement message...' }
    ],
    proof: [
      { name: 'amount', label: 'Payment amount (PHP)', type: 'number', min: '.01', step: '.01', required: true, placeholder: 'e.g. 500.00' },
      { name: 'note', label: 'Payment reference or note', type: 'textarea', maxlength: 250, placeholder: 'GCash ref #, bank transfer details, or note...' },
      { name: 'file', label: 'Proof of payment screenshot/receipt', type: 'file', accept: '.pdf,image/*', required: true }
    ]
  };
  function fieldsFor(type, value = {}) {
    if (!modalFields[type]) return [];
    return modalFields[type].map((field) => {
      let output = { ...field };
      if (typeof output.value === 'function') output.value = output.value();
      if (output.options) output.options = normalizeOptions(output.options);
      if (type === 'member' && !value.id && field.name === 'status') output.value = 'Active';
      if (field.name === 'date' && !value.date) output.value = new Date().toISOString().slice(0, 10);
      return output;
    });
  }
  function getFormValues(form) {
    const values = {};
    for (const [name, value] of new FormData(form).entries()) {
      if (value instanceof File) {
        if (value.name) values[name] = value.name;
      } else values[name] = String(value).trim();
    }
    return values;
  }
  function startTransaction(type) {
    if (type === 'contribution') {
      openModal(
        'Record a contribution',
        'Record an approved member contribution or donation in the ledger.',
        fieldsFor('contribution'),
        'Save contribution',
        'save-contribution'
      );
    } else {
      openModal(
        'Record an expense',
        'Add an organization expense to the ledger against an allocated budget.',
        fieldsFor('expense'),
        'Save expense',
        'save-expense'
      );
    }
  }
  function addTransaction(values, type, status = 'approved') {
    const amount = Number(values.amount);
    const date = values.date ? new Date(`${values.date}T12:00:00`).toISOString() : new Date().toISOString();
    if (!values.description || !Number.isFinite(amount) || amount <= 0) {
      notify('Enter a description and valid amount.', true); return;
    }
    const category = values.category || (type === 'contribution' ? 'Membership' : 'General');
    state.transactions.unshift({ id: makeId('tx'), date, description: values.description, category, type, amount, member: values.member || currentUser.name, status: status.toLowerCase(), receipt: values.receipt || '' });
    recordActivity(type === 'expense' ? 'Recorded an expense' : 'Recorded a contribution', `${values.description} · ${moneyValue(amount)}`);
    persist(type === 'expense' ? 'Expense recorded and balance updated.' : 'Contribution recorded and balance updated.');
    modalRoot.innerHTML = '';
    render();
  }
  function addMember(values, id = '') {
    if (!values.name || !values.email) { notify('Name and email are required.', true); return; }
    const exists = state.members.some((item) => item.email.toLowerCase() === values.email.toLowerCase() && item.id !== id);
    if (exists) { notify('A member with that email already exists.', true); return; }
    if (id) {
      const member = state.members.find((item) => item.id === id);
      if (!member) return;
      Object.assign(member, values);
      recordActivity('Updated a member account', `${values.name} · ${values.role}`);
    } else {
      state.members.push({ id: makeId('m'), name: values.name, email: values.email, role: values.role || 'Member', status: values.status || 'Active' });
      recordActivity('Added an organization member', `${values.name} · ${values.role || 'Member'}`);
    }
    persist(id ? 'Member details updated.' : 'Member added to the organization.');
    modalRoot.innerHTML = ''; render();
  }
  function addBudget(values, id = '') {
    const allocated = Number(values.allocated);
    if (!values.name || !Number.isFinite(allocated) || allocated <= 0) { notify('Enter a budget name and a valid allocation.', true); return; }
    const category = values.category || 'General';
    if (id) {
      const item = state.budgets.find((entry) => entry.id === id);
      if (item) Object.assign(item, { name: values.name, category, allocated });
    } else state.budgets.push({ id: makeId('b'), name: values.name, category, allocated });
    recordActivity(id ? 'Updated a budget allocation' : 'Created a budget allocation', `${values.name} · ${moneyValue(allocated)}`);
    persist('Budget saved.');
    modalRoot.innerHTML = ''; render();
  }
  function addAnnouncement(values, id = '') {
    if (!values.title || !values.body) { notify('A title and message are required.', true); return; }
    if (id) {
      const item = state.announcements.find((entry) => entry.id === id);
      if (item) Object.assign(item, { title: values.title, body: values.body });
    } else state.announcements.unshift({ id: makeId('a'), title: values.title, body: values.body, date: new Date().toISOString(), status: 'Published' });
    recordActivity(id ? 'Updated an announcement' : 'Published an announcement', values.title);
    persist('Announcement published.');
    modalRoot.innerHTML = ''; render();
  }
  function submitProof(values) {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !values.file) { notify('Enter the amount and attach proof of payment.', true); return; }
    state.proofs.unshift({
      id: makeId('proof'),
      date: new Date().toISOString(),
      member: currentUser.name,
      email: currentUser.email || '',
      amount,
      note: values.note || '',
      file: values.file,
      status: 'Pending'
    });
    recordActivity('Submitted payment proof', `${moneyValue(amount)} · ${values.file}`);
    persist('Payment proof sent to the treasurer for review.');
    modalRoot.innerHTML = ''; render();
  }

  function handleAction(action, id) {
    if (action === 'add-expense') return startTransaction('expense');
    if (action === 'add-contribution') return startTransaction('contribution');
    if (action === 'submit-proof') return openModal('Submit payment proof', 'Your treasurer will review this before it is added to the ledger.', fieldsFor('proof'), 'Submit for review', 'save-proof');
    if (action === 'add-member') return openModal('Add organization member', 'Create an account entry and assign an organization role.', fieldsFor('member'), 'Add member', 'save-member');
    if (action === 'edit-member') {
      const member = state.members.find((item) => item.id === id);
      if (member) openModal('Edit member', 'Update member information and account access.', fieldsFor('member', member), 'Save member', `edit-member:${id}`, member);
      return;
    }
    if (action === 'delete-member') {
      const member = state.members.find((item) => item.id === id);
      if (member && confirm(`Remove ${member.name} from this organization?`)) {
        state.members = state.members.filter((item) => item.id !== id);
        recordActivity('Removed an organization member', member.name); persist('Member removed.'); render();
      }
      return;
    }
    if (action === 'add-budget') return openModal('Add budget allocation', 'Set a spending plan for an organization category.', fieldsFor('budget'), 'Save budget', 'save-budget');
    if (action === 'add-announcement') return openModal('New announcement', 'Share a financial update with organization members.', fieldsFor('announcement'), 'Publish announcement', 'save-announcement');
    if (action === 'edit-announcement') {
      const item = state.announcements.find((entry) => entry.id === id);
      if (item) openModal('Edit announcement', 'Update this member-facing financial notice.', fieldsFor('announcement', item), 'Save changes', `edit-announcement:${id}`, item);
      return;
    }
    if (action === 'delete-announcement') {
      if (confirm('Delete this announcement?')) {
        const item = state.announcements.find((entry) => entry.id === id);
        state.announcements = state.announcements.filter((entry) => entry.id !== id);
        recordActivity('Deleted an announcement', item?.title || 'Announcement');
        persist('Announcement deleted.'); render();
      }
      return;
    }
    if (action === 'approve') {
      const item = state.transactions.find((entry) => entry.id === id);
      if (item?.status === 'pending') {
        item.status = 'approved';
        recordActivity('Approved a transaction', `${item.description} · ${moneyValue(item.amount)}`);
        persist('Transaction approved. Balance updated.'); render();
      }
      return;
    }
    if (action === 'delete-transaction') {
      const item = state.transactions.find((entry) => entry.id === id);
      if (item && confirm(`Delete "${item.description}" from the ledger?`)) {
        state.transactions = state.transactions.filter((entry) => entry.id !== id);
        recordActivity('Deleted a transaction', item.description); persist('Transaction deleted.'); render();
      }
      return;
    }
    if (action === 'approve-proof') {
      const proof = state.proofs.find((entry) => entry.id === id);
      if (proof?.status === 'Pending') {
        proof.status = 'Approved';
        state.transactions.unshift({ id: makeId('tx'), date: proof.date, description: proof.note || 'Member contribution', category: 'Membership', type: 'contribution', amount: proof.amount, member: proof.member, status: 'approved', receipt: proof.file });
        recordActivity('Approved member payment proof', `${proof.member} · ${moneyValue(proof.amount)}`);
        persist('Payment proof approved and contribution added to the ledger.'); render();
      }
      return;
    }
    if (action === 'delete-proof') {
      if (confirm('Delete this payment proof submission?')) {
        const proof = state.proofs.find((entry) => entry.id === id);
        state.proofs = state.proofs.filter((entry) => entry.id !== id);
        recordActivity('Removed a payment proof', proof?.member || 'Payment proof');
        persist('Payment proof removed.'); render();
      }
      return;
    }
    if (action === 'edit-organization') return openModal('Organization settings', 'Update your organization name.', [{ name: 'organization', label: 'Organization name', required: true, maxlength: 80 }], 'Save settings', 'save-organization', { organization: state.organization });
    if (action === 'edit-profile') return openModal('Edit profile', 'Update your name and contact details for this demo session.', [{ name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Email address', type: 'email', required: true }], 'Save profile', 'save-profile', currentUser);
    if (action === 'export-csv') return exportCsv();
    if (action === 'print-report') return window.print();
    if (action === 'reset-demo') {
      if (confirm('Reset all CampusCash demo data in this browser?')) {
        const fresh = freshState();
        Object.keys(state).forEach((key) => delete state[key]);
        Object.assign(state, fresh);
        persist('Demo data restored.'); render();
      }
      return;
    }
    if (action === 'go-receipts') return navigate('receipts');
    if (action === 'go-transactions') return navigate('transactions');
    if (action === 'receipt' || action === 'proof-file') return notify('File attachments in this demo are represented by their filename only.', true);
  }

  function exportCsv() {
    const header = ['Date', 'Description', 'Category', 'Type', 'Amount PHP', 'Member', 'Status', 'Receipt'];
    const rows = sortedByDate(state.transactions).map((item) => [formatDate(item.date), item.description, item.category, item.type, item.amount, item.member, item.status, item.receipt]);
    const csv = [header, ...rows].map((row) => row.map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'campuscash-financial-report.csv'; anchor.click();
    URL.revokeObjectURL(url);
    notify('Financial report exported as CSV.');
  }
  function navigate(view) {
    if (!pages[view] || (pages[view].adminOnly && currentUser.role !== 'admin')) return;
    currentView = view;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function setAuthMode(mode) {
    authMode = mode;
    const registering = authMode === 'register';
    if (adminPortal) {
      document.getElementById('authEyebrow').textContent = registering ? 'TREASURER ONBOARDING' : 'ADMINISTRATOR ACCESS';
      document.getElementById('authTitle').textContent = registering ? 'Register organization & treasurer' : 'Administrator sign in';
      document.getElementById('authDescription').textContent = registering
        ? 'Set up a new organization workspace and create your administrator account.'
        : 'Sign in with your organization administrator credentials.';
      document.getElementById('usernameLabel').textContent = registering ? 'Choose administrator username' : 'Administrator username';
      document.getElementById('loginUsername').placeholder = registering ? 'e.g. codetech_admin' : 'Enter your administrator username';
      authSubmit.innerHTML = registering ? 'Register organization & treasurer <span aria-hidden="true">→</span>' : 'Sign in as Treasurer <span aria-hidden="true">→</span>';
      authSwitch.hidden = false;
      authSwitch.innerHTML = registering
        ? 'Already have an administrator account? <button type="button" data-auth-mode="login">Sign in</button>'
        : 'Need an administrator workspace for your club? <button type="button" data-auth-mode="register">Register as Treasurer</button>';
    } else {
      document.getElementById('authEyebrow').textContent = registering ? 'GET STARTED' : 'WELCOME BACK';
      document.getElementById('authTitle').textContent = registering ? 'Create your account' : 'Sign in to your account';
      document.getElementById('authDescription').textContent = registering
        ? 'Join your organization’s transparent finance workspace.'
        : 'Access your organization’s financial workspace.';
      document.getElementById('usernameLabel').textContent = 'Username';
      document.getElementById('loginUsername').placeholder = 'Enter your username';
      authSubmit.innerHTML = registering ? 'Create account <span aria-hidden="true">→</span>' : 'Sign in <span aria-hidden="true">→</span>';
      authSwitch.hidden = false;
      authSwitch.innerHTML = registering
        ? 'Already have an account? <button type="button" data-auth-mode="login">Sign in</button>'
        : 'New to CampusCash? <button type="button" data-auth-mode="register">Create an account</button>';
    }
    document.getElementById('loginPassword').autocomplete = registering ? 'new-password' : 'current-password';
    document.getElementById('passwordLabel').textContent = registering ? 'Create password (min 8 chars)' : 'Password';
    document.getElementById('loginPassword').minLength = registering ? 8 : 1;
    registrationFields.hidden = !registering;
    [...registrationFields.querySelectorAll('input')].forEach((input) => { input.required = registering; });
    confirmPasswordField.hidden = !registering;
    document.getElementById('confirmPassword').required = registering;
    document.getElementById('memberLoginLink').hidden = !adminPortal;
    loginError.textContent = '';
  }
  async function login(username, password) {
    try {
      loginError.textContent = '';
      authSubmit.disabled = true;
      authSubmit.innerHTML = 'Signing in… <span aria-hidden="true">⟳</span>';
      const result = await apiRequest('login', { username, password });
      await openWorkspace(result);
    } catch (error) {
      const message = error.message || 'Username or password is incorrect.';
      if (message.includes('invalid') || message.includes('incorrect') || message.includes('Invalid') || message.includes('Incorrect')) {
        loginError.textContent = adminPortal
          ? '⚠ Invalid administrator credentials. Contact your organization if you need access.'
          : '⚠ Invalid username or password. Please check your credentials and try again.';
      } else if (message.includes('network') || message.includes('fetch') || message.includes('Failed')) {
        loginError.textContent = '⚠ Unable to reach the server. Please check your connection and try again.';
      } else {
        loginError.textContent = '⚠ ' + message;
      }
    } finally {
      authSubmit.disabled = false;
      authSubmit.innerHTML = adminPortal ? 'Sign in as Treasurer <span aria-hidden="true">→</span>' : 'Sign in <span aria-hidden="true">→</span>';
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const username = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '');
    if (authMode === 'register') {
      const name = String(form.get('fullName') || '').trim();
      const email = String(form.get('email') || '').trim().toLowerCase();
      const organization = String(form.get('organization') || '').trim();
      const confirmPassword = String(form.get('confirmPassword') || '');
      if (!name || !email || !organization || !username) {
        loginError.textContent = 'Complete all fields to create your account.';
        return;
      }
      if (password.length < 8) {
        loginError.textContent = 'Choose a password with at least 8 characters.';
        return;
      }
      if (password !== confirmPassword) {
        loginError.textContent = 'Passwords do not match.';
        return;
      }
      try {
        authSubmit.disabled = true;
        authSubmit.innerHTML = (adminPortal ? 'Registering organization… ' : 'Creating account… ') + '<span aria-hidden="true">⟳</span>';
        const result = await apiRequest('register', { name, email, organization, username, password });
        await openWorkspace(result);
      } catch (error) {
        loginError.textContent = '⚠ ' + (error.message || 'Could not create your account. Please try again.');
      } finally {
        authSubmit.disabled = false;
        authSubmit.innerHTML = adminPortal
          ? 'Register organization & treasurer <span aria-hidden="true">→</span>'
          : 'Create account <span aria-hidden="true">→</span>';
      }
      return;
    }
    await login(username, password);
  });
  authSwitch.addEventListener('click', (event) => {
    const modeButton = event.target.closest('[data-auth-mode]');
    if (!modeButton) return;
    setAuthMode(modeButton.dataset.authMode);
    if (authMode === 'register') document.getElementById('registerName').focus();
  });
  setAuthMode('login');
  navigation.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (button) navigate(button.dataset.view);
  });
  pageContent.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) return navigate(viewButton.dataset.view);
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      event.preventDefault();
      handleAction(actionButton.dataset.action, actionButton.dataset.id);
    }
  });
  pageContent.addEventListener('input', (event) => {
    if (event.target.matches('[data-filter]')) {
      const query = event.target.value.toLowerCase();
      pageContent.querySelectorAll('[data-search-text]').forEach((row) => {
        row.hidden = !row.dataset.searchText.includes(query);
      });
    }
  });
  modalRoot.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop') || event.target.closest('[data-action="close-modal"]')) modalRoot.innerHTML = '';
  });
  modalRoot.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target.closest('form[data-submit]');
    if (!form) return;
    const values = getFormValues(form);
    const action = form.dataset.submit;
    if (action === 'save-expense') return addTransaction(values, 'expense');
    if (action === 'save-contribution') return addTransaction(values, 'contribution');
    if (action === 'save-proof') return submitProof(values);
    if (action === 'save-member') return addMember(values);
    if (action.startsWith('edit-member:')) return addMember(values, action.split(':')[1]);
    if (action === 'save-budget') return addBudget(values);
    if (action === 'save-announcement') return addAnnouncement(values);
    if (action.startsWith('edit-announcement:')) return addAnnouncement(values, action.split(':')[1]);
    if (action === 'save-organization') {
      if (!values.organization) return notify('Organization name is required.', true);
      state.organization = values.organization;
      recordActivity('Updated organization settings', values.organization);
      persist('Organization settings saved.'); modalRoot.innerHTML = ''; render();
    }
    if (action === 'save-profile') {
      if (!values.name || !values.email) return notify('Name and email are required.', true);
      currentUser.name = values.name; currentUser.email = values.email;
      recordActivity('Updated account profile', values.name);
      persist('Profile updated.'); modalRoot.innerHTML = ''; render();
    }
  });
  document.getElementById('logoutButton').addEventListener('click', () => {
    apiRequest('logout').catch((error) => console.error('Unable to end database session:', error)).finally(() => {
      currentUser = null;
      csrfToken = '';
      app.hidden = true;
      loginScreen.hidden = false;
      loginForm.reset();
      toggleAdminMode(false);
      setAuthMode('login');
      loginError.textContent = '';
      modalRoot.innerHTML = '';
    });
  });
  document.getElementById('topProfile').addEventListener('click', () => navigate('profile'));
  document.getElementById('helpLink').addEventListener('click', (event) => {
    event.preventDefault();
    notify('Create a member account to get started, or contact your organization for administrator access.');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalRoot.firstElementChild) modalRoot.innerHTML = '';
  });

  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (event) => {
      event.preventDefault();
      if (loginScreen.hidden) return;
      logoClickCount++;
      clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2000);
      if (logoClickCount >= LOGO_CLICKS_REQUIRED) {
        logoClickCount = 0;
        clearTimeout(logoClickTimer);
        toggleAdminMode(!adminPortal);
      }
    });
  }

  function toggleAdminMode(enable) {
    adminPortal = enable;
    const loginLayout = document.getElementById('loginScreen');
    const adminBadge = document.getElementById('adminBadge');
    if (enable) {
      loginLayout.classList.add('admin-mode');
      if (adminBadge) adminBadge.hidden = false;
    } else {
      loginLayout.classList.remove('admin-mode');
      if (adminBadge) adminBadge.hidden = true;
    }
    setAuthMode('login');
  }

  const memberLoginLink = document.getElementById('memberLoginLink');
  if (memberLoginLink) {
    memberLoginLink.addEventListener('click', (event) => {
      event.preventDefault();
      toggleAdminMode(false);
    });
  }
})();
