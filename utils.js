/**
 * utils.js - Common helper utilities, UI feedback mechanisms, and export adapters for FinSync
 */

class FinSyncUtils {
  constructor() {
    this.initToastContainer();
    this.initConfirmModal();
  }

  /**
   * Format currency values based on settings currency symbol
   */
  formatCurrency(value, currencySymbol = null) {
    if (currencySymbol === null) {
      currencySymbol = window.storage.getSettings().currency;
    }
    const val = parseFloat(value) || 0;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formats string date "YYYY-MM-DD" into a friendly readable format e.g., "Jul 6, 2026"
   */
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Formats date as YYYY-MM-DD
   */
  formatISODate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Toast Container setup
   */
  initToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 380px;
        width: 100%;
      `;
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  /**
   * Display toast notification
   * @param {string} message - Text message
   * @param {string} type - success, error, warning, info
   * @param {number} duration - Time in ms (default 4000)
   */
  showToast(message, type = 'success', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Select icon
    let iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'info') iconClass = 'fa-info-circle';

    toast.innerHTML = `
      <div class="toast-content" style="display: flex; align-items: center; padding: 14px 18px; border-radius: 12px; background: var(--bg-surface); border-left: 5px solid var(--accent-toast); box-shadow: 0 10px 25px rgba(0,0,0,0.15); animation: toastSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;">
        <i class="fas ${iconClass}" style="color: var(--accent-toast); margin-right: 12px; font-size: 1.2rem;"></i>
        <div style="flex-grow: 1; font-size: 0.9rem; color: var(--text-primary); font-weight: 500;">${message}</div>
        <button class="toast-close" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); margin-left: 10px;"><i class="fas fa-times"></i></button>
      </div>
    `;

    // Set variable style based on type
    let color = '#10b981'; // success
    if (type === 'error') color = '#ef4444';
    if (type === 'warning') color = '#f59e0b';
    if (type === 'info') color = '#3b82f6';
    toast.style.setProperty('--accent-toast', color);

    this.toastContainer.appendChild(toast);

    // Auto-remove
    const removeToast = () => {
      if (toast.parentNode === this.toastContainer) {
        toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
          if (toast.parentNode === this.toastContainer) {
            this.toastContainer.removeChild(toast);
          }
        }, 300);
      }
    };

    const timeoutId = setTimeout(removeToast, duration);

    // Close button event
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeoutId);
      removeToast();
    });
  }

  /**
   * Confirmation dialog template initialization
   */
  initConfirmModal() {
    let modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'custom-confirm-modal';
      modal.className = 'custom-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
      `;
      modal.innerHTML = `
        <div class="modal-card" style="background: var(--bg-surface); padding: 28px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: var(--shadow-lg); transform: translateY(-20px); transition: transform 0.25s ease; border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 1.2rem;"></i>
            </div>
            <h3 id="confirm-title" style="margin: 0; font-size: 1.2rem; font-weight: 600; color: var(--text-primary);">Confirm Action</h3>
          </div>
          <p id="confirm-message" style="margin: 0 0 24px 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;"></p>
          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button id="confirm-btn-cancel" class="btn btn-secondary" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: none; cursor: pointer; color: var(--text-secondary); font-weight: 500;">Cancel</button>
            <button id="confirm-btn-ok" class="btn btn-danger" style="padding: 8px 16px; border-radius: 8px; border: none; background: #ef4444; cursor: pointer; color: white; font-weight: 500;">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    this.confirmModal = modal;
  }

  /**
   * Modern replacement for window.confirm
   */
  confirm(title, message, okText = 'Delete', isDanger = true) {
    return new Promise((resolve) => {
      const titleEl = this.confirmModal.querySelector('#confirm-title');
      const msgEl = this.confirmModal.querySelector('#confirm-message');
      const okBtn = this.confirmModal.querySelector('#confirm-btn-ok');
      const cancelBtn = this.confirmModal.querySelector('#confirm-btn-cancel');
      const card = this.confirmModal.querySelector('.modal-card');

      titleEl.innerText = title;
      msgEl.innerText = message;
      okBtn.innerText = okText;

      if (isDanger) {
        okBtn.style.background = '#ef4444';
      } else {
        okBtn.style.background = 'var(--accent-color)';
      }

      // Show
      this.confirmModal.style.opacity = '1';
      this.confirmModal.style.pointerEvents = 'auto';
      card.style.transform = 'translateY(0)';

      const close = (result) => {
        this.confirmModal.style.opacity = '0';
        this.confirmModal.style.pointerEvents = 'none';
        card.style.transform = 'translateY(-20px)';
        
        // Remove listeners
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        resolve(result);
      };

      const onOk = () => close(true);
      const onCancel = () => close(false);

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }

  /**
   * Export JSON data as file
   */
  downloadJSON(dataStr, filename) {
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = filename;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Export array of objects to CSV
   */
  exportToCSV(data, headers, filename) {
    if (!data || !data.length) {
      this.showToast('No data available to export', 'warning');
      return;
    }

    const csvContent = [];
    // Headers
    csvContent.push(headers.join(','));

    // Rows
    data.forEach(item => {
      const row = headers.map(header => {
        const val = item[header] !== undefined ? item[header] : '';
        // Escape quotes
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvContent.push(row.join(','));
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('CSV file exported successfully', 'success');
  }

  /**
   * Export to Excel using SheetJS (XLSX CDN)
   */
  exportToExcel(data, headers, filename) {
    if (typeof XLSX === 'undefined') {
      this.showToast('XLSX library not loaded. Falling back to CSV export.', 'warning');
      this.exportToCSV(data, headers, filename.replace('.xlsx', '.csv'));
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FinSync Data');
      XLSX.writeFile(workbook, filename);
      this.showToast('Excel file exported successfully', 'success');
    } catch (e) {
      console.error(e);
      this.showToast('Excel export failed: ' + e.message, 'error');
    }
  }

  /**
   * Export to PDF using print styles or jsPDF
   */
  exportToPDF(filename) {
    // Elegant client-side PDF export:
    // Try to use window.print() which has an optimized, print-friendly CSS style defined,
    // Or if jsPDF is available, we can capture a screenshot or print reports view.
    // The easiest and most layout-accurate way is utilizing standard browser printing.
    // We will trigger standard window.print() which runs custom media queries to format the reports page nicely.
    this.showToast('Opening print dialog. Set Destination to "Save as PDF".', 'info');
    window.print();
  }
}

// Export a single instance to be used globally
window.utils = new FinSyncUtils();
