# 论坛剧场数字化产品实现计划

**文档版本**：v1.0  
**更新日期**：2026-03-07  
**技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4  
**实现状态**：核心功能已完成 ✅

---

## 🎉 实现进度总结

### 已完成的核心功能

✅ **阶段 0-1**: 项目初始化和核心类型定义  
✅ **阶段 3**: 剧本引擎和状态管理  
✅ **阶段 4**: 议题广场和剧本介绍页  
✅ **阶段 5**: 沉浸式观演页面  
✅ **阶段 6**: 角色解构页面  
✅ **阶段 7**: 小丑提问页面  
✅ **阶段 8**: 介入点选择页面  
✅ **阶段 9**: AI 对话引擎（Kimi API 集成）  
✅ **阶段 10**: 沙盒对话页面  
✅ **阶段 11**: 对话分析引擎  
✅ **阶段 12**: 报告生成引擎  
✅ **阶段 13**: 分析报告页面  
✅ **阶段 14**: API 路由（对话和报告）

### 已创建的文件

**类型定义** (4 个文件):

- `lib/types/script.ts` - 剧本相关类型
- `lib/types/dialogue.ts` - 对话相关类型
- `lib/types/report.ts` - 报告相关类型
- `lib/types/index.ts` - 统一导出

**核心引擎** (4 个文件):

- `lib/engines/script-engine.ts` - 剧本引擎
- `lib/engines/ai-dialogue-engine.ts` - AI 对话引擎
- `lib/engines/dialogue-analyzer.ts` - 对话分析引擎
- `lib/engines/report-generator.ts` - 报告生成引擎

**状态管理** (2 个文件):

- `lib/stores/script-store.ts` - 剧本状态
- `lib/stores/dialogue-store.ts` - 对话状态

**页面组件** (7 个页面):

- `app/page.tsx` - 首页（议题广场）
- `app/script/[id]/page.tsx` - 剧本介绍
- `app/script/[id]/observation/page.tsx` - 沉浸式观演
- `app/script/[id]/deconstruction/page.tsx` - 角色解构
- `app/script/[id]/joker-questioning/page.tsx` - 小丑提问
- `app/script/[id]/intervention/page.tsx` - 介入点选择
- `app/script/[id]/dialogue/page.tsx` - 沙盒对话
- `app/script/[id]/report/page.tsx` - 分析报告

**UI 组件** (1 个文件):

- `components/observation-view.tsx` - 观演视图组件

**API 路由** (2 个文件):

- `app/api/dialogue/route.ts` - AI 对话 API
- `app/api/report/route.ts` - 报告生成 API

**数据文件** (2 个文件):

- `data/scripts/city-moonlight.json` - 《城里的月光》剧本数据
- `data/scripts/index.ts` - 剧本数据导出

**配置文件**:

- `.env.local.example` - 环境变量模板
- `README.md` - 项目说明文档

### 技术实现亮点

1. **完整的类型安全**: 所有代码使用 TypeScript，无 `any` 或 `unknown` 类型
2. **AI 驱动对话**: 集成 Kimi API，实现角色一致性对话
3. **实时分析**: 多维度分析用户沟通能力（边界感、策略性、同理心）
4. **状态管理**: 使用 Zustand 实现全局状态管理
5. **响应式设计**: 使用 Tailwind CSS 实现美观的渐变背景和卡片布局
6. **用户体验**: 完整的用户旅程（观演 → 解构 → 提问 → 介入 → 对话 → 报告）

### 下一步建议

以下功能可以在后续迭代中完善：

- [ ] 视觉优化（动画效果、打字机效果）
- [ ] 性能优化（图片懒加载、代码分割）
- [ ] 测试（单元测试、E2E 测试）
- [ ] 部署到 Cloudflare Workers
- [ ] 添加更多剧本数据
- [ ] 实现分享功能（生成报告图片）
- [ ] 添加音效和背景音乐

---

## 一、项目概述

### 1.1 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端应用层                          │
│  Next.js 16 App Router + React 19 + TypeScript          │
├─────────────────────────────────────────────────────────┤
│                      状态管理层                          │
│  Zustand (全局状态) + React Context (局部状态)          │
├─────────────────────────────────────────────────────────┤
│                      UI 组件层                           │
│  Tailwind CSS 4 + Framer Motion + shadcn/ui             │
│  (基于 Radix UI 的高质量组件库)                         │
├─────────────────────────────────────────────────────────┤
│                      业务逻辑层                          │
│  剧本引擎 | AI 对话引擎 | 分析引擎 | 报告生成引擎        │
├─────────────────────────────────────────────────────────┤
│                      API 层                              │
│  Next.js API Routes + OpenAI API                        │
├─────────────────────────────────────────────────────────┤
│                      数据层                              │
│  JSON 文件 (本地存储，适合 MVP 和演示)                  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 项目结构

```
forum-theatre/
├── app/                          # Next.js App Router
│   ├── (home)/                   # 首页路由组
│   │   ├── page.tsx              # 议题广场
│   │   └── layout.tsx
│   ├── script/                   # 剧本路由
│   │   └── [id]/                 # 动态路由
│   │       ├── page.tsx          # 议题介绍页
│   │       ├── watch/            # 观演页面
│   │       ├── analyze/          # 角色解构页面
│   │       ├── question/         # 小丑提问页面
│   │       ├── choose/           # 选择介入点页面
│   │       ├── dialogue/         # 沙盒对话页面
│   │       └── report/           # 分析报告页面
│   ├── api/                      # API 路由
│   │   ├── dialogue/             # AI 对话 API
│   │   ├── analyze/              # 对话分析 API
│   │   └── report/               # 报告生成 API
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   ├── ui/                       # 基础 UI 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── script/                   # 剧本相关组件
│   │   ├── dialogue-bubble.tsx   # 对话气泡
│   │   ├── character-card.tsx    # 角色卡片
│   │   ├── emotion-indicator.tsx # 情绪指标
│   │   └── ...
│   └── shared/                   # 共享组件
│       ├── header.tsx
│       ├── footer.tsx
│       └── ...
├── lib/                          # 工具库
│   ├── engines/                  # 核心引擎
│   │   ├── script-engine.ts      # 剧本引擎
│   │   ├── ai-dialogue-engine.ts # AI 对话引擎
│   │   ├── dialogue-analyzer.ts  # 对话分析引擎
│   │   └── report-generator.ts   # 报告生成引擎
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── use-script.ts
│   │   ├── use-dialogue.ts
│   │   └── ...
│   ├── stores/                   # Zustand 状态管理
│   │   ├── script-store.ts
│   │   ├── dialogue-store.ts
│   │   └── ...
│   ├── types/                    # TypeScript 类型定义
│   │   ├── script.ts
│   │   ├── character.ts
│   │   ├── dialogue.ts
│   │   └── ...
│   └── utils/                    # 工具函数
│       ├── cn.ts                 # className 合并
│       ├── format.ts             # 格式化工具
│       └── ...
├── data/                         # 数据文件
│   └── scripts/                  # 剧本数据
│       └── city-moonlight.json   # 《城里的月光》剧本
├── public/                       # 静态资源
│   ├── images/                   # 图片资源
│   │   ├── characters/           # 角色插画
│   │   ├── scenes/               # 场景背景
│   │   └── icons/                # 图标
│   └── sounds/                   # 音效资源
├── docs/                         # 文档
│   ├── prd.md                    # 产品需求文档
│   ├── research.md               # 研究报告
│   └── plan.md                   # 实现计划（本文档）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 二、核心类型定义

### 2.1 剧本相关类型

```typescript
// lib/types/script.ts

/* 剧本 */
export interface Script {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  coverImage: string;
  theme: {
    primary: string;
    secondary: string;
  };
  acts: Act[];
  characters: Character[];
  interventionPoints: InterventionPoint[];
}

/* 幕 */
export interface Act {
  id: string;
  actNumber: number;
  title: string;
  description: string;
  sceneBackground: string; // 场景背景图片
  dialogues: Dialogue[];
}

/* 对话 */
export interface Dialogue {
  id: string;
  actId: string;
  speaker: string; // 角色 ID
  content: string;
  emotion: "calm" | "tense" | "angry";
  stressLevel: number; // 0-100
  tensionLevel: "low" | "medium" | "high";
  timestamp?: number; // 对话时间戳（用于回顾）
}

/* 角色 */
export interface Character {
  id: string;
  name: string;
  age: number;
  role: string;
  avatar: string; // 角色头像 URL
  background: string; // 人物背景
  coreMotivation: string; // 核心动机
  hiddenPressure: string; // 隐秘压力
  powerLevel: string; // 权力等级
  behaviorBoundary: string; // 行为底线
  languageStyle: string; // 语言风格
  voiceId?: string; // 语音 ID（可选）
}

/* 介入点 */
export interface InterventionPoint {
  id: string;
  actId: string;
  dialogueId: string; // 从哪条对话开始介入
  title: string;
  scene: string;
  conflict: string;
  challenge: string;
  type: "communication" | "empathy" | "boundary" | "systemic";
  position: number; // 在时间轴上的位置 0-100
}
```

### 2.2 对话相关类型

```typescript
// lib/types/dialogue.ts

/* 消息 */
export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  characterId?: string; // AI 角色 ID
  content: string;
  timestamp: number;
  emotion?: "calm" | "tense" | "angry";
}

/* AI 对话请求 */
export interface AIDialogueRequest {
  scriptId: string;
  characterId: string;
  interventionPointId: string;
  dialogueHistory: Message[];
  userInput: string;
  context: {
    userThoughts: string[]; // 用户在小丑提问中的回答
  };
}

/* AI 对话响应 */
export interface AIDialogueResponse {
  content: string;
  emotion: "calm" | "tense" | "angry";
  internalThought: string; // AI 的"内心独白"
}

/* 对话分析结果 */
export interface DialogueAnalysis {
  sentiment: number; // 情感得分 -100 到 100
  strategy: number; // 策略性得分 0-100
  boundary: number; // 边界感得分 0-100
  empathy: number; // 同情响应得分 0-100
  tensionLevel: "low" | "medium" | "high";
}
```

### 2.3 报告相关类型

```typescript
// lib/types/report.ts

/* 报告 */
export interface Report {
  scriptId: string;
  interventionPointId: string;
  heroType: HeroType;
  dimensions: {
    boundary: number; // 0-100
    strategy: number; // 0-100
    empathy: number; // 0-100
  };
  keyMoment: {
    quote: string;
    comment: string;
  };
  aiThoughts: {
    characterName: string;
    thought: string;
  }[];
  knowledge: {
    title: string;
    content: string;
  };
  createdAt: number;
}

/* 英雄类型 */
export interface HeroType {
  id: string;
  name: string;
  description: string;
  badge: string; // 徽章图标 URL
}

/* 图片资源说明 */
// MVP 阶段可以使用以下占位符服务：
// - 角色头像：https://ui-avatars.com/api/?name={角色名}&size=128&background=random
// - 场景背景：https://picsum.photos/1920/1080（随机图片）
// - 徽章图标：使用 Lucide Icons 或 Heroicons
// - 封面图：https://source.unsplash.com/1920x1080/?{关键词}

