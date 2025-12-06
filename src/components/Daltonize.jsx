import React, { useEffect, useRef } from "react";
import Daltonizer from "../lib/Daltonizer";

export default function Daltonize({
  videoRef,
  matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1],
  mix = 1,
}) {
  const canvasRef = useRef(null);
  const dalRef = useRef(null);
  const rafRef = useRef(null);
  const matrixRef = useRef(matrix);
  const mixRef = useRef(mix);

  useEffect(() => {
    matrixRef.current = matrix;
  }, [matrix]);

  useEffect(() => {
    mixRef.current = mix;
  }, [mix]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const dal = new Daltonizer(canvasRef.current);
    dalRef.current = dal;
    function frame() {
      const v = videoRef?.current;
      if (v && v.readyState >= 2) {
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (w && h) dal.updateSize(w, h);
        dal.updateVideoFrame(v);
        dal.render({ matrix: matrixRef.current, mix: mixRef.current });
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      dal.destroy();
    };
  }, [videoRef]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}
