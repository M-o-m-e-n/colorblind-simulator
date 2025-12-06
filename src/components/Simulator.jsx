import React, { useRef, useState } from "react";
import Webcam from "./Webcam";
import Daltonize from "./Daltonize";
import { DEFICIENCIES } from "../lib/deficiencies";

export default function Simulator() {
  const [error, setError] = useState(null);
  const [defKey, setDefKey] = useState("protanopia");
  const [enabled, setEnabled] = useState(true);
  const [mix, setMix] = useState(1);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  function handleInit(videoEl) {
    videoRef.current = videoEl;
    setReady(true);
    setError(null);
  }
  function handleError(err) {
    console.error(err);
    setError(err?.message || String(err));
    setReady(false);
  }

  const matrix = (DEFICIENCIES[defKey] || DEFICIENCIES.normal).matrix;

  return (
    <div>
      <div className="grid">
        <div className="preview">
          <Webcam onInit={handleInit} onError={handleError} />
          {ready && videoRef.current ? (
            <Daltonize
              videoRef={videoRef}
              matrix={matrix}
              mix={enabled ? mix : 0}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111",
                borderRadius: 8,
              }}
            >
              {error ? (
                <span className="helper">Camera error: {error}</span>
              ) : (
                "Waiting for camera..."
              )}
            </div>
          )}
        </div>

        <div className="sidebar controls">
          <div className="row">
            <label style={{ minWidth: 80 }}>Deficiency</label>
            <select value={defKey} onChange={(e) => setDefKey(e.target.value)}>
              {Object.entries(DEFICIENCIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label style={{ minWidth: 80 }}>Enable</label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </div>

          <div className="row">
            <label style={{ minWidth: 80 }}>Intensity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mix}
              onChange={(e) => setMix(parseFloat(e.target.value))}
            />
            <span style={{ width: 32, textAlign: "right" }}>
              {Math.round(mix * 100)}%
            </span>
          </div>

          <div className="row">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              Copy Link
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  const canvas = document.createElement("canvas");
                  canvas.width = videoRef.current.videoWidth || 640;
                  canvas.height = videoRef.current.videoHeight || 360;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const url = canvas.toDataURL("image/png");
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "snapshot.png";
                  a.click();
                }
              }}
            >
              Snapshot
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "#9fb3cf" }}>
            Tip: If your browser blocks camera, open site permissions and allow
            camera access.
          </div>
        </div>
      </div>
    </div>
  );
}
