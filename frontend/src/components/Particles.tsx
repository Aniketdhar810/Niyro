import React, { useEffect, useRef } from 'react';

export const Particles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = ['+', '.', '✦', '✽'];
    const particleCount = 150;
    const particlesData: { element: HTMLDivElement; x: number; y: number; factor: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.innerText = chars[Math.floor(Math.random() * chars.length)];
      
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      p.style.left = `${x}%`;
      p.style.top = `${y}%`;
      
      const factor = 0.5 + Math.random() * 1.5;
      
      container.appendChild(p);
      particlesData.push({ element: p, x, y, factor });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      particlesData.forEach(p => {
        const moveX = mouseX * 50 * p.factor;
        const moveY = mouseY * 50 * p.factor;
        p.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      container.innerHTML = '';
    };
  }, []);

  return (
    <div id="particles-js" ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50"></div>
  );
};
