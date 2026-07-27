# NewWorld Study Room

A cozy online study cabin with a photo-textured 3D companion, a focus timer, and peer-to-peer Tip notes.

## MVP features

- Interactive Three.js companion with mouse and touch rotation.
- Switchable cozy and original chibi detective doll styles with toon shading and outlines.
- Local photo validation, center cropping, compression, and persistent texture preview.
- Real WebRTC DataChannel Tip delivery through PeerJS.
- Host invitation links, room snapshots, member presence, reconnect handling, and offline fallback.
- Starry-sky unread Tip indicator that appears only for newly received peer messages.
- Drift-resistant focus timer and configurable study sessions.
- Browser-synthesized public-domain `Für Elise` background music with volume control.
- Responsive cabin UI with WebGL fallback and reduced-motion support.
- Vite production build and GitHub Pages deployment workflow.

## Development

Requirements: Node.js 22 or newer.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/newworld-study-room/`.

Production checks:

```powershell
npm run build
npm run preview
```

## P2P rooms

Opening the app without a `host` query creates a room. Share the generated invitation URL; opening that URL connects the guest to the host through a WebRTC DataChannel.

The default configuration uses PeerJS Cloud for signaling. Copy `.env.example` to `.env.local` to configure a private PeerServer or TURN service. Tip payloads use browser-to-browser connections; the signaling server only brokers connection setup.

## 3D generation scope

The MVP maps an uploaded image onto a procedural 3D doll. It does not reconstruct a complete GLB model from one photo. The image pipeline is isolated so a later server-side AI provider can return generated GLB assets without rewriting the room UI or state flow.

The background music is synthesized at runtime from public-domain melody data. No third-party performance, recording, or sample is bundled with the application.

See [docs/architecture.md](docs/architecture.md) for module boundaries, P2P topology, trust boundaries, and the AI provider integration path.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml` and publish `dist` to GitHub Pages. In the repository settings, set Pages source to **GitHub Actions** once before the first deployment.

Repository: https://github.com/safulou/newworld-study-room
