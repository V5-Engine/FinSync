/**
 * script.js - Core application logic, controller actions, view router, and UI binding for FinSync
 */

class FinSyncApp {
  constructor() {
    this.currentView = 'dashboard';
    this.selectedDate = new Date(); // For calendar view
    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  /**
   * Reference DOM elements
   */
  initElements() {
    // Layout
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.headerTitle = document.getElementById('header-view-title');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeToggleIcon = document.getElementById('theme-toggle-icon');
    /*this.notificationBell = document.getElementById('notification-bell');*/
/*    this.notifDropdown = document.getElementById('notif-dropdown');*/
    //this.notifBadge = document.getElementById('notif-badge');
    //this.notificationsList = document.getElementById('notifications-list');
    //this.clearNotifBtn = document.getElementById('clear-notifications');
    this.globalSearch = document.getElementById('global-search');
    this.fabQuickAdd = document.getElementById('fab-quick-add');

    // Modals
    this.modals = {
      expense: document.getElementById('modal-expense'),
      bill: document.getElementById('modal-bill'),
      liability: document.getElementById('modal-liability'),
      nextMonth: document.getElementById('modal-next-month'),
      income: document.getElementById('modal-income'),
      goal: document.getElementById('modal-goal')
    };

    // Forms
    this.forms = {
      expense: document.getElementById('form-expense'),
      bill: document.getElementById('form-bill'),
      liability: document.getElementById('form-liability'),
      nextMonth: document.getElementById('form-next-month'),
      income: document.getElementById('form-income'),
      goal: document.getElementById('form-goal')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Navigation view switches
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.changeView(view);
        
        // Hide sidebar on mobile after clicking
        if (window.innerWidth <= 768) {
          this.sidebar.classList.remove('open');
        }
      });
    });

    // Sidebar Hamburger Toggle (responsive desktop collapse and mobile slide-in)
    this.sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth > 768) {
        const container = document.getElementById('app-container');
        if (container) container.classList.toggle('collapsed');
      } else {
        this.sidebar.classList.toggle('open');
      }
    });
      
    // Dashboard Tab switching
    document.querySelectorAll('.dash-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        
        // Tab Headers Toggle
        document.querySelectorAll('.dash-tab').forEach(t => {
          if (t === tab) {
            t.classList.add('active');
            t.style.color = 'var(--text-primary)';
            t.style.borderBottomColor = 'var(--accent-color)';
          } else {
            t.classList.remove('active');
            t.style.color = 'var(--text-secondary)';
            t.style.borderBottomColor = 'transparent';
          }
        });

        // Tab Content toggle
        document.querySelectorAll('.dash-tab-content').forEach(content => {
          if (content.id === `dash-tab-${target}-content`) {
            content.style.display = 'block';
          } else {
            content.style.display = 'none';
          }
        });

        // View all btn label adjust
        const viewAllBtn = document.getElementById('dash-tab-view-all');
        if (target === 'expenses') {
          viewAllBtn.style.display = 'block';
          viewAllBtn.setAttribute('onclick', "window.script.changeView('expenses')");
          viewAllBtn.innerText = 'View All';
        } else {
          viewAllBtn.style.display = 'none';
        }
      });
    });

    // Document click-away for search results dropdown
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('search-results-dropdown');
      if (dropdown && !e.target.closest('.global-search-container')) {
        dropdown.style.display = 'none';
      }
    });

    // Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Notifications Dropdown toggle
    //this.notificationBell.addEventListener('click', (e) => {
    //  e.stopPropagation();
    //  this.notifDropdown.classList.toggle('open');
    //});
    //document.addEventListener('click', () => {
    //  this.notifDropdown.classList.remove('open');
    //});
    //this.notifDropdown.addEventListener('click', (e) => e.stopPropagation());
    //this.clearNotifBtn.addEventListener('click', () => this.clearNotifications());

    // Modal Close triggers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeAllModals();
      });
    });

    // Floating Button Add Action
    this.fabQuickAdd.addEventListener('click', () => {
      this.openModal('expense');
    });

    // Dashboard Buttons
    document.getElementById('dashboard-add-income-btn').addEventListener('click', () => {
      this.openModal('income');
    });
    document.getElementById('dashboard-add-goal-btn').addEventListener('click', () => {
      this.openModal('goal');
    });

    // View specific actions
    document.getElementById('expense-add-btn').addEventListener('click', () => this.openModal('expense'));
    document.getElementById('bill-add-btn').addEventListener('click', () => this.openModal('bill'));
    document.getElementById('liability-add-btn').addEventListener('click', () => this.openModal('liability'));
    document.getElementById('next-month-add-btn').addEventListener('click', () => this.openModal('next-month'));

    // Forms submission handlers
    this.forms.expense.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
    this.forms.bill.addEventListener('submit', (e) => this.handleBillSubmit(e));
    this.forms.liability.addEventListener('submit', (e) => this.handleLiabilitySubmit(e));
    this.forms.nextMonth.addEventListener('submit', (e) => this.handleNextMonthSubmit(e));
    this.forms.income.addEventListener('submit', (e) => this.handleIncomeSubmit(e));
    this.forms.goal.addEventListener('submit', (e) => this.handleGoalSubmit(e));

    // Daily Expenses view filters & actions
    document.getElementById('expense-filter-search').addEventListener('input', () => this.renderExpensesView());
    document.getElementById('expense-filter-category').addEventListener('change', () => this.renderExpensesView());
    document.getElementById('expense-filter-start-date').addEventListener('change', () => this.renderExpensesView());
    document.getElementById('expense-filter-end-date').addEventListener('change', () => this.renderExpensesView());
    document.getElementById('expense-filter-reset').addEventListener('click', () => {
      document.getElementById('expense-filter-search').value = '';
      document.getElementById('expense-filter-category').value = '';
      document.getElementById('expense-filter-start-date').value = '';
      document.getElementById('expense-filter-end-date').value = '';
      this.renderExpensesView();
    });
    document.getElementById('expense-export-csv').addEventListener('click', () => this.exportExpenses('csv'));
    document.getElementById('expense-export-excel').addEventListener('click', () => this.exportExpenses('excel'));

    // Liabilities view filters
    document.getElementById('liability-filter-search').addEventListener('input', () => this.renderLiabilitiesView());
    document.getElementById('liability-filter-type').addEventListener('change', () => this.renderLiabilitiesView());
    document.getElementById('liability-filter-sort').addEventListener('change', () => this.renderLiabilitiesView());

    // Next Month view filters
    document.getElementById('next-month-search').addEventListener('input', () => this.renderNextMonthView());
    document.getElementById('next-month-filter-priority').addEventListener('change', () => this.renderNextMonthView());

    // Global Search
    this.globalSearch.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));

    // Settings elements binds
    document.getElementById('settings-theme-select').addEventListener('change', (e) => {
      const isDark = e.target.value === 'dark';
      this.setTheme(isDark);
    });
    document.getElementById('settings-currency').addEventListener('change', (e) => {
      window.storage.updateSettings({ currency: e.target.value });
      this.refreshAllViews();
      window.utils.showToast('Currency updated successfully', 'success');
    });
    document.getElementById('settings-monthly-budget').addEventListener('change', (e) => {
      window.storage.updateSettings({ monthlyBudget: parseFloat(e.target.value) || 0 });
      this.refreshAllViews();
    });
    document.getElementById('settings-daily-limit').addEventListener('change', (e) => {
      window.storage.updateSettings({ dailyLimit: parseFloat(e.target.value) || 0 });
      this.refreshAllViews();
    });
    document.getElementById('settings-large-expense').addEventListener('change', (e) => {
      window.storage.updateSettings({ largeExpenseThreshold: parseFloat(e.target.value) || 0 });
      window.utils.showToast('Large expense threshold saved', 'success');
    });
    document.getElementById('settings-username').addEventListener('input', (e) => {
      window.storage.updateSettings({ username: e.target.value });
      this.renderWelcome();
    });

    // Accent Color swatches
    document.querySelectorAll('.accent-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const accent = swatch.getAttribute('data-accent');
        this.setAccent(accent);
      });
    });

    // Backups actions
    document.getElementById('settings-btn-backup').addEventListener('click', () => {
      const backupStr = window.storage.exportBackup();
      window.utils.downloadJSON(backupStr, `finsync_backup_${new Date().toISOString().split('T')[0]}.json`);
      window.utils.showToast('Backup JSON downloaded successfully', 'success');
    });
    document.getElementById('settings-btn-restore-trigger').addEventListener('click', () => {
      document.getElementById('settings-file-restore').click();
    });
    document.getElementById('settings-file-restore').addEventListener('change', (e) => this.handleJSONRestore(e));
    document.getElementById('settings-btn-reset').addEventListener('click', () => this.handleResetData());

    // EMI Calculator
    document.getElementById('emi-calculate-btn').addEventListener('click', () => this.calculateEMI());

    // Calendar Navigation
    document.getElementById('calendar-prev-month').addEventListener('click', () => {
      this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
      this.renderCalendarView();
    });
    document.getElementById('calendar-next-month').addEventListener('click', () => {
      this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
      this.renderCalendarView();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          this.openModal('expense');
        } else if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          this.openModal('bill');
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          this.changeView('dashboard');
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          this.changeView('expenses');
        }
      }
    });
  }

  /**
   * Initialize Application
   */
  initApp() {
    // Load preference configurations
    const settings = window.storage.getSettings();
    
    // 1. Theme Configuration
    const isDark = settings.theme !== 'light';
    this.setTheme(isDark);
    document.getElementById('settings-theme-select').value = isDark ? 'dark' : 'light';

    // 2. Accent Highlight Configuration
    this.setAccent(settings.accentColor || 'indigo');

    // 3. User display configuration
    if (!settings.username) {
      settings.username = 'Vishnu'; // default based on app dir metadata
      window.storage.updateSettings({ username: 'Vishnu' });
    }
    document.getElementById('settings-username').value = settings.username;

    // 4. Form inputs sync
    document.getElementById('settings-currency').value = settings.currency || '$';
    document.getElementById('settings-monthly-budget').value = settings.monthlyBudget || 3000;
    document.getElementById('settings-daily-limit').value = settings.dailyLimit || 100;
    document.getElementById('settings-large-expense').value = settings.largeExpenseThreshold || 150;

    // 5. Injects Category Options dynamically
    this.populateCategoryOptions();

    // 6. View loading defaults
    this.refreshAllViews();
  }

  /**
   * Switch Active View section
   */
  changeView(viewId) {
    this.currentView = viewId;
    
    // Manage sidebar classes
    document.querySelectorAll('.sidebar-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Manage section views display
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `${viewId}-view`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Header title
    const viewTitles = {
      dashboard: 'Financial Overview',
      expenses: 'Daily Expense Logs',
      bills: 'Monthly Bills Planner',
      liabilities: 'Liabilities, Credit & Loans',
      'next-month': 'Next Month Forecasting',
      reports: 'Reports & Spending Analytics',
      calendar: 'Events Calendar',
      settings: 'App Configurations'
    };
    this.headerTitle.innerText = viewTitles[viewId] || 'FinSync';

    // Trigger specific render actions
    if (viewId === 'reports') {
      setTimeout(() => window.charts.renderAllCharts(), 50);
    } else if (viewId === 'calendar') {
      this.renderCalendarView();
    } else if (viewId === 'dashboard') {
      this.renderDashboardView();
    } else if (viewId === 'expenses') {
      this.renderExpensesView();
    } else if (viewId === 'bills') {
      this.renderBillsView();
    } else if (viewId === 'liabilities') {
      this.renderLiabilitiesView();
    } else if (viewId === 'next-month') {
      this.renderNextMonthView();
    }
  }

  /**
   * Redraw all screens and trigger alert system
   */
  refreshAllViews() {
    /*this.checkNotifications();*/
    this.renderWelcome();
    
    // Refresh currently visible screen
    this.changeView(this.currentView);
  }

  /**
   * Theme mode set
   */
  setTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark-theme');
      this.themeToggleIcon.className = 'fas fa-sun';
    } else {
      document.body.classList.remove('dark-theme');
      this.themeToggleIcon.className = 'fas fa-moon';
    }
    window.storage.updateSettings({ theme: isDark ? 'dark' : 'light' });
    
    // Refresh charts color themes if reports page is open
    if (this.currentView === 'reports') {
      window.charts.renderAllCharts();
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    this.setTheme(!isDark);
  }

  /**
   * Accent highlights color set
   */
  setAccent(colorName) {
    // Remove previous accent classes
    document.body.className = document.body.className.replace(/\baccent-\S+/g, '');
    document.body.classList.add(`accent-${colorName}`);
    
    // Active class on swatch inputs
    document.querySelectorAll('.accent-swatch').forEach(sw => {
      if (sw.getAttribute('data-accent') === colorName) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });

    window.storage.updateSettings({ accentColor: colorName });
  }

  /**
   * Populate custom Category options dynamically
   */
  populateCategoryOptions() {
    const categories = [
      'Petrol', 'Food', 'Tea/Coffee', 'Grocery', 'Shopping',
      'Medical', 'Entertainment', 'Travel', 'Parking', 'Fuel',
      'Taxi', 'Office', 'Home', 'Others'
    ];
    const select = document.getElementById('expense-filter-category');
    if (select) {
      select.innerHTML = '<option value="">All Categories</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
      });
    }
  }

  /**
   * Populate dashboard banner welcome text
   */
  renderWelcome() {
    const username = window.storage.getSettings().username || 'Vishnu';
    const welcome = document.getElementById('welcome-message');
    const avatar = document.getElementById('sidebar-avatar');
    const sideName = document.getElementById('sidebar-username');
    
    if (welcome) {
      const hours = new Date().getHours();
      let greet = 'Good morning';
      if (hours >= 12 && hours < 17) greet = 'Good afternoon';
      else if (hours >= 17) greet = 'Good evening';
      welcome.innerHTML = `${greet}, <span style="font-weight: 800;">${username}</span>! <i class="fas fa-hand-peace" style="color: #f59e0b; margin-left: 5px;"></i>`;
    }
    if (avatar) {
      avatar.innerText = username.substring(0, 2).toUpperCase();
    }
    if (sideName) {
      sideName.innerText = username;
    }
  }

  // ==========================================
  // VIEW RENDER CONTROLLERS
  // ==========================================

  /**
   * Render Dashboard View stats & summaries
   */
  renderDashboardView() {
    const settings = window.storage.getSettings();
    const currency = settings.currency;
    const currentMonthKey = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const expenses = window.storage.getExpenses();
    const bills = window.storage.getBills();
    const liabilities = window.storage.getLiabilities();
    const nextMonth = window.storage.getNextMonth();
    const goals = window.storage.getGoals();

    // 1. Calculate Monthly Expense spend
    const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonthKey));
    const totalMonthlySpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('card-monthly-expenses').innerText = window.utils.formatCurrency(totalMonthlySpent, currency);

    // Budget bar calculation
    const budgetLimit = settings.monthlyBudget || 3000;
    const budgetPct = Math.min((totalMonthlySpent / budgetLimit) * 100, 100);
    const budgetBar = document.getElementById('budget-progress-bar');
    budgetBar.style.width = `${budgetPct}%`;
    budgetBar.style.backgroundColor = budgetPct > 90 ? 'var(--color-danger)' : (budgetPct > 70 ? 'var(--color-warning)' : 'var(--accent-color)');
    document.getElementById('budget-progress-label').innerText = `${budgetPct.toFixed(0)}% of monthly budget (${window.utils.formatCurrency(budgetLimit, currency)})`;

    // 2. Calculate Today's Spend
    const todayISO = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter(exp => exp.date === todayISO);
    const totalTodaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('card-daily-expenses').innerText = window.utils.formatCurrency(totalTodaySpent, currency);

    const dailyLimit = settings.dailyLimit || 100;
    const dailyPct = Math.min((totalTodaySpent / dailyLimit) * 100, 100);
    const dailyBar = document.getElementById('daily-limit-bar');
    dailyBar.style.width = `${dailyPct}%`;
    dailyBar.style.backgroundColor = dailyPct > 90 ? 'var(--color-danger)' : (dailyPct > 75 ? 'var(--color-warning)' : 'var(--color-success)');
    document.getElementById('daily-limit-label').innerText = `${dailyPct.toFixed(0)}% of daily limit (${window.utils.formatCurrency(dailyLimit, currency)})`;

    // 3. Outstanding Liabilities
    const ccOutstanding = liabilities.filter(l => l.type === 'credit-card' && !l.paid);
    const totalCCOutstanding = ccOutstanding.reduce((sum, l) => sum + l.amount, 0);
    document.getElementById('card-credit-outstanding').innerText = window.utils.formatCurrency(totalCCOutstanding, currency);
    document.getElementById('card-credit-count').innerText = `${ccOutstanding.length} credit cards outstanding`;

    //const loanOutstanding = liabilities.filter(l => l.type === 'loan' && !l.paid);
    //const totalLoanOutstanding = loanOutstanding.reduce((sum, l) => sum + l.amount, 0);
    //document.getElementById('card-loan-outstanding').innerText = window.utils.formatCurrency(totalLoanOutstanding, currency);
    //document.getElementById('card-loan-count').innerText = `${loanOutstanding.length} loans active`;

    // 4. Cleared & Unpaid balances
    // Total unpaid monthly bills
    const unpaidBills = bills.filter(b => !b.paid);
    const totalUnpaidBillsAmt = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
    // Unpaid liabilities
    const unpaidLiabs = liabilities.filter(l => !l.paid);
    const totalUnpaidLiabsAmt = unpaidLiabs.reduce((sum, l) => sum + l.amount, 0);

    const totalPendingAmt = totalUnpaidBillsAmt + totalUnpaidLiabsAmt;
    document.getElementById('card-pending-amount').innerText = window.utils.formatCurrency(totalPendingAmt, currency);
    document.getElementById('card-pending-count').innerText = `${unpaidBills.length + unpaidLiabs.length} pending items`;

    // Total Paid bills + liabilities this month
    const paidBills = bills.filter(b => b.paid);
    const totalPaidBillsAmt = paidBills.reduce((sum, b) => sum + b.amount, 0);
    const paidLiabs = liabilities.filter(l => l.paid);
    const totalPaidLiabsAmt = paidLiabs.reduce((sum, l) => sum + l.amount, 0);
    
    const totalPaidAmt = totalPaidBillsAmt + totalPaidLiabsAmt;
    document.getElementById('card-paid-amount').innerText = window.utils.formatCurrency(totalPaidAmt, currency);

    // 5. Savings calculations
    const totalIncomeAmt = window.storage.getIncome().reduce((sum, inc) => sum + inc.amount, 0);
    const netSavings = totalIncomeAmt - totalMonthlySpent;
    const savingsCard = document.getElementById('card-savings');
    savingsCard.innerText = window.utils.formatCurrency(netSavings, currency);
    savingsCard.style.color = netSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    
    const savingsRatio = totalIncomeAmt > 0 ? (netSavings / totalIncomeAmt) * 100 : 0;
    document.getElementById('savings-ratio-label').innerText = totalIncomeAmt > 0 
      ? `Savings ratio: ${savingsRatio.toFixed(0)}% (Income: ${window.utils.formatCurrency(totalIncomeAmt, currency)})`
      : 'No income logged this month';

    // 6. Next Month upcoming summary
    const totalNextMonthAmt = nextMonth.reduce((sum, nm) => sum + nm.amount, 0);
    document.getElementById('card-next-month-payments').innerText = window.utils.formatCurrency(totalNextMonthAmt, currency);
    document.getElementById('card-next-month-count').innerText = `${nextMonth.length} forecasting items`;

    // 7. Recent Expenses Table with data-labels for mobile responsiveness
    const recentTableBody = document.querySelector('#dashboard-expenses-table tbody');
    recentTableBody.innerHTML = '';
    const sortedExpenses = [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (sortedExpenses.length === 0) {
      recentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No expenses recorded yet.</td></tr>';
    } else {
      sortedExpenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td data-label="Date">${window.utils.formatDate(exp.date)}</td>
          <td data-label="Category"><span class="badge bg-info-light">${exp.category}</span></td>
          <td data-label="Description" style="font-weight:500;">${exp.description}</td>
          <td data-label="Amount" style="font-weight:700; color:var(--color-danger);">${window.utils.formatCurrency(exp.amount, currency)}</td>
        `;
        recentTableBody.appendChild(row);
      });
    }

    // 7b. Recent Income Table with data-labels and edit/delete actions
    const incomeTableBody = document.querySelector('#dashboard-income-table tbody');
    incomeTableBody.innerHTML = '';
    const incomes = window.storage.getIncome();
    
    if (incomes.length === 0) {
      incomeTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No income logged yet.</td></tr>';
    } else {
      const sortedIncomes = [...incomes].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      sortedIncomes.forEach(inc => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td data-label="Date">${window.utils.formatDate(inc.date)}</td>
          <td data-label="Category"><span class="badge bg-success-light">${inc.category}</span></td>
          <td data-label="Source" style="font-weight:500;">${inc.source}</td>
          <td data-label="Amount" style="font-weight:700; color:var(--color-success);">${window.utils.formatCurrency(inc.amount, currency)}</td>
          <td data-label="Actions" style="text-align:center; gap: 8px; justify-content: center; display: flex;">
            <button class="action-btn btn-edit" onclick="window.script.editIncomePrompt('${inc.id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" onclick="window.script.deleteIncomePrompt('${inc.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </td>
        `;
        incomeTableBody.appendChild(row);
      });
    }

    // 8. Savings Goals
    const goalsList = document.getElementById('dashboard-goals-list');
    goalsList.innerHTML = '';
    if (goals.length === 0) {
      goalsList.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No goals added. Set a new savings goal!</p>';
    } else {
      goals.forEach(goal => {
        const pct = Math.min((goal.current / goal.target) * 100, 100);
        const div = document.createElement('div');
        div.style.cssText = `
          padding: 12px; background: rgba(148,163,184,0.03); border-radius: var(--radius-md); border:1px solid var(--border-color);
        `;
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; margin-bottom:6px;">
            <span>${goal.name}</span>
            <span style="color:var(--accent-color);">${window.utils.formatCurrency(goal.current, currency)} / ${window.utils.formatCurrency(goal.target, currency)}</span>
          </div>
          <div class="stat-card-progress" style="margin-bottom:4px;"><div class="stat-card-progress-bar" style="width: ${pct}%;"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted);">
            <span>${pct.toFixed(0)}% Saved</span>
            <div style="display:flex; gap:8px;">
              <a href="#" onclick="window.script.editGoalPrompt('${goal.id}')" style="color:var(--text-secondary); text-decoration:none;"><i class="fas fa-edit"></i></a>
              <a href="#" onclick="window.script.deleteGoalPrompt('${goal.id}')" style="color:var(--color-danger); text-decoration:none;"><i class="fas fa-trash"></i></a>
            </div>
          </div>
        `;
        goalsList.appendChild(div);
      });
    }

    // 9. Favorite Bills list
    const favList = document.getElementById('dashboard-favorites-list');
    favList.innerHTML = '';
    const favoriteBills = bills.filter(b => b.favorite);
    if (favoriteBills.length === 0) {
      favList.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No favorite bills starred. Click the star icon on bills page.</p>';
    } else {
      favoriteBills.forEach(bill => {
        const div = document.createElement('div');
        div.style.cssText = `
          display:flex; align-items:center; justify-content:space-between; padding:10px 14px;
          background: rgba(148,163,184,0.03); border-radius:var(--radius-md); border:1px solid var(--border-color);
        `;
        div.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <input type="checkbox" ${bill.paid ? 'checked' : ''} onchange="window.script.toggleBillPaidState('${bill.id}', this.checked)" style="width:16px; height:16px; cursor:pointer;">
            <span style="font-size:0.85rem; font-weight:600; ${bill.paid ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${bill.name}</span>
          </div>
          <span style="font-size:0.85rem; font-weight:700; color:${bill.paid ? 'var(--text-muted)' : 'var(--color-danger)'};">${window.utils.formatCurrency(bill.amount, currency)}</span>
        `;
        favList.appendChild(div);
      });
    }
  }

  /**
   * Render Daily Expenses View
   */
  renderExpensesView() {
    const currency = window.storage.getSettings().currency;
    const expenses = window.storage.getExpenses();

    // Ingest inputs
    const filterText = document.getElementById('expense-filter-search').value.toLowerCase();
    const filterCat = document.getElementById('expense-filter-category').value;
    const filterStart = document.getElementById('expense-filter-start-date').value;
    const filterEnd = document.getElementById('expense-filter-end-date').value;

    // Filter list
    const filteredExpenses = expenses.filter(exp => {
      // Text Match
      const matchesText = exp.description.toLowerCase().includes(filterText) || 
                          exp.tags.some(tag => tag.toLowerCase().includes(filterText));
      // Category Match
      const matchesCat = !filterCat || exp.category === filterCat;
      // Date range matching
      const matchesStart = !filterStart || exp.date >= filterStart;
      const matchesEnd = !filterEnd || exp.date <= filterEnd;

      return matchesText && matchesCat && matchesStart && matchesEnd;
    });

    // Sort by Date Descending
    filteredExpenses.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Stats calculations
    const todayISO = new Date().toISOString().split('T')[0];
    const todayTotal = expenses.filter(e => e.date === todayISO).reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('expenses-today-total').innerText = window.utils.formatCurrency(todayTotal, currency);

    // Weekly calculation (last 7 days inclusive)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyTotal = expenses.filter(e => e.date >= window.utils.formatISODate(sevenDaysAgo)).reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('expenses-weekly-total').innerText = window.utils.formatCurrency(weeklyTotal, currency);

    // Monthly calculation (current calendar month)
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const monthlyTotal = expenses.filter(e => e.date.startsWith(currentMonthKey)).reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('expenses-monthly-total').innerText = window.utils.formatCurrency(monthlyTotal, currency);

    // Render table rows
    const tbody = document.getElementById('expenses-table-body');
    tbody.innerHTML = '';

    if (filteredExpenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No matching expenses found.</td></tr>';
      return;
    }

    filteredExpenses.forEach(exp => {
      const row = document.createElement('tr');
      
      const tagBadges = exp.tags.map(t => `<span style="background:var(--border-color); color:var(--text-secondary); font-size:0.7rem; padding:2px 6px; border-radius:4px; margin-right:4px;">${t}</span>`).join('');
      
      row.innerHTML = `
        <td data-label="Date">${window.utils.formatDate(exp.date)}</td>
        <td data-label="Category"><span class="badge bg-info-light">${exp.category}</span></td>
        <td data-label="Description" style="font-weight:500;">${exp.description}</td>
        <td data-label="Tags">${tagBadges}</td>
        <td data-label="Amount" style="font-weight:700; color:var(--color-danger);">${window.utils.formatCurrency(exp.amount, currency)}</td>
        <td data-label="Actions" style="text-align:center;">
          <button class="action-btn btn-edit" onclick="window.script.editExpensePrompt('${exp.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn btn-delete" onclick="window.script.deleteExpensePrompt('${exp.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Render Monthly Bills View
   */
  renderBillsView() {
    const currency = window.storage.getSettings().currency;
    const bills = window.storage.getBills();

    const pendingBody = document.querySelector('#bills-pending-table tbody');
    const paidBody = document.querySelector('#bills-paid-table tbody');

    pendingBody.innerHTML = '';
    paidBody.innerHTML = '';

    const pendingBills = bills.filter(b => !b.paid);
    const paidBills = bills.filter(b => b.paid);

    // Render Pending
    if (pendingBills.length === 0) {
      pendingBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">All bills cleared! No pending bills.</td></tr>';
    } else {
      pendingBills.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td data-label="Favorite" style="text-align:center;">
            <button class="favorite-btn ${bill.favorite ? 'active' : ''}" onclick="window.script.toggleBillFav('${bill.id}')">
              <i class="${bill.favorite ? 'fas' : 'far'} fa-star"></i>
            </button>
          </td>
          <td data-label="Bill Name" style="font-weight:600;">${bill.name}</td>
          <td data-label="Category"><span class="badge bg-info-light">${bill.category}</span></td>
          <td data-label="Due Date">${window.utils.formatDate(bill.dueDate)}</td>
          <td data-label="Amount" style="font-weight:700; color:var(--color-danger);">${window.utils.formatCurrency(bill.amount, currency)}</td>
          <td data-label="Status"><span class="badge badge-warning">Pending</span></td>
          <td data-label="Actions" style="text-align:center; display:flex; gap:8px; justify-content:center;">
            <button class="btn btn-primary" onclick="window.script.markBillPaidPrompt('${bill.id}')" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-check"></i> Pay</button>
            <button class="action-btn btn-edit" onclick="window.script.editBillPrompt('${bill.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" onclick="window.script.deleteBillPrompt('${bill.id}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        pendingBody.appendChild(row);
      });
    }

    // Render Paid
    if (paidBills.length === 0) {
      paidBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">No bills paid this month yet.</td></tr>';
    } else {
      paidBills.forEach(bill => {
        const row = document.createElement('tr');
        row.className = 'row-strike';
        row.innerHTML = `
          <td data-label="Favorite" style="text-align:center;">
            <button class="favorite-btn ${bill.favorite ? 'active' : ''}" onclick="window.script.toggleBillFav('${bill.id}')">
              <i class="${bill.favorite ? 'fas' : 'far'} fa-star"></i>
            </button>
          </td>
          <td data-label="Bill Name" style="font-weight:600;">${bill.name}</td>
          <td data-label="Category"><span class="badge bg-success-light">${bill.category}</span></td>
          <td data-label="Due Date">${window.utils.formatDate(bill.dueDate)}</td>
          <td data-label="Amount" style="font-weight:700; color:var(--text-muted);">${window.utils.formatCurrency(bill.amount, currency)}</td>
          <td data-label="Payment Date" style="color:var(--color-success); font-weight:600;"><i class="fas fa-check" style="margin-right:4px;"></i>${window.utils.formatDate(bill.paidDate)}</td>
          <td data-label="Actions" style="text-align:center; display:flex; gap:8px; justify-content:center;">
            <button class="btn btn-secondary" onclick="window.script.toggleBillPaidState('${bill.id}', false)" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-undo"></i> Unpay</button>
            <button class="action-btn btn-delete" onclick="window.script.deleteBillPrompt('${bill.id}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        paidBody.appendChild(row);
      });
    }
  }

  /**
   * Render Credit Cards & Loans View
   */
  renderLiabilitiesView() {
    const currency = window.storage.getSettings().currency;
    const liabilities = window.storage.getLiabilities();

    // Filters
    const searchText = document.getElementById('liability-filter-search').value.toLowerCase();
    const typeFilter = document.getElementById('liability-filter-type').value;
    const sortVal = document.getElementById('liability-filter-sort').value;

    const outstandingBody = document.querySelector('#liabilities-pending-table tbody');
    const clearedBody = document.querySelector('#liabilities-paid-table tbody');

    outstandingBody.innerHTML = '';
    clearedBody.innerHTML = '';

    // Calculate totals
    const totalCC = liabilities.filter(l => l.type === 'credit-card' && !l.paid).reduce((sum, l) => sum + l.amount, 0);
    const totalLoans = liabilities.filter(l => l.type === 'loan' && !l.paid).reduce((sum, l) => sum + l.amount, 0);
    const totalEMI = liabilities.filter(l => l.type === 'emi' && !l.paid).reduce((sum, l) => sum + l.amount, 0);

    document.getElementById('liab-cc-total').innerText = window.utils.formatCurrency(totalCC, currency);
    document.getElementById('liab-loan-total').innerText = window.utils.formatCurrency(totalLoans, currency);
    document.getElementById('liab-emi-total').innerText = window.utils.formatCurrency(totalEMI, currency);

    // Apply Filter Criteria
    let processed = liabilities.filter(l => {
      const matchSearch = l.name.toLowerCase().includes(searchText);
      const matchType = !typeFilter || l.type === typeFilter;
      return matchSearch && matchType;
    });

    // Apply Sorting
    if (sortVal === 'dueDate-asc') {
      processed.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortVal === 'dueDate-desc') {
      processed.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (sortVal === 'amount-desc') {
      processed.sort((a,b) => b.amount - a.amount);
    } else if (sortVal === 'amount-asc') {
      processed.sort((a,b) => a.amount - b.amount);
    }

    const pending = processed.filter(l => !l.paid);
    const paid = processed.filter(l => l.paid);

    // Render Outstanding
    if (pending.length === 0) {
      outstandingBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">All liabilities cleared. Great job!</td></tr>';
    } else {
      pending.forEach(liab => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td data-label="Name" style="font-weight:600;">${liab.name}</td>
          <td data-label="Type"><span class="badge bg-info-light">${liab.type.toUpperCase()}</span></td>
          <td data-label="Amount" style="font-weight:700; color:var(--color-danger);">${window.utils.formatCurrency(liab.amount, currency)}</td>
          <td data-label="Due Date">${window.utils.formatDate(liab.dueDate)}</td>
          <td data-label="Notes" style="font-size:0.85rem; color:var(--text-secondary);">${liab.notes || '-'}</td>
          <td data-label="Status"><span class="badge badge-warning">Pending</span></td>
          <td data-label="Actions" style="text-align:center; display:flex; gap:8px; justify-content:center;">
            <button class="btn btn-primary" onclick="window.script.markLiabilityPaidPrompt('${liab.id}')" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-check"></i> Clear Paid</button>
            <button class="action-btn btn-edit" onclick="window.script.editLiabilityPrompt('${liab.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" onclick="window.script.deleteLiabilityPrompt('${liab.id}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        outstandingBody.appendChild(row);
      });
    }

    // Render Paid
    if (paid.length === 0) {
      clearedBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">No liabilities cleared this month.</td></tr>';
    } else {
      paid.forEach(liab => {
        const row = document.createElement('tr');
        row.className = 'row-strike';
        row.innerHTML = `
          <td data-label="Name" style="font-weight:600;">${liab.name}</td>
          <td data-label="Type"><span class="badge bg-success-light">${liab.type.toUpperCase()}</span></td>
          <td data-label="Amount" style="font-weight:700; color:var(--text-muted);">${window.utils.formatCurrency(liab.amount, currency)}</td>
          <td data-label="Due Date">${window.utils.formatDate(liab.dueDate)}</td>
          <td data-label="Payment Date" style="color:var(--color-success); font-weight:600;"><i class="fas fa-check" style="margin-right:4px;"></i>${window.utils.formatDate(liab.paidDate)}</td>
          <td data-label="Payment Count" style="text-align:center;">${liab.history ? liab.history.length : 1} cleared</td>
          <td data-label="Actions" style="text-align:center;">
            <button class="action-btn btn-delete" onclick="window.script.deleteLiabilityPrompt('${liab.id}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        clearedBody.appendChild(row);
      });
    }
  }

  /**
   * Render Next Month Planning View
   */
  renderNextMonthView() {
    const currency = window.storage.getSettings().currency;
    const list = window.storage.getNextMonth();

    const searchText = document.getElementById('next-month-search').value.toLowerCase();
    const priorityFilter = document.getElementById('next-month-filter-priority').value;

    const tbody = document.querySelector('#next-month-table tbody');
    tbody.innerHTML = '';

    const filtered = list.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchText);
      const matchPriority = !priorityFilter || item.priority === priorityFilter;
      return matchSearch && matchPriority;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No upcoming planning entries found.</td></tr>';
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('tr');
      if (item.completed) {
        row.className = 'row-strike';
      }

      let badgeColor = 'badge-info';
      if (item.priority === 'high') badgeColor = 'badge-danger';
      else if (item.priority === 'medium') badgeColor = 'badge-warning';

      row.innerHTML = `
        <td data-label="Name" style="font-weight:600;">${item.name}</td>
        <td data-label="Estimated Amount" style="font-weight:700;">${window.utils.formatCurrency(item.amount, currency)}</td>
        <td data-label="Expected Due Date">${window.utils.formatDate(item.dueDate)}</td>
        <td data-label="Priority"><span class="badge ${badgeColor}">${item.priority.toUpperCase()}</span></td>
        <td data-label="Completed">
          <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="window.script.toggleNextMonthCompletedState('${item.id}', this.checked)" style="width:16px; height:16px; cursor:pointer;">
        </td>
        <td data-label="Actions" style="text-align:center; display:flex; gap:8px; justify-content:center;">
          <button class="btn btn-primary" onclick="window.script.carryForwardNextMonth('${item.id}')" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-share"></i> Carry Forward</button>
          <button class="action-btn btn-edit" onclick="window.script.editNextMonthPrompt('${item.id}')"><i class="fas fa-edit"></i></button>
          <button class="action-btn btn-delete" onclick="window.script.deleteNextMonthPrompt('${item.id}')"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Render Calendar grid view
   */
  renderCalendarView() {
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const daysContainer = document.getElementById('calendar-days-container');
    
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();

    // Set Month Year Title
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarMonthYear.innerText = `${monthNames[month]} ${year}`;

    // Get calendar metrics
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Load dates items from storage
    const bills = window.storage.getBills();
    const liabilities = window.storage.getLiabilities();
    const expenses = window.storage.getExpenses();

    // Pad starting empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day empty-day';
      daysContainer.appendChild(cell);
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Fill days
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (isCurrentMonth && today.getDate() === day) {
        cell.classList.add('today');
      }

      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Injects day number
      const numLabel = document.createElement('span');
      numLabel.className = 'calendar-day-num';
      numLabel.innerText = day;
      cell.appendChild(numLabel);

      // Event dots matching
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'calendar-events-container';
      
      const dayEvents = [];

      // 1. Unpaid Bills due
      bills.forEach(b => {
        if (b.dueDate === cellDateStr) {
          dayEvents.push({ type: 'bill-due', item: b });
          const dot = document.createElement('span');
          dot.className = 'calendar-event-dot';
          dot.style.background = 'var(--color-warning)';
          dot.title = `Bill due: ${b.name}`;
          dotsContainer.appendChild(dot);
        }
        if (b.paid && b.paidDate === cellDateStr) {
          dayEvents.push({ type: 'bill-paid', item: b });
          const dot = document.createElement('span');
          dot.className = 'calendar-event-dot';
          dot.style.background = 'var(--color-success)';
          dot.title = `Bill paid: ${b.name}`;
          dotsContainer.appendChild(dot);
        }
      });

      // 2. Liabilities due
      liabilities.forEach(l => {
        if (l.dueDate === cellDateStr) {
          dayEvents.push({ type: 'liab-due', item: l });
          const dot = document.createElement('span');
          dot.className = 'calendar-event-dot';
          dot.style.background = 'var(--color-danger)';
          dot.title = `Liability due: ${l.name}`;
          dotsContainer.appendChild(dot);
        }
        if (l.paid && l.paidDate === cellDateStr) {
          dayEvents.push({ type: 'liab-paid', item: l });
          const dot = document.createElement('span');
          dot.className = 'calendar-event-dot';
          dot.style.background = 'var(--color-success)';
          dot.title = `Liability paid: ${l.name}`;
          dotsContainer.appendChild(dot);
        }
      });

      // 3. Other daily expenses
      expenses.forEach(e => {
        // Exclude duplicate auto-logged bill/liab payments to avoid calendar noise
        if (e.date === cellDateStr && !e.tags.includes('Bill') && !e.tags.includes('Liability')) {
          dayEvents.push({ type: 'expense', item: e });
          const dot = document.createElement('span');
          dot.className = 'calendar-event-dot';
          dot.style.background = 'var(--color-info)';
          dot.title = `Expense: ${e.description}`;
          dotsContainer.appendChild(dot);
        }
      });

      cell.appendChild(dotsContainer);

      // Click to open detailed overlay panel
      cell.addEventListener('click', () => {
        this.renderDayEventsPanel(cellDateStr, dayEvents);
      });

      daysContainer.appendChild(cell);
    }
  }

  /**
   * Render Event list for selected date
   */
  //renderDayEventsPanel(dateStr, events) {
  //  const panel = document.getElementById('calendar-day-events');
  //  const title = document.getElementById('selected-day-title');
  //  const list = document.getElementById('selected-day-events-list');
    
  //  panel.style.display = 'block';
  //  title.innerText = `Events on ${window.utils.formatDate(dateStr)}`;
  //  list.innerHTML = '';

  //  if (events.length === 0) {

  //    list.innerHTML = '<li style="color:var(--text-secondary); font-size:0.85rem;">No payments or transactions on this date.</li>';
  //    return;
  //  }

  //  const currency = window.storage.getSettings().currency;

  //  events.forEach(evt => {
  //    const li = document.createElement('li');
  //    li.style.cssText = `
  //      display:flex; justify-content:space-between; align-items:center;
  //      padding:8px 12px; background:var(--bg-primary); border-radius:8px; border-left:4px solid var(--accent-color);
  //    `;
      
  //    let label = '';
  //    let amtColor = 'var(--color-danger)';

  //    if (evt.type === 'bill-due') {
  //      label = `<i class="fas fa-file-invoice" style="color:var(--color-warning); margin-right:8px;"></i> Due: ${evt.item.name}`;
  //      li.style.borderLeftColor = 'var(--color-warning)';
  //    } else if (evt.type === 'bill-paid') {
  //      label = `<i class="fas fa-check" style="color:var(--color-success); margin-right:8px;"></i> Paid Bill: ${evt.item.name}`;
  //      li.style.borderLeftColor = 'var(--color-success)';
  //      amtColor = 'var(--color-success)';
  //    } else if (evt.type === 'liab-due') {
  //      label = `<i class="fas fa-credit-card" style="color:var(--color-danger); margin-right:8px;"></i> Due: ${evt.item.name}`;
  //      li.style.borderLeftColor = 'var(--color-danger)';
  //    } else if (evt.type === 'liab-paid') {
  //      label = `<i class="fas fa-check-double" style="color:var(--color-success); margin-right:8px;"></i> Cleared: ${evt.item.name}`;
  //      li.style.borderLeftColor = 'var(--color-success)';
  //      amtColor = 'var(--color-success)';
  //    } else {
  //      label = `<i class="fas fa-shopping-bag" style="color:var(--color-info); margin-right:8px;"></i> Spent: ${evt.item.description}`;
  //      li.style.borderLeftColor = 'var(--color-info)';
  //    }

  //    li.innerHTML = `
  //      <span style="font-size:0.85rem; font-weight:500;">${label}</span>
  //      <span style="font-weight:700; color:${amtColor}; font-size:0.9rem;">${window.utils.formatCurrency(evt.item.amount, currency)}</span>
  //    `;
  //    list.appendChild(li);
  //  });
  //}
    renderDayEventsPanel(dateStr, events) {
        const currency = window.storage.getSettings().currency;

        let html = '';

        if (events.length === 0) {
            html = `
      <div style="padding:15px; color:var(--text-secondary); text-align:center;">
        No payments or transactions on this date.
      </div>
    `;
        } else {
            html = events.map(evt => {
                let label = '';
                let borderColor = 'var(--accent-color)';
                let amountColor = 'var(--color-danger)';

                if (evt.type === 'bill-due') {
                    label = `<i class="fas fa-file-invoice" style="color:var(--color-warning); margin-right:8px;"></i> Due: ${evt.item.name}`;
                    borderColor = 'var(--color-warning)';
                } else if (evt.type === 'bill-paid') {
                    label = `<i class="fas fa-check" style="color:var(--color-success); margin-right:8px;"></i> Paid Bill: ${evt.item.name}`;
                    borderColor = 'var(--color-success)';
                    amountColor = 'var(--color-success)';
                } else if (evt.type === 'liab-due') {
                    label = `<i class="fas fa-credit-card" style="color:var(--color-danger); margin-right:8px;"></i> Due: ${evt.item.name}`;
                    borderColor = 'var(--color-danger)';
                } else if (evt.type === 'liab-paid') {
                    label = `<i class="fas fa-check-double" style="color:var(--color-success); margin-right:8px;"></i> Cleared: ${evt.item.name}`;
                    borderColor = 'var(--color-success)';
                    amountColor = 'var(--color-success)';
                } else {
                    label = `<i class="fas fa-shopping-bag" style="color:var(--color-info); margin-right:8px;"></i> Spent: ${evt.item.description}`;
                    borderColor = 'var(--color-info)';
                }

                return `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:10px 12px;
          margin-bottom:10px;
          background:var(--bg-primary);
          border-left:4px solid ${borderColor};
          border-radius:8px;
        ">
          <span style="font-size:0.9rem;font-weight:500;">
            ${label}
          </span>
          <span style="font-weight:700;color:${amountColor};white-space:nowrap;">
            ${window.utils.formatCurrency(evt.item.amount, currency)}
          </span>
        </div>
      `;
            }).join('');
        }

        Swal.fire({
            title: `Events on ${window.utils.formatDate(dateStr)}`,
            html: `
      <div style="max-height:400px;overflow-y:auto;text-align:left;">
        ${html}
      </div>
    `,
            width: 650,
            confirmButtonText: 'Close',
            customClass: {
                popup: 'calendar-events-popup'
            }
        });
    }

  // ==========================================
  // TRANSACTION SUBMITS & DIALOGS
  // ==========================================

  /**
   * Modals controller open/close helpers
   */
  openModal(modalKey, id = '') {
    this.closeAllModals();
    const modal = this.modals[modalKey];
    if (modal) {
      modal.classList.add('open');
      const form = this.forms[modalKey];
      if (form) form.reset();
      
      // Default Date setup
      const dateInputs = modal.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => {
        input.value = new Date().toISOString().split('T')[0];
      });

      // Special edits setups
      if (id) {
        if (modalKey === 'expense') this.fillExpenseEdit(id);
        else if (modalKey === 'bill') this.fillBillEdit(id);
        else if (modalKey === 'liability') this.fillLiabilityEdit(id);
        else if (modalKey === 'next-month') this.fillNextMonthEdit(id);
        else if (modalKey === 'goal') this.fillGoalEdit(id);
        else if (modalKey === 'income') this.fillIncomeEdit(id);
      } else {
        // Clear hidden ID
        const idInput = modal.querySelector(`input[id="${modalKey}-id"]`);
        if (idInput) idInput.value = '';
        
        // Reset titles
        const title = modal.querySelector(`#modal-${modalKey}-title`);
        if (title) {
          const names = { expense: 'Add Expense', bill: 'Add Monthly Bill', liability: 'Add Liability', 'next-month': 'Add Next Month Payment', goal: 'Add Savings Goal', income: 'Add Income Source' };
          title.innerText = names[modalKey] || 'Add Item';
        }
      }
    }
  }

  closeAllModals() {
    Object.values(this.modals).forEach(m => {
      if (m) m.classList.remove('open');
    });
  }

  // --- Daily Expenses Forms ---
  handleExpenseSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('expense-id').value;
    const data = {
      date: document.getElementById('expense-date').value,
      category: document.getElementById('expense-category').value,
      amount: document.getElementById('expense-amount').value,
      description: document.getElementById('expense-description').value,
      tags: document.getElementById('expense-tags').value
    };

    if (id) {
      window.storage.editExpense(id, data);
      window.utils.showToast('Expense updated successfully', 'success');
    } else {
      window.storage.addExpense(data);
      // Large spending threshold checking
      const threshold = window.storage.getSettings().largeExpenseThreshold;
      if (parseFloat(data.amount) >= threshold) {
        window.utils.showToast(`Large expense warning! Spent more than threshold Limit`, 'warning', 6000);
      } else {
        window.utils.showToast('Expense added successfully', 'success');
      }
    }
    
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillExpenseEdit(id) {
    const exp = window.storage.getExpenses().find(e => e.id === id);
    if (exp) {
      document.getElementById('modal-expense-title').innerText = 'Edit Expense';
      document.getElementById('expense-id').value = exp.id;
      document.getElementById('expense-date').value = exp.date;
      document.getElementById('expense-category').value = exp.category;
      document.getElementById('expense-amount').value = exp.amount;
      document.getElementById('expense-description').value = exp.description;
      document.getElementById('expense-tags').value = exp.tags.join(', ');
    }
  }

  async editExpensePrompt(id) {
    this.openModal('expense', id);
  }

  async deleteExpensePrompt(id) {
    const conf = await window.utils.confirm('Delete Expense', 'Are you sure you want to delete this expense permanently?');
    if (conf) {
      window.storage.deleteExpense(id);
      window.utils.showToast('Expense deleted', 'success');
      this.refreshAllViews();
    }
  }

  // --- Monthly Bills Forms ---
  handleBillSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('bill-id').value;
    const data = {
      name: document.getElementById('bill-name').value,
      category: document.getElementById('bill-category').value,
      amount: document.getElementById('bill-amount').value,
      dueDate: document.getElementById('bill-due-date').value,
      autoRepeat: document.getElementById('bill-auto-repeat').checked
    };

    if (id) {
      window.storage.editBill(id, data);
      window.utils.showToast('Bill updated successfully', 'success');
    } else {
      window.storage.addBill(data);
      window.utils.showToast('Monthly bill registered', 'success');
    }
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillBillEdit(id) {
    const bill = window.storage.getBills().find(b => b.id === id);
    if (bill) {
      document.getElementById('modal-bill-title').innerText = 'Edit Monthly Bill';
      document.getElementById('bill-id').value = bill.id;
      document.getElementById('bill-name').value = bill.name;
      document.getElementById('bill-category').value = bill.category;
      document.getElementById('bill-amount').value = bill.amount;
      document.getElementById('bill-due-date').value = bill.dueDate;
      document.getElementById('bill-auto-repeat').checked = bill.autoRepeat;
    }
  }

  editBillPrompt(id) {
    this.openModal('bill', id);
  }

  async deleteBillPrompt(id) {
    const conf = await window.utils.confirm('Delete Bill', 'Are you sure you want to delete this monthly recurring bill?');
    if (conf) {
      window.storage.deleteBill(id);
      window.utils.showToast('Monthly bill removed', 'success');
      this.refreshAllViews();
    }
  }

  toggleBillFav(id) {
    window.storage.toggleBillFavorite(id);
    this.refreshAllViews();
  }

  toggleBillPaidState(id, isPaid) {
    window.storage.toggleBillPaid(id, isPaid);
    window.utils.showToast(isPaid ? 'Bill marked Paid' : 'Bill marked Pending', 'success');
    this.refreshAllViews();
  }

  async markBillPaidPrompt(id) {
    // We can directly mark as paid using today's date
    const todayStr = new Date().toISOString().split('T')[0];
    window.storage.toggleBillPaid(id, true, todayStr);
    window.utils.showToast('Bill paid successfully. Added to Daily Tracker.', 'success');
    this.refreshAllViews();
  }

  // --- Liabilities Forms ---
  handleLiabilitySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('liability-id').value;
    const data = {
      name: document.getElementById('liability-name').value,
      type: document.getElementById('liability-type').value,
      amount: document.getElementById('liability-amount').value,
      dueDate: document.getElementById('liability-due-date').value,
      notes: document.getElementById('liability-notes').value
    };

    if (id) {
      window.storage.editLiability(id, data);
      window.utils.showToast('Liability details updated', 'success');
    } else {
      window.storage.addLiability(data);
      window.utils.showToast('Liability added successfully', 'success');
    }
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillLiabilityEdit(id) {
    const liab = window.storage.getLiabilities().find(l => l.id === id);
    if (liab) {
      document.getElementById('modal-liability-title').innerText = 'Edit Liability';
      document.getElementById('liability-id').value = liab.id;
      document.getElementById('liability-name').value = liab.name;
      document.getElementById('liability-type').value = liab.type;
      document.getElementById('liability-amount').value = liab.amount;
      document.getElementById('liability-due-date').value = liab.dueDate;
      document.getElementById('liability-notes').value = liab.notes;
    }
  }

  editLiabilityPrompt(id) {
    this.openModal('liability', id);
  }

  async deleteLiabilityPrompt(id) {
    const conf = await window.utils.confirm('Delete Liability', 'Do you want to delete this liability entry?');
    if (conf) {
      window.storage.deleteLiability(id);
      window.utils.showToast('Liability removed', 'success');
      this.refreshAllViews();
    }
  }

  markLiabilityPaidPrompt(id) {
    const todayStr = new Date().toISOString().split('T')[0];
    window.storage.markLiabilityPaid(id, todayStr);
    window.utils.showToast('Liability paid. Registered in expenditures log.', 'success');
    this.refreshAllViews();
  }

  // --- Next Month Forms ---
  handleNextMonthSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('next-month-id').value;
    const data = {
      name: document.getElementById('next-month-name').value,
      amount: document.getElementById('next-month-amount').value,
      dueDate: document.getElementById('next-month-due-date').value,
      priority: document.getElementById('next-month-priority').value
    };

    if (id) {
      window.storage.editNextMonth(id, data);
      window.utils.showToast('Planning item updated', 'success');
    } else {
      window.storage.addNextMonth(data);
      window.utils.showToast('Planning item added', 'success');
    }
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillNextMonthEdit(id) {
    const item = window.storage.getNextMonth().find(n => n.id === id);
    if (item) {
      document.getElementById('modal-next-month-title').innerText = 'Edit Next Month Plan';
      document.getElementById('next-month-id').value = item.id;
      document.getElementById('next-month-name').value = item.name;
      document.getElementById('next-month-amount').value = item.amount;
      document.getElementById('next-month-due-date').value = item.dueDate;
      document.getElementById('next-month-priority').value = item.priority;
    }
  }

  editNextMonthPrompt(id) {
    this.openModal('next-month', id);
  }

  async deleteNextMonthPrompt(id) {
    const conf = await window.utils.confirm('Remove Plan', 'Delete this upcoming planning item?');
    if (conf) {
      window.storage.deleteNextMonth(id);
      window.utils.showToast('Planning item deleted', 'success');
      this.refreshAllViews();
    }
  }

  toggleNextMonthCompletedState(id, completed) {
    window.storage.toggleNextMonthCompleted(id, completed);
    window.utils.showToast(completed ? 'Item completed' : 'Item pending', 'success');
    this.refreshAllViews();
  }

  carryForwardNextMonth(id) {
    window.storage.carryForwardNextMonth(id);
    window.utils.showToast('Carried forward! Moved into Active Bills.', 'success');
    this.refreshAllViews();
  }

  // --- Income Forms ---
  handleIncomeSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('income-id').value;
    const data = {
      source: document.getElementById('income-source').value,
      amount: document.getElementById('income-amount').value,
      date: document.getElementById('income-date').value,
      category: document.getElementById('income-category').value
    };

    if (id) {
      window.storage.editIncome(id, data);
      window.utils.showToast('Income details updated', 'success');
    } else {
      window.storage.addIncome(data);
      window.utils.showToast('Income logged successfully', 'success');
    }
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillIncomeEdit(id) {
    const inc = window.storage.getIncome().find(i => i.id === id);
    if (inc) {
      document.getElementById('modal-income-title').innerText = 'Edit Income Source';
      document.getElementById('income-id').value = inc.id;
      document.getElementById('income-source').value = inc.source;
      document.getElementById('income-amount').value = inc.amount;
      document.getElementById('income-date').value = inc.date;
      document.getElementById('income-category').value = inc.category;
    }
  }

  editIncomePrompt(id) {
    this.openModal('income', id);
  }

  async deleteIncomePrompt(id) {
    const conf = await window.utils.confirm('Delete Income', 'Are you sure you want to delete this income source?');
    if (conf) {
      window.storage.deleteIncome(id);
      window.utils.showToast('Income deleted successfully', 'success');
      this.refreshAllViews();
    }
  }

  // --- Goals Forms ---
  handleGoalSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('goal-id').value;
    const data = {
      name: document.getElementById('goal-name').value,
      target: document.getElementById('goal-target').value,
      current: document.getElementById('goal-current').value,
      category: document.getElementById('goal-category').value
    };

    if (id) {
      window.storage.editGoal(id, data);
      window.utils.showToast('Goal details updated', 'success');
    } else {
      window.storage.addGoal(data);
      window.utils.showToast('Savings goal saved', 'success');
    }
    this.closeAllModals();
    this.refreshAllViews();
  }

  fillGoalEdit(id) {
    const goal = window.storage.getGoals().find(g => g.id === id);
    if (goal) {
      document.getElementById('modal-goal-title').innerText = 'Edit Goal';
      document.getElementById('goal-id').value = goal.id;
      document.getElementById('goal-name').value = goal.name;
      document.getElementById('goal-target').value = goal.target;
      document.getElementById('goal-current').value = goal.current;
      document.getElementById('goal-category').value = goal.category;
    }
  }

  editGoalPrompt(id) {
    this.openModal('goal', id);
  }

  async deleteGoalPrompt(id) {
    const conf = await window.utils.confirm('Delete Goal', 'Are you sure you want to delete this savings goal?');
    if (conf) {
      window.storage.deleteGoal(id);
      window.utils.showToast('Savings goal deleted', 'success');
      this.refreshAllViews();
    }
  }

  // ==========================================
  // EXPORTS & BACKUPS HANDLERS
  // ==========================================

  exportExpenses(format) {
    const expenses = window.storage.getExpenses();
    const headers = ['date', 'category', 'description', 'amount'];
    const filename = `FinSync_Expenses_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      window.utils.exportToCSV(expenses, headers, `${filename}.csv`);
    } else {
      window.utils.exportToExcel(expenses, headers, `${filename}.xlsx`);
    }
  }

  handleJSONRestore(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = window.storage.restoreBackup(evt.target.result);
      if (res.success) {
        window.utils.showToast('Data restored successfully', 'success');
        this.refreshAllViews();
      } else {
        window.utils.showToast(`Restore failed: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  }

  async handleResetData() {
    const conf = await window.utils.confirm('Reset All Data', 'Warning: This will restore default demo state. This action is irreversible.');
    if (conf) {
      window.storage.resetAllData();
      window.utils.showToast('Demo data restored', 'success');
      this.initApp();
    }
  }

  // ==========================================
  // EMI CALCULATOR
  // ==========================================

  calculateEMI() {
    const P = parseFloat(document.getElementById('emi-principal').value) || 0;
    const annualR = parseFloat(document.getElementById('emi-interest').value) || 0;
    const n = parseInt(document.getElementById('emi-tenure').value) || 0;

    if (P <= 0 || annualR <= 0 || n <= 0) {
      window.utils.showToast('Please enter positive values for calculations', 'warning');
      return;
    }

    const r = (annualR / 12) / 100; // Monthly interest rate
    
    // Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    const x = Math.pow(1 + r, n);
    const emi = (P * r * x) / (x - 1);
    
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const currency = window.storage.getSettings().currency;

    document.getElementById('emi-monthly-val').innerText = window.utils.formatCurrency(emi, currency);
    document.getElementById('emi-interest-val').innerText = window.utils.formatCurrency(totalInterest, currency);
    document.getElementById('emi-total-val').innerText = window.utils.formatCurrency(totalPayment, currency);
    document.getElementById('emi-result-panel').style.display = 'block';
  }

  // ==========================================
  // NOTIFICATIONS ENGINE
  // ==========================================

  //checkNotifications() {
  //  const bills = window.storage.getBills();
  //  const liabilities = window.storage.getLiabilities();
  //  const settings = window.storage.getSettings();
  //  const today = new Date();
    
  //  const alerts = [];

  //  // Scan bills due soon (<= 3 days) or overdue
  //  bills.forEach(bill => {
  //    if (!bill.paid) {
  //      const dueDate = new Date(bill.dueDate);
  //      const timeDiff = dueDate - today;
  //      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
  //      if (daysDiff < 0) {
  //        alerts.push({
  //          type: 'danger',
  //          message: `Overdue bill: "${bill.name}" due on ${window.utils.formatDate(bill.dueDate)}`,
  //          time: 'Overdue'
  //        });
  //      } else if (daysDiff <= 3) {
  //        alerts.push({
  //          type: 'warning',
  //          message: `Bill "${bill.name}" is due in ${daysDiff} days (${window.utils.formatDate(bill.dueDate)})`,
  //          time: 'Due Soon'
  //        });
  //      }
  //    }
  //  });

  //  // Scan liabilities due soon or overdue
  //  liabilities.forEach(liab => {
  //    if (!liab.paid) {
  //      const dueDate = new Date(liab.dueDate);
  //      const timeDiff = dueDate - today;
  //      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
  //      if (daysDiff < 0) {
  //        alerts.push({
  //          type: 'danger',
  //          message: `Overdue liability: "${liab.name}" was due on ${window.utils.formatDate(liab.dueDate)}`,
  //          time: 'Overdue'
  //        });
  //      } else if (daysDiff <= 3) {
  //        alerts.push({
  //          type: 'warning',
  //          message: `Liability "${liab.name}" is due in ${daysDiff} days (${window.utils.formatDate(liab.dueDate)})`,
  //          time: 'Due Soon'
  //        });
  //      }
  //    }
  //  });

  //  // Scan Next Month Planning High Priority
  //  window.storage.getNextMonth().forEach(nm => {
  //    if (!nm.completed && nm.priority === 'high') {
  //      alerts.push({
  //        type: 'info',
  //        message: `High Priority Next Month Reminder: "${nm.name}"`,
  //        time: 'Upcoming'
  //      });
  //    }
  //  });

  //  // Check Daily Expense threshold overflow today
  //  const todayISO = new Date().toISOString().split('T')[0];
  //  const todaySpend = window.storage.getExpenses().filter(e => e.date === todayISO).reduce((sum, e) => sum + e.amount, 0);
  //  const dailyLimit = settings.dailyLimit || 100;
  //  if (todaySpend > dailyLimit) {
  //    alerts.push({
  //      type: 'danger',
  //      message: `Daily spending budget breached! Today's total: ${window.utils.formatCurrency(todaySpend, settings.currency)} (Limit: ${window.utils.formatCurrency(dailyLimit, settings.currency)})`,
  //      time: 'Limit Exceeded'
  //    });
  //  }

    // Render list
/*    this.notificationsList.innerHTML = '';*/
    
    //if (alerts.length === 0) {
    //  this.notifBadge.style.display = 'none';
    //  this.notificationsList.innerHTML = `
    //    <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
    //      <i class="fas fa-bell-slash" style="font-size:1.5rem; margin-bottom:8px; display:block;"></i>
    //      All caught up! No notifications.
    //    </div>
    //  `;
    //} else {
    //  this.notifBadge.style.display = 'block';
    //  alerts.forEach(al => {
    //    const item = document.createElement('div');
    //    item.className = 'notification-item';
        
    //    let iconClass = 'fa-exclamation-circle text-danger';
    //    if (al.type === 'warning') iconClass = 'fa-exclamation-triangle text-warning';
    //    if (al.type === 'info') iconClass = 'fa-info-circle text-info';

    //    item.innerHTML = `
    //      <i class="fas ${iconClass}"></i>
    //      <div class="notification-item-text">
    //        <p>${al.message}</p>
    //        <span>${al.time}</span>
    //      </div>
    //    `;
    //    this.notificationsList.appendChild(item);
    //  });
    //}
 // }

  //clearNotifications() {
  //  this.notifBadge.style.display = 'none';
  //  this.notificationsList.innerHTML = `
  //    <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
  //      <i class="fas fa-bell-slash" style="font-size:1.5rem; margin-bottom:8px; display:block;"></i>
  //      All caught up! No notifications.
  //    </div>
  //  `;
  //  window.utils.showToast('Notifications dismissed', 'info');
  //}

  // ==========================================
  // GLOBAL SEARCH UTILITY
  // ==========================================

  handleGlobalSearch(query) {
    const dropdown = document.getElementById('search-results-dropdown');
    if (!dropdown) return;

    if (!query || query.trim() === '') {
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
      return;
    }

    const q = query.toLowerCase().trim();
    const currency = window.storage.getSettings().currency;
    const bills = window.storage.getBills();
    const expenses = window.storage.getExpenses();
    const liabilities = window.storage.getLiabilities();

    const matchBills = bills.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    const matchExpenses = expenses.filter(e => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    const matchLiabilities = liabilities.filter(l => l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q));

    let html = '';

    if (matchBills.length === 0 && matchExpenses.length === 0 && matchLiabilities.length === 0) {
      dropdown.innerHTML = '<div style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">No matches found</div>';
      dropdown.style.display = 'block';
      return;
    }

    // 1. Group Bills matches
    if (matchBills.length > 0) {
      html += '<div class="search-result-group">Monthly Bills</div>';
      matchBills.slice(0, 3).forEach(b => {
        html += `
          <div class="search-result-item" onclick="window.script.navigateToResult('bills', '${b.id}')">
            <div>
              <div class="search-result-item-title">${b.name}</div>
              <div class="search-result-item-desc">${b.category} • Due ${window.utils.formatDate(b.dueDate)}</div>
            </div>
            <div class="search-result-item-right" style="color: var(--color-danger);">${window.utils.formatCurrency(b.amount, currency)}</div>
          </div>
        `;
      });
    }

    // 2. Group Expenses matches
    if (matchExpenses.length > 0) {
      html += '<div class="search-result-group">Expenses Log</div>';
      matchExpenses.slice(0, 4).forEach(e => {
        html += `
          <div class="search-result-item" onclick="window.script.navigateToResult('expenses', '${e.id}')">
            <div>
              <div class="search-result-item-title">${e.description}</div>
              <div class="search-result-item-desc">${e.category} • ${window.utils.formatDate(e.date)}</div>
            </div>
            <div class="search-result-item-right" style="color: var(--color-danger);">${window.utils.formatCurrency(e.amount, currency)}</div>
          </div>
        `;
      });
    }

    // 3. Group Liabilities matches
    if (matchLiabilities.length > 0) {
      html += '<div class="search-result-group">Liabilities & Loans</div>';
      matchLiabilities.slice(0, 3).forEach(l => {
        html += `
          <div class="search-result-item" onclick="window.script.navigateToResult('liabilities', '${l.id}')">
            <div>
              <div class="search-result-item-title">${l.name}</div>
              <div class="search-result-item-desc">${l.type.toUpperCase()} • Due ${window.utils.formatDate(l.dueDate)}</div>
            </div>
            <div class="search-result-item-right" style="color: var(--color-danger);">${window.utils.formatCurrency(l.amount, currency)}</div>
          </div>
        `;
      });
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  }

  navigateToResult(view, id) {
    const dropdown = document.getElementById('search-results-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    this.globalSearch.value = '';
    
    // Route
    this.changeView(view);

    // Focus/Highlight matching item
    setTimeout(() => {
      let selector = '';
      if (view === 'bills') selector = '#bills-pending-table tbody tr, #bills-paid-table tbody tr';
      else if (view === 'expenses') selector = '#expenses-main-table tbody tr';
      else if (view === 'liabilities') selector = '#liabilities-pending-table tbody tr, #liabilities-paid-table tbody tr';

      if (selector) {
        const rows = document.querySelectorAll(selector);
        rows.forEach(row => {
          if (row.innerHTML.includes(id) || row.innerHTML.includes(window.storage.state[view].find(x => x.id === id)?.name || '')) {
            row.style.transition = 'background-color 0.5s ease';
            row.style.backgroundColor = 'var(--accent-light)';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              row.style.backgroundColor = '';
            }, 3000);
          }
        });
      }
    }, 150);
  }
}

// Instantiate and attach globally
window.addEventListener('DOMContentLoaded', () => {
  window.script = new FinSyncApp();
  
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('FinSync Service Worker Registered Successfully'))
      .catch(err => console.error('FinSync Service Worker Registration Failed:', err));
  }
});
