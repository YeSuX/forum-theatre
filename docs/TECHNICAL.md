# 论坛剧场（forum-theatre）技术文档

本文描述仓库的架构、数据模型、API、状态与扩展方式，供开发与维护参考。面向已熟悉 React / Next.js 的读者。

---

## 1. 项目定位

数字化**论坛剧场**体验：用户按幕观看剧本对白、解构角色、经「小丑」反思提问后，在**介入点**代入角色与 AI 对话，并生成结构化报告。核心能力依赖 **Moonshot（Kimi）OpenAI 兼容 API**。

---

## 2. 技术栈

| 层级       | 选型                                                       |
| ---------- | ---------------------------------------------------------- |
| 框架       | Next.js 16（App Router）、React 19                         |
| 语言       | TypeScript                                                 |
| 样式       | Tailwind CSS 4                                             |
| UI         | shadcn/ui、Radix UI、Lucide                                |
| 客户端状态 | Zustand                                                    |
| 动效       | Framer Motion（部分页面）                                  |
| AI SDK     | `openai` 官方包，baseURL 指向 `https://api.moonshot.cn/v1` |

---

## 3. 目录结构（摘要）

```
app/
  page.tsx                    # 首页：剧本列表
  layout.tsx                  # 根布局、错误边界、Moonshot 配置入口
  api/
    dialogue/route.ts         # 介入对话 + 僵局分析
    report/route.ts           # 报告生成
    joker-analysis/route.ts   # 小丑提问后的 AI 分析
  script/[id]/
    page.tsx                  # 剧本详情（封面、角色、体验说明、可选宣传视频）
    observation/              # 观演
    deconstruction/           # 角色解构
    joker-questioning/        # 小丑提问
    intervention/             # 选择介入点
    dialogue/                 # 沙盒对话（AI 扮演角色）
    report/                   # 报告展示

components/
  ui/                         # 通用 UI（shadcn）
  observation-view.tsx        # 观演主界面（幕、背景、对白流）
  observation/                # 对白气泡、打字机等
  moonshot/                   # Moonshot API Key 配置 Dialog + 悬浮按钮
  joker/、report/、deconstruction/、script/ 等

data/scripts/
  index.ts                    # 导出 scripts 列表、getScriptById
  *.json                      # 剧本数据（当前含 city-moonlight）

lib/
  constants/moonshot.ts       # x-moonshot-api-key、localStorage 键名
  moonshot-resolve-api-key.ts # 服务端：请求头优先，其次 MOONSHOT_API_KEY
  moonshot-auth-headers.ts    # 浏览器：读 localStorage，拼请求头
  engines/                    # 剧本推进、AI 对话、分析、报告、小丑分析
  stores/                     # script-store、dialogue-store
  types/                      # Script、Report、Message 等
  utils/preload.ts            # 按剧本预加载图片 URL
```

---

## 4. 核心数据模型（剧本）

类型定义见 `lib/types/script.ts`。

- **Script**：`id`、`title`、`description`、`tags`、`duration`、`coverImage`、可选 `promoVideo` / `promoVideoWeb`（详情页 `<video>` 多 `source`）、`theme`、`acts[]`、`characters[]`、`interventionPoints[]`。
- **Act**：`sceneBackground`（幕布背景 URL）、`dialogues[]`（`speaker` 为角色 `id`）。
- **Character**：人设字段 + `avatar`（URL）。
- **InterventionPoint**：绑定 `actId` + `dialogueId`，描述介入场景、冲突类型、`userPlaysAs` / `dialogueWith`。

剧本以 JSON 静态导入（`data/scripts/index.ts`），新增剧本需：新建 JSON → 加入 `scripts` 数组 → 保证 `id` 与路由一致。

---

## 5. 用户体验主路径

1. **首页** `/` → 选择剧本 → `/script/[id]`
2. **观演** `/script/[id]/observation`：`ScriptEngine` 按幕推进；`ObservationView` 展示背景与对白（`useScriptStore`）
3. 结束后 → **解构** `/script/[id]/deconstruction`
4. **小丑提问** `/script/[id]/joker-questioning` → 调用 `/api/joker-analysis`
5. **介入** `/script/[id]/intervention` → 选点 → **对话** `/script/[id]/dialogue?point=...`
6. **报告** `/script/[id]/report?point=...` → 调用 `/api/report`

`script-store` 在观演页 `loadScript`；对话与报告页依赖已加载的 `script` 与 `dialogue-store` 中的消息与分析结果。

---

## 6. 核心引擎（`lib/engines`）

