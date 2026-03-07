'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DialoguePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get('point');

  const { script } = useScriptStore();
  const {
    messages,
    currentRound,
    maxRounds,
    isAITyping,
    hasDeadlock,
    userThoughts,
    addMessage,
    addAnalysis,
    setAITyping,
    setDeadlock,
    reset,
  } = useDialogueStore();

  const [input, setInput] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset();
    if (script && pointId) {
      const point = script.interventionPoints.find((p) => p.id === pointId);
      if (point) {
        const character = script.characters[0];
        setSelectedCharacter(character.id);
      }
    }
  }, [script, pointId, reset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!script || !pointId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const point = script.interventionPoints.find((p) => p.id === pointId);
  if (!point) {
    router.push(`/script/${params.id}/intervention`);
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isAITyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      characterId: selectedCharacter,
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setAITyping(true);

    try {
      const response = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: script.id,
          interventionPointId: pointId,
          messages: [...messages, userMessage],
          userThoughts,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        characterId: data.character.id,
        content: data.response.content,
        timestamp: Date.now(),
        emotion: data.response.emotion,
      };

      addMessage(aiMessage);
      addAnalysis(data.analysis);
      setDeadlock(data.hasDeadlock);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setAITyping(false);
    }
  };

  const handleEnd = () => {
    router.push(`/script/${params.id}/report?point=${pointId}`);
  };

  const progressPercent = (currentRound / maxRounds) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{point.title}</h2>
              <button
                onClick={handleEnd}
                className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-colors"
              >
                结束对话
              </button>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-purple-200 text-sm">
                轮次：{currentRound} / {maxRounds}
              </span>
              {hasDeadlock && (
                <span className="text-yellow-400 text-sm">
                  ⚠️ 检测到对话僵局
                </span>
              )}
            </div>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-6 h-[500px] overflow-y-auto p-6">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-purple-300 py-12">
                  开始你的对话吧...
                </div>
              )}
              {messages.map((message) => {
                const character = script.characters.find(
                  (c) => c.id === message.characterId,
                );
                const isUser = message.role === 'user';

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {character && (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div
                      className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : ''}`}
                    >
                      <div className="text-purple-300 text-sm mb-1">
                        {character?.name || '你'}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          isUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isAITyping && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/30 animate-pulse" />
                  <div className="px-4 py-3 bg-white/10 rounded-lg text-purple-300">
                    正在思考...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex gap-2">
              {script.characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCharacter === character.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-purple-300 hover:bg-white/20'
                  }`}
                >
                  对 {character.name} 说
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入你的回应..."
                disabled={isAITyping || currentRound >= maxRounds}
                className="flex-1 px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isAITyping || !input.trim() || currentRound >= maxRounds}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
