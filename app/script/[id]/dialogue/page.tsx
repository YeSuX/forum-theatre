'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeadlockDialog } from '@/components/joker/deadlock-dialog';
import { Send, AlertCircle, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

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
      if (point && point.userPlaysAs) {
        setSelectedCharacter(point.userPlaysAs);
        console.log('User plays as:', point.userPlaysAs);
        console.log('Dialogue with:', point.dialogueWith);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const point = script.interventionPoints.find((p) => p.id === pointId);
  if (!point) {
    router.push(`/script/${params.id}/intervention`);
    return null;
  }

  const userCharacter = script.characters.find((c) => c.id === point.userPlaysAs);
  const aiCharacter = script.characters.find((c) => c.id === point.dialogueWith);

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (!data.character || !data.response) {
        console.error('Invalid response structure:', data);
        throw new Error('服务器返回数据格式错误');
      }

      if (!data.response.content || data.response.content.trim().length === 0) {
        console.error('AI returned empty content:', data.response);
        throw new Error('AI 未返回有效回复，请重试');
      }

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        characterId: data.character.id,
        content: data.response.content.trim(),
        timestamp: Date.now(),
        emotion: data.response.emotion,
      };

      addMessage(aiMessage);
      
      if (data.analysis) {
        addAnalysis(data.analysis);
      }
      
      if (data.hasDeadlock !== undefined) {
        setDeadlock(data.hasDeadlock);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('发送失败，请重试');
    } finally {
      setAITyping(false);
    }
  };

  const handleBack = () => {
    router.push(`/script/${params.id}/intervention`);
  };

  const handleGenerateReport = () => {
    router.push(`/script/${params.id}/report?point=${pointId}`);
  };

  const handleDeadlockContinue = () => {
    setShowDeadlockDialog(false);
    setDeadlock(false);
  };

  const handleDeadlockEnd = () => {
    setShowDeadlockDialog(false);
    handleGenerateReport();
  };

  const progressPercent = (currentRound / maxRounds) * 100;
  const isMaxRounds = currentRound >= maxRounds;

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部工具栏 */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={aiCharacter?.avatar} />
                  <AvatarFallback>{aiCharacter?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-sm font-semibold">{point.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    与 {aiCharacter?.name} 对话
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasDeadlock && (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  僵局
                </Badge>
              )}
              {isMaxRounds && (
                <Badge variant="destructive">已达上限</Badge>
              )}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateReport}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  生成报告
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Progress value={progressPercent} className="h-1" />
            <p className="text-xs text-muted-foreground text-right">
              轮次 {currentRound} / {maxRounds}
            </p>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
            >
              <div className="space-y-2">
                <p className="text-lg font-medium">开始你的对话</p>
                <p className="text-sm text-muted-foreground">
                  你正在扮演 {userCharacter?.name}，尝试理解对方并表达你的想法
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
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
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={character?.avatar} />
                        <AvatarFallback>
                          {character?.name[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {character?.name}
                          </span>
                          {message.emotion && !isUser && (
                            <Badge variant="secondary" className="text-xs h-5">
                              {message.emotion === 'calm' && '平静'}
                              {message.emotion === 'tense' && '紧张'}
                              {message.emotion === 'angry' && '愤怒'}
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`px-4 py-2.5 rounded-lg ${
                            isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
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
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={aiCharacter?.avatar} />
                    <AvatarFallback>{aiCharacter?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">正在思考...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <Separator />

      {/* 输入区域 */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isMaxRounds
                    ? '已达轮次上限，无法继续输入'
                    : '输入你的回应...'
                }
                disabled={isAITyping || isMaxRounds}
                className="flex-1 min-h-[80px] resize-none"
                rows={3}
              />
              <Button
                onClick={handleSend}
                disabled={isAITyping || !input.trim() || isMaxRounds}
                size="icon"
                className="shrink-0 w-10 h-10"
              >
                {isAITyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {input.length} / 500 字
                {input.length > 450 && (
                  <span className="text-destructive ml-1">
                    (剩余 {500 - input.length} 字)
                  </span>
                )}
              </span>
              <span>Enter 发送 · Shift+Enter 换行</span>
            </div>
          </div>
        </div>
      </footer>

      <DeadlockDialog
        open={showDeadlockDialog}
        onContinue={handleDeadlockContinue}
        onEnd={handleDeadlockEnd}
      />
    </div>
  );
}
