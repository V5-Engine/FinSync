/**
 * storage.js - LocalStorage data persistence layer for FinSync
 */

const STORAGE_KEY = 'finsync_data_state';

const DEFAULT_STATE = {
  settings: {
    currency: '$',
    monthlyBudget: 3000,
    dailyLimit: 100,
    theme: 'dark',
    accentColor: 'indigo', // indigo, emerald, violet, rose, amber, sky
    largeExpenseThreshold: 150
  },
  income: [
    { id: 'inc-1', source: 'Salary', amount: 4200, date: '2026-07-01', category: 'Salary' },
    { id: 'inc-2', source: 'Freelance Design', amount: 850, date: '2026-07-05', category: 'Freelance' }
  ],
  liabilities: [
    { id: 'liab-1', name: 'Chase Sapphire Credit Card', type: 'credit-card', amount: 650, dueDate: '2026-07-15', notes: 'Statement balance', paid: false, paidDate: '', history: [] },
    { id: 'liab-2', name: 'Car Loan EMI', type: 'loan', amount: 350, dueDate: '2026-07-20', notes: 'Toyota Finance', paid: true, paidDate: '2026-07-02', history: [{ date: '2026-07-02', amount: 350 }] },
    { id: 'liab-3', name: 'MacBook Installment', type: 'emi', amount: 95, dueDate: '2026-07-10', notes: 'Apple Store 0% APR', paid: false, paidDate: '', history: [] }
  ],
  bills: [
    { id: 'bill-1', name: 'Appartment Rent', amount: 1200, dueDate: '2026-07-01', category: 'Rent', autoRepeat: true, paid: true, paidDate: '2026-07-01', favorite: true },
    { id: 'bill-2', name: 'Electricity (Power Grid)', amount: 140, dueDate: '2026-07-12', category: 'Electricity', autoRepeat: true, paid: false, paidDate: '', favorite: false },
    { id: 'bill-3', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-18', category: 'Internet', autoRepeat: true, paid: false, paidDate: '', favorite: true },
    { id: 'bill-4', name: 'Netflix Premium', amount: 20, dueDate: '2026-07-08', category: 'Entertainment', autoRepeat: true, paid: true, paidDate: '2026-07-05', favorite: false },
    { id: 'bill-5', name: 'Geico Car Insurance', amount: 110, dueDate: '2026-07-22', category: 'Insurance', autoRepeat: true, paid: false, paidDate: '', favorite: false }
  ],
  expenses: [
    { id: 'exp-1', date: '2026-07-01', category: 'Home', amount: 1200, description: 'Rent Payment (Bill: Appartment Rent)', tags: ['Bill', 'Rent'] },
    { id: 'exp-2', date: '2026-07-02', category: 'Home', amount: 350, description: 'Car Loan EMI Payment', tags: ['Loan'] },
    { id: 'exp-3', date: '2026-07-03', category: 'Grocery', amount: 145.50, description: 'Weekly Groceries at Whole Foods', tags: ['Food'] },
    { id: 'exp-4', date: '2026-07-04', category: 'Petrol', amount: 50.00, description: 'Gas refill', tags: ['Fuel'] },
    { id: 'exp-5', date: '2026-07-05', category: 'Tea/Coffee', amount: 8.50, description: 'Starbucks Latte & Croissant', tags: ['Coffee'] },
    { id: 'exp-6', date: '2026-07-05', category: 'Entertainment', amount: 20.00, description: 'Netflix Premium Subscription', tags: ['Bill', 'Streaming'] },
    { id: 'exp-7', date: '2026-07-06', category: 'Food', amount: 32.80, description: 'Lunch with colleagues', tags: ['Office'] }
  ],
  nextMonth: [
    { id: 'nm-1', name: 'Quarterly Water Bill', amount: 90, dueDate: '2026-08-04', priority: 'medium', completed: false },
    { id: 'nm-2', name: 'Annual Domain Hosting Renewal', amount: 180, dueDate: '2026-08-15', priority: 'high', completed: false },
    { id: 'nm-3', name: 'Spotify Duo Plan', amount: 15, dueDate: '2026-08-01', priority: 'low', completed: false }
  ],
  goals: [
    { id: 'goal-1', name: 'Emergency Savings', target: 10000, current: 6500, category: 'Savings' },
    { id: 'goal-2', name: 'Japan Travel Fund', target: 4000, current: 1200, category: 'Leisure' }
  ]
};

class FinSyncStorage {
  constructor() {
    this.state = this.loadState();
    this.checkAndResetMonthlyRecurring();
  }

  /**
   * Load state from local storage or generate default state
   */
  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Deep merge with defaults to ensure any new keys/fields exist
        return {
          settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
          income: parsed.income || [],
          liabilities: parsed.liabilities || [],
          bills: parsed.bills || [],
          expenses: parsed.expenses || [],
          nextMonth: parsed.nextMonth || [],
          goals: parsed.goals || []
        };
      }
    } catch (e) {
      console.error('Failed to load FinSync state from LocalStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE)); // Return fresh deep copy of default state
  }

  /**
   * Save current state to local storage
   */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      // Dispatch an event so components can update if needed
      window.dispatchEvent(new CustomEvent('finsync-state-updated', { detail: this.state }));
    } catch (e) {
      console.error('Failed to save FinSync state to LocalStorage:', e);
    }
  }

  /**
   * Checks if we have entered a new calendar month.
   * If yes, and user has auto-repeat enabled for bills, we reset their paid status
   * so they show up as pending for the new month, keeping their history.
   */
  checkAndResetMonthlyRecurring() {
    const currentMonthKey = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const lastCheckKey = localStorage.getItem('finsync_last_month_check');

    if (lastCheckKey && lastCheckKey !== currentMonthKey) {
      // It's a new month! Reset bills and liabilities
      let updated = false;

      // 1. Reset bills
      this.state.bills.forEach(bill => {
        if (bill.autoRepeat && bill.paid) {
          bill.paid = false;
          bill.paidDate = '';
          updated = true;
        }
      });

      // 2. Reset liabilities (Credit Cards / EMIs / Loans status)
      // Usually, liabilities reset every cycle. Let's reset their payment status for the new month.
      this.state.liabilities.forEach(liab => {
        if (liab.paid) {
          // If it was paid, keep it in history but clear payment status for the new cycle
          liab.paid = false;
          liab.paidDate = '';
          updated = true;
        }
      });

      // If we made changes, save them
      if (updated) {
        this.saveState();
      }
    }
    localStorage.setItem('finsync_last_month_check', currentMonthKey);
  }

  // --- SETTINGS CONTROLLER ---
  getSettings() {
    return this.state.settings;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  // --- INCOME CONTROLLER ---
  getIncome() {
    return this.state.income;
  }

  addIncome(item) {
    const newIncome = {
      id: 'inc-' + Date.now() + Math.random().toString(36).substr(2, 4),
      source: item.source,
      amount: parseFloat(item.amount) || 0,
      date: item.date || new Date().toISOString().split('T')[0],
      category: item.category || 'Other'
    };
    this.state.income.push(newIncome);
    this.saveState();
    return newIncome;
  }

  editIncome(id, updatedItem) {
    const index = this.state.income.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.income[index] = {
        ...this.state.income[index],
        source: updatedItem.source,
        amount: parseFloat(updatedItem.amount) || 0,
        date: updatedItem.date,
        category: updatedItem.category
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteIncome(id) {
    const originalLength = this.state.income.length;
    this.state.income = this.state.income.filter(item => item.id !== id);
    if (this.state.income.length !== originalLength) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- LIABILITIES CONTROLLER ---
  getLiabilities() {
    return this.state.liabilities;
  }

  addLiability(item) {
    const newItem = {
      id: 'liab-' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: item.name,
      type: item.type, // 'credit-card', 'loan', 'emi'
      amount: parseFloat(item.amount) || 0,
      dueDate: item.dueDate,
      notes: item.notes || '',
      paid: false,
      paidDate: '',
      history: []
    };
    this.state.liabilities.push(newItem);
    this.saveState();
    return newItem;
  }

  editLiability(id, updatedItem) {
    const index = this.state.liabilities.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.liabilities[index] = {
        ...this.state.liabilities[index],
        name: updatedItem.name,
        type: updatedItem.type,
        amount: parseFloat(updatedItem.amount) || 0,
        dueDate: updatedItem.dueDate,
        notes: updatedItem.notes || ''
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteLiability(id) {
    this.state.liabilities = this.state.liabilities.filter(item => item.id !== id);
    // Cleanup any linked expenses
    this.state.expenses = this.state.expenses.filter(e => e.linkedLiabilityId !== id);
    this.saveState();
  }

  markLiabilityPaid(id, paymentDate) {
    const item = this.state.liabilities.find(item => item.id === id);
    if (item) {
      const pDate = paymentDate || new Date().toISOString().split('T')[0];
      item.paid = true;
      item.paidDate = pDate;
      if (!item.history) item.history = [];
      item.history.push({ date: pDate, amount: item.amount });

      // Prevent duplicate logging of this liability payment
      const exists = this.state.expenses.some(e => e.linkedLiabilityId === id && e.date === pDate);
      if (!exists) {
        this.addExpense({
          date: pDate,
          category: item.type === 'credit-card' ? 'Shopping' : (item.type === 'loan' ? 'Home' : 'Others'),
          amount: item.amount,
          description: `Liability Payment: ${item.name} (${item.type.toUpperCase()})`,
          tags: ['Liability', item.type],
          linkedLiabilityId: item.id
        });
      }

      this.saveState();
      return true;
    }
    return false;
  }

  // --- MONTHLY BILLS CONTROLLER ---
  getBills() {
    return this.state.bills;
  }

  addBill(item) {
    const newItem = {
      id: 'bill-' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: item.name,
      amount: parseFloat(item.amount) || 0,
      dueDate: item.dueDate,
      category: item.category || 'Utilities',
      autoRepeat: !!item.autoRepeat,
      paid: false,
      paidDate: '',
      favorite: false
    };
    this.state.bills.push(newItem);
    this.saveState();
    return newItem;
  }

  editBill(id, updatedItem) {
    const index = this.state.bills.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.bills[index] = {
        ...this.state.bills[index],
        name: updatedItem.name,
        amount: parseFloat(updatedItem.amount) || 0,
        dueDate: updatedItem.dueDate,
        category: updatedItem.category,
        autoRepeat: !!updatedItem.autoRepeat
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteBill(id) {
    this.state.bills = this.state.bills.filter(item => item.id !== id);
    // Cleanup any linked expenses
    this.state.expenses = this.state.expenses.filter(e => e.linkedBillId !== id);
    this.saveState();
  }

  toggleBillPaid(id, isPaid, paymentDate) {
    const bill = this.state.bills.find(item => item.id === id);
    if (bill) {
      bill.paid = isPaid;
      if (isPaid) {
        const pDate = paymentDate || new Date().toISOString().split('T')[0];
        bill.paidDate = pDate;

        // Avoid duplicate logging of this bill payment
        const exists = this.state.expenses.some(e => e.linkedBillId === id);
        if (!exists) {
          this.addExpense({
            date: pDate,
            category: bill.category,
            amount: bill.amount,
            description: `Bill Payment: ${bill.name}`,
            tags: ['Bill', bill.category],
            linkedBillId: bill.id
          });
        }
      } else {
        bill.paidDate = '';
        // Clean up linked daily expense
        this.state.expenses = this.state.expenses.filter(e => e.linkedBillId !== id);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  toggleBillFavorite(id) {
    const bill = this.state.bills.find(item => item.id === id);
    if (bill) {
      bill.favorite = !bill.favorite;
      this.saveState();
      return true;
    }
    return false;
  }

  // --- DAILY EXPENSES CONTROLLER ---
  getExpenses() {
    return this.state.expenses;
  }

  addExpense(item) {
    const newItem = {
      id: 'exp-' + Date.now() + Math.random().toString(36).substr(2, 4),
      date: item.date || new Date().toISOString().split('T')[0],
      category: item.category || 'Others',
      amount: parseFloat(item.amount) || 0,
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : []),
      linkedBillId: item.linkedBillId || null,
      linkedLiabilityId: item.linkedLiabilityId || null
    };
    this.state.expenses.push(newItem);
    this.saveState();
    return newItem;
  }

  editExpense(id, updatedItem) {
    const index = this.state.expenses.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.expenses[index] = {
        ...this.state.expenses[index],
        date: updatedItem.date,
        category: updatedItem.category,
        amount: parseFloat(updatedItem.amount) || 0,
        description: updatedItem.description || '',
        tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : (updatedItem.tags ? updatedItem.tags.split(',').map(t => t.trim()) : [])
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteExpense(id) {
    this.state.expenses = this.state.expenses.filter(item => item.id !== id);
    this.saveState();
  }

  // --- NEXT MONTH PAYMENTS CONTROLLER ---
  getNextMonth() {
    return this.state.nextMonth;
  }

  addNextMonth(item) {
    const newItem = {
      id: 'nm-' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: item.name,
      amount: parseFloat(item.amount) || 0,
      dueDate: item.dueDate,
      priority: item.priority || 'medium', // 'high', 'medium', 'low'
      completed: false
    };
    this.state.nextMonth.push(newItem);
    this.saveState();
    return newItem;
  }

  editNextMonth(id, updatedItem) {
    const index = this.state.nextMonth.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.nextMonth[index] = {
        ...this.state.nextMonth[index],
        name: updatedItem.name,
        amount: parseFloat(updatedItem.amount) || 0,
        dueDate: updatedItem.dueDate,
        priority: updatedItem.priority
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteNextMonth(id) {
    this.state.nextMonth = this.state.nextMonth.filter(item => item.id !== id);
    this.saveState();
  }

  toggleNextMonthCompleted(id, completed) {
    const item = this.state.nextMonth.find(item => item.id === id);
    if (item) {
      item.completed = completed;
      this.saveState();
      return true;
    }
    return false;
  }

  carryForwardNextMonth(id) {
    const item = this.state.nextMonth.find(item => item.id === id);
    if (item) {
      // Transfer to Monthly Bills
      this.addBill({
        name: item.name,
        amount: item.amount,
        dueDate: item.dueDate,
        category: 'Utilities',
        autoRepeat: true
      });
      // Delete from next month planning
      this.deleteNextMonth(id);
      return true;
    }
    return false;
  }

  // --- GOALS CONTROLLER ---
  getGoals() {
    return this.state.goals;
  }

  addGoal(item) {
    const newItem = {
      id: 'goal-' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: item.name,
      target: parseFloat(item.target) || 0,
      current: parseFloat(item.current) || 0,
      category: item.category || 'Savings'
    };
    this.state.goals.push(newItem);
    this.saveState();
    return newItem;
  }

  editGoal(id, updatedItem) {
    const index = this.state.goals.findIndex(item => item.id === id);
    if (index !== -1) {
      this.state.goals[index] = {
        ...this.state.goals[index],
        name: updatedItem.name,
        target: parseFloat(updatedItem.target) || 0,
        current: parseFloat(updatedItem.current) || 0,
        category: updatedItem.category
      };
      this.saveState();
      return true;
    }
    return false;
  }

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(item => item.id !== id);
    this.saveState();
  }

  // --- BACKUP & RESTORE ---
  exportBackup() {
    return JSON.stringify(this.state, null, 2);
  }

  restoreBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        if (parsed.settings && Array.isArray(parsed.expenses) && Array.isArray(parsed.bills)) {
          this.state = parsed;
          this.saveState();
          return { success: true };
        }
      }
      return { success: false, error: 'Invalid file format. State structure is invalid.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetAllData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }
}

// Export a single instance to be used globally
window.storage = new FinSyncStorage();
