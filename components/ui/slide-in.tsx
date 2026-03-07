'use client';

import { useEffect, useState, ReactNode } from 'react';

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 500,
  className = '',
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';

    switch (direction) {
      case 'left':
        return 'translate(-50px, 0)';
      case 'right':
        return 'translate(50px, 0)';
      case 'up':
        return 'translate(0, 50px)';
      case 'down':
        return 'translate(0, -50px)';
      default:
        return 'translate(0, 50px)';
    }
  };

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
