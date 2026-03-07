'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Clapperboard } from 'lucide-react';
import { DialogueMessage } from '@/components/observation/dialogue-message';
import { Dialogue } from '@/lib/types/script';

interface DialogueWithMeta extends Dialogue {
  actNumber: number;
  characterId: string;
}

// 计算对话的左右位置(同一角色连续对话保持同侧)
function calculateDialoguePositions(dialogues: DialogueWithMeta[]): boolean[] {
  const positions: boolean[] = [];
  let currentSide = true; // true = left, false = right
  
  dialogues.forEach((dialogue, index) => {
    if (index === 0) {
      // 第一条对话在左侧
      positions.push(true);
      currentSide = true;
    } else {
      const prevDialogue = dialogues[index - 1];
      if (prevDialogue.characterId === dialogue.characterId) {
        // 同一角色,保持在同一侧
        positions.push(currentSide);
      } else {
        // 不同角色,切换到另一侧
        currentSide = !currentSide;
        positions.push(currentSide);
      }
    }
  });
  
  return positions;
}

export function ObservationView() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentActNumber, setCurrentActNumber] = useState(1);
  const [displayedDialogues, setDisplayedDialogues] = useState<DialogueWithMeta[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const {
    script,
    currentAct,
    currentDialogue,
    progress,
    engine,
    nextDialogue,
  } = useScriptStore();

  const currentIndex = engine?.getCurrentDialogueIndex() ?? 0;
  const totalDialogues = engine?.getTotalDialogues() ?? 0;
  const canGoForward = currentIndex < totalDialogues - 1;

  // 当前幕的对话
  const currentActDialogues = displayedDialogues.filter(
    (d) => d.actNumber === currentActNumber
  );

  // 获取当前显示幕的配置
  const displayedAct = script?.acts.find((act) => act.actNumber === currentActNumber);

  // 检查当前幕是否完成
  const isCurrentActComplete = displayedAct && currentActDialogues.length === displayedAct.dialogues.length;

  // 检查是否所有幕都完成
  const isAllActsComplete = script && currentActNumber === script.acts.length && isCurrentActComplete;

  // 检测幕切换,自动更新 currentActNumber
  useEffect(() => {
    if (currentAct && currentAct.actNumber !== currentActNumber && hasStarted) {
      // 检查是否是自然切换(点击下一句导致的)
      const isNaturalSwitch = currentAct.actNumber === currentActNumber + 1;
      if (isNaturalSwitch) {
        // 不自动切换,等待用户点击"进入下一幕"按钮
        return;
      }
    }
  }, [currentAct, currentActNumber, hasStarted]);

  // 当对话更新时,添加到显示列表(只显示当前幕的对话)
  useEffect(() => {
    if (!currentDialogue || !currentAct || !hasStarted) return;

    // 只添加属于当前显示幕的对话
    if (currentAct.actNumber === currentActNumber) {
      setDisplayedDialogues((prev) => {
        // 检查是否已存在
        if (prev.some((d) => d.id === currentDialogue.id)) {
          return prev;
        }

        return [
          ...prev,
          {
            ...currentDialogue,
            actNumber: currentAct.actNumber,
            characterId: currentDialogue.speaker,
          },
        ];
      });
    }
  }, [currentDialogue, currentAct, hasStarted, currentActNumber]);

  // 自动滚动到最新对话
  useEffect(() => {
    if (currentDialogue && scrollRef.current) {
      const element = document.getElementById(`dialogue-${currentDialogue.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentDialogue]);

  const handleStart = () => {
    setHasStarted(true);
    // hasStarted 变为 true 后,useEffect 会自动添加当前对话到显示列表
  };

  const handleNext = () => {
    if (isTyping) return; // 打字中不允许点击
    
    // 检查是否会切换到下一幕
    if (displayedAct && currentActDialogues.length === displayedAct.dialogues.length - 1) {
      // 这是当前幕的最后一句,点击后会切换到下一幕
      // 但我们不自动切换,而是显示"进入下一幕"按钮
      setIsTyping(true);
      nextDialogue();
      setTimeout(() => setIsTyping(false), 100);
      return;
    }
    
    setIsTyping(true);
    nextDialogue();
  };

  const handleTypingComplete = () => {
    setIsTyping(false);
  };

  const handleNextAct = () => {
    if (script && currentActNumber < script.acts.length) {
      const nextActNumber = currentActNumber + 1;
      setCurrentActNumber(nextActNumber);
      
      // 如果当前对话已经是下一幕的,直接添加到显示列表
      if (currentDialogue && currentAct && currentAct.actNumber === nextActNumber) {
        setDisplayedDialogues((prev) => {
          if (prev.some((d) => d.id === currentDialogue.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              ...currentDialogue,
              actNumber: currentAct.actNumber,
              characterId: currentDialogue.speaker,
            },
          ];
        });
      }
    }
  };

  const handleFinish = () => {
    if (script) {
      router.push(`/script/${script.id}/deconstruction`);
    }
  };

  if (!script || !currentAct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                第 {currentActNumber} 幕 · {script.acts[currentActNumber - 1]?.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {totalDialogues}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentActNumber} / {script.acts.length} 幕
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Dialogue Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {!hasStarted ? (
            /* Welcome Card */
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-6 max-w-2xl mx-auto py-12">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold">{script.title}</h3>
                    <p className="text-lg text-muted-foreground">{script.description}</p>
                  </div>

                  <Button size="lg" onClick={handleStart}>
                    开始观演
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Act Title Card */}
              <Card className="mb-8 border-2 border-dashed bg-muted/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Clapperboard className="w-6 h-6 text-primary" aria-hidden="true" />
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                        {currentActNumber}
                      </div>
                      <Clapperboard className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">第 {currentActNumber} 幕</h3>
                      <p className="text-xl font-semibold text-primary">
                        {script.acts[currentActNumber - 1]?.title}
                      </p>
                      {script.acts[currentActNumber - 1]?.description && (
                        <p className="text-sm text-muted-foreground max-w-md mx-auto pt-2">
                          {script.acts[currentActNumber - 1].description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dialogues */}
              {(() => {
                const positions = calculateDialoguePositions(currentActDialogues);

                return currentActDialogues.map((dialogue, index) => {
                  const character = script.characters.find(
                    (c) => c.id === dialogue.characterId
                  );
                  if (!character) return null;

                  const isLeft = positions[index];
                  const isLatest = dialogue.id === currentDialogue?.id;

                  return (
                    <DialogueMessage
                      key={dialogue.id}
                      dialogue={dialogue}
                      character={character}
                      isLeft={isLeft}
                      enableTypewriter={isLatest}
                      onTypingComplete={isLatest ? handleTypingComplete : undefined}
                    />
                  );
                });
              })()}
            </>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      {hasStarted && (
        <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center max-w-4xl mx-auto">
              {isAllActsComplete ? (
                /* 所有幕结束 */
                <div className="text-center space-y-4 py-2">
                  <p className="text-muted-foreground">
                    观演已完成,准备进入解构阶段
                  </p>
                  <Button size="lg" onClick={handleFinish}>
                    结束观演
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : isCurrentActComplete ? (
                /* 当前幕结束,进入下一幕 */
                <div className="text-center space-y-4 py-2">
                  <p className="text-muted-foreground">
                    第 {currentActNumber} 幕已完成
                  </p>
                  <Button size="lg" onClick={handleNextAct}>
                    进入第 {currentActNumber + 1} 幕
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                /* 继续当前幕 */
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!canGoForward || isTyping}
                >
                  下一句
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
