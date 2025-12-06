# Colorblind Simulator

Colorblind Simulator is a React + Vite demo that samples your webcam in real time, runs the frames through a lightweight WebGL shader, and previews what the world looks like under different color-vision deficiencies. Everything happens locally in the browser; no video frames ever leave your machine.

## Features
- Live preview powered by `navigator.mediaDevices.getUserMedia` and WebGL
- Presets for Normal, Protanopia, Deuteranopia, and Tritanopia (3×3 color matrices)
- Enable toggle plus intensity slider for blending simulated and real colors
- Responsive layout that keeps the preview large on desktops while remaining usable on phones
- Snapshot button that captures the processed frame to `snapshot.png`

## Requirements
- Node.js 18+ (any modern LTS works)
- A browser that supports WebGL and webcam APIs (Chrome, Edge, Firefox, Safari)
- HTTPS when not on `localhost` because some browsers require it for camera access

## Getting Started
```bash
git clone <this repo>
npm install
npm start
# open http://localhost:5173
```

### Available Scripts
- `npm start` – launches Vite dev server with hot module reload
- `npm run build` – produces a production bundle in `dist/`
- `npm run preview` – serves the production build locally for testing

## Project Structure
```
├─ index.html               # Vite entry point
├─ package.json             # dependencies + scripts
├─ src/
│  ├─ main.jsx              # React root
│  ├─ App.jsx               # shell + page layout
│  ├─ styles.css            # responsive styling
│  ├─ components/
│  │   ├─ Simulator.jsx     # UI + state + controls
│  │   ├─ Webcam.jsx        # wraps getUserMedia
│  │   └─ Daltonize.jsx     # WebGL render loop
│  └─ lib/
│      ├─ Daltonizer.js     # minimal WebGL helper
│      └─ deficiencies.js   # 3×3 matrices per deficiency
└─ public/
	└─ favicon.ico
```

## How It Works
1. **Webcam capture** – `Webcam.jsx` requests video via `navigator.mediaDevices.getUserMedia`. The raw `<video>` remains hidden.
2. **WebGL pipeline** – `Daltonizer.js` uploads each frame as a texture, draws a full-screen quad, and applies a fragment shader that multiplies each pixel by the selected 3×3 matrix. `gl.UNPACK_FLIP_Y_WEBGL` keeps the video from appearing upside-down.
3. **Mix control** – The shader blends between the original RGB and simulated RGB using `mix` so you can fade the effect in/out with the slider or checkbox.
4. **Responsive layout** – Flexbox keeps the preview dominant on wide screens, and media queries stack the sidebar beneath the video on smaller devices.

## Controls
- **Deficiency** – dropdown that swaps the active matrix defined in `src/lib/deficiencies.js`.
- **Enable** – toggles whether the simulation matrix participates in the blend.
- **Intensity** – slider (0–100%) that sets the blend factor.
- **Copy Link** – copies the current URL to the clipboard (useful when deployed).
- **Snapshot** – saves the processed frame as `snapshot.png` by drawing the current video to a temporary canvas.

## Supported Color-Vision Conditions
| Condition                    | Primary Confusion            |
| ---------------------------- | ---------------------------- |
| Protanopia / Protanomaly     | Red ↔ Black/Brown/Green      |
| Deuteranopia / Deuteranomaly | Green ↔ Yellow/Red           |
| Tritanopia / Tritanomaly     | Blue ↔ Green & Yellow ↔ Pink |
| Monochromacy                 | All colors ↦ grayscale only  |

> Note: The UI currently ships with the first three presets. Monochromacy can be added by defining another 3×3 matrix in `DEFICIENCIES` that collapses RGB to luminance.

## Privacy Notes
- Camera permission is requested once and only used within the page session.
- Streams are stopped and tracks are closed when the component unmounts.
- No network calls are made with the raw or processed frames.


## Extending the Simulator
1. **Add more deficiencies** – Append to `DEFICIENCIES` with new labels and matrices.
2. **Machado/Brettel LMS shader** – Replace the current 3×3 matrix approach with a more accurate LMS-based algorithm. That change lives entirely in `Daltonizer.js`.
3. **Multiple viewports** – Render additional canvases side-by-side, each with a different matrix, for comparison mode.
4. **Recording** – Combine the canvas stream with `MediaRecorder` to capture short clips.

## Deployment
Run `npm run build`, then serve the `dist/` directory using any static host (Netlify, Vercel, GitHub Pages, etc.). Remember to enable HTTPS so webcams work across devices.

---

Have ideas for improvements—additional shaders, accessibility overlays, or UI tweaks? Open an issue or submit a PR!