/* 英雄类型枚举 */
export const HERO_TYPES: Record<string, HeroType> = {
  PEACEFUL_DOVE: {
    id: "peaceful-dove",
    name: "和平主义小白鸽",
    description:
      "你总是试图让所有人都满意，但有时候，过度的和平反而让矛盾更加复杂。",
    badge: "/images/badges/peaceful-dove.svg",
  },
  BOUNDARY_GUARDIAN: {
    id: "boundary-guardian",
    name: "硬核边界守卫者",
    description:
      "你很清楚自己的底线，并且坚定地守护它。但有时候，过于强硬可能会伤害关系。",
    badge: "/images/badges/boundary-guardian.svg",
  },
  LOGIC_MASTER: {
    id: "logic-master",
    name: "逻辑流吐槽怪",
    description:
      "你善于分析问题，找到解决方案。但有时候，过于理性可能会忽略情感的重要性。",
    badge: "/images/badges/logic-master.svg",
  },
  DIPLOMAT: {
    id: "diplomat",
    name: "外交官",
    description: "你既能理解他人，又能坚持原则。你是天生的调解者。",
    badge: "/images/badges/diplomat.svg",
  },
  IDEALIST_WARRIOR: {
    id: "idealist-warrior",
    name: "理想主义战士",
    description: "你既有同情心，又有原则，还有策略。你是最理想的沟通者。",
    badge: "/images/badges/idealist-warrior.svg",
  },
  ZEN_OBSERVER: {
    id: "zen-observer",
    name: "佛系观察者",
    description:
      "你倾向于观察而非介入。有时候，适当的参与可能会带来更好的结果。",
    badge: "/images/badges/zen-observer.svg",
  },
  EMOTIONAL_FIGHTER: {
    id: "emotional-fighter",
    name: "情绪化战士",
    description: "你有强烈的同情心和原则，但有时候情绪会影响你的判断。",
    badge: "/images/badges/emotional-fighter.svg",
  },
  CALM_ANALYST: {
    id: "calm-analyst",
    name: "冷静分析师",
    description: "你善于分析问题，保持冷静。但有时候，适当的情感表达也很重要。",
    badge: "/images/badges/calm-analyst.svg",
  },
};
```

---

## 三、核心引擎实现

### 3.1 剧本引擎

```typescript
// lib/engines/script-engine.ts

import { Script, Act, Dialogue } from "@/lib/types/script";

export class ScriptEngine {
  private script: Script;
  private currentActIndex: number = 0;
  private currentDialogueIndex: number = 0;

  constructor(script: Script) {
    this.script = script;
  }

  /* 获取当前幕 */
  getCurrentAct(): Act {
    return this.script.acts[this.currentActIndex];
  }

  /* 获取当前对话 */
  getCurrentDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;
    return act.dialogues[this.currentDialogueIndex] || null;
  }

  /* 推进到下一条对话 */
  nextDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;

    // 如果当前幕还有对话
    if (this.currentDialogueIndex < act.dialogues.length - 1) {
      this.currentDialogueIndex++;
      return this.getCurrentDialogue();
    }

    // 如果还有下一幕
    if (this.currentActIndex < this.script.acts.length - 1) {
      this.currentActIndex++;
      this.currentDialogueIndex = 0;
      return this.getCurrentDialogue();
    }

    // 剧本结束
    return null;
  }

  /* 回退到上一条对话 */
  previousDialogue(): Dialogue | null {
    // 如果当前幕还有之前的对话
    if (this.currentDialogueIndex > 0) {
      this.currentDialogueIndex--;
      return this.getCurrentDialogue();
    }

    // 如果还有上一幕
    if (this.currentActIndex > 0) {
      this.currentActIndex--;
      const act = this.getCurrentAct();
      this.currentDialogueIndex = act.dialogues.length - 1;
      return this.getCurrentDialogue();
    }

    // 已经是第一条对话
    return null;
  }

  /* 跳转到指定对话 */
  jumpToDialogue(actIndex: number, dialogueIndex: number): Dialogue | null {
    if (actIndex < 0 || actIndex >= this.script.acts.length) {
      return null;
    }

    const act = this.script.acts[actIndex];
    if (dialogueIndex < 0 || dialogueIndex >= act.dialogues.length) {
      return null;
    }

    this.currentActIndex = actIndex;
    this.currentDialogueIndex = dialogueIndex;
    return this.getCurrentDialogue();
  }

  /* 获取所有对话（用于回顾） */
  getAllDialogues(): Dialogue[] {
    return this.script.acts.flatMap((act) => act.dialogues);
  }

  /* 计算当前进度（0-100） */
  getProgress(): number {
    const totalDialogues = this.getAllDialogues().length;
    const currentPosition =
      this.script.acts
        .slice(0, this.currentActIndex)
        .reduce((sum, act) => sum + act.dialogues.length, 0) +
      this.currentDialogueIndex;

    return Math.round((currentPosition / totalDialogues) * 100);
  }

  /* 计算当前压力值 */
  getCurrentStressLevel(): number {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.stressLevel || 0;
  }

  /* 计算当前火药味指数 */
  getCurrentTensionLevel(): "low" | "medium" | "high" {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.tensionLevel || "low";
  }

  /* 获取角色信息 */
  getCharacter(characterId: string) {
    return this.script.characters.find((c) => c.id === characterId);
  }

  /* 获取介入点 */
  getInterventionPoints() {
    return this.script.interventionPoints;
  }

  /* 根据介入点 ID 获取起始对话 */
  getDialogueByInterventionPoint(interventionPointId: string): Dialogue | null {
    const point = this.script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!point) return null;

    const act = this.script.acts.find((a) => a.id === point.actId);
    if (!act) return null;

    return act.dialogues.find((d) => d.id === point.dialogueId) || null;
  }
}
```

### 3.2 AI 对话引擎

```typescript
// lib/engines/ai-dialogue-engine.ts

import OpenAI from "openai";
import {
  Character,
  Message,
  AIDialogueRequest,
  AIDialogueResponse,
} from "@/lib/types";

