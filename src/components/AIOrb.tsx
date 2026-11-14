import React, { useEffect, useRef } from 'react';

interface AIOrbProps {
  active?: boolean;
  thinking?: boolean;
  size?: number;
  reduceAnimations?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  active = false,
  thinking = false,
  size = 96,
  reduceAnimations = false,
  onClick,
  ariaLabel = 'Interact with NutriAI Orb',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.34;
      const speed = thinking ? 0.006 : active ? 0.003 : 0.0016;
      const phase = reduceAnimations ? 0 : t * speed;

      // Outer atmospheric glow
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.4, cx, cy, size * 0.49);
      glow.addColorStop(0, thinking ? 'rgba(52, 211, 153, 0.38)' : 'rgba(34, 211, 238, 0.28)');
      glow.addColorStop(0.6, 'rgba(139, 92, 246, 0.14)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.fill();

      // Flowing plasma rings
      for (let ring = 0; ring < 3; ring++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(phase * (ring % 2 === 0 ? 1 : -1.2) + ring * 1.1);
        ctx.strokeStyle =
          ring === 0
            ? 'rgba(34, 211, 238, 0.72)'
            : ring === 1
              ? 'rgba(167, 139, 250, 0.65)'
              : 'rgba(52, 211, 153, 0.65)';
        ctx.lineWidth = thinking ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          baseR * (1.06 + Math.sin(phase + ring) * 0.08),
          baseR * (0.76 + Math.cos(phase + ring) * 0.08),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // Luminous core sphere
      const coreGrad = ctx.createRadialGradient(
        cx - baseR * 0.25,
        cy - baseR * 0.25,
        baseR * 0.1,
        cx,
        cy,
        baseR
      );
      coreGrad.addColorStop(0, '#ecfeff');
      coreGrad.addColorStop(0.35, '#22d3ee');
      coreGrad.addColorStop(0.75, '#7c3aed');
      coreGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * (thinking ? 0.9 + Math.sin(phase * 3) * 0.07 : 0.88), 0, Math.PI * 2);
      ctx.fill();

      if (!reduceAnimations) {
        raf = requestAnimationFrame(draw);
      }
    };

    if (!reduceAnimations) {
      raf = requestAnimationFrame(draw);
    } else {
      draw(0);
    }

    return () => cancelAnimationFrame(raf);
  }, [active, thinking, size, reduceAnimations]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative group inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-cyan-400 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block rounded-full"
      />
    </button>
  );
};
