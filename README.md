# HTML Casino Project Report

## 1. Introduction

This project is a static website featuring casino games, developed by the Yandex Gophers team as part of the Web Technologies 1 course at Astana IT University.

The project demonstrates the application of fundamental web technologies (HTML, CSS, JavaScript) to create an interactive user interface without using frameworks or server-side components.

## 2. Project Goals and Objectives

### Main Goals:
- Create a fully functional web application using only client-side technologies
- Implement game logic for casino games (Blackjack, Roulette)
- Demonstrate work with DOM, Canvas API, Web Audio API
- Apply modern styling approaches (CSS Custom Properties, theming)

### Tasks Addressed:
- Develop game mechanics without server-side components
- Create an adaptive interface with support for multiple themes
- Implement interactive elements (forms, search, animations)
- Organize codebase for ease of maintenance and expansion

## 3. Technology Stack

### Technologies Used:
- **HTML5** — page structure and semantic markup
- **CSS3** — styling using CSS Custom Properties for theming
- **JavaScript (ES6+)** — game logic and interactivity
- **Canvas API** — roulette wheel rendering with rotation physics
- **Web Audio API** — sound effects in games
- **localStorage** — saving user preferences

### External Libraries (loaded via CDN):
- **Bootstrap 5.3.0** — UI components and grid system
- **jQuery 3.7.1** — simplifying DOM manipulation and animations
- **Google Fonts (Geist)** — typography

### Architecture Features:
The project does not use build tools or package managers. All dependencies are loaded via CDN, which simplifies deployment and allows opening the project directly in a browser.

## 4. Project Structure

```
/
├── index.html                    # Main landing page
├── 404.html                      # Custom 404 error page
├── validation.js                 # Form validation
├── src/
│   ├── globals.css              # Global styles and theme variables
│   ├── app/                     # Application pages
│   │   ├── about/               # About page
│   │   ├── catalog/             # Games catalog
│   │   ├── faq/                 # Frequently asked questions
│   │   ├── games/               # Game pages
│   │   │   ├── blackjack/       # Blackjack game
│   │   │   └── Roulette/        # Roulette game
│   │   ├── user-profile/        # User profile
│   │   ├── user-policy/         # Privacy policy
│   │   └── sitemap/             # Site map
│   └── js/                      # Shared JavaScript modules
│       ├── theme-switcher.js    # Theme switching
│       ├── main-scripts.js      # Main scripts (lazy loading, counters)
│       ├── index.js             # Homepage scripts
│       └── balance-manager.js   # Balance management
└── public/                       # Static assets
    ├── Logo.svg                  # Logo
    ├── coins.png                 # Coin images
    └── [game-assets]/            # Game resources
```

### Organization Principles:
Each page in `/src/app/` follows a unified pattern:
- `page.html` — page markup with included header and footer
- `styles.css` — page-specific styles
- `script.js` — optional JavaScript for page functionality

## 5. Implemented Functionality

### 5.1. Theme System

A theme switching system with four themes: blue (default), purple, green, red.

**Technical Implementation:**
- CSS Custom Properties in `/src/globals.css` for color variables
- JavaScript module `theme-switcher.js` for theme switching
- Saving user choice in `localStorage`
- Applying theme to all components via CSS variables

