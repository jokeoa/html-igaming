// TASK 3: POPUP FUNCTIONALITY
function openPopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function closePopupOnOutside(event) {
  if (event.target.id === 'popupOverlay') {
    closePopup();
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('popup-name').value;
  const email = document.getElementById('popup-email').value;
  const message = document.getElementById('popup-message').value;
  
  alert(`Thank you for subscribing, ${name}!\nWe'll send updates to ${email}`);
  
  // Reset form
  event.target.reset();
  closePopup();
}

// Close popup with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closePopup();
  }
});

// === USER STATE LOGIC ===
const USER_STORAGE_KEY = 'htmlCasinoUser';
const USER_COOKIE_KEY = USER_STORAGE_KEY;
const USER_COOKIE_LIFETIME_DAYS = 30;
let currentUser = null;
let userSettingsModalInstance = null;
let topUpModalInstance = null;
const userListeners = [];

function readCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

function writeCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function readUserFromLocalStorage() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to read user from localStorage', error);
    return null;
  }
}

function writeUserToLocalStorage(user) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to write user to localStorage', error);
  }
}

function ensureCurrentUser() {
  if (!currentUser) {
    currentUser = loadUserFromStorage();
  }
  return currentUser;
}

function getUserSnapshot() {
  const user = ensureCurrentUser();
  return {
    nickname: user.nickname,
    balance: user.balance
  };
}

function notifyUserChange() {
  const snapshot = getUserSnapshot();
  userListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('User listener failed', error);
    }
  });
}

function registerUserChangeListener(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }
  userListeners.push(listener);
  return () => {
    const index = userListeners.indexOf(listener);
    if (index !== -1) {
      userListeners.splice(index, 1);
    }
  };
}

function createDefaultUser() {
  const randomSuffix = Math.floor(Math.random() * 900) + 100;
  return {
    nickname: `Player${randomSuffix}`,
    balance: 500
  };
}

function normaliseUserLikeObject(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }
  if (typeof candidate.nickname !== 'string' || typeof candidate.balance !== 'number') {
    return null;
  }
  return {
    nickname: candidate.nickname || createDefaultUser().nickname,
    balance: Number.isFinite(candidate.balance) ? Math.max(0, Math.floor(candidate.balance)) : createDefaultUser().balance
  };
}

function loadUserFromStorage() {
  const fromLocalStorage = normaliseUserLikeObject(readUserFromLocalStorage());
  if (fromLocalStorage) {
    return fromLocalStorage;
  }

  try {
    const rawCookie = readCookie(USER_COOKIE_KEY);
    if (rawCookie) {
      const parsed = JSON.parse(decodeURIComponent(rawCookie));
      const normalisedCookie = normaliseUserLikeObject(parsed);
      if (normalisedCookie) {
        writeUserToLocalStorage(normalisedCookie);
        return normalisedCookie;
      }
    }
  } catch (error) {
    console.warn('Failed to migrate user cookie, creating default user.', error);
  }

  const fallbackUser = createDefaultUser();
  writeUserToLocalStorage(fallbackUser);
  return fallbackUser;
}

function persistUserState() {
  if (!currentUser) return;
  writeUserToLocalStorage(currentUser);
  // Keep writing cookie for backward compatibility / legacy pages, but not relied upon
  writeCookie(USER_COOKIE_KEY, JSON.stringify(currentUser), USER_COOKIE_LIFETIME_DAYS);
}

function updateUserUI() {
  const user = ensureCurrentUser();
  const nicknameEl = document.getElementById('userNicknameDisplay');
  const balanceEl = document.getElementById('userBalanceDisplay');
  if (!nicknameEl || !balanceEl || !user) return;
  nicknameEl.textContent = user.nickname;
  balanceEl.textContent = user.balance;
}

function showToastMessage(title, message, options = {}) {
  const toastElement = document.getElementById('greetingToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  if (!toastElement || !toastTitle || !toastMessage || typeof bootstrap === 'undefined') {
    if (!options.silentFallback) {
      console.log(`[Toast] ${title}: ${message}`);
    }
    return;
  }

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  const toast = bootstrap.Toast.getOrCreateInstance(toastElement, {
    autohide: options.autohide ?? true,
    delay: options.delay || 4000
  });
  toast.show();
}

function setUserNickname(nickname, options = {}) {
  const trimmed = (nickname || '').trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { success: false, reason: 'invalid-length' };
  }

  const user = ensureCurrentUser();
  user.nickname = trimmed;
  persistUserState();
  updateUserUI();
  notifyUserChange();

  if (!options.silent) {
    showToastMessage(options.toastTitle || 'Profile updated', options.toastMessage || `Welcome back, ${trimmed}!`, options.toastOptions);
  }

  return { success: true, nickname: trimmed };
}

function addUserTokens(amount, options = {}) {
  const value = Math.floor(Number(amount));
  if (!Number.isFinite(value) || value <= 0) {
    return { success: false, reason: 'invalid-amount' };
  }

  const user = ensureCurrentUser();
  user.balance = Math.max(0, user.balance + value);
  persistUserState();
  updateUserUI();
  notifyUserChange();

  if (!options.silent) {
    showToastMessage(options.toastTitle || 'Tokens added', options.toastMessage || `+${value} tokens credited to your balance.`, options.toastOptions);
  }

  return { success: true, balance: user.balance, amount: value };
}

