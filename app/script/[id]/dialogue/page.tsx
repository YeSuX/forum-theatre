'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DeadlockDialog } from '@/components/joker/deadlock-dialog';
import { Send, AlertCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { emotionColors } from '@/lib/constants/emotions';

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
  const [showDeadlockDialog, setShowDeadlockDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset();
    if (script && pointId) {
      const point = script.interventionPoints.find((p) => p.id === pointId);
      if (point) {
        const character = script.characters.find(
          (c) => c.id === point.dialogueWith
        );
        if (character) {
          setSelectedCharacter(character.id);
        }
      }
    }
  }, [script, pointId, reset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (hasDeadlock && !showDeadlockDialog) {
      setShowDeadlockDialog(true);
    }
  }, [hasDeadlock, showDeadlockDialog]);

  if (!script || !pointId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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
      toast.error('发送失败，请重试');
    } finally {
      setAITyping(false);
    }
  };

  const handleEnd = () => {
    router.push(`/script/${params.id}/report?point=${pointId}`);
  };

  const handleDeadlockContinue = () => {
    setShowDeadlockDialog(false);
    setDeadlock(false);
  };

  const handleDeadlockEnd = () => {
    setShowDeadlockDialog(false);
    handleEnd();
  };

  const progressPercent = (currentRound / maxRounds) * 100;
  const isMaxRounds = currentRound >= maxRounds;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white">{point.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnd}
              className="text-slate-400 hover:text-white gap-2"
            >
              <LogOut className="w-4 h-4" />
              结束对话
            </Button>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-400 text-sm">
              轮次 {currentRound} / {maxRounds}
            </span>
            {hasDeadlock && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                检测到僵局
              </Badge>
            )}
            {isMaxRounds && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                已达轮次上限
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-40">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 min-h-[500px] max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div className="p-6 space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-slate-400 py-20"
                >
                  <p className="text-lg mb-2">开始你的对话吧</p>
                  <p className="text-sm">尝试理解对方，表达你的想法</p>
                </motion.div>
              )}
              <AnimatePresence mode="popLayout">
                {messages.map((message) => {
                  const character = script.characters.find(
                    (c) => c.id === message.characterId
                  );
                  const isUser = message.role === 'user';

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="w-10 h-10 border-2 border-slate-600">
                        <AvatarImage src={character?.avatar} />
                        <AvatarFallback>
                          {isUser ? '你' : character?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="text-slate-400 text-xs mb-1">
                          {isUser ? '你' : character?.name}
                        </div>
                        <div
                          className={`px-4 py-3 rounded-lg ${
                            isUser
                              ? 'bg-purple-600 text-white border-2 border-purple-500'
                              : `bg-slate-700/80 text-white border-2 border-slate-600 ${
                                  message.emotion
                                    ? emotionColors[message.emotion]
                                    : ''
                                }`
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.emotion && !isUser && (
                          <Badge
                            variant="secondary"
                            className={`mt-1 text-xs ${emotionColors[message.emotion]}`}
                          >
                            {message.emotion === 'calm' && '平静'}
                            {message.emotion === 'tense' && '紧张'}
                            {message.emotion === 'angry' && '愤怒'}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {isAITyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse border-2 border-slate-600" />
                  <div className="px-4 py-3 bg-slate-700/80 rounded-lg text-slate-300 border-2 border-slate-600">
                    正在思考...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex gap-2 flex-wrap">
              {script.characters.map((character) => (
                <Button
                  key={character.id}
                  variant={selectedCharacter === character.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCharacter(character.id)}
                  className={
                    selectedCharacter === character.id
                      ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-500'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }
                >
                  对 {character.name} 说
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isMaxRounds ? '已达轮次上限' : '输入你的回应... (Shift+Enter 换行)'}
                disabled={isAITyping || isMaxRounds}
                className="flex-1 min-h-[60px] max-h-[120px] bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 disabled:opacity-50 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={isAITyping || !input.trim() || isMaxRounds}
                className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 px-6"
                size="lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{input.length} / 500 字</span>
              <span>按 Enter 发送，Shift+Enter 换行</span>
            </div>
          </div>
        </div>
      </div>

      <DeadlockDialog
        open={showDeadlockDialog}
        onContinue={handleDeadlockContinue}
        onEnd={handleDeadlockEnd}
      />
    </div>
  );
}
