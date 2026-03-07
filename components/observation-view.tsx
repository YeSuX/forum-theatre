'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pause, Play, SkipForward } from 'lucide-react';
import { emotionBackgrounds, emotionColors } from '@/lib/constants/emotions';
import { EmotionIndicator } from '@/components/observation/emotion-indicator';

export function ObservationView() {
  const router = useRouter();
  const {
    script,
    currentAct,
    currentDialogue,
    progress,
    stressLevel,
    tensionLevel,
    isPlaying,
    isPaused,
    nextDialogue,
    play,
    pause,
  } = useScriptStore();

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const timer = setTimeout(() => {
      nextDialogue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, isPaused, currentDialogue, nextDialogue]);

  useEffect(() => {
    if (script && !isPlaying) {
      play();
    }
  }, [script, isPlaying, play]);

  if (!script || !currentDialogue || !currentAct) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const character = script.characters.find(
    (c) => c.id === currentDialogue.speaker
  );

  const tensionIcons = {
    low: '💧',
    medium: '🔥',
    high: '🔥🔥',
  };

  return (
    <div
      className={`min-h-screen ${emotionBackgrounds[currentDialogue.emotion]} transition-colors duration-1000`}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              第 {currentAct.actNumber} 幕 · {currentAct.title}
            </span>
            <span className="text-white/80 text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
        <EmotionIndicator
          stressLevel={stressLevel}
          tensionLevel={tensionLevel}
        />
      </div>

      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="space-y-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/20 backdrop-blur-sm hover:bg-black/30"
            onClick={() => (isPaused ? play() : pause())}
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/20 backdrop-blur-sm hover:bg-black/30"
            onClick={() => router.push(`/script/${script.id}/deconstruction`)}
          >
            <SkipForward className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDialogue.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl w-full"
          >
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              {character && (
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12 border-2 border-white/20">
                    <AvatarImage src={character.avatar} />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold">
                      {character.name}
                    </h3>
                    <p className="text-white/60 text-sm">{character.role}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`ml-auto ${emotionColors[currentDialogue.emotion]}`}
                  >
                    {currentDialogue.emotion === 'calm' && '平静'}
                    {currentDialogue.emotion === 'tense' && '紧张'}
                    {currentDialogue.emotion === 'angry' && '愤怒'}
                  </Badge>
                </div>
              )}

              <p className="text-white text-2xl leading-relaxed">
                {currentDialogue.content}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-40">
        <div className="text-center">
          <p className="text-white/60 text-sm">点击屏幕或按空格键继续</p>
        </div>
      </div>
    </div>
  );
}
