import React, { useEffect, useRef } from 'react';

interface SpaceBackgroundProps {
  reduceAnimations: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface FruitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: 'apple' | 'leaf' | 'citrus' | 'berry' | 'seed';
  size: number;
  angle: number;
  spin: number;
  alpha: number;
}

/**
 * High-performance animated outer-space canvas:
 * - Animated nebula clouds & light beams
 * - 1,100+ twinkling multi-depth stars with smooth parallax
 * - Rotating stylized fruit & vegetable planets
 * - Floating fruit & vegetable micro-particles & space dust
 * - Shooting stars
 * - Respects reduceAnimations & OS prefers-reduced-motion
 */
export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ reduceAnimations }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = !reduceAnimations && !prefersReduced;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let rafId = 0;
    let frameCount = 0;

    const isMobile = width < 768;
    const starCount = isMobile ? 550 : 1200;
    const starColors = ['#e2e8f0', '#a5f3fc', '#c4b5fd', '#6ee7b7', '#bae6fd'];

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.2 + Math.random() * 0.9,
      r: 0.45 + Math.random() * 1.45,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.012 + Math.random() * 0.03,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    const dust = Array.from({ length: isMobile ? 35 : 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.08 - Math.random() * 0.16,
      r: 0.6 + Math.random() * 1.5,
      alpha: 0.12 + Math.random() * 0.22,
    }));

    const kinds: FruitParticle['kind'][] = ['apple', 'leaf', 'citrus', 'berry', 'seed'];
    const particles: FruitParticle[] = Array.from({ length: isMobile ? 10 : 18 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.12 - Math.random() * 0.16,
      kind: kinds[i % kinds.length],
      size: 6 + Math.random() * 6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.012,
      alpha: 0.18 + Math.random() * 0.22,
    }));

    const shootingStars: ShootingStar[] = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / Math.max(1, width) - 0.5) * 2;
      targetMouseY = (e.clientY / Math.max(1, height) - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const drawNebula = (t: number) => {
      const driftX = Math.sin(t * 0.00035) * 45;
      const driftY = Math.cos(t * 0.00028) * 35;

      // Deep space base
      ctx.fillStyle = '#040712';
      ctx.fillRect(0, 0, width, height);

      // Cyan / Blue galaxy cloud
      const g1 = ctx.createRadialGradient(
        width * 0.22 + driftX,
        height * 0.24 + driftY,
        20,
        width * 0.22 + driftX,
        height * 0.24 + driftY,
        Math.max(width, height) * 0.52
      );
      g1.addColorStop(0, 'rgba(6, 182, 212, 0.14)');
      g1.addColorStop(0.45, 'rgba(37, 99, 235, 0.07)');
      g1.addColorStop(1, 'rgba(4, 7, 18, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Violet / Purple nebula
      const g2 = ctx.createRadialGradient(
        width * 0.8 - driftX * 0.8,
        height * 0.65 - driftY * 0.8,
        20,
        width * 0.8 - driftX * 0.8,
        height * 0.65 - driftY * 0.8,
        Math.max(width, height) * 0.5
      );
      g2.addColorStop(0, 'rgba(139, 92, 246, 0.14)');
      g2.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      g2.addColorStop(1, 'rgba(4, 7, 18, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // Emerald bio-nebula
      const g3 = ctx.createRadialGradient(
        width * 0.5 + driftY,
        height * 0.85 - driftX * 0.5,
        10,
        width * 0.5 + driftY,
        height * 0.85 - driftX * 0.5,
        Math.max(width, height) * 0.38
      );
      g3.addColorStop(0, 'rgba(16, 185, 129, 0.10)');
      g3.addColorStop(1, 'rgba(4, 7, 18, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, width, height);

      // Subtle animated light beams
      ctx.save();
      ctx.globalAlpha = 0.045;
      const beamGrad = ctx.createLinearGradient(0, 0, width, height);
      beamGrad.addColorStop(0, '#22d3ee');
      beamGrad.addColorStop(0.5, '#a78bfa');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.15 + driftX, 0);
      ctx.lineTo(width * 0.35 + driftX, 0);
      ctx.lineTo(width * 0.85, height);
      ctx.lineTo(width * 0.65, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawProducePlanet = (
      cx: number,
      cy: number,
      radius: number,
      rot: number,
      theme: 'apple' | 'avocado' | 'citrus' | 'berry'
    ) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Atmospheric halo
      const haloColor =
        theme === 'apple'
          ? 'rgba(34, 211, 238, 0.14)'
          : theme === 'avocado'
            ? 'rgba(52, 211, 153, 0.16)'
            : theme === 'citrus'
              ? 'rgba(251, 191, 36, 0.12)'
              : 'rgba(167, 139, 250, 0.15)';
      const halo = ctx.createRadialGradient(0, 0, radius * 0.75, 0, 0, radius * 1.55);
      halo.addColorStop(0, haloColor);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // Planet sphere
      const sphere = ctx.createRadialGradient(
        -radius * 0.35,
        -radius * 0.35,
        radius * 0.15,
        0,
        0,
        radius
      );
      if (theme === 'apple') {
        sphere.addColorStop(0, '#fb7185');
        sphere.addColorStop(0.55, '#e11d48');
        sphere.addColorStop(1, '#1e1b4b');
      } else if (theme === 'avocado') {
        sphere.addColorStop(0, '#6ee7b7');
        sphere.addColorStop(0.55, '#059669');
        sphere.addColorStop(1, '#062c2b');
      } else if (theme === 'citrus') {
        sphere.addColorStop(0, '#fde68a');
        sphere.addColorStop(0.55, '#f59e0b');
        sphere.addColorStop(1, '#3b1d0a');
      } else {
        sphere.addColorStop(0, '#c4b5fd');
        sphere.addColorStop(0.55, '#7c3aed');
        sphere.addColorStop(1, '#1e1038');
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      // Rotating organic bands / citrus segments / botanical craters
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.rotate(rot);

      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1.5;
      if (theme === 'citrus') {
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos((i * Math.PI) / 3) * radius, Math.sin((i * Math.PI) / 3) * radius);
          ctx.stroke();
        }
      } else if (theme === 'avocado') {
        // Botanical seed core
        ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
        ctx.beginPath();
        ctx.arc(radius * 0.15, radius * 0.1, radius * 0.34, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Latitude atmosphere bands
        for (let y = -radius * 0.6; y <= radius * 0.6; y += radius * 0.35) {
          ctx.beginPath();
          ctx.ellipse(0, y, radius, radius * 0.14, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Leaf crown on Apple/Avocado planet
      if (theme === 'apple' || theme === 'avocado') {
        ctx.save();
        ctx.rotate(Math.sin(rot) * 0.12);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(radius * 0.18, -radius * 1.06, radius * 0.32, radius * 0.14, -0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Planetary rings on avocado & berry planets
      if (theme === 'avocado' || theme === 'berry') {
        ctx.save();
        ctx.rotate(-0.32);
        ctx.strokeStyle =
          theme === 'avocado' ? 'rgba(34, 211, 238, 0.35)' : 'rgba(196, 181, 253, 0.32)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.75, radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    const drawParticle = (p: FruitParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;

      if (p.kind === 'leaf') {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'citrus') {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'apple') {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'berry') {
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.48, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.55, p.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const render = (time: number) => {
      frameCount++;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      drawNebula(shouldAnimate ? time : 0);

      // Stars with parallax + twinkling
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const px = (s.x + mouseX * s.z * 26 + width) % width;
        const py = (s.y + mouseY * s.z * 26 + height) % height;
        const twinkle = shouldAnimate
          ? 0.4 + 0.6 * Math.sin(s.twinklePhase + frameCount * s.twinkleSpeed)
          : 0.75;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Rotating Fruit & Vegetable Planets (with subtle parallax)
      const rotBase = shouldAnimate ? time * 0.00025 : 0.4;
      drawProducePlanet(
        width * 0.86 - mouseX * 18,
        height * 0.19 - mouseY * 18,
        isMobile ? 28 : 44,
        rotBase,
        'avocado'
      );
      drawProducePlanet(
        width * 0.14 - mouseX * 12,
        height * 0.78 - mouseY * 12,
        isMobile ? 22 : 34,
        -rotBase * 1.3,
        'apple'
      );
      if (!isMobile) {
        drawProducePlanet(
          width * 0.91 - mouseX * 10,
          height * 0.81 - mouseY * 10,
          24,
          rotBase * 0.9,
          'citrus'
        );
        drawProducePlanet(
          width * 0.24 - mouseX * 8,
          height * 0.14 - mouseY * 8,
          18,
          -rotBase * 1.1,
          'berry'
        );
      }

      // Moving space dust
      ctx.fillStyle = '#94a3b8';
      for (const d of dust) {
        if (shouldAnimate) {
          d.x = (d.x + d.vx + width) % width;
          d.y = (d.y + d.vy + height) % height;
        }
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating fruit & vegetable particles
      for (const p of particles) {
        if (shouldAnimate) {
          p.x = (p.x + p.vx + width) % width;
          p.y = (p.y + p.vy + height) % height;
          p.angle += p.spin;
        }
        drawParticle(p);
      }

      // Shooting stars
      if (shouldAnimate && Math.random() < 0.012 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          vx: 8 + Math.random() * 6,
          vy: 4 + Math.random() * 4,
          life: 0,
          maxLife: 38 + Math.random() * 22,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.x += st.vx;
        st.y += st.vy;
        st.life++;
        const progress = 1 - st.life / st.maxLife;
        if (progress <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }
        const grad = ctx.createLinearGradient(
          st.x,
          st.y,
          st.x - st.vx * 6,
          st.y - st.vy * 6
        );
        grad.addColorStop(0, `rgba(165, 243, 252, ${progress})`);
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x - st.vx * 6, st.y - st.vy * 6);
        ctx.stroke();
      }

      if (shouldAnimate) {
        rafId = requestAnimationFrame(render);
      }
    };

    if (shouldAnimate) {
      rafId = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [reduceAnimations]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none w-full h-full"
    />
  );
};
