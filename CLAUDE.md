# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HTML Casino is a static website educational project featuring casino games (Blackjack, Roulette) built with vanilla HTML, CSS, and JavaScript. Created by the Yandex Gophers team at Astana IT University for a Web Technologies 1 course.

## Development Setup

This is a static website with no build process. To develop:

```bash
# Open with a local development server
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js (if http-server is installed)
npx http-server -p 8000

# Then visit: http://localhost:8000
```

The site can also be opened directly by opening `index.html` in a browser, though a local server is preferred for proper path resolution.

## Architecture

### Project Structure

- **Root level**: Main landing page (`index.html`, `index.css`) and 404 page
- **`/src/app/`**: Page-specific directories, each containing `page.html`, `styles.css`, and optional JavaScript
- **`/src/js/`**: Shared JavaScript modules:
  - `theme-switcher.js` - Theme management (blue/purple/green/red)
  - `main-scripts.js` - Animated counters, lazy loading, form handling with jQuery
  - `index.js` - Homepage-specific scripts
- **`/src/globals.css`**: Global styles and CSS variables for theming
- **`/public/`**: Static assets (images, SVGs, game assets)
- **`/validation.js`**: Form validation for newsletter subscription

### Key Pages

- `/index.html` - Landing page with game showcase
- `/src/app/about/page.html` - About page
- `/src/app/faq/page.html` - FAQ with search functionality (`faq-search.js`)
- `/src/app/catalog/page.html` - Game catalog
- `/src/app/user-profile/page.html` - User profile
- `/src/app/user-policy/page.html` - Privacy policy with search (`policy-search.js`)
- `/src/app/sitemap/page.html` - Site map
- `/src/app/games/blackjack/blackjack.html` - Blackjack game implementation
- `/src/app/games/Roulette/roulette-games.html` - Roulette game implementation
- `/404.html` - Custom 404 page

### External Dependencies

All dependencies are loaded via CDN:
- Bootstrap 5.3.0 (CSS + JS)
- jQuery 3.7.1
- Google Fonts (Geist, Geist Mono)!

## Theming System

The site uses CSS custom properties for theming with four themes: `theme-blue` (default), `theme-purple`, `theme-green`, `theme-red`.

**Theme Variables** (defined in `/src/globals.css`):
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-header` - Background colors
- `--bg-gradient-start`, `--bg-gradient-end` - Gradient backgrounds
- `--accent-color` - Theme accent color
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-subtle` - Text colors

**Theme Switching**:
- Theme preference saved to localStorage
- Managed by `/src/js/theme-switcher.js`
- Theme button appears fixed at bottom-right corner

## Game Architecture

### Blackjack (`/src/app/games/blackjack/`)
- Uses vanilla JavaScript with jQuery for toast notifications
- Game states: `bet`, `playing`, `finished`
- Card rendering with SVG-like Unicode suits (♥ ♦ ♣ ♠)
- Standard deck management (52 cards, shuffle, deal)
- Score calculation with Ace handling (11 or 1)
- Split functionality (UI present, simplified implementation)
- Toast notifications for game events (win/lose/push)

### Roulette (`/src/app/games/Roulette/`)
- Class-based architecture (`RouletteGame`)
- Canvas-based wheel rendering (37 numbers: 0-36)
- Physics-based spin animation with easing
- Web Audio API for sound effects (spin, win, lose)
- European roulette layout (green 0, red/black numbers)
- Toast notifications for spin results

## Common Patterns

### Page Structure
Each page in `/src/app/` follows this pattern:
```
/src/app/[page-name]/
  ├── page.html      (includes header, footer, sidebar)
  ├── styles.css     (page-specific styles)
  └── script.js      (optional, page-specific behavior)
```

### Header Navigation
- Responsive Bootstrap navbar
- Links to: About, FAQ, GitHub repo
- Profile button, Subscribe button
- Logo with SVG asset (`/public/Logo.svg`)

### Sidebar (Left)
Present on some pages with quick access links:
- Quick Access: All Games, Blackjack, Poker, Roulette
- Information: About Us, FAQ, User Policy

