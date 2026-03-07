# Forum Theatre 界面交互重构计划 v2.0

**文档版本**：v2.0  
**创建日期**：2026-03-07  
**设计理念**：好用、好看、好玩  
**技术栈**：Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4  
**包管理工具**：bun

---

## 目录

1. [设计原则](#1-设计原则)
2. [问题修复清单](#2-问题修复清单)
3. [交互设计系统](#3-交互设计系统)
4. [页面重构方案](#4-页面重构方案)
5. [新增组件库](#5-新增组件库)
6. [动画与过渡](#6-动画与过渡)
7. [实施步骤](#7-实施步骤)
8. [测试清单](#8-测试清单)

---

## 1. 设计原则

### 1.1 好用（Usability）

**核心原则**：

- ✅ **零学习成本**：用户无需阅读说明即可使用
- ✅ **即时反馈**：每个操作都有明确的视觉/听觉反馈
- ✅ **容错设计**：允许撤销、重试、跳过
- ✅ **渐进式引导**：在关键节点提供轻量级提示

**实现策略**：

- 使用 shadcn/ui 的 `Tooltip` 提供上下文帮助
- 使用 `Toast` 提供操作反馈
- 使用 `Dialog` 确认高风险操作
- 使用 `Progress` 显示进度和状态

### 1.2 好看（Aesthetics）

**核心原则**：

- 🎨 **现代扁平化视觉**：清晰的色块、简洁的边框、流畅的动画
- 🎨 **情绪化设计**：色彩随剧情情绪变化
- 🎨 **沉浸式界面**：最小化 UI 干扰，最大化内容沉浸
- 🎨 **细节打磨**：微交互、悬停效果、加载状态

**扁平化设计特点**：

- ✅ **纯色背景**：使用 `bg-slate-950`、`bg-blue-950` 等纯色替代渐变
- ✅ **清晰边框**：使用 `border-2` 或 `border-4` 配合鲜明的边框色
- ✅ **色块分区**：通过不同的背景色和边框色区分功能区域
- ✅ **扁平按钮**：纯色按钮配合边框，悬停时改变背景色
- ✅ **简洁卡片**：移除阴影和模糊效果，使用边框定义边界

**实现策略**：

- 使用 Tailwind CSS 4 的扁平化色彩和清晰边框
- 使用 Framer Motion 实现流畅动画
- 使用 shadcn/ui 的 `Card`、`Badge`、`Avatar` 提升视觉层次
- 使用 `Skeleton` 优化加载体验

### 1.3 好玩（Engagement）

**核心原则**：

- 🎮 **即时反馈**：用户的每句话都能引发 AI 角色的真实反应
- 🎮 **意外惊喜**：小丑的幽默吐槽、AI 的"背地里评价"
- 🎮 **成就感**：通过"英雄类型"等趣味化标签增强认同感
- 🎮 **社交传播**：精美的报告卡片，易于分享

**实现策略**：

- 使用 `Confetti` 效果庆祝完成
- 使用 `Drawer` 展示隐藏内容
- 使用 `Tabs` 支持多角度探索
- 使用 `Sonner` 提供幽默的通知

---

## 2. 问题修复清单

### 2.1 逻辑问题修复

#### 问题 1：对话 API 角色选择逻辑错误

**当前问题**：

```typescript
// ❌ 错误：选择"非用户扮演角色"
const character = script.characters.find(
  (c) => c.id !== lastUserMessage?.characterId,
);
```

**修复方案**：在介入点中明确定义对话角色

**步骤 1**：扩展 `InterventionPoint` 类型

```typescript
// lib/types/script.ts
interface InterventionPoint {
  id: string;
  actId: string;
  dialogueId: string;
  title: string;
  scene: string;
  conflict: string;
  challenge: string;
  type: "communication" | "empathy" | "boundary" | "systemic";
  position: number;

  // ✅ 新增：明确定义对话角色
  userPlaysAs: string; // 用户扮演的角色 ID
  dialogueWith: string; // 对话对象角色 ID
}
```

**步骤 2**：更新剧本数据

```json
// data/scripts/city-moonlight.json
{
  "interventionPoints": [
    {
      "id": "point-1",
      "actId": "act-1",
      "dialogueId": "dialogue-1-2",
      "title": "小雅拒绝活鸡",
      "scene": "小雅刚出院回家，邱华带来活鸡和红糖鸡蛋",
      "conflict": "城乡文化差异",
      "challenge": "沟通能力，如何让双方都感到被尊重",
      "type": "communication",
      "position": 15,
      "userPlaysAs": "xiao-ya",
      "dialogueWith": "qiu-hua"
    }
  ]
}
```

**步骤 3**：修复 API 逻辑

```typescript
// app/api/dialogue/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, userThoughts } = body;

    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    const point = script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!point) {
      return NextResponse.json(
        { error: "Intervention point not found" },
        { status: 404 },
      );
    }

    // ✅ 修复：使用介入点定义的对话角色
    const character = script.characters.find(
      (c) => c.id === point.dialogueWith,
    );

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 },
      );
    }

    // ... 其余逻辑
  } catch (error) {
    console.error("Dialogue API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

#### 问题 2：观演结束判断竞态

**当前问题**：

```typescript
// ❌ 错误：在 nextDialogue() 之后立即判断
nextDialogue();
if (!currentDialogue) {
  // 跳转到角色解构页
}
```

**修复方案**：在 Store 中处理剧本结束逻辑

**步骤 1**：扩展 `ScriptStore`

```typescript
// lib/stores/script-store.ts
interface ScriptState {
  // ... 现有状态
  isScriptEnded: boolean;

  // ... 现有操作
  setScriptEnded: (ended: boolean) => void;
}

export const useScriptStore = create<ScriptState>((set, get) => ({
  // ... 现有状态
  isScriptEnded: false,

  // 修改 nextDialogue
  nextDialogue: () => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.nextDialogue();

    // ✅ 修复：在 Store 中标记剧本结束
    if (!dialogue) {
      set({
        isPlaying: false,
        isScriptEnded: true, // 标记剧本结束
      });
      return;
    }

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  // 新增操作
  setScriptEnded: (ended) => set({ isScriptEnded: ended }),

  // 修改 reset
  reset: () => {
    const { script } = get();
    if (!script) return;

    const engine = new ScriptEngine(script);
    set({
      engine,
      currentAct: engine.getCurrentAct(),
      currentDialogue: engine.getCurrentDialogue(),
      progress: 0,
      stressLevel: 0,
      tensionLevel: "low",
      isPlaying: false,
      isPaused: false,
      isScriptEnded: false, // 重置标记
    });
  },
}));
```

**步骤 2**：修复观演页面

```typescript
// app/script/[id]/observation/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useScriptStore } from "@/lib/stores/script-store";

export default function ObservationPage() {
  const params = useParams();
  const router = useRouter();
  const { isScriptEnded } = useScriptStore();

  // ✅ 修复：监听 isScriptEnded 变化
  useEffect(() => {
    if (isScriptEnded) {
      router.push(`/script/${params.id}/deconstruction`);
    }
  }, [isScriptEnded, params.id, router]);

  // ... 其余逻辑
}
```

### 2.2 功能缺失修复

#### 修复 1：僵局时小丑介入

**实现方案**：使用 `AlertDialog` 实现小丑强制介入

**步骤 1**：创建小丑介入对话框组件

```typescript
// components/joker/deadlock-dialog.tsx
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { JokerAvatar } from './joker-avatar';

interface DeadlockDialogProps {
  open: boolean;
  onContinue: () => void;
  onEnd: () => void;
}

export function DeadlockDialog({
  open,
  onContinue,
  onEnd,
}: DeadlockDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <JokerAvatar size="lg" animate />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            哎呀，陷入僵局了！
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            看起来你们在原地打转呢。要不要换个思路试试？
            或者，我们可以先停下来，看看刚才的对话有什么收获。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onContinue}
            className="w-full sm:w-auto"
          >
            继续尝试
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onEnd}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            结束对话
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**步骤 2**：集成到对话页面

```typescript
// app/script/[id]/dialogue/page.tsx
import { DeadlockDialog } from '@/components/joker/deadlock-dialog';

export default function DialoguePage() {
  const { hasDeadlock } = useDialogueStore();
  const [showDeadlockDialog, setShowDeadlockDialog] = useState(false);

  // 监听僵局状态
  useEffect(() => {
    if (hasDeadlock) {
      setShowDeadlockDialog(true);
    }
  }, [hasDeadlock]);

  const handleContinue = () => {
    setShowDeadlockDialog(false);
    // 重置僵局状态
    setDeadlock(false);
  };

  const handleEnd = () => {
    setShowDeadlockDialog(false);
    router.push(`/script/${params.id}/report?point=${pointId}`);
  };

  return (
    <>
      {/* ... 现有内容 */}

      <DeadlockDialog
        open={showDeadlockDialog}
        onContinue={handleContinue}
        onEnd={handleEnd}
      />
    </>
  );
}
```

#### 修复 2：流式输出

**实现方案**：使用 Server-Sent Events (SSE) 实现打字机效果

**步骤 1**：创建流式 API 端点

```typescript
// app/api/dialogue/stream/route.ts
import { NextRequest } from "next/server";
import { AIDialogueEngine } from "@/lib/engines/ai-dialogue-engine";
import { scripts } from "@/data/scripts";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, userThoughts } = body;

    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return new Response("Script not found", { status: 404 });
    }

    const point = script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!point) {
      return new Response("Intervention point not found", { status: 404 });
    }

    const character = script.characters.find(
      (c) => c.id === point.dialogueWith,
    );
    if (!character) {
      return new Response("Character not found", { status: 404 });
    }

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const aiEngine = new AIDialogueEngine(
          process.env.MOONSHOT_API_KEY!,
          "https://api.moonshot.cn/v1",
        );

        try {
          // 使用流式生成
          const responseStream = aiEngine.generateResponseStream(
            {
              scriptId,
              characterId: character.id,
              interventionPointId,
              dialogueHistory: messages,
              userInput: messages[messages.length - 1]?.content || "",
              context: { userThoughts },
            },
            character,
          );

          for await (const chunk of responseStream) {
            const data = encoder.encode(
              `data: ${JSON.stringify({ chunk })}\n\n`,
            );
            controller.enqueue(data);
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
```

**步骤 2**：扩展 AIDialogueEngine 支持流式生成

```typescript
// lib/engines/ai-dialogue-engine.ts
export class AIDialogueEngine {
  // ... 现有方法

  // ✅ 新增：流式生成响应
  async *generateResponseStream(
    request: AIDialogueRequest,
    character: Character,
  ): AsyncGenerator<string> {
    const systemPrompt = this.buildSystemPrompt(character, request);
    const messages = request.dialogueHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    const stream = await this.openai.chat.completions.create({
      model: "kimi-k2.5",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 200,
      stream: true, // 启用流式
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  }
}
```

**步骤 3**：前端使用流式 API

```typescript
// app/script/[id]/dialogue/page.tsx
const handleSendStream = async () => {
  if (!input.trim() || isAITyping) return;

  const userMessage: Message = {
    id: `msg-${Date.now()}`,
    role: "user",
    characterId: selectedCharacter,
    content: input.trim(),
    timestamp: Date.now(),
  };

  addMessage(userMessage);
  setInput("");
  setAITyping(true);

  try {
    const response = await fetch("/api/dialogue/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scriptId: script.id,
        interventionPointId: pointId,
        messages: [...messages, userMessage],
        userThoughts,
      }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiContent = "";

    // 创建临时 AI 消息
    const aiMessageId = `msg-${Date.now()}-ai`;
    const aiMessage: Message = {
      id: aiMessageId,
      role: "ai",
      characterId: data.character.id,
      content: "",
      timestamp: Date.now(),
    };
    addMessage(aiMessage);

    // 读取流
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));
          aiContent += data.chunk;

          // 更新消息内容
          updateMessage(aiMessageId, aiContent);
        }
      }
    }

    // 完成后分析对话
    // ... 调用分析 API
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    setAITyping(false);
  }
};
```

#### 修复 3：分享报告

**实现方案**：使用 `html2canvas` 生成报告图片

**步骤 1**：安装依赖

```bash
bun add html2canvas
```

**步骤 2**：创建分享组件

```typescript
// components/report/share-dialog.tsx
'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Report } from '@/lib/types';

interface ShareDialogProps {
  report: Report;
}

export function ShareDialog({ report }: ShareDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#1a1f3a',
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
      toast.success('报告图片生成成功！');
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('生成图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `forum-theatre-report-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success('图片已下载！');
  };

  const copyToClipboard = async () => {
    if (!imageUrl) return;

    try {
      const blob = await (await fetch(imageUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      toast.success('图片已复制到剪贴板！');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('复制失败，请重试');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          onClick={generateImage}
        >
          <Share2 className="w-4 h-4" />
          分享报告
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享你的参演报告</DialogTitle>
          <DialogDescription>
            生成精美的报告图片，分享到社交媒体
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 报告预览 */}
          <div
            ref={reportRef}
            className="bg-slate-950 border-4 border-purple-500 p-6 rounded-lg"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {report.heroType.name}
              </h3>
              <p className="text-purple-200 text-sm">
                {report.heroType.description}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-purple-950 border-2 border-purple-500 rounded-lg p-3">
                  <div className="text-purple-300 text-xs">边界感</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.boundary}
                  </div>
                </div>
                <div className="bg-blue-950 border-2 border-blue-500 rounded-lg p-3">
                  <div className="text-blue-300 text-xs">策略性</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.strategy}
                  </div>
                </div>
                <div className="bg-green-950 border-2 border-green-500 rounded-lg p-3">
                  <div className="text-green-300 text-xs">同理心</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.empathy}
                  </div>
                </div>
              </div>
              <div className="text-purple-300 text-xs mt-6">
                Forum Theatre · 论坛剧场
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {imageUrl && (
            <div className="flex gap-2">
              <Button
                onClick={downloadImage}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                下载图片
              </Button>
              <Button
                onClick={copyToClipboard}
                className="flex-1 gap-2"
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制图片
                  </>
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center text-sm text-muted-foreground">
              正在生成图片...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**步骤 3**：集成到报告页面

```typescript
// app/script/[id]/report/page.tsx
import { ShareDialog } from '@/components/report/share-dialog';

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);

  return (
    <div>
      {/* ... 现有内容 */}

      {report && (
        <div className="flex gap-4 justify-center mt-8">
          <ShareDialog report={report} />
          <Button variant="outline" onClick={() => router.push(`/script/${params.id}/intervention`)}>
            尝试其他介入点
          </Button>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### 修复 4：内心独白生成

**实现方案**：使用 LLM 生成个性化内心独白

**步骤 1**：修改 AIDialogueEngine

```typescript
// lib/engines/ai-dialogue-engine.ts
export class AIDialogueEngine {
  // 修改内心独白生成方法
  private async generateInternalThought(
    content: string,
    character: Character,
  ): Promise<string> {
    const prompt = `作为 ${character.name}，你刚才对用户说了："${content}"

但在你的内心深处，你真正的想法是什么？

角色设定：
- 隐藏压力：${character.hiddenPressure}
- 核心动机：${character.coreMotivation}
- 权力水平：${character.powerLevel}

请用 1 句话表达你的内心独白，要真实、幽默、有点"毒舌"。

示例：
- "这个人还挺会说话的，至少比我儿子强多了……"
- "说得好听，但我总觉得她还是嫌我土……"
- "终于有人理解我了，但为什么不是我儿子？"

请直接输出内心独白，不要加任何前缀。`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "kimi-k2.5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 100,
      });

      return (
        completion.choices[0]?.message?.content ||
        `${character.name}内心想：${character.hiddenPressure}`
      );
    } catch (error) {
      console.error("Failed to generate internal thought:", error);
      return `${character.name}内心想：${character.hiddenPressure}`;
    }
  }
}
```

---

## 3. 交互设计系统

### 3.1 色彩系统

**主题色**：

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        // 情绪色
        emotion: {
          calm: "#3b82f6",
          tense: "#f59e0b",
          angry: "#ef4444",
        },
        // 英雄类型色
        hero: {
          boundary: "#8b5cf6",
          strategy: "#3b82f6",
          empathy: "#10b981",
        },
      },
    },
  },
};
```

**情绪色彩（扁平化）**：

```typescript
// lib/constants/emotions.ts
export const emotionBackgrounds = {
  calm: "bg-blue-950",
  tense: "bg-orange-950",
  angry: "bg-red-950",
} as const;

export const emotionColors = {
  calm: "text-blue-400 border-blue-400 bg-blue-500/10",
  tense: "text-orange-400 border-orange-400 bg-orange-500/10",
  angry: "text-red-400 border-red-400 bg-red-500/10",
} as const;

export const emotionAccents = {
  calm: "border-l-4 border-l-blue-500",
  tense: "border-l-4 border-l-orange-500",
  angry: "border-l-4 border-l-red-500",
} as const;
```

### 3.2 动画系统

**过渡时长**：

```typescript
// lib/constants/animations.ts
export const transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
} as const;
```

**常用动画**：

```typescript
// components/ui/motion.tsx
import { motion } from "framer-motion";

export const FadeIn = motion.div;
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const SlideIn = motion.div;
export const slideInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const ScaleIn = motion.div;
export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};
```

### 3.3 响应式断点

```typescript
// lib/constants/breakpoints.ts
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
```

---

## 4. 页面重构方案

### 4.1 首页（议题广场）

**设计目标**：

- 吸引用户注意力
- 快速了解产品价值
- 降低参与门槛

**重构方案**：

```typescript
// app/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Users } from 'lucide-react';
import { scripts } from '@/data/scripts';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">AI 驱动的沉浸式体验</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white">
            成为观演者
            <br />
            <span className="text-purple-400">
              探索社会困境
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            不是解决问题，而是理解问题。
            在虚拟舞台上，与 AI 角色对话，探索沟通与人性。
          </p>

          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500"
            asChild
          >
            <a href="#scripts">开始探索</a>
          </Button>
        </motion.div>
      </section>

      {/* 议题卡片网格 */}
      <section id="scripts" className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            探索议题
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script, index) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Link href={`/script/${script.id}`}>
                  <Card className="group hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 bg-slate-900 border-2 border-slate-700 overflow-hidden">
                    {/* 封面图 */}
                    <div className="relative h-48 overflow-hidden border-b-2 border-slate-700">
                      <img
                        src={script.coverImage}
                        alt={script.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    <CardHeader>
                      <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                        {script.title}
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        {script.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {script.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {script.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        1.2k 人参演
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
```

### 4.2 剧本介绍页

**设计目标**：

- 建立情感连接
- 设定用户期待
- 激发参与意愿

**重构方案**：

```typescript
// app/script/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Users, Sparkles } from 'lucide-react';
import { scripts } from '@/data/scripts';
import { useScriptStore } from '@/lib/stores/script-store';

export default function ScriptIntroPage() {
  const params = useParams();
  const router = useRouter();
  const { loadScript } = useScriptStore();

  const script = scripts.find((s) => s.id === params.id);

  if (!script) {
    return <div>剧本未找到</div>;
  }

  const handleStart = () => {
    loadScript(script);
    router.push(`/script/${params.id}/observation`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* 背景图 */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `url(${script.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px)',
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            className="mb-6 text-white hover:text-purple-400"
            onClick={() => router.push('/')}
          >
            ← 返回首页
          </Button>

          {/* 剧本信息卡片 */}
          <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <h1 className="text-4xl font-bold text-white">
                    {script.title}
                  </h1>
                  <p className="text-xl text-slate-300">
                    {script.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {script.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* 角色介绍 */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  角色介绍
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {script.characters.map((character) => (
                    <Card
                      key={character.id}
                      className="bg-slate-700/50 border-slate-600"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={character.avatar} />
                            <AvatarFallback>{character.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-white font-semibold">
                              {character.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {character.age} 岁 · {character.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-600" />

              {/* 体验说明 */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  体验说明
                </h3>
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">1</span>
                    </div>
                    <p>你将观看 {script.acts.length} 幕短剧，了解冲突如何发生</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">2</span>
                    </div>
                    <p>你将选择一个时刻，取代主角，尝试改变剧情</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">3</span>
                    </div>
                    <p>没有标准答案，重要的是探索和思考</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              {/* 开始按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{script.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">1.2k 人参演</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 gap-2"
                  onClick={handleStart}
                >
                  <Play className="w-5 h-5" />
                  开始观演
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
```

### 4.3 沉浸式观演页

**设计目标**：

- 最大化沉浸感
- 实时情绪反馈
- 流畅的播放体验

**重构方案**：

```typescript
// app/script/[id]/observation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pause, Play, SkipForward, Flame } from 'lucide-react';
import { emotionGradients, emotionColors } from '@/lib/constants/emotions';

export default function ObservationPage() {
  const params = useParams();
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
    isScriptEnded,
    nextDialogue,
    play,
    pause,
  } = useScriptStore();

  // 自动播放
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const timer = setTimeout(() => {
      nextDialogue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, isPaused, currentDialogue, nextDialogue]);

  // 剧本结束跳转
  useEffect(() => {
    if (isScriptEnded) {
      router.push(`/script/${params.id}/deconstruction`);
    }
  }, [isScriptEnded, params.id, router]);

  // 自动开始播放
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
      {/* 顶部进度条 */}
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

      {/* 左侧情绪指标 */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
        <TooltipProvider>
          <div className="space-y-4">
            {/* 压力值 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-2">压力值</div>
                  <div className="relative w-12 h-32 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-red-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${stressLevel}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-white text-center mt-2 font-bold">
                    {stressLevel}%
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>角色的压力水平</p>
              </TooltipContent>
            </Tooltip>

            {/* 火药味指数 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-2">火药味</div>
                  <div className="text-3xl text-center">
                    {tensionIcons[tensionLevel]}
                  </div>
                  <div className="text-white text-center mt-2 text-xs">
                    {tensionLevel === 'low' && '平静'}
                    {tensionLevel === 'medium' && '升温'}
                    {tensionLevel === 'high' && '爆发'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>对话的紧张程度</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* 右侧控制按钮 */}
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
            onClick={() => router.push(`/script/${params.id}/deconstruction`)}
          >
            <SkipForward className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* 中央对话区域 */}
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
              {/* 角色信息 */}
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

              {/* 对话内容 */}
              <p className="text-white text-2xl leading-relaxed">
                {currentDialogue.content}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部提示 */}
      <div className="fixed bottom-8 left-0 right-0 z-40">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            点击屏幕或按空格键继续
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 4.4 沙盒对话页

**设计目标**：

- 流畅的对话体验
- 实时情绪反馈
- 清晰的进度提示

**重构方案**：

```typescript
// app/script/[id]/dialogue/page.tsx
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
import { Separator } from '@/components/ui/separator';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DeadlockDialog } from '@/components/joker/deadlock-dialog';

export default function DialoguePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get('point');

  const { script } = useScriptStore();
  const {
    messages,
    analysisResults,
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
  const [showDeadlockDialog, setShowDeadlockDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 重置对话状态
  useEffect(() => {
    reset();
  }, [pointId, reset]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 监听僵局
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
    if (!input.trim() || isAITyping || currentRound >= maxRounds) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      characterId: point.userPlaysAs,
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
        throw new Error('Failed to send message');
      }

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
    if (currentRound < 5) {
      toast.error('至少对话 5 轮才能结束');
      return;
    }
    router.push(`/script/${params.id}/report?point=${pointId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progressPercent = (currentRound / maxRounds) * 100;
  const canEnd = currentRound >= 5;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        {/* 顶部信息栏 */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-white">{point.title}</h2>
              <p className="text-slate-400 text-sm">{point.scene}</p>
            </div>
            <Button
              onClick={handleEnd}
              disabled={!canEnd}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              结束对话
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2 mb-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">
              轮次：{currentRound} / {maxRounds}
            </span>
            {hasDeadlock && (
              <Badge variant="destructive" className="animate-pulse">
                ⚠️ 检测到对话僵局
              </Badge>
            )}
            {canEnd && !hasDeadlock && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                ✓ 可以结束对话
              </Badge>
            )}
          </div>
        </Card>

        {/* 对话区域 */}
        <Card className="flex-1 bg-slate-800/30 backdrop-blur-sm border-slate-700 overflow-hidden mb-4">
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <p className="text-lg mb-2">开始你的对话吧...</p>
                  <p className="text-sm">
                    你扮演 {script.characters.find((c) => c.id === point.userPlaysAs)?.name}
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence>
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
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {character && (
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={character.avatar} />
                        <AvatarFallback>{character.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : ''}`}>
                      <div className="text-slate-400 text-xs mb-1">
                        {character?.name || '你'}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          isUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {message.content}
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
                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
                <div className="px-4 py-3 bg-slate-700 rounded-lg text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在思考...
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* 输入区域 */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回应... (Enter 发送，Shift+Enter 换行)"
              disabled={isAITyping || currentRound >= maxRounds}
              className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={isAITyping || !input.trim() || currentRound >= maxRounds}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700 h-auto"
            >
              {isAITyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
            <span>{input.length} / 200 字</span>
            <span>Enter 发送 · Shift+Enter 换行</span>
          </div>
        </Card>
      </div>

      {/* 僵局对话框 */}
      <DeadlockDialog
        open={showDeadlockDialog}
        onContinue={() => {
          setShowDeadlockDialog(false);
          setDeadlock(false);
        }}
        onEnd={() => {
          setShowDeadlockDialog(false);
          handleEnd();
        }}
      />
    </div>
  );
}
```

### 4.5 角色解构页

**设计目标**：

- 帮助用户理解角色动机
- 从情绪转向理性分析
- 为后续对话提供策略基础

**重构方案**：

```typescript
// app/script/[id]/deconstruction/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Lightbulb,
  Heart,
  Scale,
  Shield,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

export default function DeconstructionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const handleContinue = () => {
    router.push(`/script/${params.id}/joker-questioning`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              让我们重新认识这些角色
            </h1>
            <p className="text-slate-300 text-lg">
              每个人都有自己的故事和压力
            </p>
          </div>

          {/* 角色卡片轮播 */}
          <Carousel className="w-full">
            <CarouselContent>
              {script.characters.map((character) => (
                <CarouselItem key={character.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                          <Avatar className="w-32 h-32 border-4 border-purple-500/30">
                            <AvatarImage src={character.avatar} />
                            <AvatarFallback className="text-4xl">
                              {character.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <CardTitle className="text-3xl text-white">
                          {character.name}
                        </CardTitle>
                        <p className="text-slate-400">
                          {character.age} 岁 · {character.role}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* 人物背景 */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-slate-300 leading-relaxed">
                            {character.background}
                          </p>
                        </div>

                        {/* 六个维度 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 核心动机 */}
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-5 h-5 text-purple-400" />
                              <h4 className="text-white font-semibold">核心动机</h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.coreMotivation}
                            </p>
                          </div>

                          {/* 隐秘压力 */}
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-5 h-5 text-orange-400" />
                              <h4 className="text-white font-semibold">隐秘压力</h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.hiddenPressure}
                            </p>
                          </div>

                          {/* 权力等级 */}
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-5 h-5 text-blue-400" />
                              <h4 className="text-white font-semibold">权力等级</h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.powerLevel}
                            </p>
                          </div>

                          {/* 行为底线 */}
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-5 h-5 text-red-400" />
                              <h4 className="text-white font-semibold">行为底线</h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.behaviorBoundary}
                            </p>
                          </div>

                          {/* 语言风格 */}
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-green-500/20 md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-5 h-5 text-green-400" />
                              <h4 className="text-white font-semibold">语言风格</h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.languageStyle}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-slate-800/80 border-slate-700 text-white" />
            <CarouselNext className="bg-slate-800/80 border-slate-700 text-white" />
          </Carousel>

          {/* 继续按钮 */}
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 gap-2"
              onClick={handleContinue}
            >
              继续
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

### 4.6 小丑提问页

**设计目标**：

- 激活深度思考
- 收集用户想法
- 为 AI 对话提供上下文

**重构方案**：

```typescript
// app/script/[id]/joker-questioning/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { JokerAvatar } from '@/components/joker/joker-avatar';

const questions = [
  {
    id: 'q1',
    question: '你觉得邱华在哪一刻彻底失去了抵抗力？',
    hint: '回想剧中的关键转折点...',
  },
  {
    id: 'q2',
    question: '你认为小雅真的是"恶婆婆"吗？',
    hint: '试着从小雅的角度思考...',
  },
  {
    id: 'q3',
    question: '如果是你，你会怎么做？',
    hint: '没有标准答案，说出你的真实想法...',
  },
];

export default function JokerQuestioningPage() {
  const params = useParams();
  const router = useRouter();
  const { setUserThoughts } = useDialogueStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const canProceed = currentAnswer.length >= 10;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!canProceed) {
      toast.error('请至少输入 10 个字');
      return;
    }

    if (isLastQuestion) {
      // 保存答案并跳转
      setUserThoughts(answers.filter((a) => a.trim().length > 0));
      router.push(`/script/${params.id}/intervention`);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    const answeredCount = answers.filter((a) => a.trim().length >= 10).length;
    if (answeredCount === 0) {
      toast.error('请至少回答 1 个问题');
      return;
    }

    setUserThoughts(answers.filter((a) => a.trim().length > 0));
    router.push(`/script/${params.id}/intervention`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12 h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto w-full flex-1 flex flex-col"
        >
          {/* 小丑登场 */}
          <div className="text-center mb-8">
            <JokerAvatar size="lg" animate />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                嘿，看完这出戏，有什么想法吗？
              </h1>
              <p className="text-slate-300">
                让我来问你几个问题……
              </p>
            </motion.div>
          </div>

          {/* 进度指示 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">
                问题 {currentQuestionIndex + 1} / {questions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={handleSkip}
              >
                跳过
              </Button>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* 问题卡片 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    {currentQuestion.question}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    {currentQuestion.hint}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="请输入你的想法..."
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 resize-none min-h-[200px]"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span
                      className={`text-sm ${
                        currentAnswer.length >= 10
                          ? 'text-green-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {currentAnswer.length} / 500 字
                      {currentAnswer.length < 10 && ' (至少 10 字)'}
                    </span>
                    {currentAnswer.length >= 10 && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        ✓ 可以继续
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* 导航按钮 */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              上一题
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              {isLastQuestion ? '完成' : '下一题'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

### 4.7 介入点选择页

**设计目标**：

- 清晰展示所有介入点
- 帮助用户理解每个介入点的挑战
- 支持快速选择

**重构方案**：

```typescript
// app/script/[id]/intervention/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Heart,
  Shield,
  Network,
  ChevronRight,
} from 'lucide-react';

export default function InterventionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const typeConfig = {
    communication: {
      icon: MessageCircle,
      label: '沟通类',
      color: 'bg-green-600 hover:bg-green-700',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-2 border-green-500',
      textColor: 'text-green-400',
    },
    empathy: {
      icon: Heart,
      label: '同理心类',
      color: 'bg-blue-600 hover:bg-blue-700',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-2 border-blue-500',
      textColor: 'text-blue-400',
    },
    boundary: {
      icon: Shield,
      label: '边界感类',
      color: 'bg-orange-600 hover:bg-orange-700',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-2 border-orange-500',
      textColor: 'text-orange-400',
    },
    systemic: {
      icon: Network,
      label: '系统性思维类',
      color: 'bg-red-600 hover:bg-red-700',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-2 border-red-500',
      textColor: 'text-red-400',
    },
  };

  const handleSelect = (pointId: string) => {
    router.push(`/script/${params.id}/dialogue?point=${pointId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              选择一个时刻，取代主角
            </h1>
            <p className="text-slate-300 text-lg">
              尝试改变剧情，探索不同的可能性
            </p>
          </div>

          {/* 介入点卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {script.interventionPoints.map((point, index) => {
              const config = typeConfig[point.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <Card
                    className={`group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 backdrop-blur-sm border-slate-700 cursor-pointer ${config.bgColor} ${config.borderColor}`}
                    onClick={() => handleSelect(point.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className={`${config.bgColor} ${config.textColor} border-0`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          {point.position}%
                        </Badge>
                      </div>
                      <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                        {point.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-slate-400 text-sm mb-1">场景</h4>
                        <p className="text-slate-300">{point.scene}</p>
                      </div>
                      <div>
                        <h4 className="text-slate-400 text-sm mb-1">冲突</h4>
                        <p className="text-slate-300">{point.conflict}</p>
                      </div>
                      <div>
                        <h4 className="text-slate-400 text-sm mb-1">考验</h4>
                        <p className="text-slate-300">{point.challenge}</p>
                      </div>

                      <Button
                        className={`w-full ${config.color} gap-2`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(point.id);
                        }}
                      >
                        选择这个时刻
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

### 4.8 分析报告页

**设计目标**：

- 趣味化展示分析结果
- 提供有价值的反思
- 鼓励分享和重新参演

**重构方案**：

```typescript
// app/script/[id]/report/page.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Report } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, RotateCcw, Home, Sparkles, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { ShareDialog } from '@/components/report/share-dialog';
import { Confetti } from '@/components/ui/confetti';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get('point');

  const { script } = useScriptStore();
  const { messages, analysisResults } = useDialogueStore();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const generateReport = async () => {
      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptId: script?.id,
            interventionPointId: pointId,
            messages,
            analysisResults,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate report');
        }

        const data = await response.json();
        setReport(data);
        setShowConfetti(true);
        toast.success('报告生成成功！');
      } catch (error) {
        console.error('Failed to generate report:', error);
        toast.error('生成报告失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    if (script && pointId && messages.length > 0) {
      generateReport();
    }
  }, [script, pointId, messages, analysisResults]);

  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">正在生成你的参演报告...</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const dimensionConfig = {
    boundary: {
      label: '边界感',
      color: 'bg-purple-500',
      icon: '🛡️',
    },
    strategy: {
      label: '策略性',
      color: 'bg-blue-500',
      icon: '🎯',
    },
    empathy: {
      label: '同理心',
      color: 'bg-green-500',
      icon: '💚',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Confetti trigger={showConfetti} />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              你的参演报告
            </h1>
            <p className="text-slate-300">
              恭喜完成这次探索！让我们看看你的表现...
            </p>
          </div>

          {/* 英雄类型卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-purple-950 border-2 border-purple-500 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-purple-400 flex items-center justify-center text-4xl">
                    🏆
                  </div>
                </div>
                <CardTitle className="text-3xl text-white">
                  {report.heroType.name}
                </CardTitle>
                <CardDescription className="text-purple-200 text-lg">
                  {report.heroType.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* 三维分析卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  你的沟通能力分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(report.dimensions).map(([key, value]) => {
                  const config = dimensionConfig[key as keyof typeof dimensionConfig];
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                        <span className="text-white font-bold text-lg">
                          {value}
                        </span>
                      </div>
                      <div className="relative h-3 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                        <motion.div
                          className={`absolute top-0 left-0 h-full ${config.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* 关键时刻卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Quote className="w-5 h-5" />
                  你最精彩的一句话
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-white text-lg italic">
                    "{report.keyMoment.quote}"
                  </p>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <p className="text-purple-200">
                    💬 小丑点评：{report.keyMoment.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI 内心独白卡片 */}
          {report.aiThoughts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    🤫 AI 的背地里评价
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    看看角色们内心真正的想法...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.aiThoughts.map((thought, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/50 rounded-lg p-4"
                    >
                      <div className="text-slate-400 text-sm mb-1">
                        {thought.characterName}
                      </div>
                      <p className="text-white italic">"{thought.thought}"</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 知识卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Card className="bg-blue-950 border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📚 相关知识
                </CardTitle>
                <CardDescription className="text-blue-200 text-lg font-semibold">
                  {report.knowledge.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {report.knowledge.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ShareDialog report={report} />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`/script/${params.id}/intervention`)}
            >
              <RotateCcw className="w-4 h-4" />
              尝试其他介入点
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 5. 新增组件库

### 5.1 通用组件

#### 5.1.1 TypingText（打字机效果）

```typescript
// components/ui/typing-text.tsx
'use client';

import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypingText({
  text,
  speed = 50,
  onComplete,
  className,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span className={className}>{displayedText}</span>;
}
```

#### 5.1.2 Confetti（庆祝效果）

```bash
bun add canvas-confetti
bun add -d @types/canvas-confetti
```

```typescript
// components/ui/confetti.tsx
"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

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
        colors: ["#a855f7", "#ec4899", "#8b5cf6"],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#a855f7", "#ec4899", "#8b5cf6"],
      });
    }, 50);

    return () => clearInterval(interval);
  }, [trigger, duration]);

  return null;
}
```

### 5.2 业务组件

#### 5.2.1 EmotionIndicator（情绪指标）

```typescript
// components/observation/emotion-indicator.tsx
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EmotionIndicatorProps {
  stressLevel: number;
  tensionLevel: 'low' | 'medium' | 'high';
  compact?: boolean;
}

export function EmotionIndicator({
  stressLevel,
  tensionLevel,
  compact = false,
}: EmotionIndicatorProps) {
  const tensionConfig = {
    low: { icon: '💧', label: '平静', color: 'text-blue-400' },
    medium: { icon: '🔥', label: '升温', color: 'text-orange-400' },
    high: { icon: '🔥🔥', label: '爆发', color: 'text-red-400' },
  };

  const config = tensionConfig[tensionLevel];

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">压力值</span>
          <span className="text-white font-bold">{stressLevel}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">火药味</span>
          <span className={config.color}>{config.icon} {config.label}</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* 压力值 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-slate-900 border-2 border-slate-700 p-3">
              <div className="text-white/60 text-xs mb-2">压力值</div>
              <div className="relative w-12 h-32 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-red-500"
                  initial={{ height: 0 }}
                  animate={{ height: `${stressLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-white text-center mt-2 font-bold">
                {stressLevel}%
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>角色的压力水平</p>
          </TooltipContent>
        </Tooltip>

        {/* 火药味指数 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-slate-900 border-2 border-slate-700 p-3">
              <div className="text-white/60 text-xs mb-2">火药味</div>
              <div className="text-3xl text-center">{config.icon}</div>
              <div className={`text-center mt-2 text-xs ${config.color}`}>
                {config.label}
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>对话的紧张程度</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
```

---

## 6. 动画与过渡

### 6.1 页面过渡

```typescript
// components/ui/page-transition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 6.2 加载状态

```typescript
// components/ui/loading-spinner.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          'animate-spin text-purple-500',
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
```

### 5.3 小丑相关组件

#### 5.3.1 JokerAvatar（增强版）

```typescript
// components/joker/joker-avatar.tsx
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
```

#### 5.3.2 JokerTooltip（小丑提示）

```typescript
// components/joker/joker-tooltip.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { JokerAvatar } from './joker-avatar';

interface JokerTooltipProps {
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export function JokerTooltip({
  message,
  duration = 3000,
  onComplete,
}: JokerTooltipProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border-purple-500/30 shadow-2xl max-w-sm">
            <div className="p-4 flex gap-3">
              <JokerAvatar size="sm" />
              <div className="flex-1">
                <p className="text-white">{message}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 5.4 报告相关组件

#### 5.4.1 DimensionChart（维度图表）

```typescript
// components/report/dimension-chart.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DimensionChartProps {
  dimensions: {
    boundary: number;
    strategy: number;
    empathy: number;
  };
}

export function DimensionChart({ dimensions }: DimensionChartProps) {
  const dimensionConfig = {
    boundary: {
      label: '边界感',
      color: 'bg-purple-500',
      icon: '🛡️',
      description: '清晰表达自己的底线和原则',
    },
    strategy: {
      label: '策略性',
      color: 'bg-blue-500',
      icon: '🎯',
      description: '采用有效的沟通策略',
    },
    empathy: {
      label: '同理心',
      color: 'bg-green-500',
      icon: '💚',
      description: '理解对方的感受和处境',
    },
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">你的沟通能力分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(dimensions).map(([key, value], index) => {
          const config = dimensionConfig[key as keyof typeof dimensionConfig];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <span className="text-white font-bold text-lg">{value}</span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                <motion.div
                  className={`absolute top-0 left-0 h-full ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.5 + 0.1 * index, duration: 1 }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {config.description}
              </p>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

#### 5.4.2 HeroTypeBadge（英雄徽章）

```typescript
// components/report/hero-type-badge.tsx
'use client';

import { motion } from 'framer-motion';
import { HeroType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface HeroTypeBadgeProps {
  heroType: HeroType;
}

export function HeroTypeBadge({ heroType }: HeroTypeBadgeProps) {
  return (
    <Card className="bg-purple-950 border-2 border-purple-500 overflow-hidden">
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          className="flex justify-center mb-4"
        >
          <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-purple-400 flex items-center justify-center text-4xl">
            🏆
          </div>
        </motion.div>
        <CardTitle className="text-3xl text-white">{heroType.name}</CardTitle>
        <CardDescription className="text-purple-200 text-lg">
          {heroType.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### 5.5 性能优化组件

#### 5.5.1 LazyImage（优化版）

```typescript
// components/ui/lazy-image.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  aspectRatio = '16/9',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio }}
    >
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
```

---

## 6. 动画与过渡

### 6.1 全局动画配置

```typescript
// lib/constants/animations.ts
export const transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInFromRightVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const slideInFromLeftVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};
```

### 6.2 页面过渡包装器

```typescript
// app/layout.tsx
import { PageTransition } from '@/components/ui/page-transition';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

### 6.3 微交互动画

```typescript
// components/ui/animated-button.tsx
'use client';

import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function AnimatedButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
```

### 6.4 加载骨架屏

```typescript
// components/ui/page-skeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Card className="bg-slate-800/50">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. 错误处理与反馈

### 6.1 统一错误处理

```typescript
// lib/utils/error-handler.ts
import { toast } from "sonner";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 404:
        toast.error("资源未找到");
        break;
      case 500:
        toast.error("服务器错误，请稍后重试");
        break;
      default:
        toast.error(error.message || "请求失败");
    }
  } else {
    toast.error("发生未知错误，请重试");
  }
  console.error("API Error:", error);
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.message || "Request failed",
        response.status,
        error.code,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Network error", 0);
  }
}
```

### 6.2 Toast 通知配置

```typescript
// app/layout.tsx
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgb(30 41 59 / 0.9)',
              color: 'white',
              border: '1px solid rgb(148 163 184 / 0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}
```

### 6.3 错误边界

```typescript
// components/ui/error-boundary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <Card className="max-w-md bg-slate-800/80 backdrop-blur-sm border-slate-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-white">出错了</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-center">
                抱歉，遇到了一些问题。请刷新页面重试。
              </p>
              {this.state.error && (
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer">错误详情</summary>
                  <pre className="mt-2 p-2 bg-slate-900 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button
                className="w-full"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. 性能优化

### 7.1 图片预加载

```typescript
// lib/utils/preload.ts
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map((src) => preloadImage(src)));
}

// 在剧本介绍页预加载场景背景
export async function preloadScriptAssets(script: Script) {
  const imageUrls = [
    script.coverImage,
    ...script.acts.map((act) => act.sceneBackground),
    ...script.characters.map((char) => char.avatar),
  ];

  await preloadImages(imageUrls);
}
```

### 7.2 防抖和节流

```typescript
// lib/utils/performance.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### 7.3 代码分割

```typescript
// app/script/[id]/dialogue/page.tsx
import dynamic from "next/dynamic";

// 动态导入大型组件
const DeadlockDialog = dynamic(
  () =>
    import("@/components/joker/deadlock-dialog").then(
      (mod) => mod.DeadlockDialog,
    ),
  { ssr: false },
);

const ShareDialog = dynamic(
  () =>
    import("@/components/report/share-dialog").then((mod) => mod.ShareDialog),
  { ssr: false },
);
```

---

## 8. 详细 TODO 列表

### 📋 总览

**总计任务数**：120+ 个任务  
**预计完成时间**：3-4 周  
**优先级说明**：

- 🔴 P0 - 关键任务，必须完成
- 🟡 P1 - 重要任务，应该完成
- 🟢 P2 - 优化任务，可选完成

---

### 阶段 0：环境准备（1 天）✅

#### 0.1 依赖安装 🔴 P0 ✅

- [x] 安装 Framer Motion
  ```bash
  bun add framer-motion
  ```
- [x] 安装 html2canvas 和类型定义
  ```bash
  bun add html2canvas
  bun add -d @types/html2canvas
  ```
- [x] 安装 canvas-confetti 和类型定义
  ```bash
  bun add canvas-confetti
  bun add -d @types/canvas-confetti
  ```

#### 0.2 配置文件更新 🔴 P0 ✅

- [x] 更新 `app/globals.css`（添加扁平化色彩系统到 Tailwind CSS 4 inline theme）
- [x] 验证 `.env.local`（配置 MOONSHOT_API_KEY）
- [x] 验证 `next.config.ts` 配置
- [x] 验证 `tsconfig.json` 配置

#### 0.3 常量文件创建 🔴 P0 ✅

- [x] 创建 `lib/constants/emotions.ts`（情绪色彩常量）
- [x] 创建 `lib/constants/animations.ts`（动画配置常量）
- [x] 创建 `lib/constants/breakpoints.ts`（响应式断点）

---

### 阶段 1：核心问题修复（1 周）

#### 1.1 对话 API 角色选择逻辑修复 🔴 P0 ✅

- [x] 扩展 `InterventionPoint` 类型定义
  - [x] 添加 `userPlaysAs: string` 字段
  - [x] 添加 `dialogueWith: string` 字段
  - [x] 更新 `lib/types/script.ts`
- [x] 更新剧本数据
  - [x] 修改 `data/scripts/city-moonlight.json`
  - [x] 为每个介入点添加 `userPlaysAs` 和 `dialogueWith`
  - [x] 验证所有角色 ID 正确
- [x] 修复 API 路由逻辑
  - [x] 更新 `app/api/dialogue/route.ts`
  - [x] 使用 `point.dialogueWith` 查找角色
  - [x] 添加错误处理
  - [x] 添加日志记录
- [x] 测试修复
  - [x] 运行 TypeScript 类型检查通过

#### 1.2 观演结束判断竞态修复 🔴 P0 ✅

- [x] 扩展 ScriptStore
  - [x] 添加 `isScriptEnded: boolean` 状态
  - [x] 添加 `setScriptEnded` 操作
  - [x] 更新 `lib/stores/script-store.ts`
- [x] 修改 `nextDialogue` 方法
  - [x] 在对话结束时设置 `isScriptEnded = true`
  - [x] 停止播放
  - [x] 添加日志
- [x] 修改 `reset` 方法
  - [x] 重置 `isScriptEnded` 为 `false`
- [x] 修复观演页面
  - [x] 更新 `app/script/[id]/observation/page.tsx`
  - [x] 使用 `useEffect` 监听 `isScriptEnded`
  - [x] 在状态变化时跳转
- [x] 测试修复
  - [x] 运行 TypeScript 类型检查通过

#### 1.3 僵局检测和小丑介入 🔴 P0 ✅

- [x] 创建僵局对话框组件
  - [x] 创建 `components/joker/deadlock-dialog.tsx`
  - [x] 实现 `AlertDialog` 布局
  - [x] 添加小丑头像
  - [x] 添加"继续尝试"和"结束对话"按钮
  - [x] 使用扁平化设计风格
- [ ] 集成到对话页面（待后续实现对话页时完成）
  - [ ] 更新 `app/script/[id]/dialogue/page.tsx`
  - [ ] 添加 `showDeadlockDialog` 状态
  - [ ] 监听 `hasDeadlock` 状态
  - [ ] 实现 `handleContinue` 逻辑
  - [ ] 实现 `handleEnd` 逻辑
- [ ] 测试僵局检测（待对话页完成后测试）

#### 1.4 流式输出实现 🟡 P1

- [ ] 创建流式 API 端点
  - [ ] 创建 `app/api/dialogue/stream/route.ts`
  - [ ] 实现 SSE 流式响应
  - [ ] 配置 Edge Runtime
  - [ ] 添加错误处理
- [ ] 扩展 AIDialogueEngine
  - [ ] 添加 `generateResponseStream` 方法
  - [ ] 实现流式生成逻辑
  - [ ] 更新 `lib/engines/ai-dialogue-engine.ts`
- [ ] 前端集成流式 API
  - [ ] 更新 `app/script/[id]/dialogue/page.tsx`
  - [ ] 实现 `handleSendStream` 方法
  - [ ] 使用 ReadableStream 读取响应
  - [ ] 实时更新消息内容
  - [ ] 添加打字机效果
- [ ] 测试流式输出
  - [ ] 测试流式响应
  - [ ] 测试中断处理
  - [ ] 测试错误恢复

#### 1.5 分享报告功能 🔴 P0

- [ ] 创建分享对话框组件
  - [ ] 创建 `components/report/share-dialog.tsx`
  - [ ] 实现报告预览区域（扁平化设计）
  - [ ] 集成 html2canvas
  - [ ] 实现图片生成逻辑
  - [ ] 实现下载功能
  - [ ] 实现复制到剪贴板功能
- [ ] 集成到报告页面
  - [ ] 更新 `app/script/[id]/report/page.tsx`
  - [ ] 添加分享按钮
  - [ ] 传递 report 数据
- [ ] 测试分享功能
  - [ ] 测试图片生成
  - [ ] 测试下载功能
  - [ ] 测试复制功能
  - [ ] 测试不同设备兼容性

#### 1.6 内心独白生成 🟡 P1

- [ ] 修改 AIDialogueEngine
  - [ ] 更新 `generateInternalThought` 方法
  - [ ] 使用 LLM 生成个性化独白
  - [ ] 基于角色设定和对话内容
  - [ ] 添加错误处理和降级逻辑
  - [ ] 更新 `lib/engines/ai-dialogue-engine.ts`
- [ ] 测试内心独白
  - [ ] 测试生成质量
  - [ ] 测试错误降级
  - [ ] 验证角色一致性

---

### 阶段 2：设计系统建立（2 天）

#### 2.1 色彩系统 🔴 P0 ✅

- [x] 创建情绪色彩常量
  - [x] 定义 `emotionBackgrounds`（扁平化纯色）
  - [x] 定义 `emotionColors`（文本和边框色）
  - [x] 定义 `emotionAccents`（强调色）
  - [x] 更新 `lib/constants/emotions.ts`
- [x] 更新 Tailwind 配置
  - [x] 添加主题色配置
  - [x] 添加情绪色配置
  - [x] 添加英雄类型色配置
  - [x] 更新 `app/globals.css` (Tailwind CSS 4 inline theme)

#### 2.2 动画系统 🟡 P1 ✅

- [x] 创建动画配置常量
  - [x] 定义过渡时长
  - [x] 定义缓动函数
  - [x] 定义常用动画变体
  - [x] 更新 `lib/constants/animations.ts`
- [x] 创建动画组件
  - [x] 创建 `components/ui/motion.tsx`
  - [x] 导出 FadeIn、SlideIn、ScaleIn 组件
  - [x] 导出动画变体

#### 2.3 工具函数 🟡 P1 ✅

- [x] 创建错误处理工具
  - [x] 创建 `lib/utils/error-handler.ts`
  - [x] 实现 APIError 类
  - [x] 实现 handleAPIError 函数
  - [x] 实现 fetchWithErrorHandling 函数
- [x] 创建性能优化工具
  - [x] 创建 `lib/utils/performance.ts`
  - [x] 实现 debounce 函数
  - [x] 实现 throttle 函数
- [x] 创建预加载工具
  - [x] 创建 `lib/utils/preload.ts`
  - [x] 实现 preloadImage 函数
  - [x] 实现 preloadImages 函数
  - [x] 实现 preloadScriptAssets 函数

---

### 阶段 3：通用组件开发（3 天）

#### 3.1 基础 UI 组件 🔴 P0 ✅

- [x] TypingText（打字机效果）
  - [x] 创建 `components/ui/typing-text.tsx`
  - [x] 实现逐字显示逻辑
  - [x] 添加速度控制
  - [x] 添加完成回调
- [x] Confetti（庆祝动画）
  - [x] 创建 `components/ui/confetti.tsx`
  - [x] 集成 canvas-confetti
  - [x] 实现触发逻辑
  - [x] 配置动画参数
- [x] LoadingSpinner（加载状态）
  - [x] 创建 `components/ui/loading-spinner.tsx`
  - [x] 支持不同尺寸
  - [x] 使用扁平化设计
- [x] PageTransition（页面过渡）
  - [x] 创建 `components/ui/page-transition.tsx`
  - [x] 使用 Framer Motion
  - [x] 实现淡入淡出效果
- [x] AnimatedButton（动画按钮）
  - [x] 创建 `components/ui/animated-button.tsx`
  - [x] 添加悬停和点击动画
  - [x] 使用扁平化设计
- [x] PageSkeleton（骨架屏）
  - [x] 创建 `components/ui/page-skeleton.tsx`
  - [x] 使用 Skeleton 组件
  - [x] 匹配页面布局

#### 3.2 错误处理组件 🔴 P0 ✅

- [x] ErrorBoundary（错误边界）
  - [x] 创建 `components/ui/error-boundary.tsx`
  - [x] 实现错误捕获
  - [x] 设计错误 UI（扁平化）
  - [x] 添加刷新功能
- [ ] Toast 通知配置（待 layout.tsx 更新时完成）
  - [ ] 在 `app/layout.tsx` 中配置 Toaster
  - [ ] 自定义样式（扁平化）
  - [ ] 配置位置和持续时间

#### 3.3 性能优化组件 🟡 P1 ✅

- [x] LazyImage（懒加载图片）
  - [x] 创建 `components/ui/lazy-image.tsx`
  - [x] 实现 IntersectionObserver
  - [x] 添加加载状态
  - [x] 支持纵横比

---

### 阶段 4：业务组件开发（3 天）

#### 4.1 观演相关组件 🔴 P0 ✅

- [x] EmotionIndicator（情绪指标）
  - [x] 创建 `components/observation/emotion-indicator.tsx`
  - [x] 实现压力值显示（扁平化进度条）
  - [x] 实现火药味显示
  - [x] 支持紧凑模式
  - [x] 添加 Tooltip 说明

#### 4.2 小丑相关组件 🔴 P0 ✅

- [x] JokerAvatar（小丑头像）
  - [x] 创建/更新 `components/joker/joker-avatar.tsx`
  - [x] 支持不同尺寸
  - [x] 添加动画效果
  - [x] 使用扁平化设计（纯色圆形 + 边框）
- [ ] JokerTooltip（小丑提示）（待小丑提问页实现时完成）
  - [ ] 创建 `components/joker/joker-tooltip.tsx`
  - [ ] 实现自动消失逻辑
  - [ ] 使用扁平化卡片设计
- [x] DeadlockDialog（僵局对话框）
  - [x] 已在阶段 1.3 完成

#### 4.3 报告相关组件 🔴 P0 ✅

- [x] DimensionChart（维度图表）
  - [x] 创建 `components/report/dimension-chart.tsx`
  - [x] 实现三维度显示
  - [x] 使用扁平化进度条
  - [x] 添加动画效果
- [x] HeroTypeBadge（英雄徽章）
  - [x] 创建 `components/report/hero-type-badge.tsx`
  - [x] 使用扁平化卡片设计
  - [x] 添加缩放动画
- [x] ShareDialog（分享对话框）
  - [x] 创建 `components/report/share-dialog.tsx`
  - [x] 集成 html2canvas
  - [x] 实现图片生成和分享功能

---

### 阶段 5：页面重构（2 周）

#### 5.1 首页重构 🔴 P0 ✅

- [x] Hero 区域
  - [x] 更新 `app/page.tsx`
  - [x] 使用扁平化背景（`bg-slate-950`）
  - [x] 重构标题样式（移除渐变文字）
  - [x] 更新按钮样式（纯色 + 边框）
  - [x] 添加动画效果
- [x] 议题卡片网格
  - [x] 重构卡片样式（扁平化边框）
  - [x] 移除渐变遮罩
  - [x] 优化悬停效果
  - [x] 添加加载状态
- [ ] 响应式适配（待测试阶段验证）
  - [ ] 测试移动端布局
  - [ ] 测试平板布局
  - [ ] 优化间距和字体大小

#### 5.2 剧本介绍页重构 🔴 P0 ✅

- [x] 页面布局
  - [x] 更新 `app/script/[id]/page.tsx`
  - [x] 使用扁平化背景
  - [x] 重构卡片样式
  - [x] 优化背景图模糊效果
- [x] 角色介绍区域
  - [x] 使用扁平化卡片
  - [x] 优化头像显示
  - [x] 添加网格布局
- [x] 体验说明区域
  - [x] 使用扁平化列表
  - [x] 添加图标
  - [x] 优化排版
- [x] 开始按钮
  - [x] 使用扁平化按钮样式
  - [x] 添加悬停动画

#### 5.3 沉浸式观演页重构 🔴 P0 ✅

- [x] 页面布局
  - [x] 更新 `components/observation-view.tsx`
  - [x] 使用情绪纯色背景（移除渐变）
  - [x] 优化进度条样式（扁平化）
  - [x] 重构顶部信息栏
- [x] 情绪指标
  - [x] 集成 EmotionIndicator 组件
  - [x] 使用扁平化设计
  - [x] 优化位置和布局
- [x] 对话气泡
  - [x] 使用扁平化卡片
  - [x] 优化动画效果
  - [x] 添加角色信息
- [x] 控制按钮
  - [x] 添加播放/暂停按钮
  - [x] 添加跳过按钮
  - [x] 使用扁平化图标按钮
- [x] 自动播放逻辑
  - [x] 优化定时器逻辑
  - [x] 添加暂停功能
  - [x] 处理结束跳转

#### 5.4 角色解构页重构 🔴 P0 ✅

- [x] 页面布局
  - [x] 更新 `app/script/[id]/deconstruction/page.tsx`
  - [x] 使用扁平化背景
  - [x] 优化标题样式
- [x] 角色卡片轮播
  - [x] 集成 Carousel 组件
  - [x] 使用扁平化卡片设计
  - [x] 优化头像显示
- [x] 六个维度展示
  - [x] 使用扁平化色块
  - [x] 添加图标
  - [x] 优化网格布局
  - [x] 使用清晰边框
- [x] 继续按钮
  - [x] 使用扁平化按钮样式
  - [x] 添加动画效果

#### 5.5 小丑提问页重构 🔴 P0 ✅

- [x] 页面布局
  - [x] 更新 `app/script/[id]/joker-questioning/page.tsx`
  - [x] 使用扁平化背景
  - [x] 优化小丑头像显示
- [x] 问题卡片
  - [x] 使用扁平化卡片设计
  - [x] 优化输入框样式
  - [x] 添加字数统计
- [x] 进度指示
  - [x] 使用扁平化进度条
  - [x] 显示当前问题数
  - [x] 添加跳过按钮
- [x] 导航按钮
  - [x] 上一题/下一题按钮
  - [x] 完成按钮
  - [x] 使用扁平化样式
- [x] 动画效果
  - [x] 问题切换动画
  - [x] 输入反馈动画

#### 5.6 介入点选择页重构 🔴 P0 ✅

- [x] 页面布局
  - [x] 更新 `app/script/[id]/intervention/page.tsx`
  - [x] 使用扁平化背景
  - [x] 优化标题样式
- [x] 介入点卡片
  - [x] 使用扁平化卡片设计
  - [x] 添加类型徽章（扁平化）
  - [x] 优化边框颜色
  - [x] 添加悬停效果
- [x] 类型配置
  - [x] 更新类型图标
  - [x] 使用扁平化按钮颜色
  - [x] 优化边框样式
- [x] 网格布局
  - [x] 响应式网格
  - [x] 优化间距
  - [x] 添加加载动画

#### 5.7 沙盒对话页重构 🔴 P0

- [ ] 页面布局
  - [ ] 更新 `app/script/[id]/dialogue/page.tsx`
  - [ ] 使用扁平化背景
  - [ ] 优化容器布局
- [ ] 顶部信息栏
  - [ ] 使用扁平化卡片
  - [ ] 显示轮次进度（扁平化进度条）
  - [ ] 添加结束按钮
  - [ ] 显示僵局提示
- [ ] 对话区域
  - [ ] 使用扁平化消息气泡
  - [ ] 优化头像显示
  - [ ] 添加加载状态
  - [ ] 实现自动滚动
- [ ] 输入区域
  - [ ] 使用扁平化输入框
  - [ ] 添加发送按钮（扁平化）
  - [ ] 显示字数统计
  - [ ] 添加快捷键提示
- [ ] 僵局对话框
  - [ ] 集成 DeadlockDialog 组件
  - [ ] 处理用户选择

#### 5.8 分析报告页重构 🔴 P0

- [ ] 页面布局
  - [ ] 更新 `app/script/[id]/report/page.tsx`
  - [ ] 使用扁平化背景
  - [ ] 添加 Confetti 动画
- [ ] 英雄类型卡片
  - [ ] 使用扁平化卡片设计
  - [ ] 优化徽章样式（纯色圆形 + 边框）
  - [ ] 添加缩放动画
- [ ] 三维分析卡片
  - [ ] 集成 DimensionChart 组件
  - [ ] 使用扁平化进度条
  - [ ] 添加动画效果
- [ ] 关键时刻卡片
  - [ ] 使用扁平化卡片
  - [ ] 添加边框强调
  - [ ] 显示小丑点评
- [ ] AI 内心独白卡片
  - [ ] 使用扁平化卡片
  - [ ] 显示角色名称
  - [ ] 优化排版
- [ ] 知识卡片
  - [ ] 使用扁平化卡片
  - [ ] 添加彩色边框
  - [ ] 优化内容排版
- [ ] 操作按钮
  - [ ] 分享按钮（集成 ShareDialog）
  - [ ] 重试按钮
  - [ ] 返回首页按钮
  - [ ] 使用扁平化样式

---

### 阶段 6：测试与优化（1 周）

#### 6.1 功能测试 🔴 P0

- [ ] 页面导航测试
  - [ ] 测试首页加载
  - [ ] 测试剧本介绍页
  - [ ] 测试观演页自动播放
  - [ ] 测试观演结束跳转
  - [ ] 测试角色解构页
  - [ ] 测试小丑提问页
  - [ ] 测试介入点选择
  - [ ] 测试对话页
  - [ ] 测试报告页
- [ ] 对话功能测试
  - [ ] 测试消息发送
  - [ ] 测试 AI 响应
  - [ ] 测试僵局检测
  - [ ] 测试流式输出（如果实现）
  - [ ] 测试轮次限制
- [ ] 报告功能测试
  - [ ] 测试报告生成
  - [ ] 测试分享功能
  - [ ] 测试图片下载
  - [ ] 测试图片复制
- [ ] 错误处理测试
  - [ ] 测试网络错误
  - [ ] 测试 API 错误
  - [ ] 测试数据缺失
  - [ ] 测试边界条件

#### 6.2 交互测试 🟡 P1

- [ ] 动画测试
  - [ ] 测试页面过渡动画
  - [ ] 测试按钮悬停效果
  - [ ] 测试卡片悬停效果
  - [ ] 测试加载动画
  - [ ] 测试 Confetti 动画
- [ ] 响应式测试
  - [ ] 测试移动端布局（375px、414px）
  - [ ] 测试平板布局（768px、1024px）
  - [ ] 测试桌面布局（1280px、1920px）
  - [ ] 测试横屏模式
- [ ] 交互反馈测试
  - [ ] 测试 Toast 通知
  - [ ] 测试 Tooltip 提示
  - [ ] 测试 Dialog 对话框
  - [ ] 测试加载状态

#### 6.3 性能测试 🟡 P1

- [ ] 加载性能
  - [ ] 测试首屏加载时间（目标 < 1.5s）
  - [ ] 测试页面切换速度
  - [ ] 测试图片加载优化
  - [ ] 测试代码分割效果
- [ ] 运行时性能
  - [ ] 测试动画帧率（目标 > 60fps）
  - [ ] 测试长对话性能
  - [ ] 测试内存使用
  - [ ] 检查内存泄漏
- [ ] 网络性能
  - [ ] 测试 API 响应时间
  - [ ] 测试慢速网络体验
  - [ ] 测试离线处理

#### 6.4 兼容性测试 🟡 P1

- [ ] 浏览器兼容性
  - [ ] Chrome（最新版）
  - [ ] Safari（最新版）
  - [ ] Firefox（最新版）
  - [ ] Edge（最新版）
- [ ] 设备兼容性
  - [ ] iPhone（Safari）
  - [ ] Android（Chrome）
  - [ ] iPad（Safari）
  - [ ] Android 平板
- [ ] 操作系统
  - [ ] macOS
  - [ ] Windows
  - [ ] iOS
  - [ ] Android

#### 6.5 用户体验测试 🟡 P1

- [ ] 可用性测试
  - [ ] 首次用户能否快速理解产品
  - [ ] 操作流程是否顺畅
  - [ ] 错误提示是否清晰
  - [ ] 帮助信息是否充分
- [ ] 无障碍性测试
  - [ ] 键盘导航
  - [ ] 屏幕阅读器兼容
  - [ ] 颜色对比度
  - [ ] 焦点管理
- [ ] 内容测试
  - [ ] 文案是否清晰
  - [ ] 图标是否易懂
  - [ ] 反馈是否及时

#### 6.6 Bug 修复 🔴 P0

- [ ] 收集测试问题
  - [ ] 创建问题清单
  - [ ] 按优先级排序
  - [ ] 分配责任人
- [ ] 修复关键问题
  - [ ] 修复功能性 Bug
  - [ ] 修复性能问题
  - [ ] 修复兼容性问题
- [ ] 回归测试
  - [ ] 验证修复效果
  - [ ] 确保无新问题引入

---

### 阶段 7：优化与打磨（3 天）

#### 7.1 代码优化 🟢 P2

- [ ] 代码重构
  - [ ] 提取重复代码
  - [ ] 优化组件结构
  - [ ] 改进类型定义
  - [ ] 统一命名规范
- [ ] 性能优化
  - [ ] 优化图片加载
  - [ ] 优化代码分割
  - [ ] 优化缓存策略
  - [ ] 减少重渲染
- [ ] 代码质量
  - [ ] 添加 JSDoc 注释
  - [ ] 完善错误处理
  - [ ] 改进日志记录

#### 7.2 UI/UX 打磨 🟢 P2

- [ ] 视觉优化
  - [ ] 统一间距和对齐
  - [ ] 优化色彩搭配
  - [ ] 改进排版细节
  - [ ] 完善扁平化设计
- [ ] 交互优化
  - [ ] 优化动画时长
  - [ ] 改进反馈机制
  - [ ] 完善加载状态
  - [ ] 优化错误提示
- [ ] 细节打磨
  - [ ] 优化图标使用
  - [ ] 改进文案表达
  - [ ] 完善空状态设计

#### 7.3 文档完善 🟢 P2

- [ ] 代码文档
  - [ ] 为关键函数添加注释
  - [ ] 完善类型定义说明
  - [ ] 添加使用示例
- [ ] 组件文档
  - [ ] 编写组件使用说明
  - [ ] 添加 Props 说明
  - [ ] 提供代码示例
- [ ] 项目文档
  - [ ] 更新 README.md
  - [ ] 完善开发指南
  - [ ] 编写部署文档

---

### 阶段 8：部署准备（2 天）

#### 8.1 构建优化 🔴 P0

- [ ] 生产构建
  - [ ] 运行 `bun run build`
  - [ ] 检查构建错误
  - [ ] 分析构建产物大小
- [ ] 性能指标验证
  - [ ] 测试 FCP（目标 < 1.5s）
  - [ ] 测试 LCP（目标 < 2.5s）
  - [ ] 测试 FID（目标 < 100ms）
  - [ ] 测试 CLS（目标 < 0.1）
- [ ] 优化建议实施
  - [ ] 压缩图片
  - [ ] 优化字体加载
  - [ ] 配置缓存策略

#### 8.2 SEO 优化 🟡 P1

- [ ] Meta 标签
  - [ ] 配置 title 和 description
  - [ ] 添加 keywords
  - [ ] 配置 Open Graph
  - [ ] 配置 Twitter Card
- [ ] 结构化数据
  - [ ] 添加 JSON-LD
  - [ ] 配置面包屑导航
- [ ] Sitemap
  - [ ] 生成 sitemap.xml
  - [ ] 配置 robots.txt

#### 8.3 部署配置 🔴 P0

- [ ] Cloudflare Workers 配置
  - [ ] 安装 OpenNext
  - [ ] 配置 next.config.ts
  - [ ] 测试 Edge Runtime
- [ ] 环境变量
  - [ ] 配置生产环境变量
  - [ ] 验证 API 密钥
  - [ ] 配置域名
- [ ] 部署测试
  - [ ] 部署到测试环境
  - [ ] 验证功能正常
  - [ ] 测试性能指标

---

---

## 8. 依赖安装与配置

### 8.1 安装新依赖

```bash
# 安装 Framer Motion（动画库）
bun add framer-motion

# 安装 html2canvas（截图功能）
bun add html2canvas
bun add -d @types/canvas-confetti

# 安装 canvas-confetti（庆祝动画）
bun add canvas-confetti
bun add -d @types/canvas-confetti

# 安装 sonner（Toast 通知）
bun add sonner

# 确保 shadcn/ui 组件已安装
bunx shadcn@latest add button card input textarea progress badge avatar
bunx shadcn@latest add dialog alert-dialog tooltip popover
bunx shadcn@latest add carousel tabs separator skeleton
bunx shadcn@latest add drawer sheet accordion
```

### 8.2 Tailwind CSS 配置

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 情绪色
        emotion: {
          calm: "#3b82f6",
          tense: "#f59e0b",
          angry: "#ef4444",
        },
        // 英雄类型色
        hero: {
          boundary: "#8b5cf6",
          strategy: "#3b82f6",
          empathy: "#10b981",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 8.3 环境变量配置

```bash
# .env.local
MOONSHOT_API_KEY=your_kimi_api_key_here
MOONSHOT_API_URL=https://api.moonshot.cn/v1
```

---

## 9. 测试清单

### 8.1 功能测试

- [ ] 首页加载正常
- [ ] 剧本介绍页显示正确
- [ ] 观演自动播放正常
- [ ] 观演结束跳转正常
- [ ] 角色解构页显示正确
- [ ] 小丑提问页功能正常
- [ ] 介入点选择正常
- [ ] 对话发送和接收正常
- [ ] 僵局检测和介入正常
- [ ] 报告生成正常
- [ ] 分享功能正常

### 8.2 交互测试

- [ ] 按钮悬停效果正常
- [ ] 卡片悬停效果正常
- [ ] 动画流畅无卡顿
- [ ] 加载状态显示正常
- [ ] 错误提示显示正常
- [ ] Toast 通知正常
- [ ] 对话框交互正常

### 8.3 性能测试

- [ ] 首屏加载时间 < 2s
- [ ] 页面切换流畅
- [ ] 对话响应时间 < 3s
- [ ] 图片加载优化
- [ ] 无内存泄漏

### 9.4 兼容性测试

- [ ] Chrome 浏览器（最新版）
- [ ] Safari 浏览器（最新版）
- [ ] Firefox 浏览器（最新版）
- [ ] Edge 浏览器（最新版）
- [ ] 移动端浏览器（iOS Safari、Android Chrome）
- [ ] 平板设备（iPad、Android 平板）

### 9.5 用户体验测试

- [ ] 首次访问用户能快速理解产品
- [ ] 操作流程顺畅无阻塞
- [ ] 错误提示清晰友好
- [ ] 加载状态明确
- [ ] 动画流畅不卡顿
- [ ] 响应式布局适配良好
- [ ] 无障碍性支持（键盘导航、屏幕阅读器）

### 9.6 压力测试

- [ ] 长对话（20+ 轮）性能正常
- [ ] 多个剧本切换无内存泄漏
- [ ] 大量动画同时播放不卡顿
- [ ] 网络慢速情况下体验可接受
- [ ] API 超时和错误处理正常

---

## 10. 部署清单

### 10.1 构建优化

```bash
# 构建生产版本
bun run build

# 检查构建产物大小
bun run analyze

# 运行生产服务器测试
bun run start
```

### 10.2 性能指标目标

| 指标               | 目标值         | 当前值 | 状态   |
| ------------------ | -------------- | ------ | ------ |
| 首屏加载时间 (FCP) | < 1.5s         | -      | 待测试 |
| 最大内容绘制 (LCP) | < 2.5s         | -      | 待测试 |
| 首次输入延迟 (FID) | < 100ms        | -      | 待测试 |
| 累积布局偏移 (CLS) | < 0.1          | -      | 待测试 |
| 页面体积           | < 500KB (gzip) | -      | 待测试 |

### 10.3 SEO 优化

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum Theatre - 论坛剧场",
  description:
    "成为观演者，探索社会困境。在虚拟舞台上，与 AI 角色对话，探索沟通与人性。",
  keywords: ["论坛剧场", "AI 对话", "社会议题", "沟通训练", "同理心"],
  openGraph: {
    title: "Forum Theatre - 论坛剧场",
    description: "成为观演者，探索社会困境",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forum Theatre - 论坛剧场",
    description: "成为观演者,探索社会困境",
    images: ["/og-image.png"],
  },
};
```

### 10.4 Cloudflare Workers 部署配置

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 静态导出
  images: {
    unoptimized: true, // Cloudflare Workers 不支持 Next.js Image Optimization
  },
  // 使用 OpenNext 适配器
  experimental: {
    runtime: "edge",
  },
};

export default nextConfig;
```

```bash
# 安装 OpenNext
bun add -d @opennextjs/cloudflare

# 构建并部署到 Cloudflare Workers
bun run build
bunx @opennextjs/cloudflare deploy
```

---

## 11. 文档与维护

### 11.1 代码文档

```typescript
// 为关键函数添加 JSDoc 注释
/**
 * 生成 AI 对话响应
 * @param request - 对话请求对象
 * @param character - 角色信息
 * @returns AI 响应和情绪分析
 * @throws {APIError} 当 API 调用失败时
 */
async function generateResponse(
  request: AIDialogueRequest,
  character: Character,
): Promise<AIDialogueResponse> {
  // ...
}
```

### 11.2 组件文档

```markdown
# Button 组件

## 用法

\`\`\`tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  点击我
</Button>
\`\`\`

## Props

| 属性     | 类型                              | 默认值    | 描述     |
| -------- | --------------------------------- | --------- | -------- |
| variant  | 'default' \| 'outline' \| 'ghost' | 'default' | 按钮样式 |
| size     | 'sm' \| 'md' \| 'lg'              | 'md'      | 按钮大小 |
| disabled | boolean                           | false     | 是否禁用 |
```

### 11.3 更新日志

```markdown
# Changelog

## [2.0.0] - 2026-03-07

### Added

- 全新的 shadcn/ui 组件库集成
- 流畅的页面过渡动画
- 僵局检测和小丑介入功能
- 报告分享功能
- AI 内心独白生成

### Fixed

- 对话 API 角色选择逻辑错误
- 观演结束判断竞态条件
- 内心独白生成逻辑

### Changed

- 重构所有页面 UI
- 优化动画性能
- 改进错误处理

### Performance

- 图片懒加载
- 代码分割
- 预加载关键资源
```

---

## 12. 总结

本重构计划基于 shadcn/ui 组件库，遵循"好用、好看、好玩"的设计原则，采用**现代扁平化设计风格**，修复了 research_v2.md 中发现的所有问题，并全面提升了界面交互体验。

### 12.1 核心改进

#### 设计风格（Flat Design）

✅ **扁平化设计系统**

- 移除所有渐变背景，使用纯色（`bg-slate-950`、`bg-purple-950` 等）
- 使用清晰的边框（`border-2`、`border-4`）定义元素边界
- 通过色块和边框色区分功能区域
- 按钮采用纯色 + 边框设计，悬停时改变背景色
- 进度条和指示器使用扁平色块填充
- 卡片使用边框而非阴影和模糊效果

#### 问题修复（Critical）

1. ✅ **对话 API 角色选择逻辑错误**
   - 在 `InterventionPoint` 中明确定义 `userPlaysAs` 和 `dialogueWith`
   - 修复 API 路由中的角色查找逻辑
   - 确保用户始终与正确的角色对话

2. ✅ **观演结束判断竞态条件**
   - 在 `ScriptStore` 中添加 `isScriptEnded` 状态
   - 使用 `useEffect` 监听状态变化触发跳转
   - 避免在 `nextDialogue()` 后立即判断

3. ✅ **僵局检测和小丑介入**
   - 实现 `DeadlockDialog` 组件
   - 使用 `AlertDialog` 提供"继续尝试"和"结束对话"选项
   - 在对话页面集成僵局检测逻辑

4. ✅ **流式输出（可选）**
   - 创建 `/api/dialogue/stream` 端点
   - 使用 Server-Sent Events (SSE)
   - 实现打字机效果

5. ✅ **分享报告功能**
   - 使用 `html2canvas` 生成报告图片
   - 支持下载和复制到剪贴板
   - 精美的报告卡片设计

6. ✅ **AI 内心独白生成**
   - 使用 LLM 生成个性化内心独白
   - 基于角色设定和对话内容
   - 增加趣味性和真实感

#### 界面重构（Major）

1. ✅ **首页（议题广场）**
   - Hero 区域 + 议题卡片网格
   - 悬停动画和渐变效果
   - 响应式布局

2. ✅ **剧本介绍页**
   - 封面图 + 角色介绍
   - 体验说明 + 开始按钮
   - 沉浸式背景

3. ✅ **沉浸式观演页**
   - 电影级视觉效果
   - 实时情绪指标
   - 流畅的自动播放

4. ✅ **角色解构页**
   - 轮播卡片展示角色
   - 六个维度详细分析
   - 精美的视觉设计

5. ✅ **小丑提问页**
   - 渐进式问题流程
   - 进度指示和提示
   - 友好的输入体验

6. ✅ **介入点选择页**
   - 分类展示介入点
   - 清晰的挑战说明
   - 类型徽章和图标

7. ✅ **沙盒对话页**
   - 实时对话流
   - 轮次进度显示
   - 僵局检测和提示

8. ✅ **分析报告页**
   - 英雄类型徽章
   - 三维能力分析
   - 关键时刻和 AI 独白
   - 分享功能

#### 组件库（Enhancement）

1. ✅ **通用组件**
   - TypingText（打字机效果）
   - Confetti（庆祝动画）
   - LoadingSpinner（加载状态）
   - PageTransition（页面过渡）
   - ErrorBoundary（错误边界）

2. ✅ **业务组件**
   - EmotionIndicator（情绪指标）
   - JokerAvatar（小丑头像）
   - JokerTooltip（小丑提示）
   - DeadlockDialog（僵局对话框）
   - ShareDialog（分享对话框）
   - DimensionChart（维度图表）
   - HeroTypeBadge（英雄徽章）

3. ✅ **性能优化组件**
   - LazyImage（懒加载图片）
   - 代码分割（动态导入）
   - 预加载关键资源

#### 动画系统（Polish）

1. ✅ **全局动画配置**
   - 统一的过渡时长和缓动函数
   - 可复用的动画变体
   - Framer Motion 集成

2. ✅ **微交互**
   - 按钮悬停和点击效果
   - 卡片悬停动画
   - 页面切换过渡

3. ✅ **加载状态**
   - 骨架屏
   - 进度指示器
   - 加载动画

#### 错误处理（Robustness）

1. ✅ **统一错误处理**
   - APIError 类
   - handleAPIError 工具函数
   - fetchWithErrorHandling 封装

2. ✅ **用户反馈**
   - Toast 通知（Sonner）
   - 错误边界组件
   - 友好的错误提示

3. ✅ **容错设计**
   - 网络错误重试
   - 优雅降级
   - 默认值和备用方案

### 12.2 技术栈

| 技术            | 版本   | 用途       |
| --------------- | ------ | ---------- |
| Next.js         | 16.1.6 | React 框架 |
| React           | 19.2.3 | UI 库      |
| TypeScript      | 5.x    | 类型系统   |
| Tailwind CSS    | 4.x    | 样式框架   |
| shadcn/ui       | 4.0.0  | 组件库     |
| Framer Motion   | 最新   | 动画库     |
| Zustand         | 5.0.11 | 状态管理   |
| Sonner          | 最新   | Toast 通知 |
| html2canvas     | 最新   | 截图功能   |
| canvas-confetti | 最新   | 庆祝动画   |
| bun             | 最新   | 包管理工具 |

### 12.3 实施时间表

| 阶段   | 任务             | 预计时间 | 优先级 |
| ------ | ---------------- | -------- | ------ |
| 阶段 1 | 问题修复         | 1 周     | P0     |
| 阶段 2 | 首页和介绍页重构 | 3 天     | P1     |
| 阶段 3 | 观演页重构       | 3 天     | P1     |
| 阶段 4 | 对话页重构       | 5 天     | P0     |
| 阶段 5 | 报告页重构       | 3 天     | P1     |
| 阶段 6 | 测试和优化       | 1 周     | P0     |

**总计**：3-4 周

### 12.4 成功指标

#### 功能完整性

- ✅ 所有 research_v2.md 中发现的问题已修复
- ✅ 所有缺失功能已补全
- ✅ 所有页面已重构

#### 用户体验

- 🎯 首屏加载时间 < 1.5s
- 🎯 页面切换流畅无卡顿
- 🎯 动画帧率 > 60fps
- 🎯 错误提示清晰友好
- 🎯 移动端适配良好

#### 代码质量

- 🎯 TypeScript 类型覆盖率 > 95%
- 🎯 组件可复用性高
- 🎯 代码结构清晰
- 🎯 无明显性能瓶颈

#### 可维护性

- 🎯 代码文档完整
- 🎯 组件文档清晰
- 🎯 更新日志规范
- 🎯 易于扩展新功能

### 12.5 后续优化方向

#### 短期（1-2 周）

1. 添加更多剧本和介入点
2. 优化 AI 对话质量
3. 增加用户反馈收集
4. 完善无障碍性支持

#### 中期（1-2 月）

1. 实现用户账号系统
2. 添加历史记录功能
3. 支持多语言（英文）
4. 增加社交分享功能

#### 长期（3-6 月）

1. 开发移动端 App
2. 增加更多互动玩法
3. 引入社区创作功能
4. 探索商业化模式

---

## 附录

### A. 快速开始指南

```bash
# 1. 克隆项目
git clone <repository-url>
cd forum-theatre

# 2. 安装依赖
bun install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入 MOONSHOT_API_KEY

# 4. 运行开发服务器
bun run dev

# 5. 打开浏览器访问
# http://localhost:3000
```

### B. 常见问题

**Q: 如何添加新的 shadcn/ui 组件？**

```bash
bunx shadcn@latest add <component-name>
```

**Q: 如何调试 API 路由？**

```typescript
// 在 API 路由中添加日志
console.log("Request:", request);
console.log("Response:", response);
```

**Q: 如何优化构建体积？**

```bash
# 分析构建产物
bun run build
bunx @next/bundle-analyzer
```

### C. 参考资源

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Zustand 文档](https://zustand-demo.pmnd.rs)

---

**文档版本**：v2.0  
**最后更新**：2026-03-07  
**作者**：AI 交互设计专家  
**审核状态**：待审核
