'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface JokerAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export function JokerAvatar({
  size = 'md',
  animate = false,
  className,
}: JokerAvatarProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-6xl',
  };

  const Component = animate ? motion.div : 'div';

  return (
    <Component
      {...(animate && {
        initial: { opacity: 0, scale: 0.5, rotate: -10 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        transition: { duration: 0.5, type: 'spring' },
      })}
      className={cn(
        'rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-400',
        sizeClasses[size],
        className
      )}
    >
      <span>🎭</span>
    </Component>
  );
}