### Footer
- Logo and Profile button
- Navigation links
- Team attribution text

### Toast Notifications
jQuery-based toast system for game feedback:
```javascript
showToast(title, message, type)
// types: 'win', 'lose', 'start', 'push'
```

### Form Validation
Newsletter forms use `validation.js`:
- Name validation (2+ chars, letters/spaces only)
- Email regex validation
- Phone number validation (10+ digits)
- Personal data checkbox required
- Real-time blur validation + submit validation

### Search Functionality
- FAQ search (`/src/app/faq/faq-search.js`)
- User policy search (`/src/app/user-policy/policy-search.js`)
- Autocomplete dropdowns with highlighting
- Case-insensitive search with match emphasis

### Lazy Loading
Implemented in `main-scripts.js` for images:
- Images with `class="lazy-load"` and `data-src` attribute
- Load on scroll when entering viewport
- Fade-in transition effect

### Animated Counters
Stats section on homepage uses jQuery scroll-triggered animation:
- Counts up to `data-target` attribute
- Triggers when section enters viewport

## File Path Conventions

**Important**: All paths in HTML use absolute paths from root:
- CSS: `/src/globals.css`, `/index.css`
- JS: `/src/js/theme-switcher.js`
- Images: `/public/Logo.svg`, `/public/black-jack/*.webp`
- Pages: `/src/app/about/page.html`

When adding new pages, follow this absolute path convention.

## Styling Guidelines

### Custom Bootstrap Overrides
Bootstrap components are heavily customized in `/src/globals.css`:
- Cards: Dark background, gradient hover effects
- Accordions: Custom colors matching theme
- Forms: Translucent inputs with theme-aware focus states
- Alerts, Badges, Carousels: All themed

### Button Styles
- `.btn-outline` - Transparent with border
- `.btn-gradient` - Orange gradient (primary action)
- `.btn-theme` - Purple gradient (theme-related actions)

### Responsive Design
- Mobile-first approach
- Bootstrap grid system (12 columns)
- Custom breakpoints in media queries
- Sidebar hidden on mobile (`d-none d-lg-block`)

## Accessibility Features

- Skip to main content link on all pages
- ARIA labels on interactive elements
- Keyboard support (spacebar for roulette spin)
- Focus indicators defined in globals.css
- Semantic HTML structure
- Alt text on images

## Known Implementation Notes

- **No backend**: All game logic is client-side, no actual betting
- **Audio**: Uses Web Audio API, may require user interaction to start
- **localStorage**: Theme and preferences saved locally
- **Game balance**: Not implemented (display only)
- **Split in Blackjack**: UI exists but simplified implementation
- **Roulette betting**: Not implemented, auto-spin only
- **Poker**: Links to 404 page (not implemented)

## Development Workflow

When adding new features:

1. **New Pages**: Create directory in `/src/app/[page-name]/` with `page.html`, `styles.css`
2. **Shared Styles**: Add to `/src/globals.css` using CSS custom properties
3. **Shared JS**: Add to `/src/js/` and reference in pages
4. **Images**: Place in `/public/` subdirectories
5. **Navigation**: Update header/footer in all relevant pages
6. **Theming**: Use CSS variables for colors, test all 4 themes
7. **Validation**: Follow patterns in `validation.js` for forms
8. **Toast Notifications**: Use `showToast()` pattern from game files

## Common Tasks

### Adding a new game:
1. Create `/src/app/games/[game-name]/` directory
2. Add `[game-name].html`, `[game-name].css`, `[game-name].js`
3. Implement game logic following Blackjack/Roulette patterns
4. Add toast notifications for game events
5. Update catalog page with new game card
6. Add game to sidebar navigation

### Modifying themes:
1. Edit theme variables in `/src/globals.css` (lines 11-49)
2. Test across all pages
3. Verify contrast for accessibility

### Adding validation to a form:
1. Follow pattern in `validation.js`
2. Add blur event listeners for real-time feedback
3. Add submit handler with comprehensive validation
4. Use Bootstrap `.invalid-feedback` for error messages
