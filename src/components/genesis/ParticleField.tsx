'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = [
  'rgba(124, 58, 237, 0.8)',  // Nebula purple
  'rgba(6, 182, 212, 0.8)',   // Energy cyan
  'rgba(236, 72, 153, 0.6)',  // Nova pink
  'rgba(16, 185, 129, 0.6)',  // Aurora green
  'rgba(249, 115, 22, 0.5)',  // Plasma orange
];

interface ParticleFieldProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function ParticleField({ intensity = 'medium', className = '' }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const particleCount = intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100;

  const createParticle = useCallback((canvas: HTMLCanvasElement, x?: number, y?: number): Particle => {
    const startX = x ?? Math.random() * canvas.width;
    const startY = y ?? Math.random() * canvas.height;

    return {
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5 - 0.3, // Slight upward drift
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 300 + 200,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Mouse interaction - particles drift away from cursor
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          particle.vx += (dx / dist) * force * 0.02;
          particle.vy += (dy / dist) * force * 0.02;
        }

        // Apply drag
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Calculate opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        const fadeIn = Math.min(particle.life / 30, 1);
        const fadeOut = lifeRatio > 0.7 ? 1 - ((lifeRatio - 0.7) / 0.3) : 1;
        const currentOpacity = particle.opacity * fadeIn * fadeOut;

        // Draw particle with glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, particle.color.replace('0.8', String(currentOpacity)));
        gradient.addColorStop(0.5, particle.color.replace('0.8', String(currentOpacity * 0.3)));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.fillStyle = particle.color.replace('0.8', String(currentOpacity));
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Reset particle if out of bounds or life ended
        if (
          particle.life > particle.maxLife ||
          particle.x < -50 ||
          particle.x > canvas.width + 50 ||
          particle.y < -50 ||
          particle.y > canvas.height + 50
        ) {
          particlesRef.current[index] = createParticle(canvas);
        }
      });

      // Draw connections between close particles
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.globalAlpha = (1 - dist / 100) * 0.3;
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
