'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function ObservationView() {
  const router = useRouter();
  const {
    script,
    currentAct,
    currentDialogue,
    progress,
    stressLevel,
    nextDialogue,
    play,
    pause,
    isPlaying,
  } = useScriptStore();

  const [showCharacterInfo, setShowCharacterInfo] = useState(false);

  useEffect(() => {
    if (isPlaying && currentDialogue) {
      const timer = setTimeout(() => {
        nextDialogue();
        if (!currentDialogue) {
          pause();
          router.push(`/script/${script?.id}/deconstruction`);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentDialogue, nextDialogue, pause, router, script]);

  if (!script || !currentAct || !currentDialogue) {
    return null;
  }

  const character = script.characters.find(
    (c) => c.id === currentDialogue.speaker,
  );

  const emotionColors = {
    calm: 'from-blue-500/20 to-blue-600/20',
    tense: 'from-yellow-500/20 to-orange-600/20',
    angry: 'from-red-500/20 to-red-600/20',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
        style={{ backgroundImage: `url(${currentAct.sceneBackground})` }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              第 {currentAct.actNumber} 幕：{currentAct.title}
            </h2>
            <button
              onClick={() => setShowCharacterInfo(!showCharacterInfo)}
              className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-colors"
            >
              {showCharacterInfo ? '隐藏角色信息' : '查看角色信息'}
            </button>
          </div>

          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-purple-200 text-sm">进度：{progress}%</span>
            <span className="text-purple-200 text-sm">
              压力值：{stressLevel}
            </span>
          </div>
        </div>

        {showCharacterInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {script.characters.map((char) => (
              <Card
                key={char.id}
                className="bg-white/10 backdrop-blur-sm border-purple-300/20 p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{char.name}</h3>
                    <p className="text-purple-300 text-sm">{char.role}</p>
                  </div>
                </div>
                <p className="text-purple-200 text-sm">{char.background}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          <div
            className={`bg-gradient-to-r ${emotionColors[currentDialogue.emotion]} backdrop-blur-sm border border-purple-300/20 rounded-lg p-6 animate-fade-in`}
          >
            <div className="flex items-start gap-4">
              {character && (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold text-lg">
                    {character?.name}
                  </span>
                  <span className="text-purple-300 text-sm">
                    {currentDialogue.emotion === 'calm' && '😌'}
                    {currentDialogue.emotion === 'tense' && '😰'}
                    {currentDialogue.emotion === 'angry' && '😠'}
                  </span>
                </div>
                <p className="text-white text-lg leading-relaxed">
                  {currentDialogue.content}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={play}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                开始播放
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                暂停
              </button>
            )}
            <button
              onClick={() => router.push(`/script/${script.id}/deconstruction`)}
              className="px-8 py-3 bg-purple-500/50 hover:bg-purple-500/70 text-white font-semibold rounded-lg transition-colors"
            >
              跳过观演
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
