# 小丑分析功能说明

## 功能概述

在 Joker 提问环节,用户填写完每一题的思考后,可以点击"小丑分析"按钮,系统会调用大模型分析用户的回答,并提供深度反馈。

## 功能特点

### 1. 智能分析
- 结合剧本内容、角色背景和用户回答
- 提供有深度的洞察和新视角
- 帮助用户更深入理解冲突本质

### 2. 结构化反馈
分析结果包含三个部分:
- **深度分析**: 200-300字的详细分析
- **关键洞察**: 3个要点式的洞察
- **鼓励总结**: 50-80字的鼓励性总结

### 3. 用户体验
- 只有输入至少10字才能分析
- 分析过程显示加载状态
- 修改答案后自动清除旧分析
- 切换问题时清除分析结果

## 技术实现

### 架构设计

采用 **API 路由 + 引擎** 的架构,保护 API 密钥安全:

```
客户端组件 → API 路由 (/api/joker-analysis) → JokerAnalysisEngine → 大模型 API
```

### 核心组件

#### 1. API 路由
位置: `app/api/joker-analysis/route.ts`

职责:
- 接收客户端请求
- 从服务端环境变量读取 API 密钥(安全)
- 调用 JokerAnalysisEngine
- 返回分析结果

```typescript
// 客户端调用
const response = await fetch('/api/joker-analysis', {
  method: 'POST',
  body: JSON.stringify({
    scriptId,
    question,
    userAnswer,
    questionIndex,
    allAnswers,
  }),
});
```

#### 2. JokerAnalysisEngine
位置: `lib/engines/joker-analysis-engine.ts`

主要功能:
- 构建包含剧情、角色、问题的完整上下文
- 调用大模型 API 进行分析
- 解析结构化的分析结果

#### 3. AnalysisResult 组件
位置: `components/joker/analysis-result.tsx`

展示分析结果的 UI 组件:
- 主分析内容
- 关键洞察列表
- 鼓励性总结

### 提示词设计

系统提示词包含:
1. **角色定位**: 论坛剧场引导者(Joker)
2. **剧情上下文**: 完整的剧本、角色、幕次信息
3. **分析要求**: 
   - 肯定用户思考
   - 提供新视角
   - 引发深入思考
   - 保持中立开放
4. **输出格式**: 严格的结构化格式

### API 配置

需要在 `.env.local` 中配置:

```bash
# 注意: 使用 MOONSHOT_API_KEY (不带 NEXT_PUBLIC_ 前缀)
# 这样密钥只在服务端可用,更安全
MOONSHOT_API_KEY=your_moonshot_api_key_here
```

**API 服务**:
- 使用 Kimi (Moonshot) API
- 模型: `kimi-k2.5`
- 基础 URL: `https://api.moonshot.cn/v1`

**安全说明**:
- API 密钥存储在服务端环境变量中
- 客户端通过 API 路由 (`/api/joker-analysis`) 调用
- 避免了在浏览器中暴露敏感信息
- 与项目中其他 AI 功能使用相同的配置

## 使用流程

1. 用户在问题卡片中输入思考(至少10字)
2. 点击"小丑分析"按钮
3. 系统调用大模型 API,显示加载状态
4. 分析完成后,在问题卡片下方展示结果
5. 用户可以继续修改答案或进入下一题

## 错误处理

- API 调用失败时显示友好的错误提示
- 网络问题时提供降级方案
- 解析失败时使用默认的鼓励性文案

## 性能优化

- 分析结果缓存在组件状态中
- 切换问题时自动清除,避免混淆
- 使用相同的 OpenAI 客户端配置,与其他 AI 功能保持一致

## 未来优化方向

1. **缓存机制**: 相同答案不重复分析
2. **流式输出**: 使用 streaming 实时显示分析过程
3. **多轮对话**: 支持用户对分析结果提问
4. **个性化**: 根据用户历史调整分析风格
5. **离线模式**: 提供预设的分析模板
