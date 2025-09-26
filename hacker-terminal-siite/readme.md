# Hacker Site — 90s Terminal
Single-page static site with matrix rain, CRT vibe, draggable window, fake terminal, command parser, themes.

## Run locally
- Double-click `index.html`, or
- Serve the folder:
  - Python 3: `python -m http.server 8000` then open http://localhost:8000
  - Node http-server: `npx http-server` then open the printed URL

## Deploy
Any static host works (GitHub Pages, Vercel, Netlify, Surge). No backend required.

## Commands
- `help` — list commands
- `clear` — clear terminal
- `trace <ip>` — faux traceroute
- `login <user>` — playful auth success
- `theme <g|a|p>` — switch theme: green, amber, phosphor
- `demo <on|off>` — toggle cinematic loop

## Customize
- Edit boot messages in `js/app.js` (`bootLines` array)
- Change title and HUD text in `index.html`
- Colors/themes in `css/styles.css` under `:root` and `[data-theme]`

## Notes
- Keep assets small; everything is client-side.
- Accessibility: screen-reader label on command input, scanline overlay is non-interactive.
