# NewWorld Study Room

A cozy online study cabin with a photo-textured 3D companion, a focus timer, and peer-to-peer Tip notes.

## Features

- Interactive Three.js companion with mouse and touch rotation, natural 3D head tracking eye contact (yaw ±18°, pitch ±10° smooth lerp) following cursor movements, dynamic sparkling gaze catchlights, and procedural facial micro-expressions with realistic double-blinking.
- Switchable 3D doll and double-sided photo standee modes with a dimensional wooden base.
- Switchable cozy, original chibi detective, and star wizard doll styles with toon shading, outlines, and switchable 3D accessories (retro glasses, golden crown, coffee mug, sleeping kitty).
- Interactive companion tapping with 3D squash-and-stretch bounce animations, procedural facial micro-expressions (natural blinking and gaze shift), triple-click 360° Happy Spin, procedural Web Audio chimes, encouraging speech bubbles, and focus timer pose synchronization (studious desk-reading posture with rhythmic writing pencil during focus, relaxed upward stretch breathing during breaks).
- Four-phase day/night atmospheric cabin lighting (auto, day, dusk, night) with dynamic hearth fireplace flicker glow, multi-mode weather particle canvas engine (rain, gentle snow, autumn leaves, celestial dust), dedicated manual weather scene switcher console (settings select, `#ambientWeatherRow` chips, and interactive cabin window cycling), interactive touch/cursor wind breeze simulation, and particle density modes.
- Focus Flow Sprint Presets: 4 golden rhythm templates (Classic 25/5/15m, Deep 50/10/20m, Sprint 15/3/10m, Ultradian 90/20/30m) with one-click rhythm switching and encouraging companion speech bubbles.
- Distraction & Interruption Parking Lot (`#btnQuickDistraction`, hotkey `I`): instant non-blocking capture modal for fleeting thoughts and interruptions, persistent store management, and one-click conversion to checklist tasks.
- Task Markdown Batch Importer & Flow Forecast HUD: batch task importer supporting bullet points (`-`, `*`, `1.`), checkboxes (`- [ ]`), and Pomodoro estimates (`(3)`, `[2]`, `🍅 4`), real-time flow forecast badge (`預計 6 🍅 · 約 2.5 小時`), and one-click clear completed tasks.
- Pre-Focus Flow Grounding Ritual Modal (`#btnFlowPrep`, `#flowPrepModal`): pre-flight focus calibration dialog featuring single intention locking, a guided 3-breath grounding sequence (4s inhale, 2s hold, 4s exhale with dynamic scaling ring and acoustic chime cues), companion doll bounce & speech cheer, and seamless focus timer ignition.
- Multi-track procedural ambient soundscapes with smooth acoustic crossfade engine (0.8s fade-in, 0.8s fade-out, seamless preset transitions), spatial 3D stereo panner (`StereoPannerNode` on every track), one-click "🪵 3D 木屋" realistic cabin audio staging and "🎯 全居中" reset, one-click atmosphere presets, master volume control, dynamic individual track volume and pan mixing sliders (`🎚️ 獨立軌道混音`), custom presets system (save, apply, and delete your own soundscape mixes with spatial pans ⭐), scientific brainwave entrainment engine with Theta (6Hz 冥想), Alpha (10Hz 心流), and Gamma (40Hz 敏捷) binaural beats with live frequency fine-tuner sliders (`.mixer-binaural-row`, 1~45Hz) and brainwave band indicators (Delta 💤, Theta 🌙, Alpha ✨, Beta ⚡, Gamma 💥), new "🌙 禪修冥想" (Zen Meditation) soundscape preset, and zero-server soundscape preset sharing codes (`sc_...`) with one-click clipboard link copying (`.preset-share-btn`), manual import modal (`#btnImportSoundscape`), and automatic URL `#soundscape=` hash detection.
- Single-task focus intention anchor bar (`#focusIntentionBar`) and Zen Mode HUD display (`#zenFocusIntention`), supporting quick inline editing, one-click syncing from active task checklist, and persistent memory.
- Dynamic Ocean Wave Tide LFO & Pink Noise Synthesizer: Procedural 1/f spectral slope pink noise generator via Paul Kellet filter algorithm (`pink_noise`) and natural ocean wave tide synthesizer with 0.08Hz ultra-low frequency sine LFO modulated BiquadFilter (150Hz ~ 660Hz swell) and gain breathing (`ocean_waves`), new "🌊 潮汐漫步" (Ocean Tide) soundscape preset, and 3D spatial panning scenarios.
- Remote Companion ASMR Micro-interactions: P2P ceramic/glass resonant harmonic ping cup clink (`#btnPeerClink`, 🥂) and warm wooden table double-knock transient (`#btnPeerKnock`, 🪵) with real-time WebRTC DataChannel broadcast, floating reaction bubbles, and zen spark feedback.
- Flow Autopilot & Gentle Wind-down Crystal Chimes: Toggleable automatic flow cruise (`#flowAutopilot`) advancing and starting subsequent sessions upon timer completion, plus gentle 3-minute and 1-minute countdown warning crystal chimes (`CompanionSoundManager.playWindDownChime()`, `#windDownAlert`).
- Zero-Server Cross-Device P2P Mirroring & Migration: Zero-server offline JSON/Base64 backup code package export/import, plus live in-room P2P aerial DataChannel syncing to mirror profile settings, task checklists, and historical analytics milestones across devices with 100% privacy and zero external server retention.
- Pure Client-Side Canvas QR Code Generator (`#qrModal`): zero-dependency ISO/IEC 18004 Model 2 generator rendering directly to HTML5 Canvas at 2x Retina resolution with Reed-Solomon GF(256) error correction, accessible from room invite (`#btnShowInviteQr`) and migration modal (`#btnShowMigrationQr`) with one-click PNG image download (`#btnDownloadQr`) and direct clipboard copying (`#btnCopyQrImage`).
- Focus Flow Polaroid Poster Generator: pure client-side 2x Retina canvas rendering of shareable milestone cards displaying daily focused minutes, streak days, total hours, domain tags, botanical art & flower language, and companion quotes, featuring 5 customizable atmosphere themes (Midnight Cabin, Aurora Dawn, Amber Sunset, Forest Glade, Cyber Neon) with live preview chips, HD PNG download, and instant clipboard copying.
- Soundscape Polaroid Share Card & Acoustic Art Generator (`FocusPosterGenerator.generateSoundscapeCard`, `#btnShareActiveSoundscapePoster`, `.preset-poster-btn`): Pure client-side 2x Retina canvas card generator rendering audio waveform spectrum bars, active track mixes with stereo pan tags, master EQ (Bass/Mid/Treble) and reverb specs, embedded QR code from `qr-generator.js`, and 5 atmosphere themes with instant PNG download and clipboard copy.
- Real-Time P2P Soundscape Live Broadcast & Cabin Ensemble (`#btnBroadcastSoundscape`, `#p2pSoundscapeSyncRow`, `#syncWithHostSoundscape`): Real-time WebRTC DataChannel soundscape synchronization protocol (`soundscape-sync`), enabling cabin hosts to broadcast ambient multi-track mixes, 3D spatial pans, master EQ, and reverb settings in real time, and guests to automatically synchronize or tune in via interactive notifications with zero external audio streaming bandwidth.
- Acoustic Flow Ducking & Timer Resonant Pulse Engine (`#audioDuckingOnPause`, `.timer.paused`, `.timer.final-stretch`): Gentle Web Audio linear ramp ducking (decay to 25% on timer pause, smooth restoration on resume) for ambient soundscapes and Lo-Fi jazz music, accompanied by an amber breathing glow on paused timer states and a golden resonant energy pulse in the final 60 seconds of focus.
- Ambient Acoustic Master Reverb & 3-Band Parametric EQ Console (`#btnToggleAcousticFX`, `#acousticFxPanel`): studio-grade procedural acoustics engine with algorithmic stereo Convolver impulse responses (Cabin 🪵, Library 📚, Cathedral ⛪, and Clean Bypass ⚡) synthesized entirely at runtime via Web Audio exponential decay envelopes, paired with a master 3-band parametric EQ (Low-shelf 200Hz, Peaking mid 1000Hz, High-shelf 3200Hz) and live wet/dry mix controls.
- Soundscape Share Protocol 2.0 with Master Acoustics & Reverb: Extended zero-server soundscape preset sharing format (`sc_...`) and custom preset storage with full master acoustic persistence (EQ & Reverb), 2 new acoustic study presets ("⛪ 大教堂自習室" Cathedral Study & "❄️ 暴風雪木屋" Blizzard Cabin), and seamless backward-compatible URL hash detection and manual import.
- Flow Momentum Gauge & Adaptive Break Coach: Real-time focus momentum tracking badge (`#flowMomentumBadge`) calculating a weighted daily momentum score (0~100%) and tiers (🌊 深度超頻, 🔥 巔峰心流, ⚡ 穩步爬升, 🌱 初入狀態, ☕ 蓄勢待發) based on total focus duration, session consistency, and flow quality, paired with an adaptive post-focus smart break recommendation engine (`#smartBreakSuggestion`) in the reflection prompt offering dynamic break intervals and one-click rhythm adoption (`#btnApplySmartBreak`).
- Companion Affinity Level & Bonding Milestones System (`#btnCompanionAffinity`, `#affinityModal`): 10 bonding growth tiers (Lv.1 初識書伴 to Lv.10 靈魂旅伴) celebrating shared focus progress with animated milestone fanfare, celebration speech bubbles, and unlockable procedural 3D WebGL flow resonance auras (🍵 溫潤微光 Lv.3+, ✨ 星光共振 Lv.5+, 🌟 極光流彩 Lv.7+, 👑 神聖日冕 Lv.10+) with subtle breathing rotations and live aura selector chips in the bonding modal.
- Multi-Dimensional Flow Timeline Filter & Scoped Review Exporter (`#timelineFilterBar`): interactive session timeline filtering by temporal scope (Today, Week, Month, All) and qualitative flow depth (All, 🔥 Flow, ✨ Steady, 🌱 Warmup) with dynamic count & flow-rate summary badges, single-session deletion audit, and scoped Markdown report exporting (`#btnExportWeeklyReport`) formatting custom-interval focus reviews with domain icons.
- Integrated daily task checklist and focus analytics milestone panel with customizable target Pomodoro goals, progress steppers, real-time Pomodoro budget progress bar (`.task-pomo-bar-wrapper`) with glowing target-met state, companion celebration feedback (harmonic singing bowl, zen spark bubbles, and cheering companion quotes upon task completion), HTML5 drag-and-drop & keyboard reordering, 28-day study heatmap with history navigation and 4 theme palettes (Emerald, Amber, Cyber, Ocean), streak tracking, weekly flow trend analytics HUD (`#weeklyTrendCard`) tracking week-over-week growth and flow rates, 24-hour hourly flow distribution chart with peak-window detection, focus domain breakdown analytics (💻 Dev, 📚 Read, ✍️ Write, 🎨 Design, 🧠 Review), today's focus session timeline with single-session deletion audit, interactive retroactive flow rating toggles (🔥 深度心流, ✨ 穩定推進, 🌱 漸入佳境), session notes, plant harvest counts, and one-click Executive Markdown Weekly Flow Report (`#btnExportWeeklyReport`) & JSON export.
- Real WebRTC DataChannel Tip delivery, live co-focusing presence broadcasting partner focus intentions, current window weather, and flow sprint templates, synchronized host-timer flow broadcast (`🔗 房主同步`), celebration cheers, and quick emoji reactions (💡, 🔥, ☕, ✨, 💯) with animated floating bubbles and harmonic chimes through PeerJS.
- Offline-ready Progressive Web App (PWA) with Service Worker caching and app manifest.
- Local photo validation, center cropping, compression, and persistent texture preview.
- Token-protected invitation links, room snapshots, an eight-member limit, presence, reconnect handling, and Tip rate limits.
- Room-scoped history plus a persistent Tip outbox with acknowledgements and automatic retry.
- A shooting star carries each newly received peer Tip to the unread indicator in the sky.
- Drift-resistant focus timer with complete 4-round Pomodoro workflow (Focus, configurable Short Break 1~~30m, Long Break 5~~60m), post-focus instant flow reflection prompt bar (`#flowReflectionPrompt`) for quick one-click state logging, customizable completion chime (Fanfare, Tibetan Singing Bowl, Zen Wooden Fish, Celestial Wind Chimes), round tracking badge (`1/4 🍅`), dynamic browser tab title countdown, and background Web Notifications for focus completion and incoming Tips.
- Fullscreen Zen ambient mode (`Z` shortcut or topbar toggle) with auto-hiding controls, enlarged glowing timer display, interactive mindfulness tool tray featuring procedurally synthesized Tibetan singing bowl, temple wooden fish, and Mindful Breathing Coach (`3` shortcut or tray button) supporting Box Breathing (4-4-4-4), Relaxing Breath (4-7-8), and Awakening Breath (4-2-4-2) with glowing animated halo circle and procedural binaural sound cues.
- Universal keyboard shortcuts HUD modal (`?` key or topbar keyboard button) with frosted-glass cheat sheet and hotkeys (`Space` play/pause, `R` reset, `M` music, `A` ambient mixer, `Z` Zen mode, `1` wooden fish, `2` singing bowl, `3` breathing coach, `T`/`S` jump to tasks/stats).
- Focus category tags & breakdown analytics: 5 domain pills above the timer (💻 開發 Dev, 📚 閱讀 Read, ✍️ 寫作 Write, 🎨 設計 Design, 🧠 複習 Review), recording session domain, and rendering category flow distribution progress bars in the stats panel.
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
