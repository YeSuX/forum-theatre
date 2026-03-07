# 论坛剧场 Forum Theatre

一个数字化的论坛剧场体验平台，通过 AI 驱动的角色对话，让用户在虚拟舞台上探索真实的人性与沟通。

## 技术栈

- **前端框架**: Next.js 16 (App Router) + React 19
- **类型安全**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand
- **AI 引擎**: Kimi API (moonshot-v1-8k / kimi-k2.5)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 Kimi API Key：

```env
MOONSHOT_API_KEY=your_moonshot_api_key_here
```

### 3. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
forum-theatre/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页（议题广场）
│   ├── script/[id]/              # 剧本相关页面
│   │   ├── page.tsx              # 剧本介绍
│   │   ├── observation/          # 沉浸式观演
│   │   ├── deconstruction/       # 角色解构
│   │   ├── joker-questioning/    # 小丑提问
│   │   ├── intervention/         # 选择介入点
│   │   ├── dialogue/             # 沙盒对话
│   │   └── report/               # 分析报告
│   └── api/                      # API 路由
│       ├── dialogue/             # AI 对话 API
│       └── report/               # 报告生成 API
├── components/                   # React 组件
│   ├── ui/                       # 基础 UI 组件
│   └── observation-view.tsx      # 观演视图组件
├── lib/                          # 工具库
│   ├── engines/                  # 核心引擎
│   │   ├── script-engine.ts      # 剧本引擎
│   │   ├── ai-dialogue-engine.ts # AI 对话引擎
│   │   ├── dialogue-analyzer.ts  # 对话分析引擎
│   │   └── report-generator.ts   # 报告生成引擎
│   ├── stores/                   # Zustand 状态管理
│   │   ├── script-store.ts       # 剧本状态
│   │   └── dialogue-store.ts     # 对话状态
│   └── types/                    # TypeScript 类型定义
│       ├── script.ts
│       ├── dialogue.ts
│       └── report.ts
└── data/                         # 数据文件
    └── scripts/                  # 剧本数据
        ├── city-moonlight.json   # 《城里的月光》
        └── index.ts
```

## 核心功能

1. **沉浸式观演**: 自动播放剧本对话，展示角色情绪和压力值
2. **角色解构**: 深入了解每个角色的背景、动机和压力
3. **小丑提问**: 引导用户思考冲突的本质
4. **选择介入点**: 在关键时刻介入，改变故事走向
5. **AI 对话**: 与 AI 驱动的角色进行真实对话
6. **对话分析**: 实时分析用户的沟通能力（边界感、策略性、同理心）
7. **分析报告**: 生成个性化的沟通报告和英雄类型

## 开发指南

### 类型检查

```bash
npm run build
```

### 代码规范

- 不使用 `any` 或 `unknown` 类型
- 不添加不必要的注释或 JSDoc
- 保持代码简洁和类型安全

## 部署

推荐部署到 Cloudflare Workers。详细步骤请参考 `docs/plan.md` 中的部署章节。

## 许可证

MIT