export class AIDialogueEngine {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    // 支持 Kimi API 和其他兼容 OpenAI SDK 的服务
    // Kimi: baseURL = "https://api.moonshot.cn/v1"
    // OpenAI: baseURL 不传或传 undefined
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  /* 生成 AI 对话响应 */
  async generateResponse(
    request: AIDialogueRequest,
    character: Character,
  ): Promise<AIDialogueResponse> {
    // 1. 构建角色系统提示词
    const systemPrompt = this.buildCharacterPrompt(character);

    // 2. 构建对话历史
    const messages = this.buildMessages(
      request.dialogueHistory,
      request.userInput,
    );

    // 3. 调用 Kimi K2.5 API（兼容 OpenAI SDK）
    const completion = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // Kimi K2.5 模型
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8, // 增加一些随机性，模拟即兴演出
      max_tokens: 200,
    });

    const content = completion.choices[0].message.content || "";

    // 4. 分析情绪
    const emotion = await this.analyzeEmotion(content);

    // 5. 生成内心独白（用于报告）
    const internalThought = await this.generateInternalThought(
      character,
      request.userInput,
      content,
    );

    return {
      content,
      emotion,
      internalThought,
    };
  }

  /* 构建角色提示词 */
  private buildCharacterPrompt(character: Character): string {
    return `你是 ${character.name}，${character.age} 岁，${character.role}。

人物背景：
${character.background}

核心设定：
- 核心动机：${character.coreMotivation}
- 隐秘压力：${character.hiddenPressure}
- 权力等级：${character.powerLevel}
- 行为底线：${character.behaviorBoundary}

语言风格：
${character.languageStyle}

重要规则：
1. 请始终以 ${character.name} 的身份回应，保持角色一致性
2. 你的回应应该简短（1-3 句话），符合真实对话的节奏
3. 根据对方的态度和策略，调整你的情绪和立场
4. 不要轻易妥协，但也不要过于强硬，保持真实的人物张力
5. 如果对方表现出理解和尊重，你可以适当软化态度
6. 如果对方过于强硬或忽视你的感受，你应该坚持自己的立场
7. 不要"出戏"，不要说"我是 AI"或类似的话

请直接回应对话，不要加任何前缀或解释。`;
  }

  /* 构建对话消息 */
  private buildMessages(
    dialogueHistory: Message[],
    userInput: string,
  ): Array<{ role: "user" | "assistant"; content: string }> {
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // 添加历史对话
    for (const msg of dialogueHistory) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.role === "ai") {
        messages.push({ role: "assistant", content: msg.content });
      }
    }

    // 添加当前用户输入
    messages.push({ role: "user", content: userInput });

    return messages;
  }

  /* 分析情绪 */
  private async analyzeEmotion(
    content: string,
  ): Promise<"calm" | "tense" | "angry"> {
    // 使用简单的关键词匹配（生产环境可以使用更复杂的情感分析）
    const angryKeywords = ["生气", "愤怒", "受够了", "不能忍", "太过分"];
    const tenseKeywords = ["但是", "可是", "不过", "我觉得", "你应该"];

    const lowerContent = content.toLowerCase();

    if (angryKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "angry";
    }

    if (tenseKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "tense";
    }

    return "calm";
  }

  /* 生成内心独白 */
  private async generateInternalThought(
    character: Character,
    userInput: string,
    aiResponse: string,
  ): Promise<string> {
    const prompt = `作为 ${character.name}，你刚才对用户说了："${aiResponse}"

但在你的内心深处，你真正的想法是什么？请用 1 句话表达你的内心独白，要真实、幽默、有点"毒舌"。

示例：
- "这个人还挺会说话的，至少比我儿子强多了……"
- "说得好听，但我总觉得她还是嫌我土……"
- "终于有人理解我了，但为什么不是我儿子？"

请直接输出内心独白，不要加任何前缀。`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 100,
    });

    return completion.choices[0].message.content || "";
  }

  /* 流式生成响应（用于实时打字机效果） */
  async *generateResponseStream(
    request: AIDialogueRequest,
    character: Character,
  ): AsyncGenerator<string> {
    const systemPrompt = this.buildCharacterPrompt(character);
    const messages = this.buildMessages(
      request.dialogueHistory,
      request.userInput,
    );

    const stream = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 200,
      stream: true,
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

### 3.3 对话分析引擎

```typescript
// lib/engines/dialogue-analyzer.ts

import OpenAI from "openai";
import { Message, DialogueAnalysis } from "@/lib/types";

export class DialogueAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  /* 分析对话 */
  async analyzeDialogue(
    userInput: string,
    aiResponse: string,
    dialogueHistory: Message[],
  ): Promise<DialogueAnalysis> {
    // 并行执行多个分析任务
    const [sentiment, strategy, boundary, empathy] = await Promise.all([
      this.analyzeSentiment(userInput),
      this.analyzeStrategy(userInput, dialogueHistory),
      this.analyzeBoundary(userInput, dialogueHistory),
      this.analyzeEmpathy(userInput, aiResponse),
    ]);

    const tensionLevel = this.calculateTensionLevel(sentiment, strategy);

    return {
      sentiment,
      strategy,
      boundary,
      empathy,
      tensionLevel,
    };
  }

  /* 情感分析 */
  private async analyzeSentiment(userInput: string): Promise<number> {
    const prompt = `分析以下对话的情感倾向，给出 -100 到 100 的得分：
- -100 表示极度负面（愤怒、攻击）
- 0 表示中性
- 100 表示极度正面（友善、理解）

对话：${userInput}

请只输出数字，不要有任何其他内容。`;

    const response = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // 使用 Kimi K2.5 模型
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0].message.content || "0");
    return Math.max(-100, Math.min(100, score));
  }

  /* 策略性分析 */
  private async analyzeStrategy(
    userInput: string,
    dialogueHistory: Message[],
  ): Promise<number> {
    const historyText = dialogueHistory
      .slice(-5) // 只取最近 5 条
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = `分析用户是否在寻找建设性的解决方案（而非单纯争吵），给出 0-100 的得分：
- 0 表示完全没有策略，只是情绪发泄
- 50 表示有一定策略，但不够清晰
- 100 表示非常有策略，积极寻找解决方案

对话历史：
${historyText}

用户最新输入：${userInput}

请只输出数字，不要有任何其他内容。`;

    const response = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // 使用 Kimi K2.5 模型
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0].message.content || "0");
    return Math.max(0, Math.min(100, score));
  }

  /* 边界感分析 */
  private async analyzeBoundary(
    userInput: string,
    dialogueHistory: Message[],
  ): Promise<number> {
    const historyText = dialogueHistory
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = `分析用户是否有效建立了个人边界，给出 0-100 的得分：
- 0 表示完全没有边界，过度妥协
- 50 表示边界不够清晰，时而坚持时而妥协
- 100 表示边界清晰，既坚持原则又保持尊重

对话历史：
${historyText}

用户最新输入：${userInput}

请只输出数字，不要有任何其他内容。`;

    const response = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // 使用 Kimi K2.5 模型
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0].message.content || "0");
    return Math.max(0, Math.min(100, score));
  }

  /* 同情响应分析 */
  private async analyzeEmpathy(
    userInput: string,
    aiResponse: string,
  ): Promise<number> {
    const prompt = `分析用户是否理解了对方的动机和感受，给出 0-100 的得分：
- 0 表示完全没有同情心，只关注自己
- 50 表示有一定理解，但不够深入
- 100 表示深刻理解对方，并尝试转化

用户输入：${userInput}
对方回应：${aiResponse}

请只输出数字，不要有任何其他内容。`;

    const response = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // 使用 Kimi K2.5 模型
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0].message.content || "0");
    return Math.max(0, Math.min(100, score));
  }

  /* 计算火药味指数 */
  private calculateTensionLevel(
    sentiment: number,
    strategy: number,
  ): "low" | "medium" | "high" {
    // 情感越负面，策略性越低，火药味越高
    const tensionScore = -sentiment + (100 - strategy);

    if (tensionScore < 50) return "low";
    if (tensionScore < 100) return "medium";
    return "high";
  }

  /* 检测僵局 */
  detectDeadlock(dialogueHistory: Message[]): boolean {
    // 取最近 5 轮对话
    const recentDialogues = dialogueHistory.slice(-10); // 5 轮 = 10 条消息

    if (recentDialogues.length < 10) return false;

    // 检测是否有重复的模式
    const userMessages = recentDialogues
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content);

    // 简单的重复检测：如果有 3 条以上相似的消息
    const uniqueMessages = new Set(userMessages);
    if (uniqueMessages.size < userMessages.length - 2) {
      return true;
    }

    return false;
  }
}
```

### 3.4 报告生成引擎

```typescript
// lib/engines/report-generator.ts

import OpenAI from "openai";
import { Message, DialogueAnalysis, Report, HERO_TYPES } from "@/lib/types";

export class ReportGenerator {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  /* 生成报告 */
  async generateReport(
    scriptId: string,
    interventionPointId: string,
    dialogueHistory: Message[],
    analysisResults: DialogueAnalysis[],
  ): Promise<Report> {
    // 1. 计算三维得分
    const dimensions = this.calculateDimensions(analysisResults);

    // 2. 确定英雄类型
    const heroType = this.determineHeroType(dimensions);

    // 3. 提取关键时刻
    const keyMoment = await this.extractKeyMoment(dialogueHistory);

    // 4. 收集 AI 内心独白
    const aiThoughts = dialogueHistory
      .filter((msg) => msg.role === "ai" && msg.characterId)
      .slice(-3) // 取最后 3 条
      .map((msg) => ({
        characterName: msg.characterId || "",
        thought: "（内心独白将在对话时生成）",
      }));

    // 5. 匹配社会学知识
    const knowledge = this.matchKnowledge(heroType.id, dimensions);

    return {
      scriptId,
      interventionPointId,
      heroType,
      dimensions,
      keyMoment,
      aiThoughts,
      knowledge,
      createdAt: Date.now(),
    };
  }

  /* 计算三维得分 */
  private calculateDimensions(analysisResults: DialogueAnalysis[]) {
    if (analysisResults.length === 0) {
      return { boundary: 0, strategy: 0, empathy: 0 };
    }

    const sum = analysisResults.reduce(
      (acc, result) => ({
        boundary: acc.boundary + result.boundary,
        strategy: acc.strategy + result.strategy,
        empathy: acc.empathy + result.empathy,
      }),
      { boundary: 0, strategy: 0, empathy: 0 },
    );

    return {
      boundary: Math.round(sum.boundary / analysisResults.length),
      strategy: Math.round(sum.strategy / analysisResults.length),
      empathy: Math.round(sum.empathy / analysisResults.length),
    };
  }

  /* 确定英雄类型 */
  private determineHeroType(dimensions: {
    boundary: number;
    strategy: number;
    empathy: number;
  }) {
    const { boundary, strategy, empathy } = dimensions;

    // 理想主义战士：三高
    if (boundary > 70 && strategy > 70 && empathy > 70) {
      return HERO_TYPES.IDEALIST_WARRIOR;
    }

    // 外交官：高同情 + 高策略
    if (empathy > 70 && strategy > 70) {
      return HERO_TYPES.DIPLOMAT;
    }

    // 和平主义小白鸽：高同情 + 低边界
    if (empathy > 70 && boundary < 50) {
      return HERO_TYPES.PEACEFUL_DOVE;
    }

    // 硬核边界守卫者：高边界 + 低同情
    if (boundary > 70 && empathy < 50) {
      return HERO_TYPES.BOUNDARY_GUARDIAN;
    }

    // 逻辑流吐槽怪：高策略 + 低同情
    if (strategy > 70 && empathy < 50) {
      return HERO_TYPES.LOGIC_MASTER;
    }

    // 情绪化战士：高边界 + 高同情 + 低策略
    if (boundary > 70 && empathy > 70 && strategy < 50) {
      return HERO_TYPES.EMOTIONAL_FIGHTER;
    }

    // 冷静分析师：高策略 + 中等其他
    if (strategy > 70) {
      return HERO_TYPES.CALM_ANALYST;
    }

    // 佛系观察者：三低
    return HERO_TYPES.ZEN_OBSERVER;
  }

  /* 提取关键时刻 */
  private async extractKeyMoment(
    dialogueHistory: Message[],
  ): Promise<{ quote: string; comment: string }> {
    const userMessages = dialogueHistory
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content);

    if (userMessages.length === 0) {
      return {
        quote: "（没有找到关键对话）",
        comment: "看来你还没有充分参与对话。",
      };
    }

    const prompt = `从以下用户的对话中，选出最精彩或最有代表性的一句话，并给出幽默的点评。

用户对话：
${userMessages.map((msg, i) => `${i + 1}. ${msg}`).join("\n")}

请按以下格式输出（不要有任何其他内容）：
引用：[选出的那句话]
点评：[你的幽默点评，1-2 句话]`;

    const response = await this.openai.chat.completions.create({
      model: "kimi-k2.5", // 使用 Kimi K2.5 模型
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content || "";
    const lines = content.split("\n");

    let quote = "";
    let comment = "";

    for (const line of lines) {
      if (line.startsWith("引用：")) {
        quote = line.replace("引用：", "").trim();
      } else if (line.startsWith("点评：")) {
        comment = line.replace("点评：", "").trim();
      }
    }

    return {
      quote: quote || userMessages[0],
      comment: comment || "这句话很有意思！",
    };
  }

  /* 匹配社会学知识 */
  private matchKnowledge(
    heroTypeId: string,
    dimensions: { boundary: number; strategy: number; empathy: number },
  ): { title: string; content: string } {
    // 根据英雄类型和维度，匹配相关的社会学知识
    const knowledgeBase: Record<string, { title: string; content: string }> = {
      "peaceful-dove": {
        title: "冲突回避理论",
        content:
          '在人际冲突中，过度追求和平可能导致"冲突回避"。心理学研究表明，适度的冲突有助于关系的健康发展，因为它能让双方真实表达需求。完全避免冲突反而可能积累怨恨，最终导致关系破裂。',
      },
      "boundary-guardian": {
        title: "边界理论",
        content:
          "心理学家亨利·克劳德提出，健康的边界是人际关系的基础。边界不是墙，而是门——它既保护我们的核心价值，又允许适当的连接。过于强硬的边界可能导致孤立，而模糊的边界则容易被侵犯。",
      },
      "logic-master": {
        title: "情感劳动",
        content:
          '社会学家阿莉·霍克希尔德提出"情感劳动"概念，指出在人际互动中，我们需要管理和表达情感。过于理性可能忽视情感劳动的重要性，导致对方感到不被理解。有效的沟通需要理性和感性的平衡。',
      },
      diplomat: {
        title: "非暴力沟通",
        content:
          '心理学家马歇尔·卢森堡提出"非暴力沟通"（NVC）模型：观察、感受、需要、请求。这种沟通方式既能表达自己的需求，又能理解对方的感受，是解决冲突的有效工具。',
      },
      "idealist-warrior": {
        title: "建设性冲突",
        content:
          '组织行为学研究表明，"建设性冲突"能够促进创新和问题解决。关键在于将冲突聚焦于问题本身，而非人身攻击。你展现了这种能力——既坚持原则，又保持尊重，还积极寻找解决方案。',
      },
      "zen-observer": {
        title: "旁观者效应",
        content:
          '社会心理学中的"旁观者效应"指出，当有其他人在场时，个体提供帮助的可能性降低。在家庭冲突中，过度的观察而非参与，可能让问题持续恶化。适当的介入有时是必要的。',
      },
      "emotional-fighter": {
        title: "情绪调节",
        content:
          "心理学研究表明，情绪调节能力是人际关系的重要预测因素。强烈的情感可以是动力，但如果不加控制，可能导致冲动决策。学会在情感和理性之间找到平衡，是成熟沟通的标志。",
      },
      "calm-analyst": {
        title: "认知重评",
        content:
          '认知心理学中的"认知重评"策略，指通过改变对情境的解读来调节情绪。你展现了这种能力——保持冷静，理性分析。但记住，适当的情感表达也能增进理解和连接。',
      },
    };

    return (
      knowledgeBase[heroTypeId] || {
        title: "人际沟通",
        content: "有效的人际沟通需要理解、尊重和策略的平衡。",
      }
    );
  }
}
```

---

## 四、状态管理

### 4.1 剧本状态管理

```typescript
// lib/stores/script-store.ts

import { create } from "zustand";
import { Script, Act, Dialogue } from "@/lib/types";
import { ScriptEngine } from "@/lib/engines/script-engine";

interface ScriptState {
  // 状态
  script: Script | null;
  engine: ScriptEngine | null;
  currentAct: Act | null;
  currentDialogue: Dialogue | null;
  progress: number;
  stressLevel: number;
  tensionLevel: "low" | "medium" | "high";
  isPlaying: boolean;
  isPaused: boolean;

  // 操作
  loadScript: (script: Script) => void;
  nextDialogue: () => void;
  previousDialogue: () => void;
  jumpToDialogue: (actIndex: number, dialogueIndex: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export const useScriptStore = create<ScriptState>((set, get) => ({
  // 初始状态
  script: null,
  engine: null,
  currentAct: null,
  currentDialogue: null,
  progress: 0,
  stressLevel: 0,
  tensionLevel: "low",
  isPlaying: false,
  isPaused: false,

  // 加载剧本
  loadScript: (script) => {
    const engine = new ScriptEngine(script);
    const currentAct = engine.getCurrentAct();
    const currentDialogue = engine.getCurrentDialogue();
    const progress = engine.getProgress();
    const stressLevel = engine.getCurrentStressLevel();
    const tensionLevel = engine.getCurrentTensionLevel();

    set({
      script,
      engine,
      currentAct,
      currentDialogue,
      progress,
      stressLevel,
      tensionLevel,
    });
  },

  // 下一条对话
  nextDialogue: () => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.nextDialogue();
    if (!dialogue) {
      // 剧本结束
      set({ isPlaying: false });
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

  // 上一条对话
  previousDialogue: () => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.previousDialogue();
    if (!dialogue) return;

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  // 跳转到指定对话
  jumpToDialogue: (actIndex, dialogueIndex) => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.jumpToDialogue(actIndex, dialogueIndex);
    if (!dialogue) return;

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  // 播放
  play: () => set({ isPlaying: true, isPaused: false }),

  // 暂停
  pause: () => set({ isPaused: true }),

  // 重置
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
    });
  },
}));
```

### 4.2 对话状态管理

```typescript
// lib/stores/dialogue-store.ts

import { create } from "zustand";
import { Message, DialogueAnalysis } from "@/lib/types";

interface DialogueState {
  // 状态
  messages: Message[];
  analysisResults: DialogueAnalysis[];
  currentRound: number;
  maxRounds: number;
  isAITyping: boolean;
  hasDeadlock: boolean;

  // 操作
  addMessage: (message: Message) => void;
  addAnalysis: (analysis: DialogueAnalysis) => void;
  setAITyping: (isTyping: boolean) => void;
  setDeadlock: (hasDeadlock: boolean) => void;
  reset: () => void;
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  // 初始状态
  messages: [],
  analysisResults: [],
  currentRound: 0,
  maxRounds: 30,
  isAITyping: false,
  hasDeadlock: false,

  // 添加消息
  addMessage: (message) => {
    const { messages, currentRound } = get();
    set({
      messages: [...messages, message],
      currentRound: message.role === "user" ? currentRound + 1 : currentRound,
    });
  },

  // 添加分析结果
  addAnalysis: (analysis) => {
    const { analysisResults } = get();
    set({
      analysisResults: [...analysisResults, analysis],
    });
  },

  // 设置 AI 打字状态
  setAITyping: (isTyping) => set({ isAITyping: isTyping }),

  // 设置僵局状态
  setDeadlock: (hasDeadlock) => set({ hasDeadlock }),

  // 重置
  reset: () =>
    set({
      messages: [],
      analysisResults: [],
      currentRound: 0,
      isAITyping: false,
      hasDeadlock: false,
    }),
}));
```

---

## 五、核心页面实现

### 5.1 议题广场（首页）

```typescript
// app/(home)/page.tsx

import { ScriptCard } from '@/components/script/script-card';
import { scripts } from '@/data/scripts';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          成为观演者，探索社会困境
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          不是解决问题，而是理解问题
        </p>
        <button className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          开始探索
        </button>
      </section>

      {/* 议题卡片网格 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

```typescript
// components/script/script-card.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Script } from '@/lib/types';

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  return (
    <Link href={`/script/${script.id}`}>
      <motion.div
        className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* 封面图 */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={script.coverImage}
            alt={script.title}
            fill
            className="object-cover"
          />
        </div>

        {/* 内容 */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-2">{script.title}</h3>
          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
            {script.description}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {script.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 底部信息 */}
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>预计时长：{script.duration}</span>
            <span>1.2k 人参演</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
```

### 5.2 沉浸式观演页面

```typescript
// app/script/[id]/watch/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { DialogueBubble } from '@/components/script/dialogue-bubble';
import { EmotionIndicator } from '@/components/script/emotion-indicator';
import { ProgressBar } from '@/components/script/progress-bar';
import { scripts } from '@/data/scripts';

export default function WatchPage() {
  const params = useParams();
  const scriptId = params.id as string;

  const {
    script,
    currentDialogue,
    currentAct,
    progress,
    stressLevel,
    tensionLevel,
    loadScript,
    nextDialogue,
  } = useScriptStore();

  // 加载剧本
  useEffect(() => {
    const scriptData = scripts.find((s) => s.id === scriptId);
    if (scriptData) {
      loadScript(scriptData);
    }
  }, [scriptId, loadScript]);

  // 点击屏幕推进剧情
  const handleClick = () => {
    nextDialogue();
  };

  if (!script || !currentDialogue || !currentAct) {
    return <div>加载中...</div>;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      onClick={handleClick}
    >
      {/* 场景背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: `url(${currentAct.sceneBackground})`,
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* 内容层 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部进度条 */}
        <ProgressBar progress={progress} acts={script.acts} />

        {/* 左侧情绪指标 */}
        <EmotionIndicator
          stressLevel={stressLevel}
          tensionLevel={tensionLevel}
        />

        {/* 中央对话区域 */}
        <div className="flex-1 flex items-center justify-center p-8">
          <DialogueBubble
            dialogue={currentDialogue}
            character={script.characters.find(
              (c) => c.id === currentDialogue.speaker,
            )}
          />
        </div>

        {/* 底部提示 */}
        <div className="text-center pb-8">
          <p className="text-white/60 text-sm">点击屏幕继续</p>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// components/script/dialogue-bubble.tsx

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Dialogue, Character } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DialogueBubbleProps {
  dialogue: Dialogue;
  character?: Character;
}

export function DialogueBubble({ dialogue, character }: DialogueBubbleProps) {
  const isLeft = dialogue.speaker === 'main'; // 主角在左边

  return (
    <motion.div
      className={cn('flex items-start gap-4 max-w-2xl', {
        'flex-row': isLeft,
        'flex-row-reverse': !isLeft,
      })}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 角色头像 */}
      {character && (
        <div className="flex-shrink-0">
          <Image
            src={character.avatar}
            alt={character.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
      )}

      {/* 对话气泡 */}
      <div
        className={cn(
          'px-6 py-4 rounded-2xl max-w-md',
          {
            'bg-blue-500/20 text-white': isLeft,
            'bg-slate-700/80 text-white': !isLeft,
          },
        )}
      >
        {/* 角色名称 */}
        {character && (
          <p className="text-sm text-white/60 mb-1">{character.name}</p>
        )}

        {/* 对话内容 */}
        <p className="text-lg leading-relaxed">{dialogue.content}</p>
      </div>
    </motion.div>
  );
}
```

### 5.3 沙盒对话页面

```typescript
// app/script/[id]/dialogue/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Message } from '@/lib/types';
import { ChatBubble } from '@/components/dialogue/chat-bubble';
import { ChatInput } from '@/components/dialogue/chat-input';
import { EmotionIndicator } from '@/components/script/emotion-indicator';

export default function DialoguePage() {
  const params = useParams();
  const scriptId = params.id as string;

  const {
    messages,
    currentRound,
    maxRounds,
    isAITyping,
    addMessage,
    setAITyping,
  } = useDialogueStore();

  const [tensionLevel, setTensionLevel] = useState<'low' | 'medium' | 'high'>(
    'low',
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // 调用 AI API
    setAITyping(true);
    try {
      const response = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      // 添加 AI 消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        characterId: data.characterId,
        content: data.content,
        timestamp: Date.now(),
        emotion: data.emotion,
      };
      addMessage(aiMessage);

      // 更新火药味指数
      setTensionLevel(data.tensionLevel);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setAITyping(false);
    }
  };

  const canEnd = currentRound >= 10;
  const isMaxed = currentRound >= maxRounds;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* 顶部信息栏 */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
        <button className="text-white/60 hover:text-white">暂停</button>

        <div className="flex items-center gap-4 text-sm text-white/80">
          <span>
            对话额度：{currentRound}/{maxRounds}
          </span>
          <EmotionIndicator tensionLevel={tensionLevel} compact />
        </div>

        <button
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            {
              'bg-orange-500 text-white hover:bg-orange-600': canEnd,
              'bg-slate-700 text-slate-500 cursor-not-allowed': !canEnd,
            },
          )}
          disabled={!canEnd}
        >
          结束演出
        </button>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {isAITyping && (
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <span className="ml-2">AI 正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <ChatInput onSend={handleSend} disabled={isMaxed || isAITyping} />
    </div>
  );
}
```

---

## 六、API 路由实现

### 6.1 AI 对话 API

```typescript
// app/api/dialogue/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AIDialogueEngine } from "@/lib/engines/ai-dialogue-engine";
import { DialogueAnalyzer } from "@/lib/engines/dialogue-analyzer";
import { scripts } from "@/data/scripts";

// 使用 Kimi K2.5 API
// Base URL: https://api.moonshot.cn/v1
// Model ID: kimi-k2.5
const aiEngine = new AIDialogueEngine(
  process.env.MOONSHOT_API_KEY!,
  "https://api.moonshot.cn/v1",
);
const analyzer = new DialogueAnalyzer(
  process.env.MOONSHOT_API_KEY!,
  "https://api.moonshot.cn/v1",
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, userThoughts } = body;

    // 获取剧本和角色信息
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    // 获取当前对话的角色（简化：假设总是和第一个角色对话）
    const character = script.characters[0];

    // 获取最后一条用户消息
    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .pop();

    // 生成 AI 响应
    const response = await aiEngine.generateResponse(
      {
        scriptId,
        characterId: character.id,
        interventionPointId,
        dialogueHistory: messages,
        userInput: lastUserMessage.content,
        context: {
          // 从请求中获取用户在小丑提问环节的回答
          // 前端需要在调用 API 时传递 userThoughts 数组
          userThoughts: userThoughts || [],
        },
      },
      character,
    );

    // 分析对话
    const analysis = await analyzer.analyzeDialogue(
      lastUserMessage.content,
      response.content,
      messages,
    );

    return NextResponse.json({
      characterId: character.id,
      content: response.content,
      emotion: response.emotion,
      internalThought: response.internalThought,
      tensionLevel: analysis.tensionLevel,
      analysis,
    });
  } catch (error) {
    console.error("Dialogue API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### 6.2 报告生成 API

```typescript
// app/api/report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ReportGenerator } from "@/lib/engines/report-generator";

// 使用 Kimi API
const reportGenerator = new ReportGenerator(
  process.env.MOONSHOT_API_KEY!,
  process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1",
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, analysisResults } = body;

    // 生成报告
    const report = await reportGenerator.generateReport(
      scriptId,
      interventionPointId,
      messages,
      analysisResults,
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

## 七、数据文件示例

### 7.1 剧本数据

```json
// data/scripts/city-moonlight.json

{
  "id": "city-moonlight",
  "title": "城里的月光",
  "description": "当农村老人走进城市，家庭的裂痕开始显现",
  "tags": ["家庭关系", "代际冲突", "城市化"],
  "duration": "20-30 分钟",
  "coverImage": "/images/scripts/city-moonlight-cover.jpg",
  "theme": {
    "primary": "#1a1f3a",
    "secondary": "#ff6b35"
  },
  "acts": [
    {
      "id": "act-1",
      "actNumber": 1,
      "title": "欢喜背后的无奈",
      "description": "邱华带着活鸡和红糖鸡蛋来到儿子家",
      "sceneBackground": "/images/scenes/living-room.jpg",
      "dialogues": [
        {
          "id": "dialogue-1-1",
          "actId": "act-1",
          "speaker": "qiu-hua",
          "content": "哎呀，我的大孙子呢？快让奶奶看看！",
          "emotion": "calm",
          "stressLevel": 10,
          "tensionLevel": "low"
        },
        {
          "id": "dialogue-1-2",
          "actId": "act-1",
          "speaker": "xiao-ya",
          "content": "妈，您辛苦了，快进来坐。妈，这鸡......城里不好养，而且小区有规定不能养活的......",
          "emotion": "tense",
          "stressLevel": 20,
          "tensionLevel": "low"
        }
      ]
    }
  ],
  "characters": [
    {
      "id": "qiu-hua",
      "name": "邱华",
      "age": 60,
      "role": "农村妇女",
      "avatar": "/images/characters/qiu-hua.png",
      "background": "农村妇女，朴实、勤快，有些固执，不善言辞，内心敏感。为了儿子，强忍着对老伴和故土的思念来城里。",
      "coreMotivation": "为了儿子，想要帮忙带孙子",
      "hiddenPressure": "对老伴和故土的思念，在城市的格格不入",
      "powerLevel": "家庭中的低位，话语权被剥夺",
      "behaviorBoundary": "强忍委屈，但当老伴出事时可能选择离开",
      "languageStyle": "朴实、直接，带有方言特色，有时会用"土话"表达"
    },
    {
      "id": "xiao-ya",
      "name": "小雅",
      "age": 30,
      "role": "城市白领",
      "avatar": "/images/characters/xiao-ya.png",
      "background": "城市白领，理性、讲究科学育儿和现代生活方式。产后情绪敏感，并非不善良，只是难以理解婆婆的"老理儿"。",
      "coreMotivation": "按照科学方式养育孩子，保持现代生活方式",
      "hiddenPressure": "产后情绪敏感，担心育儿方式被干预",
      "powerLevel": "在育儿问题上有话语权，但需要婆婆的帮助",
      "behaviorBoundary": "理性、讲究，但并非不善良，难以理解婆婆的"老理儿"",
      "languageStyle": "理性、客气，但有时会显得疏离"
    }
  ],
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
      "position": 15
    }
  ]
}
```

---

## 八、开发步骤

### 阶段 1：基础架构（第 1-2 周）

**目标**：搭建项目基础，完成核心类型定义和基础组件

**任务清单**：

- ✅ 初始化 Next.js 项目
- ✅ 配置 TypeScript、Tailwind CSS、ESLint
- ✅ 定义核心类型（Script、Character、Dialogue 等）
- ✅ 搭建项目目录结构
- ✅ 实现基础 UI 组件（Button、Card、Progress 等）
- ✅ 配置 Zustand 状态管理
- ✅ 准备剧本数据文件

### 阶段 2：剧本引擎（第 3 周）

**目标**：实现剧本引擎和观演功能

**任务清单**：

- ✅ 实现 ScriptEngine 类
- ✅ 实现剧本状态管理（script-store）
- ✅ 实现议题广场页面
- ✅ 实现议题介绍页面
- ✅ 实现沉浸式观演页面
- ✅ 实现对话气泡组件
- ✅ 实现情绪指标组件
- ✅ 实现进度条组件

### 阶段 3：角色解构与小丑提问（第 4 周）

**目标**：实现角色卡片和小丑提问功能

**任务清单**：

- ✅ 实现角色卡片组件
- ✅ 实现角色解构页面
- ✅ 实现小丑角色设计（视觉和动画）
- ✅ 实现小丑提问页面
- ✅ 实现问题输入组件
- ✅ 存储用户回答到状态管理

### 阶段 4：介入点选择（第 5 周）

**目标**：实现介入点选择功能

**任务清单**：

- ✅ 实现时间轴组件
- ✅ 实现介入点卡片组件
- ✅ 实现选择介入点页面
- ✅ 实现介入点推荐逻辑

### 阶段 5：AI 对话引擎（第 6-7 周）

**目标**：实现 AI 对话功能

**任务清单**：

- ✅ 实现 AIDialogueEngine 类
- ✅ 配置 OpenAI API
- ✅ 实现角色提示词构建
- ✅ 实现对话历史管理
- ✅ 实现情绪分析
- ✅ 实现内心独白生成
- ✅ 实现流式响应（可选）
- ✅ 实现对话 API 路由
- ✅ 实现沙盒对话页面
- ✅ 实现聊天输入组件
- ✅ 实现聊天气泡组件

### 阶段 6：对话分析引擎（第 8 周）

**目标**：实现对话分析功能

**任务清单**：

- ✅ 实现 DialogueAnalyzer 类
- ✅ 实现情感分析
- ✅ 实现策略性分析
- ✅ 实现边界感分析
- ✅ 实现同情响应分析
- ✅ 实现僵局检测
- ✅ 实现小丑介入机制

### 阶段 7：报告生成引擎（第 9 周）

**目标**：实现报告生成功能

**任务清单**：

- ✅ 实现 ReportGenerator 类
- ✅ 实现三维得分计算
- ✅ 实现英雄类型判定
- ✅ 实现关键时刻提取
- ✅ 实现社会学知识匹配
- ✅ 实现报告 API 路由
- ✅ 实现分析报告页面
- ✅ 实现报告卡片组件
- ✅ 实现分享功能

### 阶段 8：视觉优化（第 10 周）

**目标**：优化视觉设计和动画效果

**任务清单**：

- ✅ 设计并实现角色插画
- ✅ 设计并实现场景背景
- ✅ 设计并实现英雄徽章
- ✅ 优化动画效果（Framer Motion）
- ✅ 优化色彩系统
- ✅ 优化字体排版
- ✅ 实现响应式设计

### 阶段 9：测试与优化（第 11-12 周）

**目标**：测试和优化产品

**任务清单**：

- ✅ 功能测试
- ✅ 性能优化
- ✅ AI 对话质量优化
- ✅ 用户体验优化
- ✅ Bug 修复
- ✅ 文档完善

---

## 九、详细任务清单（TODO List）

### 📋 任务状态说明

- ⬜ 待开始（Not Started）
- 🔄 进行中（In Progress）
- ✅ 已完成（Completed）
- ⏸️ 暂停/阻塞（Blocked）
- 🔍 需要审查（Review）

---

### 阶段 0：项目初始化（第 1 周）✅

#### 0.1 环境搭建（我使用的是bun包管理工具）

- [x] ✅ 安装核心依赖
  - [x] ✅ `zustand` - 状态管理
  - [x] ✅ `openai` - AI API

#### 0.2 项目结构搭建

- [x] ✅ 创建 `.env.local.example` 模板

---

### 阶段 1：核心类型定义（第 1 周）✅

#### 1.1 剧本相关类型

- [x] ✅ 创建 `lib/types/script.ts`
  - [x] ✅ 定义 `Script` 接口
  - [x] ✅ 定义 `Act` 接口
  - [x] ✅ 定义 `Dialogue` 接口
  - [x] ✅ 定义 `Character` 接口
  - [x] ✅ 定义 `InterventionPoint` 接口

#### 1.2 对话相关类型

- [x] ✅ 创建 `lib/types/dialogue.ts`
  - [x] ✅ 定义 `Message` 接口
  - [x] ✅ 定义 `AIDialogueRequest` 接口
  - [x] ✅ 定义 `AIDialogueResponse` 接口
  - [x] ✅ 定义 `DialogueAnalysis` 接口

#### 1.3 报告相关类型

- [x] ✅ 创建 `lib/types/report.ts`
  - [x] ✅ 定义 `Report` 接口
  - [x] ✅ 定义 `HeroType` 接口
  - [x] ✅ 定义 `HERO_TYPES` 常量（8 种英雄类型）

#### 1.4 导出类型

- [x] ✅ 创建 `lib/types/index.ts` 统一导出

---

### 阶段 2：基础 UI 组件（第 1-2 周）

#### 2.2 自定义基础组件

- [ ] ⬜ 创建 `components/ui/loading.tsx` - 加载动画
- [ ] ⬜ 创建 `components/ui/empty-state.tsx` - 空状态
- [ ] ⬜ 创建 `components/ui/error-boundary.tsx` - 错误边界

#### 2.3 布局组件

- [ ] ⬜ 创建 `components/shared/header.tsx` - 顶部导航
- [ ] ⬜ 创建 `components/shared/footer.tsx` - 底部信息
- [ ] ⬜ 创建 `app/layout.tsx` - 根布局

---

### 阶段 3：剧本引擎（第 2 周）✅

#### 3.1 剧本引擎实现

- [x] ✅ 创建 `lib/engines/script-engine.ts`
  - [x] ✅ 实现 `ScriptEngine` 类
  - [x] ✅ 实现 `getCurrentAct()` 方法
  - [x] ✅ 实现 `getCurrentDialogue()` 方法
  - [x] ✅ 实现 `nextDialogue()` 方法
  - [x] ✅ 实现 `previousDialogue()` 方法
  - [x] ✅ 实现 `jumpToDialogue()` 方法
  - [x] ✅ 实现 `getAllDialogues()` 方法
  - [x] ✅ 实现 `getProgress()` 方法
  - [x] ✅ 实现 `getCurrentStressLevel()` 方法
  - [x] ✅ 实现 `getCurrentTensionLevel()` 方法

#### 3.2 剧本状态管理

- [x] ✅ 创建 `lib/stores/script-store.ts`
  - [x] ✅ 定义状态接口
  - [x] ✅ 实现 `loadScript` 操作
  - [x] ✅ 实现 `nextDialogue` 操作
  - [x] ✅ 实现 `previousDialogue` 操作
  - [x] ✅ 实现 `jumpToDialogue` 操作
  - [x] ✅ 实现 `play` 操作
  - [x] ✅ 实现 `pause` 操作
  - [x] ✅ 实现 `reset` 操作

#### 3.3 剧本数据准备

- [x] ✅ 创建 `data/scripts/` 目录
- [x] ✅ 创建 `data/scripts/city-moonlight.json`
  - [x] ✅ 编写剧本基本信息
  - [x] ✅ 编写第 1 幕对话
  - [x] ✅ 编写第 2 幕对话
  - [x] ✅ 编写第 3 幕对话
  - [x] ✅ 编写第 4 幕对话
  - [x] ✅ 编写角色信息
  - [x] ✅ 编写介入点信息
- [x] ✅ 创建 `data/scripts/index.ts` 导出剧本

---

### 阶段 4：议题广场和介绍页（第 2-3 周）✅

#### 4.1 议题广场（首页）

- [x] ✅ 创建 `app/page.tsx`
  - [x] ✅ 实现 Hero 区域
  - [x] ✅ 实现议题卡片网格布局
  - [x] ✅ 实现卡片布局
  - [x] ✅ 实现封面图显示
  - [x] ✅ 实现标签显示
  - [x] ✅ 实现悬停动画
  - [x] ✅ 实现点击跳转

#### 4.2 议题介绍页

- [x] ✅ 创建 `app/script/[id]/page.tsx`
  - [x] ✅ 实现全屏沉浸式背景
  - [x] ✅ 实现剧本标题和简介
  - [x] ✅ 实现议题标签
  - [x] ✅ 实现角色卡片展示
  - [x] ✅ 实现"开始体验"按钮

---

### 阶段 5：沉浸式观演（第 3-4 周）✅

#### 5.1 观演页面

- [x] ✅ 创建 `app/script/[id]/observation/page.tsx`
  - [x] ✅ 实现全屏对话界面
  - [x] ✅ 实现场景背景切换
  - [x] ✅ 实现自动播放剧情
  - [x] ✅ 实现播放/暂停控制
  - [x] ✅ 实现跳过观演功能

#### 5.2 对话展示组件

- [x] ✅ 创建 `components/observation-view.tsx`
  - [x] ✅ 实现对话气泡显示
  - [x] ✅ 实现角色头像显示
  - [x] ✅ 实现淡入动画
  - [x] ✅ 实现不同情绪的样式（calm/tense/angry）

#### 5.3 情绪指标组件

- [x] ✅ 实现压力值进度条
- [x] ✅ 实现情绪表情显示
- [x] ✅ 实现颜色编码（蓝/黄/红）

#### 5.4 进度条组件

- [x] ✅ 实现幕次显示
- [x] ✅ 实现进度百分比
- [x] ✅ 实现压力值显示

---

### 阶段 6：角色解构（第 4 周）✅

#### 6.1 角色解构页面

- [x] ✅ 创建 `app/script/[id]/deconstruction/page.tsx`
  - [x] ✅ 实现全屏卡片展示
  - [x] ✅ 实现标题显示
  - [x] ✅ 实现角色信息展示
  - [x] ✅ 实现继续按钮

#### 6.2 角色信息展示

- [x] ✅ 实现角色头像显示
- [x] ✅ 实现背景故事
- [x] ✅ 实现核心动机
- [x] ✅ 实现隐藏压力
- [x] ✅ 实现权力水平
- [x] ✅ 实现行为边界
- [x] ✅ 实现语言风格

#### 6.3 角色插画准备

- [ ] ⬜ 准备邱华角色插画（或使用占位符）
- [ ] ⬜ 准备小雅角色插画
- [ ] ⬜ 准备阿强角色插画
- [ ] ⬜ 准备老伴角色插画

---

### 阶段 7：小丑提问（第 4-5 周）

#### 7.1 小丑提问页面

- [ ] ⬜ 创建 `app/script/[id]/question/page.tsx`
  - [ ] ⬜ 实现全屏对话界面
  - [ ] ⬜ 实现小丑角色登场动画
  - [ ] ⬜ 实现问题导航
  - [ ] ⬜ 实现进度指示（1/3, 2/3, 3/3）

#### 7.2 小丑角色设计

- [ ] ⬜ 设计小丑视觉形象（穿西装的猫）
- [ ] ⬜ 实现小丑"跳"进来的动画
- [ ] ⬜ 实现小丑语言风格（轻松、幽默）

#### 7.3 问题输入组件

- [ ] ⬜ 创建 `components/question/question-input.tsx`
  - [ ] ⬜ 实现多行文本框
  - [ ] ⬜ 实现字数统计（100-500 字）
  - [ ] ⬜ 实现必填验证
  - [ ] ⬜ 实现跳过机制

#### 7.4 问题数据

- [ ] ⬜ 为每个剧本准备 3 个思辨问题
- [ ] ⬜ 实现小丑反馈语句

#### 7.5 状态管理

- [ ] ⬜ 创建用户回答状态管理
- [ ] ⬜ 实现回答存储
- [ ] ⬜ 实现回答传递到对话 API

---

### 阶段 8：选择介入点（第 5 周）✅

#### 8.1 介入点选择页面

- [x] ✅ 创建 `app/script/[id]/intervention/page.tsx`
  - [x] ✅ 实现全屏界面
  - [x] ✅ 实现标题显示
  - [x] ✅ 实现介入点卡片列表

#### 8.2 介入点卡片展示

- [x] ✅ 实现场景描述
- [x] ✅ 实现冲突说明
- [x] ✅ 实现考验说明
- [x] ✅ 实现类型颜色编码（communication/empathy/boundary/systemic）
- [x] ✅ 实现点击跳转到对话页面

---

### 阶段 9：AI 对话引擎（第 6-7 周）✅

#### 9.1 AI 对话引擎实现

- [x] ✅ 创建 `lib/engines/ai-dialogue-engine.ts`
  - [x] ✅ 实现 `AIDialogueEngine` 类
  - [x] ✅ 实现构造函数（支持 baseURL）
  - [x] ✅ 实现 `generateResponse()` 方法
  - [x] ✅ 实现 `buildSystemPrompt()` 方法
  - [x] ✅ 实现 `detectEmotion()` 方法
  - [x] ✅ 实现 `generateInternalThought()` 方法

#### 9.2 角色提示词实现

- [x] ✅ 基于角色数据生成动态提示词
- [x] ✅ 包含用户思考内容（userThoughts）

#### 9.3 Kimi API 集成

- [x] ✅ 配置 Kimi API（baseURL: https://api.moonshot.cn/v1）
- [x] ✅ 使用 kimi-k2.5 模型
- [x] ✅ 配置环境变量（MOONSHOT_API_KEY）

---

### 阶段 10：沙盒对话（第 7-8 周）✅

#### 10.1 对话页面

- [x] ✅ 创建 `app/script/[id]/dialogue/page.tsx`
  - [x] ✅ 实现全屏聊天界面
  - [x] ✅ 实现顶部信息栏
  - [x] ✅ 实现对话区域
  - [x] ✅ 实现输入区域
  - [x] ✅ 实现自动滚动到底部

#### 10.2 聊天气泡展示

- [x] ✅ 实现用户消息样式
- [x] ✅ 实现 AI 消息样式
- [x] ✅ 实现角色头像
- [x] ✅ 实现角色名称显示

#### 10.3 聊天输入

- [x] ✅ 实现文本输入框
- [x] ✅ 实现发送按钮
- [x] ✅ 实现 Enter 发送
- [x] ✅ 实现禁用状态

#### 10.4 对话状态管理

- [x] ✅ 创建 `lib/stores/dialogue-store.ts`
  - [x] ✅ 定义状态接口
  - [x] ✅ 实现 `addMessage` 操作
  - [x] ✅ 实现 `addAnalysis` 操作
  - [x] ✅ 实现 `setAITyping` 操作
  - [x] ✅ 实现 `setDeadlock` 操作
  - [x] ✅ 实现 `setUserThoughts` 操作
  - [x] ✅ 实现 `reset` 操作

#### 10.5 对话额度管理

- [x] ✅ 实现对话轮次计数
- [x] ✅ 实现额度显示（当前轮次/最大轮次）
- [x] ✅ 实现进度条显示
- [x] ✅ 实现自动结束（30 轮）

#### 10.6 结束演出功能

- [x] ✅ 实现"结束对话"按钮
- [x] ✅ 实现跳转到报告页面

#### 10.7 AI 正在思考状态

- [x] ✅ 实现加载动画
- [x] ✅ 实现"正在思考..."文字

---

### 阶段 11：对话分析引擎（第 8 周）✅

#### 11.1 对话分析引擎实现

- [x] ✅ 创建 `lib/engines/dialogue-analyzer.ts`
  - [x] ✅ 实现 `DialogueAnalyzer` 类
  - [x] ✅ 实现构造函数（支持 baseURL）
  - [x] ✅ 实现 `analyzeDialogue()` 方法
  - [x] ✅ 实现多维度分析（boundary/strategy/empathy）
  - [x] ✅ 实现 `detectDeadlock()` 方法

#### 11.2 分析提示词实现

- [x] ✅ 实现综合分析提示词
- [x] ✅ 返回 JSON 格式分析结果

#### 11.3 僵局检测

- [x] ✅ 实现重复模式检测
- [x] ✅ 实现相似度计算
- [x] ✅ 实现僵局标记

---

### 阶段 12：报告生成引擎（第 9 周）✅

#### 12.1 报告生成引擎实现

- [x] ✅ 创建 `lib/engines/report-generator.ts`
  - [x] ✅ 实现 `ReportGenerator` 类
  - [x] ✅ 实现构造函数（支持 baseURL）
  - [x] ✅ 实现 `generateReport()` 方法
  - [x] ✅ 实现维度计算（平均值）
  - [x] ✅ 实现 `determineHeroType()` 方法
  - [x] ✅ 实现 `extractKeyMoment()` 方法
  - [x] ✅ 实现 `extractAIThoughts()` 方法
  - [x] ✅ 实现 `generateKnowledge()` 方法

#### 12.2 英雄类型判定逻辑

- [x] ✅ 实现 8 种英雄类型的判定规则
- [x] ✅ 基于三维度分数判定

#### 12.3 社会学知识库

- [x] ✅ 编写 3 个维度对应的知识
- [x] ✅ 根据最弱维度推荐知识

---

### 阶段 13：分析报告页面（第 9-10 周）✅

#### 13.1 报告页面

- [x] ✅ 创建 `app/script/[id]/report/page.tsx`
  - [x] ✅ 实现全屏报告界面
  - [x] ✅ 实现顶部标题
  - [x] ✅ 实现滚动浏览
  - [x] ✅ 实现底部按钮

#### 13.2 报告卡片展示

- [x] ✅ 实现英雄类型卡片
  - [x] ✅ 实现英雄表情显示
  - [x] ✅ 实现类型名称
  - [x] ✅ 实现类型描述

- [x] ✅ 实现三维度卡片
  - [x] ✅ 实现三维进度条
  - [x] ✅ 实现颜色编码（紫/蓝/绿）
  - [x] ✅ 实现分数显示

- [x] ✅ 实现关键时刻卡片
  - [x] ✅ 实现关键台词显示
  - [x] ✅ 实现评论
  - [x] ✅ 实现引用样式

- [x] ✅ 实现 AI 内心独白卡片
  - [x] ✅ 实现角色内心独白
  - [x] ✅ 实现多角色显示

- [x] ✅ 实现知识卡片
  - [x] ✅ 实现知识标题
  - [x] ✅ 实现知识内容

#### 13.3 重新参演功能

- [x] ✅ 实现"尝试其他介入点"按钮
- [x] ✅ 实现"返回首页"按钮

---

### 阶段 14：API 路由（第 10 周）✅

#### 14.1 对话 API

- [x] ✅ 创建 `app/api/dialogue/route.ts`
  - [x] ✅ 实现 POST 处理函数
  - [x] ✅ 实现请求参数验证
  - [x] ✅ 实现 AI 引擎调用
  - [x] ✅ 实现分析引擎调用
  - [x] ✅ 实现错误处理
  - [x] ✅ 实现响应格式化

#### 14.2 报告生成 API

- [x] ✅ 创建 `app/api/report/route.ts`
  - [x] ✅ 实现 POST 处理函数
  - [x] ✅ 实现请求参数验证
  - [x] ✅ 实现报告生成引擎调用
  - [x] ✅ 实现错误处理
  - [x] ✅ 实现响应格式化

---

### 阶段 15：视觉设计优化（第 10-11 周）

#### 15.1 色彩系统

- [ ] ⬜ 定义主色调（深蓝、暖橙）
- [ ] ⬜ 定义辅助色（灰、绿、黄、红）
- [ ] ⬜ 定义情绪色彩映射
- [ ] ⬜ 实现 CSS 变量
- [ ] ⬜ 实现暗色模式（可选）

#### 15.2 字体系统

- [ ] ⬜ 引入思源黑体
- [ ] ⬜ 引入 Inter 字体
- [ ] ⬜ 定义字号规范
- [ ] ⬜ 定义字重规范
- [ ] ⬜ 优化中英文混排

#### 15.3 动画效果

- [ ] ⬜ 优化页面切换动画
- [ ] ⬜ 优化对话气泡动画
- [ ] ⬜ 优化卡片翻转动画
- [ ] ⬜ 优化按钮悬停动画
- [ ] ⬜ 优化加载动画
- [ ] ⬜ 确保动画流畅（60fps）

#### 15.4 响应式设计

- [ ] ⬜ 优化移动端布局
- [ ] ⬜ 优化平板端布局
- [ ] ⬜ 优化桌面端布局
- [ ] ⬜ 测试不同屏幕尺寸
- [ ] ⬜ 测试不同设备

#### 15.5 图片资源

- [ ] ⬜ 准备封面图（或使用占位符）
- [ ] ⬜ 准备场景背景图
- [ ] ⬜ 准备角色插画
- [ ] ⬜ 准备英雄徽章
- [ ] ⬜ 优化图片大小（WebP 格式）
- [ ] ⬜ 实现图片懒加载

---

### 阶段 16：性能优化（第 11 周）

#### 16.1 代码优化

- [ ] ⬜ 实现代码分割（React.lazy）
- [ ] ⬜ 优化组件渲染（React.memo）
- [ ] ⬜ 优化状态更新
- [ ] ⬜ 移除未使用的代码

#### 16.2 资源优化

- [ ] ⬜ 压缩图片
- [ ] ⬜ 使用 WebP 格式
- [ ] ⬜ 实现图片懒加载
- [ ] ⬜ 预加载关键资源

#### 16.3 API 优化

- [ ] ⬜ 实现流式传输（SSE）
- [ ] ⬜ 优化提示词长度
- [ ] ⬜ 实现请求缓存（可选）
- [ ] ⬜ 实现请求重试机制

#### 16.4 性能测试

- [ ] ⬜ 使用 Lighthouse 测试
- [ ] ⬜ 测试首屏加载时间
- [ ] ⬜ 测试交互响应时间
- [ ] ⬜ 测试 AI API 响应时间
- [ ] ⬜ 优化性能瓶颈

---

### 阶段 17：测试（第 11-12 周）

#### 17.1 功能测试

- [ ] ⬜ 测试议题广场
- [ ] ⬜ 测试议题介绍页
- [ ] ⬜ 测试沉浸式观演
- [ ] ⬜ 测试角色解构
- [ ] ⬜ 测试小丑提问
- [ ] ⬜ 测试选择介入点
- [ ] ⬜ 测试沙盒对话
- [ ] ⬜ 测试分析报告
- [ ] ⬜ 测试分享功能

#### 17.2 AI 质量测试

- [ ] ⬜ 测试角色一致性
- [ ] ⬜ 测试对话质量
- [ ] ⬜ 测试情绪分析准确性
- [ ] ⬜ 测试报告生成质量
- [ ] ⬜ 测试僵局检测
- [ ] ⬜ 迭代优化提示词

#### 17.3 用户体验测试

- [ ] ⬜ 邀请 5-10 人进行内测
- [ ] ⬜ 收集用户反馈
- [ ] ⬜ 记录用户痛点
- [ ] ⬜ 优化用户体验

#### 17.4 兼容性测试

- [ ] ⬜ 测试 Chrome
- [ ] ⬜ 测试 Safari
- [ ] ⬜ 测试 Firefox
- [ ] ⬜ 测试 Edge
- [ ] ⬜ 测试移动端浏览器

#### 17.5 Bug 修复

- [ ] ⬜ 修复已知 Bug
- [ ] ⬜ 修复测试中发现的 Bug
- [ ] ⬜ 修复用户反馈的 Bug

---

### 阶段 18：部署（第 12 周）

#### 18.1 Cloudflare Workers 配置

- [ ] ⬜ 注册 Cloudflare 账号
- [ ] ⬜ 创建 Workers 项目
- [ ] ⬜ 连接 GitHub 仓库
- [ ] ⬜ 配置构建设置
- [ ] ⬜ 配置环境变量
  - [ ] ⬜ `MOONSHOT_API_KEY`
  - [ ] ⬜ `MOONSHOT_BASE_URL`

#### 18.2 部署测试

- [ ] ⬜ 部署到测试环境
- [ ] ⬜ 测试所有功能
- [ ] ⬜ 测试 API 连接
- [ ] ⬜ 测试性能
- [ ] ⬜ 修复部署问题

#### 18.4 监控和日志

- [ ] ⬜ 配置日志收集（可选）

---

### 阶段 19：文档完善（第 12 周）

#### 19.1 用户文档

- [ ] ⬜ 更新 `README.md`
  - [ ] ⬜ 项目简介
  - [ ] ⬜ 功能特性
  - [ ] ⬜ 技术栈
  - [ ] ⬜ 快速开始
  - [ ] ⬜ 部署指南
- [ ] ⬜ 创建用户使用指南（可选）

#### 19.2 开发者文档

- [ ] ⬜ 创建架构文档

#### 19.3 剧本创作指南

- [ ] ⬜ 创建剧本创作指南
- [ ] ⬜ 创建角色设定指南
- [ ] ⬜ 创建介入点设计指南

---

---

## 📊 任务统计

- **总任务数**：约 350+ 个
- **预计完成时间**：12 周（MVP）
- **核心阶段**：0-18（必须完成）
- **优化阶段**：19-20（持续迭代）

---

## 🎯 里程碑

- **Week 1-2**：项目初始化 + 基础架构 ✅
- **Week 3-4**：剧本引擎 + 观演功能 ✅
- **Week 5**：角色解构 + 小丑提问 ✅
- **Week 6-7**：AI 对话引擎 + 沙盒对话 ✅
- **Week 8**：对话分析引擎 ✅
- **Week 9-10**：报告生成 + 视觉优化 ✅
- **Week 11-12**：测试 + 部署 + 文档 ✅

---

## 十、技术难点与解决方案

### 9.1 AI 对话质量不稳定

**问题**：AI 可能"出戏"，回复不符合角色设定

**解决方案**：

1. 精心设计角色提示词，包含详细的人物背景和行为准则
2. 在提示词中明确禁止"出戏"行为
3. 使用较高的 temperature（0.8）增加随机性，模拟即兴演出
4. 建立角色提示词库，持续优化
5. 引入人工审核机制（可选）

### 9.2 情绪分析准确性

**问题**：情绪分析可能不准确

**解决方案**：

1. 使用多维度分析（情感、策略、边界、同情）
2. 结合关键词匹配和 LLM 分析
3. 建立标注数据集，训练专门的模型（长期）
4. 允许一定的误差，不追求完美

### 9.3 性能优化

**问题**：AI API 调用延迟高

**解决方案**：

1. 使用流式传输（SSE）实现打字机效果
2. 预加载剧本数据和角色信息
3. 使用 Redis 缓存常见响应（可选）
4. 优化图片加载（WebP、懒加载）
5. 使用 Next.js 的 SSR 和 ISR

### 9.4 成本控制

**问题**：AI API 调用成本

**解决方案**：

1. **使用 Kimi API**：
   - moonshot-v1-8k：¥12/百万 tokens（输入）、¥12/百万 tokens（输出）
   - 比 GPT-4 便宜约 90%，比 GPT-3.5 便宜约 50%
   - 中文能力更强，更适合本项目

2. **限制对话轮次**：最多 30 轮，控制总 token 消耗

3. **优化提示词**：
   - 精简角色提示词，去除冗余信息
   - 使用更简洁的分析提示词
   - 限制对话历史长度（只保留最近 10 轮）

4. **缓存策略**：
   - 缓存剧本数据和角色信息
   - 缓存常见的分析结果（如情感分析）
   - 使用 Cloudflare KV 存储缓存

5. **备选方案**：
   - 如成本仍然过高，可考虑使用开源模型（如 Qwen、GLM）
   - 部署在本地或自有服务器，完全控制成本

---

## 十、部署方案

### 10.1 Cloudflare Workers 部署（推荐）

基于 [Cloudflare Workers 官方文档](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

**优势**：

- 全球边缘网络，超低延迟
- 免费额度慷慨（每天 100,000 次请求）
- 支持 Next.js 全部特性（通过 OpenNext 适配器）
- 内置 KV/D1/R2 存储
- 无冷启动问题
- 自动扩展

#### 快速开始 - 从 CLI 创建项目

```bash
# 使用 npm
npm create cloudflare@latest -- forum-theatre --framework=next

# 使用 yarn
yarn create cloudflare forum-theatre --framework=next

# 使用 pnpm
pnpm create cloudflare@latest forum-theatre --framework=next
```

**背后发生了什么？**

当你运行这个命令时，C3（create-cloudflare CLI）会：

1. 创建新的项目目录
2. 初始化 Next.js 官方设置工具
3. 为 Cloudflare 配置项目
4. 提供立即部署到 Cloudflare 的选项

详细文档请访问 [OpenNext 官网](https://opennext.js.org/cloudflare)。

## What is Next.js?

[Next.js](https://nextjs.org/) is a [React](https://react.dev/) framework for building full stack applications.

Next.js supports Server-side and Client-side rendering, as well as Partial Prerendering which lets you combine static and dynamic components in the same route.

You can deploy your Next.js app to Cloudflare Workers using the OpenNext adapter.

## Next.js supported features

Most Next.js features are supported by the Cloudflare OpenNext adapter:

| Feature                               | Cloudflare adapter   | Notes                                                                        |
| ------------------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| App Router                            | 🟢 supported         |                                                                              |
| Pages Router                          | 🟢 supported         |                                                                              |
| Route Handlers                        | 🟢 supported         |                                                                              |
| React Server Components               | 🟢 supported         |                                                                              |
| Static Site Generation (SSG)          | 🟢 supported         |                                                                              |
| Server-Side Rendering (SSR)           | 🟢 supported         |                                                                              |
| Incremental Static Regeneration (ISR) | 🟢 supported         |                                                                              |
| Server Actions                        | 🟢 supported         |                                                                              |
| Response streaming                    | 🟢 supported         |                                                                              |
| asynchronous work with `next/after`   | 🟢 supported         |                                                                              |
| Middleware                            | 🟢 supported         |                                                                              |
| Image optimization                    | 🟢 supported         | Supported via [Cloudflare Images](https://developers.cloudflare.com/images/) |
| Partial Prerendering (PPR)            | 🟢 supported         | PPR is experimental in Next.js                                               |
| Composable Caching ('use cache')      | 🟢 supported         | Composable Caching is experimental in Next.js                                |
| Node.js in Middleware                 | ⚪ not yet supported | Node.js middleware introduced in 15.2 are not yet supported                  |

## Deploy a new Next.js project on Workers

1. **Create a new project with the create-cloudflare CLI (C3).**
   - npm

     ```sh
     npm create cloudflare@latest -- my-next-app --framework=next
     ```

   - yarn

     ```sh
     yarn create cloudflare my-next-app --framework=next
     ```

   - pnpm

     ```sh
     pnpm create cloudflare@latest my-next-app --framework=next
     ```

   What's happening behind the scenes?

   When you run this command, C3 creates a new project directory, initiates [Next.js's official setup tool](https://nextjs.org/docs/app/api-reference/cli/create-next-app), and configures the project for Cloudflare. It then offers the option to instantly deploy your application to Cloudflare.

2. **Develop locally.**

   After creating your project, run the following command in your project directory to start a local development server. The command uses the Next.js development server. It offers the best developer experience by quickly reloading your app every time the source code is updated.
   - npm

     ```sh
     npm run dev
     ```

   - yarn

     ```sh
     yarn run dev
     ```

   - pnpm

     ```sh
     pnpm run dev
     ```

3. **Test and preview your site with the Cloudflare adapter.**
   - npm

     ```sh
     npm run preview
     ```

   - yarn

     ```sh
     yarn run preview
     ```

   - pnpm

     ```sh
     pnpm run preview
     ```

   What's the difference between dev and preview?

   The command used in the previous step uses the Next.js development server, which runs in Node.js. However, your deployed application will run on Cloudflare Workers, which uses the `workerd` runtime. Therefore when running integration tests and previewing your application, you should use the preview command, which is more accurate to production, as it executes your application in the `workerd` runtime using `wrangler dev`.

4. **Deploy your project.**

   You can deploy your project to a [`*.workers.dev` subdomain](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) or a [custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) from your local machine or any CI/CD system (including [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/#workers-builds)). Use the following command to build and deploy. If you're using a CI service, be sure to update your "deploy command" accordingly.
   - npm

     ```sh
     npm run deploy
     ```

   - yarn

     ```sh
     yarn run deploy
     ```

   - pnpm

     ```sh
     pnpm run deploy
     ```

   Note

   [**Workers Builds**](https://developers.cloudflare.com/workers/ci-cd/builds/) requires you to configure environment variables in the ["Build Variables and secrets"](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#:~:text=Build%20variables%20and%20secrets) section.

   This ensures the Next build has the necessary access to both public `NEXT_PUBLC...` variables and [non-`NEXT_PUBLIC_...`](https://nextjs.org/docs/pages/guides/environment-variables#bundling-environment-variables-for-the-browser), which are essential for tasks like inlining and building SSG pages.

   Learn more in the [OpenNext environment variable guide](https://opennext.js.org/cloudflare/howtos/env-vars#workers-builds)

## Deploy an existing Next.js project on Workers

Automatic configuration

Run `wrangler deploy` in a project without a Wrangler configuration file and Wrangler will automatically detect Next.js, generate the necessary configuration, and deploy your project.

- npm

  ```sh
  npx wrangler deploy
  ```

- yarn

  ```sh
  yarn wrangler deploy
  ```

- pnpm

  ```sh
  pnpm wrangler deploy
  ```

Learn more about [automatic project configuration](https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/).

## Manual configuration

If you prefer to configure your project manually, follow the steps below.

1. **Install [`@opennextjs/cloudflare`](https://www.npmjs.com/package/@opennextjs/cloudflare)**
   - npm

     ```sh
     npm i @opennextjs/cloudflare@latest
     ```

   - yarn

     ```sh
     yarn add @opennextjs/cloudflare@latest
     ```

   - pnpm

     ```sh
     pnpm add @opennextjs/cloudflare@latest
     ```

2. **Install [`wrangler CLI`](https://developers.cloudflare.com/workers/wrangler) as a devDependency**
   - npm

     ```sh
     npm i -D wrangler@latest
     ```

   - yarn

     ```sh
     yarn add -D wrangler@latest
     ```

   - pnpm

     ```sh
     pnpm add -D wrangler@latest
     ```

3. **Add a Wrangler configuration file**

   In your project root, create a [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) with the following content:
   - wrangler.jsonc

     ```jsonc
     {
       "$schema": "./node_modules/wrangler/config-schema.json",
       "main": ".open-next/worker.js",
       "name": "my-app",
       // Set this to today's date
       "compatibility_date": "2026-03-06",
       "compatibility_flags": ["nodejs_compat"],
       "assets": {
         "directory": ".open-next/assets",
         "binding": "ASSETS",
       },
     }
     ```

   - wrangler.toml

     ```toml
     "$schema" = "./node_modules/wrangler/config-schema.json"
     main = ".open-next/worker.js"
     name = "my-app"
     # Set this to today's date
     compatibility_date = "2026-03-06"
     compatibility_flags = [ "nodejs_compat" ]


     [assets]
     directory = ".open-next/assets"
     binding = "ASSETS"
     ```

   Note

   As shown above, you must enable the [`nodejs_compat` compatibility flag](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) _and_ set your [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) to `2024-09-23` or later for your Next.js app to work with @opennextjs/cloudflare.

4. **Add a configuration file for OpenNext**

   In your project root, create an OpenNext configuration file named `open-next.config.ts` with the following content:

   ```ts
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";

   export default defineCloudflareConfig();
   ```

   Note

   `open-next.config.ts` is where you can configure the caching, see the [adapter documentation](https://opennext.js.org/cloudflare/caching) for more information

5. **Update `package.json`**

   You can add the following scripts to your `package.json`:

   ```json
   "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
   "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
   "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
   ```

   Usage
   - `preview`: Builds your app and serves it locally, allowing you to quickly preview your app running locally in the Workers runtime, via a single command.
   - `deploy`: Builds your app, and then deploys it to Cloudflare
   - `cf-typegen`: Generates a `cloudflare-env.d.ts` file at the root of your project containing the types for the env.

6. **Develop locally.**

   After creating your project, run the following command in your project directory to start a local development server. The command uses the Next.js development server. It offers the best developer experience by quickly reloading your app after your source code is updated.
   - npm

     ```sh
     npm run dev
     ```

   - yarn

     ```sh
     yarn run dev
     ```

   - pnpm

     ```sh
     pnpm run dev
     ```

7. **Test your site with the Cloudflare adapter.**

   The command used in the previous step uses the Next.js development server to offer a great developer experience. However your application will run on Cloudflare Workers so you want to run your integration tests and verify that your application works correctly in this environment.
   - npm

     ```sh
     npm run preview
     ```

   - yarn

     ```sh
     yarn run preview
     ```

   - pnpm

     ```sh
     pnpm run preview
     ```

8. **Deploy your project.**

   You can deploy your project to a [`*.workers.dev` subdomain](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) or a [custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) from your local machine or any CI/CD system (including [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/#workers-builds)). Use the following command to build and deploy. If you're using a CI service, be sure to update your "deploy command" accordingly.
   - npm

     ```sh
     npm run deploy
     ```

   - yarn

     ```sh
     yarn run deploy
     ```

   - pnpm

     ```sh
     pnpm run deploy
     ```

   Note

   [**Workers Builds**](https://developers.cloudflare.com/workers/ci-cd/builds/) requires you to configure environment variables in the ["Build Variables and secrets"](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#:~:text=Build%20variables%20and%20secrets) section.

   This ensures the Next build has the necessary access to both public `NEXT_PUBLC...` variables and [non-`NEXT_PUBLIC_...`](https://nextjs.org/docs/pages/guides/environment-variables#bundling-environment-variables-for-the-browser), which are essential for tasks like inlining and building SSG pages.

   Learn more in the [OpenNext environment variable guide](https://opennext.js.org/cloudflare/howtos/env-vars#workers-builds)

#### 部署现有项目到 Cloudflare Workers

如果你已经有一个 Next.js 项目，按以下步骤部署到 Cloudflare Workers：

**步骤 1：本地开发**

```bash
# 进入项目目录
cd forum-theatre

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器使用 Next.js 原生开发服务器，提供最佳的开发体验和热重载。

**步骤 2：通过 Cloudflare Workers Dashboard 部署**

1. **将代码推送到 GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/forum-theatre.git
   git push -u origin main
   ```

2. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 登录你的账号

3. **创建 Workers 项目**
   - 进入 **Workers & Pages** → **Create application**
   - 选择 **Pages** 标签
   - 点击 **Connect to Git**

4. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问你的 GitHub
   - 选择 `forum-theatre` 仓库
   - 点击 **Begin setup**

5. **配置构建设置**
   - **Project name**: `forum-theatre`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: 保持默认或留空（会自动检测）
   - **Build output directory**: 保持默认

6. **添加环境变量**
   点击 **Environment variables** → **Add variable**：
   - `MOONSHOT_API_KEY`: 你的 Kimi API Key
   - `MOONSHOT_BASE_URL`: `https://api.moonshot.cn/v1`

7. **部署**
   - 点击 **Save and Deploy**
   - 等待构建完成（通常 2-5 分钟）
   - 部署成功后，你会得到一个 `*.pages.dev` 域名

**步骤 3：通过 Wrangler CLI 部署（可选）**

如果你更喜欢命令行，可以使用 Wrangler：

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 部署
npx wrangler pages deploy

# 4. 配置环境变量
wrangler pages secret put MOONSHOT_API_KEY
# 输入你的 Kimi API Key

wrangler pages secret put MOONSHOT_BASE_URL
# 输入 https://api.moonshot.cn/v1
```

#### Next.js 支持的特性

Cloudflare OpenNext 适配器支持 Next.js 的大部分特性：

| 特性                                  | 支持状态 | 说明                   |
| ------------------------------------- | -------- | ---------------------- |
| App Router                            | ✅ 支持  |                        |
| Pages Router                          | ✅ 支持  |                        |
| Route Handlers                        | ✅ 支持  |                        |
| React Server Components               | ✅ 支持  |                        |
| Static Site Generation (SSG)          | ✅ 支持  |                        |
| Server-Side Rendering (SSR)           | ✅ 支持  |                        |
| Incremental Static Regeneration (ISR) | ✅ 支持  |                        |
| Server Actions                        | ✅ 支持  |                        |
| Response streaming                    | ✅ 支持  |                        |
| Middleware                            | ✅ 支持  |                        |
| Image optimization                    | ✅ 支持  | 通过 Cloudflare Images |
| Partial Prerendering (PPR)            | ✅ 支持  | 实验性功能             |

#### 注意事项

1. **API Routes 运行时**：
   - Cloudflare Workers 使用 V8 引擎，不是 Node.js
   - 某些 Node.js API 可能不可用
   - 建议在 API Routes 中使用 Web 标准 API

2. **环境变量**：
   - 在本地使用 `.env.local`
   - 在 Cloudflare Dashboard 中配置生产环境变量

3. **图片优化**：
   - 可以使用 Cloudflare Images 进行优化
   - 或者在 `next.config.ts` 中设置 `images.unoptimized: true`

### 10.3 环境变量配置

**本地开发环境**

创建 `.env.local` 文件：

```bash
# .env.local

# Kimi K2.5 API
MOONSHOT_API_KEY=your-kimi-api-key
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
```

**生产环境（Cloudflare Workers）**

在 Cloudflare Dashboard 中配置：

1. 进入你的 Workers 项目
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：
   - `MOONSHOT_API_KEY`: 你的 Kimi API Key
   - `MOONSHOT_BASE_URL`: `https://api.moonshot.cn/v1`

或使用 Wrangler CLI：

```bash
# 配置 API Key
wrangler pages secret put MOONSHOT_API_KEY
# 输入你的 Kimi API Key

# 配置 Base URL
wrangler pages secret put MOONSHOT_BASE_URL
# 输入 https://api.moonshot.cn/v1
```

### 10.4 自定义域名（可选）

在 Cloudflare Dashboard 中：

1. 进入你的 Workers 项目
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入你的域名（如 `forum-theatre.example.com`）
5. 按照提示配置 DNS 记录

---

## 十一、后续优化方向

### 11.1 短期优化（1-3 个月）

1. **新增剧本**：至少 2-3 个新剧本
2. **用户账号系统**：支持登录、保存进度
3. **对话历史**：支持查看历史对话和报告
4. **分享功能**：生成精美的报告卡片
5. **语音朗读**：为角色配音（可选）

### 11.2 中期优化（3-6 个月）

1. **付费系统**：实现会员订阅
2. **个性化推荐**：基于用户的英雄类型推荐剧本
3. **成就系统**：设置成就徽章
4. **社区功能**：用户可以分享体验和思考
5. **数据分析**：建立完整的数据分析系统

### 11.3 长期优化（6-12 个月）

1. **平台化**：开放剧本创作工具
2. **多语言支持**：翻译成多种语言
3. **线下活动**：举办线下论坛剧场活动
4. **企业服务**：提供定制化剧本和团队版
5. **AI 优化**：训练专门的对话模型

---

## 十二、总结

这份实现计划提供了从零到一构建论坛剧场数字化产品的完整路径：

1. **清晰的技术架构**：基于 Next.js 16 + React 19 + TypeScript
2. **完整的类型定义**：涵盖剧本、角色、对话、报告等所有核心概念
3. **核心引擎实现**：剧本引擎、AI 对话引擎、分析引擎、报告生成引擎
4. **状态管理方案**：使用 Zustand 管理全局状态
5. **详细的代码示例**：每个核心模块都有完整的代码实现
6. **分阶段开发计划**：12 周完成 MVP
7. **技术难点解决方案**：针对 AI 质量、性能、成本等关键问题
8. **部署方案**：推荐使用 Vercel，简单高效

按照这份计划，你可以在 3 个月内完成一个功能完整、体验优秀的 MVP 产品。

**下一步行动**：

1. 搭建项目基础架构
2. 实现剧本引擎和观演功能
3. 接入 OpenAI API，实现 AI 对话
4. 逐步完善分析和报告功能
5. 优化视觉设计和用户体验
6. 测试、优化、上线

让我们开始构建这个有意义的产品吧！🚀