| 模块                       | 职责                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| `script-engine.ts`         | 维护当前幕/对白索引，`nextDialogue` / `previousDialogue` / 进度与压力等级 |
| `ai-dialogue-engine.ts`    | 根据介入点与用户消息生成 AI 角色回复（Moonshot Chat Completions）         |
| `dialogue-analyzer.ts`     | 分析对话轮次、检测僵局（deadlock）                                        |
| `joker-analysis-engine.ts` | 对用户在小丑环节的作答做结构化点评                                        |
| `report-generator.ts`      | 汇总对话与思考，生成报告对象（英雄类型、维度等）                          |

以上引擎在 **Route Handler** 内实例化，传入解析得到的 API Key，不暴露密钥给浏览器（除用户自行通过请求头传入的 BYOK 场景）。

---

## 7. API 路由

### 7.1 共同约定

- **认证**：`resolveMoonshotApiKey(request)`（`lib/moonshot-resolve-api-key.ts`）
  - 若请求头带 `x-moonshot-api-key`，优先使用（与前端「API 配置」弹窗 + `localStorage` 配合）。
  - 否则使用环境变量 `MOONSHOT_API_KEY`。
  - 二者皆无则返回 500 及明确错误文案。
- **内容类型**：`POST` + `application/json`。

### 7.2 `POST /api/dialogue`

- 输入：`scriptId`、`interventionPointId`、`messages`、`userThoughts`、`userCharacterId`、`aiCharacterId` 等。
- 输出：AI 回复、`analysis`、`hasDeadlock`、对方角色展示信息。
- 内部：`AIDialogueEngine` + `DialogueAnalyzer`。

### 7.3 `POST /api/report`

- 输入：`scriptId`、`interventionPointId`、`messages`、`analysisResults`、`userThoughts`。
- 输出：`{ report }`（结构见 `lib/types/report.ts`）。

### 7.4 `POST /api/joker-analysis`

- 输入：`scriptId`、`question`、`userAnswer`、`questionIndex`、`allAnswers`。
- 输出：分析文案、insights、encouragement 等（失败时部分情况下仍返回 200 降级内容，见路由实现）。

---

## 8. 客户端状态（Zustand）

- **`useScriptStore`**：当前剧本、`ScriptEngine` 实例、当前幕/对白、进度、是否结束。
- **`useDialogueStore`**：介入对话消息列表、轮次上限、AI typing、僵局标记、`userThoughts`、分析结果累积。

页面间跳转应注意：部分流程假设观演已完成并写过 store；刷新页面可能丢失对话状态，属当前设计限制。

---

## 9. Moonshot 配置与安全

- **部署推荐**：在宿主平台配置环境变量 `MOONSHOT_API_KEY`。
- **本地/演示**：右下角齿轮打开 Dialog，将 Key 存入 `localStorage`（键名见 `lib/constants/moonshot.ts`），请求时附加 `x-moonshot-api-key`。
- **说明**：BYOK 模式下密钥经**同源** API 传入服务端再调 Moonshot，仍应避免在公共环境共享浏览器配置；生产多用户场景优先服务端环境变量。

---

## 10. 静态资源与媒体

- 公共资源放在 `public/`，剧本 JSON 中引用路径以 `/` 开头（如 `/backgroud_1.png`）。
- 宣传视频：浏览器对 **ProRes `.mov`** 支持差，宜提供 **H.264 + AAC 的 `.mp4`**，在剧本数据中用 `promoVideoWeb`（及必要时 `promoVideo` 作后备 `source`）配置；详情页用 `<video>` + `poster`（一般为 `coverImage`）。

---

## 11. 构建与运行

```bash
bun install   # 或 npm install
cp .env.local.example .env.local  # 若存在
# 在 .env.local 中设置 MOONSHOT_API_KEY（可选，若仅用弹窗配置可省略）

bun run dev
bun run build && bun run start
```

- **图片优化**：`next/image`；远程域名需在 `next.config.ts` 的 `images.remotePatterns` 中声明。
- **预加载**：`lib/utils/preload.ts` 可根据 `Script` 收集封面、幕背景、头像 URL 做预加载（实现以仓库为准）。

---

## 12. 扩展与维护建议

- **新剧本**：复制 JSON 结构，校对 `speaker` 与 `characters[].id`、`interventionPoints` 与 `dialogueId` 一致。
- **新 API**：保持「Route + Engine」分层，密钥统一走 `resolveMoonshotApiKey`；前端 `fetch` 合并 `moonshotAuthHeaders()`（`lib/moonshot-auth-headers.ts`）。
- **类型与 JSON 同步**：新增剧本字段时同时更新 `lib/types/script.ts` 与相关页面，避免运行期与类型漂移。

---

## 13. 与 README 的关系

- **README**：产品简介、安装步骤、环境变量示例、粗粒度目录说明。
- **本文**：架构、数据流、API 契约、密钥策略与扩展点，便于二次开发与排障。

---

文档版本随仓库迭代更新；若接口或目录有重大变更，请同步修改本节与 `README.md`。
