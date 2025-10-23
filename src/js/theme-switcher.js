// TASK 4: BACKGROUND COLOR CHANGER
const themes = ['theme-blue', 'theme-purple', 'theme-green', 'theme-red'];
let currentThemeIndex = 0;

function changeTheme() {
  const body = document.body;
  
  // Remove current theme
  body.classList.remove(themes[currentThemeIndex]);
  
  // Move to next theme
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  
  // Add new theme
  body.classList.add(themes[currentThemeIndex]);
  
  // Save preference to localStorage
  try {
    localStorage.setItem('preferredTheme', themes[currentThemeIndex]);
    localStorage.setItem('themeIndex', currentThemeIndex.toString());
  } catch (e) {
    // If localStorage is not available, continue without saving
    console.log('Theme preference not saved');
  }
}

function loadThemePreference() {
  try {
    const savedTheme = localStorage.getItem('preferredTheme');
    const savedIndex = localStorage.getItem('themeIndex');
    
    if (savedTheme && themes.includes(savedTheme)) {
      currentThemeIndex = parseInt(savedIndex) || themes.indexOf(savedTheme);
      document.body.classList.remove(...themes);
      document.body.classList.add(themes[currentThemeIndex]);
    } else {
      // Default theme
      document.body.classList.add('theme-blue');
    }
  } catch (e) {
    // If localStorage is not available, use default theme
    document.body.classList.add('theme-blue');
  }
}

// Load theme on page load
window.addEventListener('DOMContentLoaded', loadThemePreference);