**Theme Variables:**
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` — background colors
- `--accent-color` — theme accent color
- `--text-primary`, `--text-secondary` — text colors
- `--bg-gradient-start`, `--bg-gradient-end` — gradients

### 5.2. Blackjack Game

**Implemented Features:**
- Standard 52-card deck with shuffling
- Automatic score calculation with ace handling (11 or 1)
- Game logic: card dealing, dealer turn, winner determination
- Card visualization using Unicode suit symbols (♥ ♦ ♣ ♠)
- Game result notifications via toast notification system

**Game States:**
- `bet` — bet selection
- `playing` — active game
- `finished` — completed game

**Implementation Details:**
- Simplified Split function implementation (UI present, logic simplified)
- Client-side processing of all game logic
- No server communication

### 5.3. Roulette Game

**Implemented Features:**
- European roulette (37 numbers: 0-36)
- Canvas-based wheel rendering with rotation physics
- Animation with easing functions for realistic movement
- Sound effects via Web Audio API (spin sound, win, lose)
- Color scheme: green 0, red/black numbers

**Technical Details:**
- `RouletteGame` class for logic encapsulation
- Angle and number position calculations on the wheel
- Keyboard event handling (spacebar to start)
- Toast notifications for results

**Limitations:**
- Betting not implemented (auto-spin only)
- Balance displayed but not saved between sessions

### 5.4. Additional Pages

**FAQ (Frequently Asked Questions):**
- Question search with autocomplete
- Match highlighting in search results
- Implemented in `faq-search.js`

**User Policy (Privacy Policy):**
- Similar search system
- Implemented in `policy-search.js`

**Games Catalog:**
- Display of available games with cards
- Navigation to game pages

**User Profile:**
- Data editing form
- Field validation

### 5.5. Forms and Validation

**Implemented Validation (`validation.js`):**
- Name: minimum 2 characters, letters and spaces only
- Email: regex pattern validation
- Phone: minimum 10 digits
- Required consent for data processing

**Features:**
- Validation on blur (focus loss)
- Validation on form submission
- Visual feedback via Bootstrap classes

### 5.6. Performance Optimization

**Lazy Loading Images:**
- Implemented in `main-scripts.js`
- Images with `lazy-load` class and `data-src` attribute
- Loading when entering viewport
- Smooth appearance with fade-in effect

**Animated Counters:**
- Number animation when scrolling to statistics section
- Using `data-target` attribute for target value
- Trigger based on Intersection Observer (via jQuery)

## 6. Implementation Details

### 6.1. Resource Paths

All paths in the project are absolute from root:
- CSS: `/src/globals.css`
- JavaScript: `/src/js/theme-switcher.js`
- Images: `/public/Logo.svg`
- Pages: `/src/app/about/page.html`

This ensures correct operation when opened via local server and simplifies navigation.

### 6.2. Responsiveness

- Mobile-first approach
- Using Bootstrap grid system
- Hiding sidebar on mobile devices (`d-none d-lg-block`)
- Custom breakpoints in media queries

### 6.3. Accessibility

- Semantic HTML markup
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators in styles
- Alt texts for images
- "Skip to main content" link on all pages

## 7. Running the Project

### Requirements:
- Local web server (Python 3 or Node.js)

### Setup Instructions:

**Option 1: Python**
```bash
python3 -m http.server 8000
```

**Option 2: Node.js**
```bash
npx http-server -p 8000
```

After starting the server, open in browser: `http://localhost:8000`

**Note:** You can open `index.html` directly, but using a server is preferred for correct absolute path resolution.

## 8. Limitations and Known Features

### Technical Limitations:
- **No server-side:** All logic runs on the client
- **Balance not saved:** Displayed only within current session
- **Split in Blackjack:** UI present but implementation simplified
- **Betting in Roulette:** Not implemented, only auto-spin available
- **Poker:** Page leads to 404 (not implemented)

### Operational Features:
- **Audio:** Web Audio API may require user interaction for first playback
- **localStorage:** Used only for saving theme preference
- **Game balance:** Demonstrative, not connected to real transactions

## 9. Conclusions

The project demonstrates the possibility of creating a fully functional web application using fundamental web technologies without frameworks or server-side components. Two casino games with interactive interfaces, a theming system, forms with validation, and additional pages with search functionality have been implemented.

Key Achievements:
- Clean architecture with module separation
- Application of modern web APIs (Canvas, Web Audio)
- Adaptive design with theme support
- Performance optimization through lazy loading

The project can serve as a foundation for further development: adding new games, implementing server-side for progress saving, integrating a real betting system.

## 10. Additional Information

### Project Extension Guide

**Adding a New Page:**
1. Create directory `/src/app/[page-name]/`
2. Add `page.html` and `styles.css`
3. Copy header/footer structure from existing pages
4. Use absolute paths for resources

**Adding a New Game:**
1. Create `/src/app/games/[game-name]/`
2. Add HTML, CSS, and JS files
3. Follow Blackjack or Roulette patterns
4. Use `showToast()` for notifications
5. Update games catalog with new card

**Modifying Themes:**
1. Edit variables in `/src/globals.css` (lines 11-49)
2. Test on all pages
3. Verify contrast for accessibility

---

**Development Team:** Yandex Gophers  
**Institution:** Astana IT University  
**Course:** Web Technologies 1
