// src/components/ui/Snowfall.tsx
import React, { useEffect, useRef } from 'react';

const Snowfall = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const flakesCount = 150;
    const flakes: HTMLDivElement[] = [];

    for (let i = 0; i < flakesCount; i++) {
      const size = 5 + Math.random() * 15;
      const left = Math.random() * 100;
      const duration = 8 + Math.random() * 10;
      const blur = 2 + Math.random() * 2;
      const opacity = 0.5 + Math.random() * 0.5;
      const startTop = -size;
      const maxDelay = duration * 0.9;
      const delay = -(Math.random() * maxDelay);

      const flake = document.createElement('div');
      flake.className = 'flake';
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${left}%`;
      flake.style.top = `${startTop}px`;
      flake.style.opacity = `${opacity}`;
      flake.style.filter = `blur(${blur}px)`;
      flake.style.animation = `fall ${duration}s linear infinite`;
      flake.style.animationDelay = `${delay}s`;

      container.appendChild(flake);
      flakes.push(flake);
    }

    return () => flakes.forEach(f => f.remove());
  }, []);

  return <div ref={containerRef} className="snow-container" />;
};

export default Snowfall;