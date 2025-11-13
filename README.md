# html-igaming — iGaming Front-End Prototype by Yandex Gophers
**Project created by the Yandex Gophers team!**  
A fully self-contained, responsive, and interactive iGaming web template built with **pure HTML, CSS, and vanilla JavaScript** — no frameworks, no build tools, no backend required.  
Perfect for rapid prototyping of online casino interfaces, slot games, betting lobbies, or promotional landing pages.
---
## 🌟 Features
- **Fully Responsive Design** – Works seamlessly on mobile, tablet, and desktop
- **Interactive Slot Machine** – Click-to-spin reels with smooth animations and sound effects
- **Mock User Wallet** – Real-time balance updates on wins/losses
- **Game Lobby Grid** – Browse featured games with hover effects
- **Dark/Light Mode Toggle** – Instant theme switching
- **Animated UI Elements** – Spinners, confetti on win, coin counters
- **Touch-Optimized Controls** – Swipe & tap support for mobile
- **Zero Dependencies** – No npm, React, Vue, or jQuery
- **Fast Loading** – Optimized assets, minimal JS, semantic HTML
---
## 🚀 Getting Started
### 1. Clone the Repository

🛠️ Customization Guide
Change Starting Balance

Edit in js/app.js:

let balance = 1000; // ← Modify this value

Add New Games to Lobby

Edit index.html inside .game-grid:


Replace Sounds
Place new .mp3 files in assets/sounds/ and update paths in js/sound.js.
🎨 Design & UX

Typography: Google Fonts (Inter or system stack)

Color Palette:

Primary: #6C5CE7 (vibrant purple)

Success: #00B894 (win green)

Background: #1A1A2E (dark) / #FAFAFA (light)

Animations: CSS keyframes for reel spin, coin burst, button pulse

Accessibility: ARIA labels, focus states, high contrast mode support



```bash
git clone https://github.com/jokeoa/html-igaming.git
cd html-igaming
# Just double-click index.html or use:
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux

html-igaming/
├── index.html                # Main page (game lobby + slot demo)
├── css/
│   └── style.css             # Global styles, animations, responsive rules
├── js/
│   ├── app.js                # Core logic: spin, wallet, theme toggle
│   └── sound.js              # Audio control (optional mute)
├── assets/
│   ├── images/               # Game thumbnails, backgrounds, icons
│   ├── icons/                # SVG icons (wallet, spin, settings)
│   └── sounds/               # Click, win, spin sound effects (MP3)
└── README.md                 # This file
```
🔧 Tech Stack
Layer	Technology
Markup	HTML5
Styling	CSS3 (Flexbox, Grid)
Logic	Vanilla JavaScript
Audio	HTML5 <audio>
Storage	localStorage

🎮 How to Play (Demo)

Open index.html

Click Spin to start the slot machine

Watch reels animate and stop randomly

Win credits on matching symbols

Balance updates in real-time

Toggle dark mode via the 🌙 icon

Mute/unmute sound with 🔊
All interactions are client-side. Data is stored in localStorage during the session


💡 Inspiration & Use Cases

Casino promo sites
Game studio pitch decks
Frontend developer portfolios
Hackathon projects
Educational demos (HTML/CSS/JS)


👥 About Yandex Gophers
Yandex Gophers is a passionate team of developers exploring modern web technologies, performance, and user experience. We love building fast, beautiful, and functional prototypes.
"Code like a gopher — dig deep, build fast, stay underground." 🦔
