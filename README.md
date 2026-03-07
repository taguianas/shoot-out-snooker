# Shoot Out Snooker: Referee Assistant

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://shoot-out-snooker.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Volunteering](https://img.shields.io/badge/FFBillard-Volunteering-00ff88?style=for-the-badge)](https://www.ffbillard.fr)

> A professional, real-time referee tool for the **Shoot Out** snooker format, built as part of a volunteering initiative with **FFBillard** club.

### Live Demo

**[shoot-out-snooker.vercel.app](https://shoot-out-snooker.vercel.app)**

## About

This application was designed and developed as a volunteer contribution to support the **FFBillard** club in organizing and refereeing Shoot Out snooker tournaments. It replaces manual scorekeeping with a precise, real-time digital assistant that enforces official Shoot Out rules automatically, allowing referees to focus entirely on the game.

**Author:** Anas TAGUI

**Context:** Volunteering work with FFBillard Club

## What is Shoot Out Snooker?

Shoot Out is a fast-paced, single-frame snooker format played under strict time constraints:

- **Total match duration:** 10 minutes on a central clock
- **Shot clock:** 15 seconds per shot for the first 5 minutes, automatically reducing to **10 seconds** after the halfway mark
- **Max break potential:** 147, the classic sequence of 15 reds each followed by a color, then the final colors (Yellow, Green, Brown, Blue, Pink, Black)
- If time expires before all balls are potted, the player with the **highest score wins**

## Features

### Real-Time Scoring Engine
- Bulletproof atomic state management with zero double-counting, resilient to rapid inputs
- Full support for the 15-red, free-choice color, locked final sequence (Yellow to Black) progression
- Live score display with animated transitions for both players

### Intelligent Shot Clock
- SVG circular progress ring that counts down in real time
- Color shifts from **Cyan, Amber (10s or less), Red (5s or less)** with a glowing pulse animation on critical time
- Automatic reset after every shot or player switch
- On auto-expire: the foul is declared automatically and play switches to the opponent

### Match Timer
- Full 10-minute countdown displayed in the header
- **Audible double-beep alert** at 5 minutes remaining: shot clock drops to 10s with an animated banner notification
- Second audible alert at 2 minutes remaining
- Match ends automatically when the clock reaches zero

### Professional Toolkit
- **Foul System:** Select from a list of official foul types; penalty calculated automatically (min 4 pts). Selecting "Hit Color (not Red)" opens a ball picker — tap the color that was struck and the exact penalty (e.g. +6 for Pink, +7 for Black) is applied instantly
- **Miss / Pass:** Switches play to the opponent and resets the shot clock
- **Switch Player:** Manually transfers play to the other player, resets and auto-resumes the 15-second shot clock
- **Pause / Resume:** Freezes only the shot clock — the 10-minute match timer always keeps running and can only be reset via Restart

### Match Log
- Collapsible in-game history panel listing every pot, foul, and miss with player names and point values
- Individual entries can be deleted with a single tap, or the entire log cleared at once

### Match Statistics
- End-of-match overlay with winner announcement, final scores, pot count, foul count, and top run for each player

### Light & Dark Mode
- Toggle between a deep-black glassmorphism dark theme and a clean light theme using the sun/moon button in the header
- Light mode is the default; all accent colors, borders, and backgrounds adapt automatically

### Elite UI
- Glassmorphism panels with `backdrop-filter` frosted glass effect
- 3D snooker balls rendered with multi-stop radial gradients and specular highlights
- Animated phase indicator (dots) during the final color sequence
- Fully responsive, optimized for phone and tablet use at the table

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Animations | Framer Motion |
| Audio | Web Audio API (procedural beeps, no audio files needed) |
| Styling | CSS-in-JS (inline styles + CSS keyframes in HTML) |
| Fonts | Inter + Rajdhani (Google Fonts) |
| Build Tool | Create React App |

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/taguianas/shoot-out-snooker.git
cd shoot-out-snooker

# Install dependencies
npm install

# Start the development server
npm start
```

The app runs on **http://localhost:3002** (port configured in `.env`).

### Production Build

```bash
npm run build
```

Outputs a production-ready bundle to the `build/` folder, ready to be served from any static host.

## Usage

1. **Setup:** Enter both player names on the start screen, then tap **Begin Match**
2. **Scoring:** Tap a lit ball to register a pot; the shot clock resets automatically
3. **Fouls:** Tap **Foul** → choose the foul type; for "Hit Color (not Red)" pick the exact ball struck to set the correct penalty
4. **Miss:** Tap **Miss** to pass play to the opponent without scoring
5. **Switch:** Tap **Switch** to manually transfer play; the shot clock restarts and resumes immediately
6. **Pause / Resume:** Freezes only the shot clock — the 10-minute timer is unaffected
7. **Match Log:** Tap **Match Log** in the controls row to view, delete, or clear the action history
8. **Theme:** Tap the sun/moon icon in the header to toggle between light and dark mode

## Project Structure

```
src/
├── App.js            # Full application: UI components + game logic
├── AudioManager.js   # Web Audio API wrapper for beeps and alerts
├── index.js          # React entry point
└── index.css         # Base body reset styles

public/
├── index.html        # HTML template with Google Fonts and CSS keyframes
└── manifest.json     # PWA manifest
```

## License

This project was created for non-commercial, voluntary use in support of the FFBillard club's snooker tournament activities.

*Built with care by **Anas TAGUI** as part of a volunteering commitment to the FFBillard snooker community.*
