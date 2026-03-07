import { cn } from '@/lib/utils';

interface JokerAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JokerAvatar({
  size = 'md',
  className,
}: JokerAvatarProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-6xl',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-primary flex items-center justify-center border-4 border-primary/50',
        sizeClasses[size],
        className
      )}
      role="img"
      aria-label="Joker 引导者"
    >
      <span>🎭</span>
    </div>
  );
}
