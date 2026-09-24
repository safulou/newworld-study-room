# NewWorld Study Room

A cozy online study cabin with a photo-textured 3D companion, a focus timer, and peer-to-peer Tip notes.

## Features

- Interactive Three.js companion with mouse and touch rotation.
- Switchable 3D doll and double-sided photo standee modes with a dimensional wooden base.
- Switchable cozy, original chibi detective, and star wizard doll styles with toon shading, outlines, and switchable 3D accessories (retro glasses, golden crown, coffee mug, sleeping kitty).
- Interactive companion tapping with 3D squash-and-stretch bounce animations, procedural facial micro-expressions (natural blinking), triple-click 360° Happy Spin, procedural Web Audio chimes, encouraging speech bubbles, and focus timer pose synchronization.
- Four-phase day/night atmospheric cabin lighting (auto, day, dusk, night) with procedural window raindrop canvas animations.
- Multi-track procedural ambient soundscapes (rain, wind, campfire, tidal brown noise, 10Hz Alpha & 40Hz Gamma binaural beats) with one-click atmosphere presets and master volume control, synthesized via Web Audio API.
- Integrated daily task checklist and focus analytics milestone panel with customizable target Pomodoro goals, progress steppers, HTML5 drag-and-drop & keyboard reordering, 28-day study heatmap with history navigation and 4 theme palettes (Emerald, Amber, Cyber, Ocean), streak tracking, 24-hour hourly flow distribution chart with peak-window detection, plant harvest counts, and Markdown/JSON export.
- Real WebRTC DataChannel Tip delivery, live co-focusing status broadcast, celebration cheers, and quick emoji reactions (💡, 🔥, ☕, ✨, 💯) with animated floating bubbles and harmonic chimes through PeerJS.
- Offline-ready Progressive Web App (PWA) with Service Worker caching and app manifest.
- Local photo validation, center cropping, compression, and persistent texture preview.
- Token-protected invitation links, room snapshots, an eight-member limit, presence, reconnect handling, and Tip rate limits.
- Room-scoped history plus a persistent Tip outbox with acknowledgements and automatic retry.
- A shooting star carries each newly received peer Tip to the unread indicator in the sky.
- Drift-resistant focus timer with complete 4-round Pomodoro workflow (Focus, 5m Short Break, 15m Long Break), round tracking badge (`1/4 🍅`), dynamic browser tab title countdown, and background Web Notifications for focus completion and incoming Tips.
- Fullscreen Zen ambient mode (`Z` shortcut or topbar toggle) with auto-hiding controls, enlarged glowing timer display, and interactive mindfulness tool tray featuring authentic procedurally synthesized Tibetan singing bowl and temple wooden fish strikes with floating sparks and ripple effects.
- Generative procedural Lo-Fi jazz chord progressions synthesized in real time via Web Audio API with vintage lowpass filter and tape flutter LFO.
- Petting & doll mood interaction system: stroke/pet the doll head to trigger joyful squinting expressions, blushing cheeks, gentle body wiggles, purring chimes, floating hearts, procedural 3D study book, and idle sleep `Zzz` bubble.
- Botanical Herbarium and milestone badge collection modal showcasing flower languages, harvest histories, and unlockable achievement ranks.
- ASMR mechanical keyboard and pencil sketching soundscapes with responsive tactile typing sound effects on task and note inputs.
- Timer-driven focus garden with rose, tulip, cactus, succulent, and pine growth stages.
- Browser-synthesized public-domain `Für Elise` background music with volume control.
- Responsive cabin UI with mobile navigation, native sharing, 44 px touch targets, WebGL fallback, and reduced-motion support.
- Optional GLB generation-provider contract and dynamic Three.js GLTF loading.
- Vite, ESLint, Vitest, Playwright, axe, GitHub CI, GitHub Pages, and Cloudflare Pages support.

## Development

Requirements: Node.js 22 or newer.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/newworld-study-room/`.

Production checks:

```powershell
npm run check
npm run test:e2e
```

## P2P rooms

Opening the app without a `host` query creates a room. The invitation contains the host ID and a random token in the URL fragment. Opening it connects the guest to the host through a WebRTC DataChannel. The host relays Tips to at most seven guests.

The default configuration uses PeerJS Cloud for signaling and Cloudflare STUN. Copy `.env.example` to `.env.local` to configure a private PeerServer or the same-origin TURN credentials endpoint. Tip payloads use browser-to-browser connections; signaling only brokers connection setup.

## 3D generation scope

Without `VITE_DOLL_GENERATION_URL`, the app maps an optimized image onto a procedural 3D doll. When a provider endpoint is configured, it may return a direct `modelUrl` or a pollable `statusUrl`; completed GLB assets are loaded dynamically. Provider and storage credentials must remain server-side.

The background music is synthesized at runtime from public-domain melody data. No third-party performance, recording, or sample is bundled with the application.

See [docs/architecture.md](docs/architecture.md) for module boundaries, P2P topology, trust boundaries, and the AI provider integration path.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml` and publish `dist` to GitHub Pages. In the repository settings, set Pages source to **GitHub Actions** once before the first deployment.

For Cloudflare Pages use build command `npm run build`, output directory `dist`, and these variables:

```text
VITE_BASE_PATH=/
VITE_TURN_CREDENTIALS_URL=/api/turn-credentials
TURN_KEY_ID=<server-side secret>
TURN_KEY_API_TOKEN=<server-side secret>
```

`TURN_KEY_ID` and `TURN_KEY_API_TOKEN` are read only by `functions/api/turn-credentials.js`. For local Pages Function development, copy `.dev.vars.example` to `.dev.vars`; never commit `.dev.vars`.

Repository: https://github.com/safulou/newworld-study-room
