'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
  duration?: number;
}

export function Confetti({ trigger = false, duration = 3000 }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6'],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6'],
      });
    }, 50);

    return () => clearInterval(interval);
  }, [trigger, duration]);

  return null;
}
