import React, { useEffect, useRef } from "react";

export default function Webcam({
  constraints = { video: { facingMode: "environment" } },
  onInit,
  onError,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let stream = null;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          onInit && onInit(videoRef.current);
        }
      } catch (err) {
        onError && onError(err);
      }
    }
    start();
    return () => {
      mounted = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [JSON.stringify(constraints)]);

  return <video ref={videoRef} style={{ display: "none" }} playsInline muted />;
}
