# newworld-study-room

NewWorld Study Room is an early MVP for a cozy online study room: a small wooden cabin, a photo-to-3D companion doll flow, a local P2P-style Tip note wall, a focus timer, and a shareable room invitation.

## MVP scope

- Small wooden cabin study room built as a static HTML/CSS scene.
- Upload a favorite doll or character photo and map it onto an interactive Three.js companion.
- Drag the companion with a mouse or finger to inspect the 3D model.
- P2P Tip note wall prototype using local state.
- Focus timer with configurable session length.
- Invite link UI and room naming.
- Static deployment friendly: no build step required.

## Run locally

Open `index.html` in a browser.

For a local server:

```powershell
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Roadmap

1. Replace local Tip state with WebRTC room presence and peer-to-peer note sync.
2. Add persistent room sessions and focus history.
3. Move uploaded toy or character photos to object storage with upload progress, processing status, and deletion.
4. Replace the photo-textured preview with an AI image-to-3D pipeline and downloadable GLB assets.
5. Add authentication, moderation, and room privacy controls.

## Repository

GitHub: https://github.com/safulou/newworld-study-room
