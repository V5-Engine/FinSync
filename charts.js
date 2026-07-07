/**
 * charts.js - Chart rendering and data aggregation logic using Chart.js
 */

class FinSyncCharts {
  constructor() {
    this.pieChart = null;
    this.barChart = null;
    this.lineChart = null;
  }

  /**
   * Helper to get theme colors
   */
  getChartThemeColors() {
    const isDark = document.body.classList.contains('dark-theme');
    return {
      text: isDark ? '#94a3b8' : '#64748b',
      grid: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.08)',
      backgrounds: [
        '#8b5cf6', // Violet
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#ef4444', // Red
        '#06b6d4', // Cyan
        '#f97316', // Orange
        '#a855f7', // Purple
        '#64748b', // Slate
        '#14b8a6', // Teal
        '#eab308'  // Yellow
      ]
    };
  }

  /**
   * Aggregate expenses and paid bills by Category
   */
  aggregateCategoryData(expenses) {
    const categoryTotals = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Others';
      const amt = parseFloat(exp.amount) || 0;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });
    return categoryTotals;
  }

  /**
   * Aggregate daily spending for the last 7 days
   */
  aggregateLast7DaysData(expenses) {
    const totals = {};
    const days = [];
    
    // Generate last 7 days labels
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push(dateStr);
      totals[dateStr] = 0;
    }

    expenses.forEach(exp => {
      if (totals[exp.date] !== undefined) {
        totals[exp.date] += parseFloat(exp.amount) || 0;
      }
    });

    return {
      labels: days.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }),
      data: days.map(d => totals[d])
    };
  }

  /**
   * Aggregate monthly expenses for the current year
   */
  aggregateMonthlyData(expenses) {
    const currentYear = new Date().getFullYear();
    const monthlyTotals = Array(12).fill(0);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getFullYear() === currentYear) {
        const monthIndex = expDate.getMonth();
        monthlyTotals[monthIndex] += parseFloat(exp.amount) || 0;
      }
    });

    return {
      labels: months,
      data: monthlyTotals
    };
  }

  /**
   * Render all charts on the reports page
   */
  renderAllCharts() {
    const expenses = window.storage.getExpenses();
    const colors = this.getChartThemeColors();

    // 1. Pie Chart - Category Breakdown
    this.renderCategoryPieChart(expenses, colors);

    // 2. Bar Chart - Monthly Trends
    this.renderMonthlyBarChart(expenses, colors);

    // 3. Line Chart - Last 7 Days Spending
    this.renderWeeklyLineChart(expenses, colors);
  }

  /**
   * Render Category Pie Chart
   */
  renderCategoryPieChart(expenses, colors) {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const catData = this.aggregateCategoryData(expenses);
    const labels = Object.keys(catData);
    const data = Object.values(catData);

    if (labels.length === 0) {
      // Draw placeholder text or handle empty
      return;
    }

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.backgrounds.slice(0, labels.length),
          borderWidth: 2,
          borderColor: document.body.classList.contains('dark-theme') ? '#1e293b' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.text,
              font: { family: 'Outfit, Inter, sans-serif', size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw || 0;
                const currency = window.storage.getSettings().currency;
                return ` ${context.label}: ${currency}${value.toFixed(2)}`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  /**
   * Render Monthly Bar Chart
   */
  renderMonthlyBarChart(expenses, colors) {
    const ctx = document.getElementById('monthlyBarChart');
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    const monthlyData = this.aggregateMonthlyData(expenses);

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: 'Monthly Expenses',
          data: monthlyData.data,
          backgroundColor: '#8b5cf6', // Indigo primary
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { family: 'Outfit, Inter, sans-serif' } }
          },
          y: {
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Outfit, Inter, sans-serif' },
              callback: (value) => {
                const currency = window.storage.getSettings().currency;
                return currency + value;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render Weekly Line Chart
   */
  renderWeeklyLineChart(expenses, colors) {
    const ctx = document.getElementById('weeklyLineChart');
    if (!ctx) return;

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const weeklyData = this.aggregateLast7DaysData(expenses);

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeklyData.labels,
        datasets: [{
          label: 'Daily Spending',
          data: weeklyData.data,
          borderColor: '#10b981', // Emerald success
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { family: 'Outfit, Inter, sans-serif' } }
          },
          y: {
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Outfit, Inter, sans-serif' },
              callback: (value) => {
                const currency = window.storage.getSettings().currency;
                return currency + value;
              }
            }
          }
        }
      }
    });
  }
}

// Export global instance
window.charts = new FinSyncCharts();