function spendUserTokens(amount, options = {}) {
  const value = Math.floor(Number(amount));
  if (!Number.isFinite(value) || value <= 0) {
    return { success: false, reason: 'invalid-amount' };
  }

  const user = ensureCurrentUser();
  if (!options.allowNegative && user.balance < value) {
    return { success: false, reason: 'insufficient-balance', balance: user.balance };
  }

  user.balance = Math.max(0, user.balance - value);
  persistUserState();
  updateUserUI();
  notifyUserChange();

  if (!options.silent) {
    showToastMessage(options.toastTitle || 'Tokens spent', options.toastMessage || `-${value} tokens used.`, options.toastOptions);
  }

  return { success: true, balance: user.balance, amount: value };
}

function ensureModalInstances() {
  const settingsModalEl = document.getElementById('userSettingsModal');
  const topUpModalEl = document.getElementById('topUpModal');
  if (settingsModalEl && !userSettingsModalInstance) {
    userSettingsModalInstance = new bootstrap.Modal(settingsModalEl);
  }
  if (topUpModalEl && !topUpModalInstance) {
    topUpModalInstance = new bootstrap.Modal(topUpModalEl);
  }
}

function openUserSettingsModal() {
  ensureModalInstances();
  if (!userSettingsModalInstance || !currentUser) return;
  const input = document.getElementById('userNicknameInput');
  if (input) {
    input.value = currentUser.nickname;
  }
  userSettingsModalInstance.show();
}

function saveUserSettings() {
  const input = document.getElementById('userNicknameInput');
  if (!input) return;
  const nickname = input.value.trim();
  const result = setUserNickname(nickname, { silent: true });
  if (!result.success) {
    input.classList.add('is-invalid');
    input.focus();
    return;
  }
  input.classList.remove('is-invalid');
  if (userSettingsModalInstance) {
    userSettingsModalInstance.hide();
  }
  showToastMessage('Profile updated', `Welcome back, ${nickname}!`);
}

function openTopUpModal() {
  ensureModalInstances();
  if (!topUpModalInstance) return;
  const amountInput = document.getElementById('topUpAmountInput');
  if (amountInput) {
    amountInput.value = 100;
  }
  topUpModalInstance.show();
}

function submitTopUp() {
  const amountInput = document.getElementById('topUpAmountInput');
  if (!amountInput) return;
  const amount = Math.floor(Number(amountInput.value));
  if (!Number.isFinite(amount) || amount <= 0) {
    amountInput.classList.add('is-invalid');
    amountInput.focus();
    return;
  }
  amountInput.classList.remove('is-invalid');
  addUserTokens(amount, { silent: true });
  if (topUpModalInstance) {
    topUpModalInstance.hide();
  }
  showToastMessage('Tokens added', `+${amount} tokens credited to your balance.`);
}

function hookGameButtons() {
  const buttons = document.querySelectorAll('.game-play-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const cost = Math.max(0, parseInt(button.dataset.tokenCost, 10) || 0);
      if (cost <= 0) return;
      const spendResult = spendUserTokens(cost, { silent: true });
      if (!spendResult.success) {
        event.preventDefault();
        showToastMessage('Not enough tokens', `You need ${cost} tokens to play. Top up your balance first.`);
        return;
      }
      showToastMessage('Good luck!', `-${cost} tokens used to launch the game.`);
    });
  });
}

function initialiseUserState() {
  currentUser = loadUserFromStorage();
  persistUserState();
  updateUserUI();
  hookGameButtons();
  ensureModalInstances();
  notifyUserChange();
}

// Time-based greeting toast
function showGreetingToast() {
  const hour = new Date().getHours();
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastElement = document.getElementById('greetingToast');

  if (!toastTitle || !toastMessage || !toastElement || typeof bootstrap === 'undefined') {
    return;
  }

  let greeting, message;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning!';
    message = 'Start your day with some exciting casino games!';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon!';
    message = 'Perfect time to try your luck at our casino!';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening!';
    message = 'Evening is the best time to play and win!';
  } else {
    greeting = 'Good Night!';
    message = 'Late night gaming sessions are the most thrilling!';
  }

  toastTitle.textContent = greeting;
  toastMessage.textContent = message;

  const toast = bootstrap.Toast.getOrCreateInstance(toastElement, {
    autohide: true,
    delay: 5000
  });
  toast.show();
}

function attachFormHandlers() {
  const userSettingsForm = document.getElementById('userSettingsForm');
  if (userSettingsForm) {
    userSettingsForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveUserSettings();
    });
  }

  const topUpForm = document.getElementById('topUpForm');
  if (topUpForm) {
    topUpForm.addEventListener('submit', function(event) {
      event.preventDefault();
      submitTopUp();
    });
  }
}

function initialisePage() {
  initialiseUserState();
  attachFormHandlers();
  if (document.getElementById('greetingToast')) {
    setTimeout(showGreetingToast, 1000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialisePage);
} else {
  initialisePage();
}

window.showToastMessage = showToastMessage;

window.htmlCasinoUser = {
  ensureUser: ensureCurrentUser,
  getUserSnapshot,
  updateUI: updateUserUI,
  setNickname: (nickname, options) => setUserNickname(nickname, options),
  addTokens: (amount, options) => addUserTokens(amount, options),
  spendTokens: (amount, options) => spendUserTokens(amount, options),
  onChange: registerUserChangeListener,
  openSettingsModal: openUserSettingsModal,
  openTopUpModal: openTopUpModal
};
