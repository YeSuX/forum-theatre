'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Character, Dialogue } from '@/lib/types/script';
import { cn } from '@/lib/utils';
import { TypewriterText } from './typewriter-text';

interface DialogueMessageProps {
  dialogue: Dialogue;
  character: Character;
  isLeft: boolean;
  enableTypewriter?: boolean;
  onTypingComplete?: () => void;
}

const emotionLabels = {
  calm: '平静',
  tense: '紧张',
  angry: '愤怒',
} as const;

const emotionColors = {
  calm: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  tense: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  angry: 'bg-red-500/10 text-red-700 dark:text-red-300',
} as const;

export function DialogueMessage({
  dialogue,
  character,
  isLeft,
  enableTypewriter = false,
  onTypingComplete,
}: DialogueMessageProps) {
  return (
    <div
      id={`dialogue-${dialogue.id}`}
      className={cn(
        'flex gap-3 mb-6 scroll-mt-24',
        isLeft ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={character.avatar} alt={character.name} />
        <AvatarFallback>{character.name[0]}</AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-2 max-w-[70%]', isLeft ? 'items-start' : 'items-end')}>
        {/* Character Name & Emotion */}
        <div className={cn('flex items-center gap-2', isLeft ? 'flex-row' : 'flex-row-reverse')}>
          <span className="text-sm font-medium">{character.name}</span>
          <Badge variant="secondary" className={cn('text-xs', emotionColors[dialogue.emotion])}>
            {emotionLabels[dialogue.emotion]}
          </Badge>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500',
            isLeft
              ? 'bg-muted rounded-tl-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
          )}
        >
          <p className="text-base leading-relaxed">
            {enableTypewriter ? (
              <TypewriterText 
                text={dialogue.content} 
                speed={30}
                onComplete={onTypingComplete}
              />
            ) : (
              dialogue.content
            )}
          </p>
        </div>

        {/* Stress Level Indicator */}
        {dialogue.stressLevel > 50 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>压力等级: {dialogue.stressLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
