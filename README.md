# NewWorld Study Room

A cozy online study cabin with a photo-textured 3D companion, a focus timer, and peer-to-peer Tip notes.

## Features

- Interactive Three.js companion with mouse and touch rotation.
- Switchable 3D doll and double-sided photo standee modes with a dimensional wooden base.
- Switchable cozy and original chibi detective doll styles with toon shading and outlines.
- Local photo validation, center cropping, compression, and persistent texture preview.
- Real WebRTC DataChannel Tip delivery through PeerJS.
- Token-protected invitation links, room snapshots, an eight-member limit, presence, reconnect handling, and Tip rate limits.
- Room-scoped history plus a persistent Tip outbox with acknowledgements and automatic retry.
- A shooting star carries each newly received peer Tip to the unread indicator in the sky.
- Drift-resistant focus timer and configurable study sessions.
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
