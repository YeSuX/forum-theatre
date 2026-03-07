# Forum Theatre 项目深度研究报告 v2.0

**文档版本**：v2.0  
**研究日期**：2026-03-07  
**研究深度**：完整代码库分析 + 架构解析 + 实现细节  
**研究方法**：代码审查、文档分析、架构推导、模式识别

---

## 执行摘要

Forum Theatre（论坛剧场）是一个创新的数字化社会议题探索平台，通过 AI 驱动的角色对话，让用户在虚拟舞台上体验社会困境，探索沟通与人性。项目基于 Next.js 16 + React 19 + TypeScript 构建，集成 Kimi K2.5 AI 模型，实现了从观演到报告的完整体验链路。

**核心价值主张**：
- **好用**：零学习成本、流程顺畅、反馈清晰
- **好看**：电影感视觉、情绪化设计、沉浸式界面
- **好玩**：即时反馈、意外惊喜、社交传播

**技术亮点**：
- 完整的 TypeScript 类型系统，无 `any` 类型
- 四大核心引擎：剧本引擎、AI 对话引擎、对话分析引擎、报告生成引擎
- 基于 Zustand 的全局状态管理
- 集成 Kimi K2.5 API，实现角色一致性对话
- 多维度对话分析（边界感、策略性、同理心）

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术架构](#2-技术架构)
3. [核心类型系统](#3-核心类型系统)
4. [核心引擎实现](#4-核心引擎实现)
5. [状态管理](#5-状态管理)
6. [用户体验流程](#6-用户体验流程)
7. [API 路由设计](#7-api-路由设计)
8. [数据结构与内容](#8-数据结构与内容)
9. [UI 组件体系](#9-ui-组件体系)
10. [关键实现细节](#10-关键实现细节)
11. [问题与改进建议](#11-问题与改进建议)
12. [技术债务与优化方向](#12-技术债务与优化方向)
13. [总结与展望](#13-总结与展望)

---

## 1. 项目概览

### 1.1 产品定位

论坛剧场（Forum Theatre）源于巴西戏剧家奥古斯托·波瓦的"被压迫者剧场"理论，是一种参与式戏剧形式。本项目将这一理念数字化，通过 AI 技术实现观众与虚拟角色的深度互动。

**核心理念**：
- **不是解决问题，而是理解问题**
- **从旁观者到观演者（Spect-Actor）**
- **探索结构性困境，而非个人道德评判**

### 1.2 用户旅程

```
首页（议题广场）
    ↓
剧本介绍（了解议题背景）
    ↓
沉浸式观演（3-4 幕，自动播放）
    ↓
角色解构（理解角色动机与压力）
    ↓
小丑提问（3 个思辨问题）
    ↓
选择介入点（4 个关键时刻）
    ↓
沙盒对话（与 AI 角色对话，最多 30 轮）
    ↓
分析报告（英雄类型 + 三维分析 + 关键时刻）
```

### 1.3 技术栈概览

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 前端框架 | Next.js (App Router) | 16.1.6 |
| UI 框架 | React | 19.2.3 |
| 类型系统 | TypeScript | 5.x |
| 样式方案 | Tailwind CSS | 4.x |
| UI 组件库 | shadcn/ui (Radix UI) | 1.4.3 |
| 状态管理 | Zustand | 5.0.11 |
| AI 服务 | Kimi API (kimi-k2.5) | - |
| HTTP 客户端 | OpenAI SDK | 6.27.0 |
| 图表库 | Recharts | 2.15.4 |
| 动画库 | tw-animate-css | 1.4.0 |

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用层 (Next.js 16)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  页面路由   │ │  UI 组件    │ │  业务组件   │           │
│  │  (App Router)│ │  (shadcn)   │ │  (观演/对话)│           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴──────┐          │
│  │         状态管理层 (Zustand)                   │          │
│  │  ┌──────────────┐  ┌──────────────┐           │          │
│  │  │ script-store │  │dialogue-store│           │          │
│  │  └──────────────┘  └──────────────┘           │          │
│  └────────────────────┬────────────────┘          │          │
└───────────────────────┼───────────────────────────┘          │
                        │                                       │
┌───────────────────────┼───────────────────────────┐          │
│              业务逻辑层 (Engines)                  │          │
│  ┌──────────────┐  ┌──────────────┐               │          │
│  │ ScriptEngine │  │AIDialogueEngine│             │          │
│  └──────────────┘  └──────────────┘               │          │
│  ┌──────────────┐  ┌──────────────┐               │          │
│  │DialogueAnalyzer│ │ReportGenerator│             │          │
│  └──────────────┘  └──────────────┘               │          │
└───────────────────────┼───────────────────────────┘          │
                        │                                       │
┌───────────────────────┼───────────────────────────┐          │
│                 API 层 (Next.js API Routes)        │          │
│  ┌──────────────┐  ┌──────────────┐               │          │
│  │ /api/dialogue│  │ /api/report  │               │          │
│  └──────┬───────┘  └──────┬───────┘               │          │
└─────────┼──────────────────┼───────────────────────┘          │
          │                  │                                  │
┌─────────┼──────────────────┼───────────────────────┐          │
│         ▼                  ▼                        │          │
│    Kimi API (moonshot.cn)                          │          │
│    Model: kimi-k2.5                                │          │
│    Base URL: https://api.moonshot.cn/v1           │          │
└────────────────────────────────────────────────────┘
```

### 2.2 目录结构详解

```
forum-theatre/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页（议题广场）
│   ├── layout.tsx                # 根布局
│   ├── globals.css               # 全局样式
│   ├── script/[id]/              # 剧本动态路由
│   │   ├── page.tsx              # 剧本介绍
│   │   ├── observation/          # 沉浸式观演
│   │   │   └── page.tsx
│   │   ├── deconstruction/       # 角色解构
│   │   │   └── page.tsx
│   │   ├── joker-questioning/    # 小丑提问
│   │   │   └── page.tsx
│   │   ├── intervention/         # 选择介入点
│   │   │   └── page.tsx
│   │   ├── dialogue/             # 沙盒对话
│   │   │   └── page.tsx
│   │   └── report/               # 分析报告
│   │       └── page.tsx
│   └── api/                      # API 路由
│       ├── dialogue/route.ts     # AI 对话 API
│       └── report/route.ts       # 报告生成 API
├── components/
│   ├── ui/                       # 基础 UI 组件（50+ shadcn 组件）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── shared/                   # 共享组件
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── joker/                    # 小丑相关组件
│   │   ├── joker-avatar.tsx
│   │   └── question-input.tsx
│   └── observation-view.tsx      # 观演视图组件
├── lib/
│   ├── engines/                  # 核心引擎
│   │   ├── script-engine.ts      # 剧本引擎
│   │   ├── ai-dialogue-engine.ts # AI 对话引擎
│   │   ├── dialogue-analyzer.ts  # 对话分析引擎
│   │   └── report-generator.ts   # 报告生成引擎
│   ├── stores/                   # Zustand 状态
│   │   ├── script-store.ts       # 剧本状态
│   │   └── dialogue-store.ts     # 对话状态
│   ├── types/                    # 类型定义
│   │   ├── script.ts             # 剧本相关类型
│   │   ├── dialogue.ts           # 对话相关类型
│   │   ├── report.ts             # 报告相关类型
│   │   └── index.ts              # 统一导出
│   ├── utils.ts                  # cn() 工具
│   └── utils/performance.ts      # 性能工具（防抖、节流、预加载）
├── data/scripts/
│   ├── city-moonlight.json       # 《城里的月光》剧本
│   └── index.ts                  # 剧本导出
├── docs/                         # 文档
│   ├── plan.md                   # 实现计划
│   ├── prd.md                    # 产品需求文档
│   ├── research.md               # 研究报告 v1
│   └── research_v2.md            # 本文档
├── hooks/use-mobile.ts           # 移动端检测
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind 配置
└── next.config.ts                # Next.js 配置
```

### 2.3 数据流向

```
用户操作
    ↓
React 组件（页面/组件）
    ↓
Zustand Store（状态更新）
    ↓
Engine（业务逻辑处理）
    ↓
API Route（后端处理）
    ↓
Kimi API（AI 推理）
    ↓
API Route（响应处理）
    ↓
Zustand Store（状态更新）
    ↓
React 组件（UI 更新）
```

---

## 3. 核心类型系统

项目采用严格的 TypeScript 类型系统，所有核心实体均有明确的类型定义，无 `any` 类型。

### 3.1 剧本相关类型 (`lib/types/script.ts`)

#### 3.1.1 Script（剧本）

```typescript
interface Script {
  id: string;                    // 剧本唯一标识
  title: string;                 // 剧本标题
  description: string;           // 剧本简介
  tags: string[];                // 议题标签
  duration: string;              // 预计时长
  coverImage: string;            // 封面图 URL
  theme: {                       // 主题色
    primary: string;
    secondary: string;
  };
  acts: Act[];                   // 幕次列表
  characters: Character[];       // 角色列表
  interventionPoints: InterventionPoint[]; // 介入点列表
}
```

**设计亮点**：
- `theme` 字段支持每个剧本自定义主题色
- `acts` 采用数组结构，支持任意幕次
- `interventionPoints` 与 `acts` 解耦，灵活定义介入点位置

#### 3.1.2 Act（幕）

```typescript
interface Act {
  id: string;                    // 幕次唯一标识
  actNumber: number;             // 幕次编号（1, 2, 3, ...）
  title: string;                 // 幕次标题
  description: string;           // 幕次描述
  sceneBackground: string;       // 场景背景图 URL
  dialogues: Dialogue[];         // 对话列表
}
```

**设计亮点**：
- `sceneBackground` 支持每幕切换场景背景
- `dialogues` 数组保持对话顺序

#### 3.1.3 Dialogue（对话）

```typescript
interface Dialogue {
  id: string;                    // 对话唯一标识
  actId: string;                 // 所属幕次 ID
  speaker: string;               // 说话者（角色 ID）
  content: string;               // 对话内容
  emotion: 'calm' | 'tense' | 'angry'; // 情绪状态
  stressLevel: number;           // 压力值（0-100）
  tensionLevel: 'low' | 'medium' | 'high'; // 火药味指数
  timestamp?: number;            // 时间戳（可选）
}
```

**设计亮点**：
- `emotion` 使用字面量类型，确保类型安全
- `stressLevel` 和 `tensionLevel` 双重情绪指标
- `timestamp` 可选，用于回顾功能

#### 3.1.4 Character（角色）

```typescript
interface Character {
  id: string;                    // 角色唯一标识
  name: string;                  // 角色名称
  age: number;                   // 年龄
  role: string;                  // 身份/职业
  avatar: string;                // 头像 URL
  background: string;            // 人物背景
  coreMotivation: string;        // 核心动机
  hiddenPressure: string;        // 隐秘压力
  powerLevel: string;            // 权力等级
  behaviorBoundary: string;      // 行为底线
  languageStyle: string;         // 语言风格
  voiceId?: string;              // 语音 ID（可选）
}
```

**设计亮点**：
- 6 个核心维度（背景、动机、压力、权力、边界、语言）
- 为 AI 对话生成提供丰富的角色设定
- `voiceId` 预留语音合成功能

#### 3.1.5 InterventionPoint（介入点）

```typescript
interface InterventionPoint {
  id: string;                    // 介入点唯一标识
  actId: string;                 // 所属幕次 ID
  dialogueId: string;            // 起始对话 ID
  title: string;                 // 介入点标题
  scene: string;                 // 场景描述
  conflict: string;              // 冲突描述
  challenge: string;             // 考验描述
  type: 'communication' | 'empathy' | 'boundary' | 'systemic'; // 类型
  position: number;              // 时间轴位置（0-100）
}
```

**设计亮点**：
- `type` 分类介入点类型，用于颜色编码和推荐
- `position` 用于时间轴可视化
- `dialogueId` 关联起始对话，支持从任意对话开始

### 3.2 对话相关类型 (`lib/types/dialogue.ts`)

#### 3.2.1 Message（消息）

```typescript
interface Message {
  id: string;                    // 消息唯一标识
  role: 'user' | 'ai' | 'system'; // 角色类型
  characterId?: string;          // 角色 ID（AI 消息）
  content: string;               // 消息内容
  timestamp: number;             // 时间戳
  emotion?: 'calm' | 'tense' | 'angry'; // 情绪（可选）
}
```

**设计亮点**：
- `role` 支持三种角色：用户、AI、系统
- `characterId` 可选，仅 AI 消息需要
- `emotion` 可选，用于 AI 消息的情绪显示

#### 3.2.2 AIDialogueRequest（AI 对话请求）

```typescript
interface AIDialogueRequest {
  scriptId: string;              // 剧本 ID
  characterId: string;           // 角色 ID
  interventionPointId: string;   // 介入点 ID
  dialogueHistory: Message[];    // 对话历史
  userInput: string;             // 用户输入
  context: {
    userThoughts: string[];      // 用户在小丑提问中的回答
  };
}
```

**设计亮点**：
- `context.userThoughts` 将用户思考注入 AI 上下文
- `dialogueHistory` 保持对话连贯性

#### 3.2.3 AIDialogueResponse（AI 对话响应）

```typescript
interface AIDialogueResponse {
  content: string;               // AI 回复内容
  emotion: 'calm' | 'tense' | 'angry'; // 情绪
  internalThought: string;       // 内心独白（用于报告）
}
```

#### 3.2.4 DialogueAnalysis（对话分析结果）

```typescript
interface DialogueAnalysis {
  sentiment: number;             // 情感得分（-100 到 100）
  strategy: number;              // 策略性得分（0-100）
  boundary: number;              // 边界感得分（0-100）
  empathy: number;               // 同理心得分（0-100）
  tensionLevel: 'low' | 'medium' | 'high'; // 火药味指数
}
```

**设计亮点**：
- 四维度分析：情感、策略、边界、同理心
- `sentiment` 使用 -100 到 100 范围，区分正负情绪
- `tensionLevel` 用于 UI 实时反馈

### 3.3 报告相关类型 (`lib/types/report.ts`)

#### 3.3.1 Report（报告）

```typescript
interface Report {
  scriptId: string;              // 剧本 ID
  interventionPointId: string;   // 介入点 ID
  heroType: HeroType;            // 英雄类型
  dimensions: {                  // 三维得分
    boundary: number;            // 边界感（0-100）
    strategy: number;            // 策略性（0-100）
    empathy: number;             // 同理心（0-100）
  };
  keyMoment: {                   // 关键时刻
    quote: string;               // 用户关键发言
    comment: string;             // 小丑点评
  };
  aiThoughts: {                  // AI 内心独白
    characterName: string;
    thought: string;
  }[];
  knowledge: {                   // 社会学知识
    title: string;
    content: string;
  };
  createdAt: number;             // 创建时间戳
}
```

#### 3.3.2 HeroType（英雄类型）

```typescript
interface HeroType {
  id: string;                    // 类型唯一标识
  name: string;                  // 类型名称
  description: string;           // 类型描述
  badge: string;                 // 徽章图标 URL
}
```

#### 3.3.3 HERO_TYPES（8 种英雄类型）

```typescript
const HERO_TYPES: Record<string, HeroType> = {
  PEACEFUL_DOVE: {
    id: 'peaceful-dove',
    name: '和平主义小白鸽',
    description: '你总是试图让所有人都满意，但有时候，过度的和平反而让矛盾更加复杂。',
    badge: '/images/badges/peaceful-dove.svg',
  },
  BOUNDARY_GUARDIAN: {
    id: 'boundary-guardian',
    name: '硬核边界守卫者',
    description: '你很清楚自己的底线，并且坚定地守护它。但有时候,过于强硬可能会伤害关系。',
    badge: '/images/badges/boundary-guardian.svg',
  },
  LOGIC_MASTER: {
    id: 'logic-master',
    name: '逻辑流吐槽怪',
    description: '你善于分析问题，找到解决方案。但有时候，过于理性可能会忽略情感的重要性。',
    badge: '/images/badges/logic-master.svg',
  },
  DIPLOMAT: {
    id: 'diplomat',
    name: '外交官',
    description: '你既能理解他人，又能坚持原则。你是天生的调解者。',
    badge: '/images/badges/diplomat.svg',
  },
  IDEALIST_WARRIOR: {
    id: 'idealist-warrior',
    name: '理想主义战士',
    description: '你既有同情心，又有原则，还有策略。你是最理想的沟通者。',
    badge: '/images/badges/idealist-warrior.svg',
  },
  ZEN_OBSERVER: {
    id: 'zen-observer',
    name: '佛系观察者',
    description: '你倾向于观察而非介入。有时候，适当的参与可能会带来更好的结果。',
    badge: '/images/badges/zen-observer.svg',
  },
  EMOTIONAL_FIGHTER: {
    id: 'emotional-fighter',
    name: '情绪化战士',
    description: '你有强烈的同情心和原则，但有时候情绪会影响你的判断。',
    badge: '/images/badges/emotional-fighter.svg',
  },
  CALM_ANALYST: {
    id: 'calm-analyst',
    name: '冷静分析师',
    description: '你善于分析问题，保持冷静。但有时候，适当的情感表达也很重要。',
    badge: '/images/badges/calm-analyst.svg',
  },
};
```

**设计亮点**：
- 8 种类型覆盖不同沟通风格
- 每种类型有独特的名称、描述和徽章
- 描述采用幽默、不评判的语气

---

## 4. 核心引擎实现

项目的业务逻辑封装在四个核心引擎中，各司其职，解耦清晰。

### 4.1 ScriptEngine（剧本引擎）

**职责**：管理剧本播放流程，计算进度和情绪指标。

**核心方法**：

```typescript
class ScriptEngine {
  private script: Script;
  private currentActIndex: number = 0;
  private currentDialogueIndex: number = 0;

  constructor(script: Script) {
    this.script = script;
  }

  // 获取当前幕
  getCurrentAct(): Act {
    return this.script.acts[this.currentActIndex];
  }

  // 获取当前对话
  getCurrentDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;
    return act.dialogues[this.currentDialogueIndex] || null;
  }

  // 推进到下一条对话
  nextDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;

    // 当前幕还有对话
    if (this.currentDialogueIndex < act.dialogues.length - 1) {
      this.currentDialogueIndex++;
      return this.getCurrentDialogue();
    }

    // 还有下一幕
    if (this.currentActIndex < this.script.acts.length - 1) {
      this.currentActIndex++;
      this.currentDialogueIndex = 0;
      return this.getCurrentDialogue();
    }

    // 剧本结束
    return null;
  }

  // 回退到上一条对话
  previousDialogue(): Dialogue | null {
    // 当前幕还有之前的对话
    if (this.currentDialogueIndex > 0) {
      this.currentDialogueIndex--;
      return this.getCurrentDialogue();
    }

    // 还有上一幕
    if (this.currentActIndex > 0) {
      this.currentActIndex--;
      const act = this.getCurrentAct();
      this.currentDialogueIndex = act.dialogues.length - 1;
      return this.getCurrentDialogue();
    }

    // 已经是第一条对话
    return null;
  }

  // 跳转到指定对话
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

  // 计算当前进度（0-100）
  getProgress(): number {
    const totalDialogues = this.getAllDialogues().length;
    const currentPosition =
      this.script.acts
        .slice(0, this.currentActIndex)
        .reduce((sum, act) => sum + act.dialogues.length, 0) +
      this.currentDialogueIndex;

    return Math.round((currentPosition / totalDialogues) * 100);
  }

  // 计算当前压力值
  getCurrentStressLevel(): number {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.stressLevel || 0;
  }

  // 计算当前火药味指数
  getCurrentTensionLevel(): 'low' | 'medium' | 'high' {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.tensionLevel || 'low';
  }

  // 根据介入点 ID 获取起始对话
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

**设计亮点**：
- 封装了剧本播放的所有逻辑
- 支持前进、后退、跳转
- 实时计算进度和情绪指标
- 与 UI 层完全解耦

### 4.2 AIDialogueEngine（AI 对话引擎）

**职责**：基于角色设定生成 AI 对话，检测情绪。

**核心实现**：

```typescript
class AIDialogueEngine {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async generateResponse(
    request: AIDialogueRequest,
    character: Character,
  ): Promise<AIDialogueResponse> {
    // 1. 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(character, request);

    // 2. 构建对话历史
    const messages = request.dialogueHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // 3. 调用 Kimi K2.5 API
    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '';

    // 4. 检测情绪
    const emotion = this.detectEmotion(content);

    // 5. 生成内心独白
    const internalThought = this.generateInternalThought(content, character);

    return {
      content,
      emotion,
      internalThought,
    };
  }

  private buildSystemPrompt(
    character: Character,
    request: AIDialogueRequest,
  ): string {
    const userThoughtsContext =
      request.context.userThoughts.length > 0
        ? `\n\n用户在反思环节的思考：\n${request.context.userThoughts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
        : '';

    return `你是 ${character.name}，一个 ${character.age} 岁的 ${character.role}。

角色背景：
${character.background}

核心动机：${character.coreMotivation}
隐藏压力：${character.hiddenPressure}
权力水平：${character.powerLevel}
行为边界：${character.behaviorBoundary}
语言风格：${character.languageStyle}
${userThoughtsContext}

请严格按照角色设定进行对话，保持角色的语言风格和情绪状态。回复应该简短自然，不超过 100 字。`;
  }

  private detectEmotion(content: string): 'calm' | 'tense' | 'angry' {
    const angryKeywords = ['生气', '愤怒', '讨厌', '受够了', '！！'];
    const tenseKeywords = ['担心', '紧张', '不安', '焦虑', '但是'];

    if (angryKeywords.some((keyword) => content.includes(keyword))) {
      return 'angry';
    }
    if (tenseKeywords.some((keyword) => content.includes(keyword))) {
      return 'tense';
    }
    return 'calm';
  }

  private generateInternalThought(
    content: string,
    character: Character,
  ): string {
    // 当前实现：使用角色的隐藏压力作为内心独白
    return `${character.name}内心想：${character.hiddenPressure}`;
  }
}
```

**设计亮点**：
- 使用 OpenAI SDK 兼容 Kimi API
- 系统提示词包含角色的 6 个维度
- 注入用户在小丑提问中的思考
- 基于关键词的简单情绪检测
- 内心独白当前为固定模板（可优化为 LLM 生成）

**API 配置**：
- Base URL: `https://api.moonshot.cn/v1`
- Model: `kimi-k2.5`
- Temperature: `0.8`（增加随机性，模拟即兴演出）
- Max Tokens: `200`（控制回复长度）

### 4.3 DialogueAnalyzer（对话分析引擎）

**职责**：分析用户对话的三维度得分，检测僵局。

**核心实现**：

```typescript
class DialogueAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async analyzeDialogue(messages: Message[]): Promise<DialogueAnalysis> {
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0];

    if (!lastUserMessage) {
      return {
        sentiment: 0,
        strategy: 0,
        boundary: 0,
        empathy: 0,
        tensionLevel: 'low',
      };
    }

    const prompt = `请分析以下对话中用户的表现，从以下四个维度打分（0-100）：

1. 边界感（boundary）：用户是否清晰表达了自己的底线和原则
2. 策略性（strategy）：用户是否采用了有效的沟通策略
3. 同理心（empathy）：用户是否理解对方的感受和处境

对话内容：
${messages.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n')}

请以 JSON 格式返回分析结果：
{
  "boundary": 数字,
  "strategy": 数字,
  "empathy": 数字,
  "tensionLevel": "low" | "medium" | "high"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    try {
      const result = JSON.parse(content);
      return {
        sentiment: 0,
        strategy: result.strategy || 0,
        boundary: result.boundary || 0,
        empathy: result.empathy || 0,
        tensionLevel: result.tensionLevel || 'low',
      };
    } catch {
      return {
        sentiment: 0,
        strategy: 0,
        boundary: 0,
        empathy: 0,
        tensionLevel: 'low',
      };
    }
  }

  // 检测僵局
  detectDeadlock(messages: Message[]): boolean {
    const recentMessages = messages.slice(-6);
    const userMessages = recentMessages.filter((m) => m.role === 'user');

    if (userMessages.length < 3) return false;

    const similarityThreshold = 0.7;
    let similarCount = 0;

    for (let i = 1; i < userMessages.length; i++) {
      const similarity = this.calculateSimilarity(
        userMessages[i - 1].content,
        userMessages[i].content,
      );
      if (similarity > similarityThreshold) {
        similarCount++;
      }
    }

    return similarCount >= 2;
  }

  // 计算相似度（基于字符级 Jaccard）
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(''));
    const words2 = new Set(text2.split(''));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}
```

**设计亮点**：
- 单次 LLM 调用，返回 JSON 格式结果
- 三维度分析：边界感、策略性、同理心
- 僵局检测：最近 6 条消息，相似度 > 0.7 且重复 ≥ 2 次
- 相似度计算：基于字符级 Jaccard 系数

**改进空间**：
- 当前 `sentiment` 字段未使用
- 相似度计算可优化为词级或语义级
- 可增加更多维度（如礼貌度、逻辑性等）

### 4.4 ReportGenerator（报告生成引擎）

**职责**：基于对话分析生成报告，确定英雄类型。

**核心实现**：

```typescript
class ReportGenerator {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async generateReport(
    scriptId: string,
    interventionPointId: string,
    messages: Message[],
    analysisResults: DialogueAnalysis[],
    characters: Character[],
  ): Promise<Report> {
    // 1. 计算三维平均得分
    const avgBoundary =
      analysisResults.reduce((sum, a) => sum + a.boundary, 0) /
        analysisResults.length || 0;
    const avgStrategy =
      analysisResults.reduce((sum, a) => sum + a.strategy, 0) /
        analysisResults.length || 0;
    const avgEmpathy =
      analysisResults.reduce((sum, a) => sum + a.empathy, 0) /
        analysisResults.length || 0;

    // 2. 确定英雄类型
    const heroType = this.determineHeroType(
      avgBoundary,
      avgStrategy,
      avgEmpathy,
    );

    // 3. 提取关键时刻
    const keyMoment = await this.extractKeyMoment(messages);

    // 4. 提取 AI 内心独白
    const aiThoughts = this.extractAIThoughts(messages, characters);

    // 5. 生成知识卡片
    const knowledge = await this.generateKnowledge(
      messages,
      avgBoundary,
      avgStrategy,
      avgEmpathy,
    );

    return {
      scriptId,
      interventionPointId,
      heroType,
      dimensions: {
        boundary: Math.round(avgBoundary),
        strategy: Math.round(avgStrategy),
        empathy: Math.round(avgEmpathy),
      },
      keyMoment,
      aiThoughts,
      knowledge,
      createdAt: Date.now(),
    };
  }

  // 确定英雄类型
  private determineHeroType(
    boundary: number,
    strategy: number,
    empathy: number,
  ) {
    if (boundary > 70 && strategy > 70 && empathy > 70) {
      return HERO_TYPES.IDEALIST_WARRIOR;
    }
    if (boundary > 60 && empathy > 60) {
      return HERO_TYPES.DIPLOMAT;
    }
    if (boundary > 70) {
      return HERO_TYPES.BOUNDARY_GUARDIAN;
    }
    if (strategy > 70) {
      return HERO_TYPES.LOGIC_MASTER;
    }
    if (empathy > 70) {
      return HERO_TYPES.EMOTIONAL_FIGHTER;
    }
    if (boundary < 40 && strategy < 40) {
      return HERO_TYPES.ZEN_OBSERVER;
    }
    if (empathy < 40) {
      return HERO_TYPES.CALM_ANALYST;
    }
    return HERO_TYPES.PEACEFUL_DOVE;
  }

  // 提取关键时刻
  private async extractKeyMoment(
    messages: Message[],
  ): Promise<{ quote: string; comment: string }> {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) {
      return {
        quote: '暂无对话',
        comment: '请先进行对话',
      };
    }

    const prompt = `从以下对话中找出最关键的一句用户发言，并给出简短评论：

${userMessages.map((m, i) => `${i + 1}. ${m.content}`).join('\n')}

请以 JSON 格式返回：
{
  "quote": "用户的原话",
  "comment": "简短评论（不超过50字）"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    try {
      const result = JSON.parse(content);
      return {
        quote: result.quote || userMessages[0].content,
        comment: result.comment || '这是一个关键时刻',
      };
    } catch {
      return {
        quote: userMessages[0].content,
        comment: '这是一个关键时刻',
      };
    }
  }

  // 提取 AI 内心独白
  private extractAIThoughts(
    messages: Message[],
    characters: Character[],
  ): { characterName: string; thought: string }[] {
    const aiMessages = messages.filter((m) => m.role === 'ai');
    const thoughts: { characterName: string; thought: string }[] = [];

    aiMessages.forEach((msg) => {
      const character = characters.find((c) => c.id === msg.characterId);
      if (character) {
        thoughts.push({
          characterName: character.name,
          thought: `${character.name}内心想：${character.hiddenPressure}`,
        });
      }
    });

    return thoughts.slice(0, 3);
  }

  // 生成知识卡片
  private async generateKnowledge(
    messages: Message[],
    boundary: number,
    strategy: number,
    empathy: number,
  ): Promise<{ title: string; content: string }> {
    // 找出最弱维度
    const weakestDimension =
      boundary < strategy && boundary < empathy
        ? 'boundary'
        : strategy < empathy
          ? 'strategy'
          : 'empathy';

    const knowledgeMap = {
      boundary: {
        title: '边界感的重要性',
        content:
          '在沟通中，清晰地表达自己的底线和原则是非常重要的。这不是自私，而是对自己和他人的尊重。',
      },
      strategy: {
        title: '有效的沟通策略',
        content:
          '好的沟通不仅需要真诚，还需要策略。尝试用"我"开头的句子表达感受，而不是指责对方。',
      },
      empathy: {
        title: '同理心的力量',
        content:
          '理解对方的感受和处境，不代表你要放弃自己的立场。同理心是建立连接的桥梁。',
      },
    };

    return knowledgeMap[weakestDimension];
  }
}
```

**设计亮点**：
- 英雄类型判定基于三维度得分，规则清晰
- 关键时刻提取使用 LLM，增加趣味性
- 内心独白当前为固定模板（可优化）
- 知识卡片根据最弱维度推荐

**改进空间**：
- 内心独白可使用 LLM 生成，更个性化
- 知识库可扩展为可配置的数据库
- 可增加更多英雄类型或动态生成类型

---

## 5. 状态管理

项目使用 Zustand 进行全局状态管理，分为两个主要 Store。

### 5.1 ScriptStore（剧本状态）

**职责**：管理剧本播放状态。

**状态字段**：

```typescript
interface ScriptState {
  // 状态
  script: Script | null;
  engine: ScriptEngine | null;
  currentAct: Act | null;
  currentDialogue: Dialogue | null;
  progress: number;
  stressLevel: number;
  tensionLevel: 'low' | 'medium' | 'high';
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
```

**核心实现**：

```typescript
export const useScriptStore = create<ScriptState>((set, get) => ({
  // 初始状态
  script: null,
  engine: null,
  currentAct: null,
  currentDialogue: null,
  progress: 0,
  stressLevel: 0,
  tensionLevel: 'low',
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

  // ... 其他操作
}));
```

**设计亮点**：
- 封装 ScriptEngine，UI 层无需直接操作引擎
- 实时同步进度和情绪指标
- 支持播放控制（play、pause、reset）

### 5.2 DialogueStore（对话状态）

**职责**：管理沙盒对话状态。

**状态字段**：

```typescript
interface DialogueState {
  // 状态
  messages: Message[];
  analysisResults: DialogueAnalysis[];
  currentRound: number;
  maxRounds: number;
  isAITyping: boolean;
  hasDeadlock: boolean;
  userThoughts: string[];

  // 操作
  addMessage: (message: Message) => void;
  addAnalysis: (analysis: DialogueAnalysis) => void;
  setAITyping: (isTyping: boolean) => void;
  setDeadlock: (hasDeadlock: boolean) => void;
  setUserThoughts: (thoughts: string[]) => void;
  reset: () => void;
}
```

**核心实现**：

```typescript
export const useDialogueStore = create<DialogueState>((set, get) => ({
  // 初始状态
  messages: [],
  analysisResults: [],
  currentRound: 0,
  maxRounds: 30,
  isAITyping: false,
  hasDeadlock: false,
  userThoughts: [],

  // 添加消息
  addMessage: (message) => {
    const { messages, currentRound } = get();
    set({
      messages: [...messages, message],
      currentRound: message.role === 'user' ? currentRound + 1 : currentRound,
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

  // 设置用户思考
  setUserThoughts: (thoughts) => set({ userThoughts: thoughts }),

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

**设计亮点**：
- `userThoughts` 存储小丑提问的答案，传递给 AI
- `maxRounds` 限制对话轮次为 30
- `hasDeadlock` 标记僵局状态
- `analysisResults` 累积每轮分析结果

---

## 6. 用户体验流程

### 6.1 完整用户路径

```
1. 首页（议题广场）
   ↓ 点击剧本卡片
2. 剧本介绍页
   ↓ 点击"开始观演"
3. 沉浸式观演（3-4 幕，自动播放）
   ↓ 观演结束，自动跳转
4. 角色解构（卡片轮播）
   ↓ 点击"继续"
5. 小丑提问（3 个问题）
   ↓ 完成提问
6. 选择介入点（时间轴 + 卡片）
   ↓ 选择介入点
7. 沙盒对话（与 AI 对话，最多 30 轮）
   ↓ 点击"结束对话"
8. 分析报告（英雄类型 + 三维分析 + 关键时刻）
   ↓ 点击"重新参演"或"返回首页"
```

### 6.2 首页（议题广场）

**文件**：`app/page.tsx`

**功能**：
- 展示所有剧本卡片
- 卡片包含：封面图、标题、简介、标签、时长
- 悬停动画：卡片放大、封面图视差效果

**实现要点**：
- 使用 CSS Grid 实现响应式布局
- 封面图使用 Unsplash 占位符
- 卡片点击跳转到剧本介绍页

### 6.3 剧本介绍页

**文件**：`app/script/[id]/page.tsx`

**功能**：
- 展示剧本标题、简介、标签、角色卡片
- 点击"开始体验"进入观演页

**实现要点**：
- 全屏沉浸式背景（剧本封面图 + 深色遮罩）
- 角色卡片展示角色头像、名称、年龄、身份
- 使用 `useScriptStore.loadScript()` 加载剧本

### 6.4 沉浸式观演

**文件**：`app/script/[id]/observation/page.tsx`

**功能**：
- 自动播放剧本对话（每 3 秒一条）
- 显示进度条、压力值、火药味指数
- 支持暂停、跳过

**实现要点**：
- 使用 `useScriptStore` 管理播放状态
- `useEffect` 实现自动播放：

```typescript
useEffect(() => {
  if (!isPlaying || isPaused) return;

  const timer = setTimeout(() => {
    nextDialogue();
  }, 3000);

  return () => clearTimeout(timer);
}, [isPlaying, isPaused, currentDialogue]);
```

- 剧本结束时自动跳转到角色解构页
- 情绪通过 `emotionColors` 映射到不同渐变背景

**情绪色彩映射**：

```typescript
const emotionColors = {
  calm: 'from-blue-900 via-purple-900 to-slate-900',
  tense: 'from-orange-900 via-red-900 to-slate-900',
  angry: 'from-red-900 via-pink-900 to-slate-900',
};
```

### 6.5 角色解构

**文件**：`app/script/[id]/deconstruction/page.tsx`

**功能**：
- 卡片轮播展示所有角色
- 每个角色显示 6 个维度：背景、动机、压力、权力、边界、语言

**实现要点**：
- 使用 `embla-carousel-react` 实现卡片轮播
- 支持左右箭头和触摸滑动
- 点击"继续"进入小丑提问页

### 6.6 小丑提问

**文件**：`app/script/[id]/joker-questioning/page.tsx`

**功能**：
- 小丑角色登场（动画）
- 3 个思辨问题，逐个回答
- 答案存储到 `dialogueStore.userThoughts`

**实现要点**：
- 问题数据硬编码在组件中（可优化为配置）
- 使用 `useState` 管理当前问题索引
- 答案验证：至少 10 字，最多 500 字
- 支持跳过，但至少回答 1 个问题

**问题示例**：

```typescript
const questions = [
  {
    id: 'q1',
    question: '你觉得邱华在哪一刻彻底失去了抵抗力？',
    placeholder: '请输入你的想法...',
  },
  {
    id: 'q2',
    question: '你认为小雅真的是"恶婆婆"吗？',
    placeholder: '请输入你的想法...',
  },
  {
    id: 'q3',
    question: '如果是你，你会怎么做？',
    placeholder: '请输入你的想法...',
  },
];
```

### 6.7 选择介入点

**文件**：`app/script/[id]/intervention/page.tsx`

**功能**：
- 时间轴展示所有介入点
- 点击介入点显示详情卡片
- 选择介入点进入沙盒对话

**实现要点**：
- 介入点按 `type` 着色：
  - `communication`：绿色
  - `empathy`：蓝色
  - `boundary`：橙色
  - `systemic`：红色
- 卡片包含：场景、冲突、考验
- 点击"选择这个时刻"跳转到对话页，传递 `point` 参数

### 6.8 沙盒对话

**文件**：`app/script/[id]/dialogue/page.tsx`

**功能**：
- 与 AI 角色对话，最多 30 轮
- 实时显示对话额度、火药味指数
- 检测僵局并提示
- 点击"结束对话"生成报告

**实现要点**：

1. **角色选择**：
   - 用户可选择对哪个角色说话
   - 当前实现：默认选择第一个角色

2. **发送消息**：

```typescript
const handleSend = async () => {
  if (!input.trim() || isAITyping) return;

  // 1. 添加用户消息
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
    // 2. 调用 API
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

    // 3. 添加 AI 消息
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
```

3. **自动滚动**：

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

4. **对话限制**：
   - `currentRound >= maxRounds` 时禁用输入
   - 显示进度条和轮次计数

5. **僵局提示**：
   - `hasDeadlock` 为 `true` 时显示 "⚠️ 检测到对话僵局"

### 6.9 分析报告

**文件**：`app/script/[id]/report/page.tsx`

**功能**：
- 展示英雄类型、三维分析、关键时刻、AI 内心独白、知识卡片
- 支持分享、重新参演、返回首页

**实现要点**：

1. **生成报告**：

```typescript
useEffect(() => {
  const generateReport = async () => {
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: script.id,
          interventionPointId: pointId,
          messages,
          analysisResults,
        }),
      });

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  generateReport();
}, []);
```

2. **报告卡片**：
   - 英雄类型：徽章图标 + 名称 + 描述
   - 三维分析：进度条 + 分数
   - 关键时刻：引用 + 点评
   - AI 内心独白：角色名 + 内心想法
   - 知识卡片：标题 + 内容

3. **分享功能**（待实现）：
   - 生成精美的报告图片
   - 支持分享到微信、微博、朋友圈

---

## 7. API 路由设计

### 7.1 POST `/api/dialogue`

**文件**：`app/api/dialogue/route.ts`

**功能**：生成 AI 对话响应，分析对话质量。

**请求体**：

```typescript
{
  scriptId: string;
  interventionPointId: string;
  messages: Message[];
  userThoughts: string[];
}
```

**响应体**：

```typescript
{
  response: AIDialogueResponse;
  analysis: DialogueAnalysis;
  hasDeadlock: boolean;
  character: Character;
}
```

**实现逻辑**：

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, userThoughts } = body;

    // 1. 校验 API Key
    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 2. 获取剧本
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // 3. 校验介入点
    const point = script.interventionPoints.find(
      (p) => p.id === interventionPointId
    );
    if (!point) {
      return NextResponse.json(
        { error: 'Intervention point not found' },
        { status: 404 }
      );
    }

    // 4. 确定对话角色
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const character = script.characters.find(
      (c) => c.id !== lastUserMessage?.characterId
    );

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // 5. 生成 AI 响应
    const aiEngine = new AIDialogueEngine(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1'
    );

    const response = await aiEngine.generateResponse(
      {
        scriptId,
        characterId: character.id,
        interventionPointId,
        dialogueHistory: messages,
        userInput: lastUserMessage?.content || '',
        context: { userThoughts },
      },
      character
    );

    // 6. 分析对话
    const analyzer = new DialogueAnalyzer(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1'
    );

    const analysis = await analyzer.analyzeDialogue([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        role: 'ai',
        characterId: character.id,
        content: response.content,
        timestamp: Date.now(),
      },
    ]);

    // 7. 检测僵局
    const hasDeadlock = analyzer.detectDeadlock([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        role: 'ai',
        characterId: character.id,
        content: response.content,
        timestamp: Date.now(),
      },
    ]);

    return NextResponse.json({
      response,
      analysis,
      hasDeadlock,
      character,
    });
  } catch (error) {
    console.error('Dialogue API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**问题**：
- 角色选择逻辑：`character.id !== lastUserMessage?.characterId` 会选到「非用户扮演角色」，但用户实际是「取代主角」与对方对话，当前逻辑可能选错角色

**改进建议**：
- 在介入点中明确定义「用户扮演角色」和「对话对象」
- 或在前端传递明确的 `targetCharacterId`

### 7.2 POST `/api/report`

**文件**：`app/api/report/route.ts`

**功能**：生成分析报告。

**请求体**：

```typescript
{
  scriptId: string;
  interventionPointId: string;
  messages: Message[];
  analysisResults: DialogueAnalysis[];
}
```

**响应体**：

```typescript
Report
```

**实现逻辑**：

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, analysisResults } = body;

    // 1. 校验 API Key
    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 2. 获取剧本
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // 3. 生成报告
    const generator = new ReportGenerator(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1'
    );

    const report = await generator.generateReport(
      scriptId,
      interventionPointId,
      messages,
      analysisResults,
      script.characters
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 8. 数据结构与内容

### 8.1 剧本数据（《城里的月光》）

**文件**：`data/scripts/city-moonlight.json`

**结构**：

```json
{
  "id": "city-moonlight",
  "title": "城里的月光",
  "description": "当农村老人走进城市，家庭的裂痕开始显现",
  "tags": ["家庭关系", "代际冲突", "城市化"],
  "duration": "20-30 分钟",
  "coverImage": "https://source.unsplash.com/1920x1080/?city,night",
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
      "sceneBackground": "https://picsum.photos/1920/1080",
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
        // ... 更多对话
      ]
    },
    // ... 更多幕次
  ],
  "characters": [
    {
      "id": "qiu-hua",
      "name": "邱华",
      "age": 60,
      "role": "农村妇女",
      "avatar": "https://ui-avatars.com/api/?name=邱华&size=128&background=random",
      "background": "农村妇女，朴实、勤快，有些固执，不善言辞，内心敏感。为了儿子，强忍着对老伴和故土的思念来城里。",
      "coreMotivation": "为了儿子，想要帮忙带孙子",
      "hiddenPressure": "对老伴和故土的思念，在城市的格格不入",
      "powerLevel": "家庭中的低位，话语权被剥夺",
      "behaviorBoundary": "强忍委屈，但当老伴出事时可能选择离开",
      "languageStyle": "朴实、直接，带有方言特色，有时会用"土话"表达"
    },
    // ... 更多角色
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
    },
    // ... 更多介入点
  ]
}
```

**内容亮点**：
- 4 幕完整剧情，共约 50 条对话
- 3 个角色：邱华（婆婆）、小雅（儿媳）、阿强（儿子）
- 4 个介入点，覆盖不同类型的冲突
- 每个角色有详细的 6 维度设定

### 8.2 图片资源

**封面图**：
- 使用 Unsplash：`https://source.unsplash.com/1920x1080/?city,night`

**场景背景**：
- 使用 Picsum：`https://picsum.photos/1920/1080`

**角色头像**：
- 使用 ui-avatars.com：`https://ui-avatars.com/api/?name={角色名}&size=128&background=random`

**英雄徽章**：
- 路径：`/images/badges/*.svg`
- 当前为占位符，需设计实际图标

---

## 9. UI 组件体系

### 9.1 基础 UI 组件（shadcn/ui）

项目使用 shadcn/ui（基于 Radix UI），共 50+ 个组件：

**常用组件**：
- `Button`：按钮
- `Card`：卡片容器
- `Progress`：进度条
- `Input`：输入框
- `Textarea`：多行文本框
- `Dialog`：对话框
- `Popover`：弹出层
- `Tooltip`：提示框
- `Badge`：徽章
- `Avatar`：头像
- `Carousel`：轮播图
- `Tabs`：标签页
- `Accordion`：折叠面板
- `Alert`：警告提示
- `Toast`：通知提示

**优势**：
- 完全可定制，代码在项目中
- 基于 Radix UI，无障碍性好
- 与 Tailwind CSS 深度集成

### 9.2 业务组件

#### 9.2.1 ObservationView（观演视图）

**文件**：`components/observation-view.tsx`

**功能**：
- 显示当前对话
- 显示角色头像和名称
- 根据情绪切换背景色
- 显示进度条、压力值、火药味指数

**实现要点**：

```typescript
export function ObservationView() {
  const {
    currentAct,
    currentDialogue,
    progress,
    stressLevel,
    tensionLevel,
    isPlaying,
    nextDialogue,
  } = useScriptStore();

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      nextDialogue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentDialogue]);

  if (!currentDialogue) {
    return <div>剧本结束</div>;
  }

  const emotionColors = {
    calm: 'from-blue-900 via-purple-900 to-slate-900',
    tense: 'from-orange-900 via-red-900 to-slate-900',
    angry: 'from-red-900 via-pink-900 to-slate-900',
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${emotionColors[currentDialogue.emotion]}`}
    >
      {/* 进度条 */}
      <Progress value={progress} />

      {/* 对话气泡 */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl p-8 bg-white/10 backdrop-blur-sm rounded-lg">
          <p className="text-white text-xl">{currentDialogue.content}</p>
        </div>
      </div>

      {/* 情绪指标 */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2">
        <div className="text-white">
          <div>压力值：{stressLevel}%</div>
          <div>火药味：{tensionLevel}</div>
        </div>
      </div>
    </div>
  );
}
```

#### 9.2.2 JokerAvatar（小丑头像）

**文件**：`components/joker/joker-avatar.tsx`

**功能**：
- 显示小丑角色头像
- 登场动画（淡入 + 缩放）

**实现要点**：

```typescript
export function JokerAvatar() {
  return (
    <div className="flex justify-center mb-8 animate-fade-in">
      <div className="w-32 h-32 rounded-full bg-purple-600/20 flex items-center justify-center">
        <span className="text-6xl">🎭</span>
      </div>
    </div>
  );
}
```

#### 9.2.3 QuestionInput（问题输入）

**文件**：`components/joker/question-input.tsx`

**功能**：
- 多行文本输入
- 字数统计（10-500 字）
- 字数验证

**实现要点**：

```typescript
export function QuestionInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const charCount = value.length;
  const isValid = charCount >= 10 && charCount <= 500;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-32 p-4 bg-white/5 border border-purple-300/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
      />
      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm ${isValid ? 'text-green-400' : 'text-red-400'}`}>
          {charCount} / 500 字
        </span>
        {charCount < 10 && (
          <span className="text-sm text-red-400">至少 10 字</span>
        )}
      </div>
    </div>
  );
}
```

### 9.3 共享组件

#### 9.3.1 Header（顶部导航）

**文件**：`components/shared/header.tsx`

**功能**：
- 显示 Logo 和导航链接
- 响应式设计（移动端折叠）

#### 9.3.2 Footer（底部信息）

**文件**：`components/shared/footer.tsx`

**功能**：
- 显示版权信息、链接
- 社交媒体图标

---

## 10. 关键实现细节

### 10.1 自动播放观演

**实现方式**：使用 `useEffect` + `setTimeout`

```typescript
useEffect(() => {
  if (!isPlaying || isPaused) return;

  const timer = setTimeout(() => {
    nextDialogue();
  }, 3000);

  return () => clearTimeout(timer);
}, [isPlaying, isPaused, currentDialogue]);
```

**关键点**：
- 依赖 `currentDialogue`，每次对话变化后重新设置定时器
- 清理函数 `clearTimeout` 避免内存泄漏

### 10.2 情绪色彩映射

**实现方式**：根据 `emotion` 字段切换背景渐变

```typescript
const emotionColors = {
  calm: 'from-blue-900 via-purple-900 to-slate-900',
  tense: 'from-orange-900 via-red-900 to-slate-900',
  angry: 'from-red-900 via-pink-900 to-slate-900',
};

<div className={`bg-gradient-to-br ${emotionColors[currentDialogue.emotion]}`}>
```

### 10.3 对话自动滚动

**实现方式**：使用 `useRef` + `scrollIntoView`

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

return (
  <div>
    {messages.map((msg) => (
      <div key={msg.id}>{msg.content}</div>
    ))}
    <div ref={messagesEndRef} />
  </div>
);
```

### 10.4 僵局检测

**实现方式**：基于字符级 Jaccard 相似度

```typescript
detectDeadlock(messages: Message[]): boolean {
  const recentMessages = messages.slice(-6);
  const userMessages = recentMessages.filter((m) => m.role === 'user');

  if (userMessages.length < 3) return false;

  const similarityThreshold = 0.7;
  let similarCount = 0;

  for (let i = 1; i < userMessages.length; i++) {
    const similarity = this.calculateSimilarity(
      userMessages[i - 1].content,
      userMessages[i].content,
    );
    if (similarity > similarityThreshold) {
      similarCount++;
    }
  }

  return similarCount >= 2;
}

private calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(''));
  const words2 = new Set(text2.split(''));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
```

**改进空间**：
- 当前为字符级，可优化为词级或语义级
- 可使用 embedding 计算语义相似度

### 10.5 英雄类型判定

**实现方式**：基于三维度得分的规则判定

```typescript
private determineHeroType(
  boundary: number,
  strategy: number,
  empathy: number,
) {
  if (boundary > 70 && strategy > 70 && empathy > 70) {
    return HERO_TYPES.IDEALIST_WARRIOR; // 理想主义战士
  }
  if (boundary > 60 && empathy > 60) {
    return HERO_TYPES.DIPLOMAT; // 外交官
  }
  if (boundary > 70) {
    return HERO_TYPES.BOUNDARY_GUARDIAN; // 硬核边界守卫者
  }
  if (strategy > 70) {
    return HERO_TYPES.LOGIC_MASTER; // 逻辑流吐槽怪
  }
  if (empathy > 70) {
    return HERO_TYPES.EMOTIONAL_FIGHTER; // 情绪化战士
  }
  if (boundary < 40 && strategy < 40) {
    return HERO_TYPES.ZEN_OBSERVER; // 佛系观察者
  }
  if (empathy < 40) {
    return HERO_TYPES.CALM_ANALYST; // 冷静分析师
  }
  return HERO_TYPES.PEACEFUL_DOVE; // 和平主义小白鸽（默认）
}
```

**设计亮点**：
- 规则清晰，易于理解和调整
- 覆盖所有可能的得分组合

---

## 11. 问题与改进建议

### 11.1 逻辑问题

#### 问题 1：对话 API 角色选择逻辑错误

**当前实现**：

```typescript
const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
const character = script.characters.find(
  (c) => c.id !== lastUserMessage?.characterId
);
```

**问题**：
- 用户实际是「取代主角」与对方对话
- 当前逻辑选择「非用户扮演角色」，可能选错

**改进建议**：
- 在介入点中明确定义「用户扮演角色」和「对话对象」
- 或在前端传递明确的 `targetCharacterId`

#### 问题 2：观演结束判断竞态

**当前实现**：

```typescript
useEffect(() => {
  if (!isPlaying) return;

  const timer = setTimeout(() => {
    nextDialogue();
  }, 3000);

  return () => clearTimeout(timer);
}, [isPlaying, currentDialogue]);

// 在 nextDialogue() 之后判断
if (!currentDialogue) {
  // 跳转到角色解构页
}
```

**问题**：
- `nextDialogue()` 异步更新状态
- `if (!currentDialogue)` 判断可能在状态更新前执行

**改进建议**：
- 在 `nextDialogue` 返回 `null` 时，直接在 Store 中处理跳转
- 或使用 `useEffect` 监听 `currentDialogue` 变化

### 11.2 功能缺失

#### 缺失 1：僵局时小丑介入

**当前实现**：
- `hasDeadlock` 仅做 UI 提示

**改进建议**：
- 僵局时弹出小丑对话框
- 提供两个选项：「继续尝试」或「结束对话」
- 小丑给出幽默的建议

#### 缺失 2：流式输出

**当前实现**：
- AI 回复为一次性返回

**改进建议**：
- 使用 SSE（Server-Sent Events）实现流式传输
- 前端逐字显示，增强打字机效果

#### 缺失 3：分享报告

**当前实现**：
- 报告页面有「分享报告」按钮，但未实现

**改进建议**：
- 使用 `html2canvas` 生成报告图片
- 支持分享到微信、微博、朋友圈
- 图片包含：英雄类型、三维分析、关键时刻、产品 Logo

#### 缺失 4：内心独白生成

**当前实现**：
- 内心独白为固定模板：`${character.name}内心想：${character.hiddenPressure}`

**改进建议**：
- 使用 LLM 生成个性化内心独白
- 基于对话内容和角色设定
- 风格幽默、犀利，但不伤人

### 11.3 性能与体验

#### 问题 1：对话 API 延迟

**当前实现**：
- 每次对话调用 2 次 LLM（对话生成 + 对话分析）

**改进建议**：
- 使用流式响应（SSE）
- 对话生成和分析并行执行
- 增加加载动画和进度提示

#### 问题 2：图片优化

**当前实现**：
- 使用 Unsplash、Picsum 占位符
- 未优化图片格式和尺寸

**改进建议**：
- 使用 WebP 格式
- 使用 Next.js Image 组件自动优化
- 实现图片懒加载

#### 问题 3：错误处理

**当前实现**：
- API 失败时仅 `console.error`

**改进建议**：
- 统一错误提示（Toast）
- 实现重试机制
- 显示友好的错误信息

### 11.4 数据与扩展

#### 问题 1：剧本数量

**当前实现**：
- 仅《城里的月光》一个剧本

**改进建议**：
- 新增 2-3 个剧本
- 覆盖不同议题（职场、社区、社会）

#### 问题 2：用户数据持久化

**当前实现**：
- 用户数据未持久化，刷新即丢失

**改进建议**：
- 实现用户账号系统
- 保存对话历史和报告
- 支持查看历史记录

#### 问题 3：知识库可配置

**当前实现**：
- 知识库为硬编码

**改进建议**：
- 知识库改为可配置的数据库
- 根据用户得分动态推荐
- 支持多种知识类型（心理学、社会学、沟通技巧）

---

## 12. 技术债务与优化方向

### 12.1 短期优化（1-3 个月）

1. **修复逻辑问题**：
   - 对话 API 角色选择逻辑
   - 观演结束判断竞态

2. **完善功能**：
   - 僵局时小丑介入
   - 流式输出
   - 分享报告
   - 内心独白生成

3. **性能优化**：
   - 图片优化（WebP、懒加载）
   - API 并行执行
   - 错误处理和重试

4. **新增剧本**：
   - 至少 2-3 个新剧本

### 12.2 中期优化（3-6 个月）

1. **用户系统**：
   - 账号注册/登录
   - 对话历史保存
   - 报告查看

2. **个性化推荐**：
   - 基于英雄类型推荐剧本
   - 基于用户得分推荐知识

3. **成就系统**：
   - 设置成就徽章
   - 鼓励用户体验更多剧本

4. **社区功能**：
   - 用户可以分享体验和思考
   - 评论和点赞

5. **数据分析**：
   - 建立完整的数据分析系统
   - 追踪用户行为和对话质量

### 12.3 长期优化（6-12 个月）

1. **平台化**：
   - 开放剧本创作工具
   - 用户可以创建和分享剧本

2. **多语言支持**：
   - 翻译成多种语言
   - 支持国际化

3. **线下活动**：
   - 举办线下论坛剧场活动
   - 与学校、NGO 合作

4. **企业服务**：
   - 提供定制化剧本和团队版
   - 用于团队培训和企业文化建设

5. **AI 优化**：
   - 训练专门的对话模型
   - 提升角色一致性和对话质量

---

## 13. 总结与展望

### 13.1 项目优势

1. **完整的产品体验**：
   - 从观演到报告的完整链路
   - 每个环节都有清晰的目标和价值

2. **严格的类型系统**：
   - 全 TypeScript，无 `any` 类型
   - 类型定义清晰，易于维护

3. **清晰的架构设计**：
   - 四大核心引擎，职责明确
   - UI 层与业务逻辑解耦
   - 状态管理集中化

4. **AI 驱动的对话**：
   - 集成 Kimi K2.5，角色一致性好
   - 多维度对话分析，提供有价值的反馈

5. **趣味化的报告**：
   - 8 种英雄类型，幽默不评判
   - 关键时刻、内心独白、知识卡片

### 13.2 改进空间

1. **逻辑问题**：
   - 对话 API 角色选择逻辑
   - 观演结束判断竞态

2. **功能缺失**：
   - 僵局时小丑介入
   - 流式输出
   - 分享报告
   - 内心独白生成

3. **性能优化**：
   - 图片优化
   - API 并行执行
   - 错误处理

4. **数据扩展**：
   - 新增剧本
   - 用户数据持久化
   - 知识库可配置

### 13.3 技术亮点

1. **Next.js 16 + React 19**：
   - 使用最新的 App Router
   - 服务端组件和客户端组件分离

2. **Zustand 状态管理**：
   - 轻量级、易用
   - 与 React Hooks 深度集成

3. **Kimi K2.5 API**：
   - 中文能力强
   - 成本低（比 GPT-4 便宜 90%）

4. **shadcn/ui 组件库**：
   - 完全可定制
   - 基于 Radix UI，无障碍性好

5. **Tailwind CSS 4**：
   - 原子化 CSS
   - 响应式设计简单

### 13.4 社会价值

1. **推动公民教育**：
   - 培养对话能力和民主素养
   - 探索社会结构性困境

2. **促进社会对话**：
   - 减少社会撕裂
   - 增进相互理解

3. **启发政策思考**：
   - 为政策制定者提供参考
   - 推动社会进步

### 13.5 商业前景

1. **订阅制**：
   - 月度会员：¥19.9/月
   - 年度会员：¥199/年

2. **企业服务**：
   - 定制化剧本
   - 团队培训
   - 教育授权

3. **平台化**：
   - 开放剧本创作工具
   - 用户可以创建和分享剧本
   - 平台抽成

### 13.6 下一步行动

1. **修复逻辑问题**（1 周）
2. **完善核心功能**（2-3 周）
3. **性能优化**（1 周）
4. **新增剧本**（2-3 周）
5. **用户测试**（1 周）
6. **正式上线**

---

## 附录

### A. 依赖列表

```json
{
  "dependencies": {
    "@base-ui/react": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "openai": "^6.27.0",
    "radix-ui": "^1.4.3",
    "react": "19.2.3",
    "react-day-picker": "^9.14.0",
    "react-dom": "19.2.3",
    "react-resizable-panels": "^4.7.1",
    "recharts": "2.15.4",
    "shadcn": "^4.0.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### B. 环境变量

```bash
# .env.local

# Kimi API
MOONSHOT_API_KEY=your-kimi-api-key
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
```

### C. 参考资料

- 奥古斯托·波瓦《被压迫者剧场》
- 论坛剧场实践案例
- AI 对话系统设计最佳实践
- Next.js 16 文档
- Kimi API 文档
- Zustand 文档
- shadcn/ui 文档

---

**报告结束**

本报告详细分析了 Forum Theatre 项目的技术架构、实现细节、核心引擎、状态管理、用户体验流程、API 设计、数据结构、UI 组件体系、关键实现细节、问题与改进建议、技术债务与优化方向。

项目整体设计清晰，实现完整，具有良好的扩展性和可维护性。主要改进空间在于逻辑问题修复、功能完善、性能优化和数据扩展。

通过持续迭代和优化，Forum Theatre 有潜力成为一个有影响力的社会议题探索平台，推动公民教育和社会对话。
