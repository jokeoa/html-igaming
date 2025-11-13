// Theme switcher - only light and dark themes
const themes = ['theme-light', 'theme-dark'];
let currentThemeIndex = 0;

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove(...themes);
  body.classList.add(theme);
}

function setTheme(theme) {
  if (!themes.includes(theme)) return;
  currentThemeIndex = themes.indexOf(theme);
  applyTheme(theme);
  try { 
    localStorage.setItem('preferredTheme', theme);
    localStorage.setItem('themeIndex', String(currentThemeIndex));
  } catch (e) {
    // ignore
  }
}

function changeTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  setTheme(themes[currentThemeIndex]);
}

function loadThemePreference() {
  try {
    const savedTheme = localStorage.getItem('preferredTheme');
    const savedIndex = localStorage.getItem('themeIndex');
    if (savedTheme && themes.includes(savedTheme)) {
      currentThemeIndex = Number.isNaN(parseInt(savedIndex)) ? themes.indexOf(savedTheme) : parseInt(savedIndex);
      applyTheme(themes[currentThemeIndex]);
      return;
    }
  } catch (e) {
    // ignore and fall back
  }
  // Fallback to system preference
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme = prefersDark ? 'theme-dark' : 'theme-light';
  currentThemeIndex = themes.indexOf(defaultTheme);
  applyTheme(defaultTheme);
}

// Apply immediately (before DOMContentLoaded) to reduce flashes between pages
loadThemePreference();

// Expose helpers if needed elsewhere
window.theme = window.theme || {};
window.theme.setTheme = setTheme;
window.theme.changeTheme = changeTheme;
