"use client";

import { useEffect, useRef } from "react";

/*
 * Flowing copper-silk waves, drawn back to front as layered sine sums.
 * Each layer: y = baseY + A1*sin(k1*x + t*s1) + A2*sin(k2*x + t*s2 + phase),
 * filled to the bottom with a vertical gradient. Speeds differ per layer
 * for parallax drift. Pauses when off-screen or tab hidden; renders a
 * single static frame under prefers-reduced-motion.
 */

const LAYERS = [
  { baseY: 0.5, amp: 26, amp2: 12, k: 0.0062, k2: 0.011, speed: 0.00022, speed2: -0.00016, from: "#F7E9D4", to: "#F0D6B0" },
  { baseY: 0.58, amp: 30, amp2: 14, k: 0.0054, k2: 0.0092, speed: 0.00028, speed2: -0.0002, from: "#F1D4AA", to: "#E5B67B" },
  { baseY: 0.66, amp: 34, amp2: 16, k: 0.0048, k2: 0.0082, speed: 0.00034, speed2: -0.00024, from: "#E3AA6A", to: "#CA8040" },
  { baseY: 0.74, amp: 38, amp2: 18, k: 0.0042, k2: 0.0074, speed: 0.0004, speed2: -0.00028, from: "#BA6C2F", to: "#8C4C20" },
] as const;

export function HeroWaves({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const maybeCanvas = canvasRef.current;
    if (!maybeCanvas) return;
    const canvas: HTMLCanvasElement = maybeCanvas;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#FFFFFF");
      sky.addColorStop(0.55, "#FDF8EF");
      sky.addColorStop(1, "#F9EDDB");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const scale = height / 900;
      for (const layer of LAYERS) {
        const baseY = height * layer.baseY;
        const amp = layer.amp * scale;
        const amp2 = layer.amp2 * scale;
        ctx.beginPath();
        for (let x = -16; x <= width + 16; x += 8) {
          const y =
            baseY +
            amp * Math.sin(layer.k * x + t * layer.speed) +
            amp2 * Math.sin(layer.k2 * x + t * layer.speed2 + 1.7);
          if (x === -16) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width + 16, height + 16);
        ctx.lineTo(-16, height + 16);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, baseY - amp - amp2, 0, height);
        grad.addColorStop(0, layer.from);
        grad.addColorStop(1, layer.to);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    function loop(now: number) {
      draw(now);
      if (running) raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (!running && visible && !reduce) {
        running = true;
        raf = window.requestAnimationFrame(loop);
      }
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) draw(0);
    else start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
