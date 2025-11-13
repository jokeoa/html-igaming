// Balance Manager - localStorage-based user balance and name storage

/**
 * User balance management with localStorage
 */
const BalanceManager = {
  // Initialize user data
  init() {
    // Set default username if not exists
    if (!this.getUserName()) {
      this.setUserName('Guest User');
    }

    // Set default balance if not exists
    if (this.getBalance() === null) {
      this.setBalance(1000); // Starting balance: 1000
    }
  },

  // User name management
  getUserName() {
    return localStorage.getItem('userName');
  },

  setUserName(name) {
    localStorage.setItem('userName', name);
    this.updateUserNameDisplay();
  },

  // Balance management
  getBalance() {
    const balance = localStorage.getItem('userBalance');
    return balance !== null ? parseFloat(balance) : null;
  },

  setBalance(amount) {
    const balance = Math.max(0, parseFloat(amount)); // Ensure non-negative
    localStorage.setItem('userBalance', balance.toString());
    this.updateBalanceDisplay();
    return balance;
  },

  addBalance(amount) {
    const currentBalance = this.getBalance() || 0;
    const newBalance = currentBalance + parseFloat(amount);
    return this.setBalance(newBalance);
  },

  subtractBalance(amount) {
    const currentBalance = this.getBalance() || 0;
    const newBalance = Math.max(0, currentBalance - parseFloat(amount));
    return this.setBalance(newBalance);
  },

  canAfford(amount) {
    const balance = this.getBalance() || 0;
    return balance >= parseFloat(amount);
  },

  // Update balance display on page
  updateBalanceDisplay() {
    const balance = this.getBalance() || 0;
    const balanceFormatted = balance.toFixed(2);

    // Update all elements with user-balance class or id userBalance
    const balanceElements = document.querySelectorAll('.user-balance, #userBalance');
    balanceElements.forEach(el => {
      // Check if element should have $ prefix (has balance-amount class or already contains $)
      const hasDollar = el.classList.contains('balance-amount') || el.textContent.includes('$');
      el.textContent = hasDollar ? `$${balanceFormatted}` : balanceFormatted;
    });

    // Also update specific elements by ID if they exist
    const userBalanceEl = document.getElementById('userBalance');
    if (userBalanceEl) {
      const hasDollar = userBalanceEl.classList.contains('balance-amount') || userBalanceEl.textContent.includes('$');
      userBalanceEl.textContent = hasDollar ? `$${balanceFormatted}` : balanceFormatted;
    }

    // Update nav balance if exists
    const navBalanceEl = document.getElementById('userBalanceNav');
    if (navBalanceEl) {
      navBalanceEl.textContent = `$${balanceFormatted}`;
    }
  },

  // Update user name display on page
  updateUserNameDisplay() {
    const userName = this.getUserName() || 'Guest User';

    // Update all elements with user name
    const userNameElements = document.querySelectorAll('#userName, #userNameDisplay, #userNameNav');
    userNameElements.forEach(el => {
      el.textContent = userName;
    });
  },

  // Format balance for display
  formatBalance(amount) {
    return parseFloat(amount || 0).toFixed(2);
  }
};

// Initialize on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BalanceManager.init());
  } else {
    BalanceManager.init();
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.BalanceManager = BalanceManager;
}

