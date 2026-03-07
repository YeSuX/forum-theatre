# Report 重新生成功能调试指南

## 🔍 问题诊断

如果点击"重新生成"按钮后没有看到 AI 分析内容，按以下步骤排查：

---

## 📊 日志检查清单

### 1. 浏览器控制台日志

打开浏览器开发者工具（F12），查看 Console 标签页：

```
[Report Page] Starting report generation...
  ↓
[Report Page] Sending request to /api/report
  ↓
[Report Page] Response received: 200
  ↓
[Report Page] Report data received: { hasReport: true, ... }
  ↓
[Report Page] Report set successfully
```

**关键检查点：**
- ✅ `messagesCount` 应该 > 0
- ✅ `analysisCount` 应该 > 0
- ✅ Response status 应该是 200
- ✅ `hasReport` 应该是 true

### 2. 服务端日志

查看终端中的 Next.js 服务器日志：

```
[Report API] Request received: { scriptId: '...', messagesCount: 10, ... }
  ↓
[Report API] Initializing ReportGenerator...
  ↓
[Report API] Generating report...
  ↓
[ReportGenerator] Calling AI to extract key moment...
[ReportGenerator] AI raw response: { "quote": "...", "comment": "..." }
  ↓
[ReportGenerator] Calling AI to generate knowledge...
[ReportGenerator] AI knowledge response: { "title": "...", "content": "..." }
  ↓
[Report API] Report generated successfully: { heroType: '...', ... }
```

**关键检查点：**
- ✅ AI 调用应该有响应
- ✅ JSON 解析应该成功
- ✅ 没有 catch 到的错误

---

## 🐛 常见问题及解决方案

### 问题 1: 看不到 AI 生成的内容

**症状：**
- 报告显示，但关键时刻和建议都是默认文案
- 没有个性化的评论

**可能原因：**

#### A. AI API 调用失败
```bash
# 检查服务端日志
[ReportGenerator] Failed to extract key moment: Error: ...
```

**解决方案：**
1. 检查 `.env` 文件中的 `MOONSHOT_API_KEY` 是否配置
2. 验证 API key 是否有效
3. 检查网络连接
4. 查看 API 配额是否用尽

#### B. JSON 解析失败
```bash
# 检查服务端日志
[ReportGenerator] AI raw response: 这是一个关于...的分析
# 注意：如果响应不是 JSON 格式
```

**解决方案：**
- AI 可能返回了非 JSON 格式
- 已添加 markdown 代码块提取逻辑
- 如果仍失败，会使用降级方案

#### C. Temperature 过低导致结果相同
```bash
# 当前配置
temperature: 1.2  // 高随机性，确保每次不同
```

**验证方法：**
- 多次点击"重新生成"
- 观察关键时刻和建议是否变化
- 如果始终相同，检查是否走了降级逻辑

---

### 问题 2: 按钮点击无响应

**症状：**
- 点击"重新生成"按钮没有反应
- 没有加载状态

**检查：**
```javascript
// 浏览器控制台
console.log('Button clicked');
// 如果没有输出，检查事件绑定
```

**解决方案：**
- 检查 `handleRegenerate` 函数是否正确绑定
- 验证 `isRegenerating` 状态是否正常
- 查看是否有 JavaScript 错误

---

### 问题 3: 报告生成后立即消失

**症状：**
- 看到加载状态
- 报告闪现后消失

**可能原因：**
- 状态管理冲突
- useEffect 依赖问题

**检查：**
```javascript
// 浏览器控制台
[Report Page] Report set successfully
// 之后是否有其他状态更新导致重置
```

---

## 🧪 手动测试步骤

### 完整流程测试

1. **准备数据**
```bash
# 确保有对话记录
- 完成至少 3 轮对话
- 有分析结果
- （可选）填写了用户反思
```

2. **首次生成**
```bash
# 在对话页面点击"生成报告"
- 观察加载进度
- 查看控制台日志
- 验证报告内容
```

3. **重新生成**
```bash
# 点击页面右上角"重新生成"按钮
- 按钮应显示"生成中"
- 页面显示加载状态
- 进度条从 0 开始
- 查看控制台日志
- 验证新报告内容与之前不同
```

4. **验证 AI 内容**
```bash
# 检查以下内容是否是 AI 生成的：
- 关键时刻的评论（不是"这是一个关键时刻"）
- 知识卡片的标题（不是"边界感的重要性"等固定文案）
- 知识卡片的内容（应该具体、个性化）
```

---

## 🔧 调试技巧

### 1. 启用详细日志

所有关键步骤都已添加 console.log，格式为：
```
[Component/Module] Action: details
```

### 2. 检查 API 响应

在浏览器 Network 标签页：
```bash
# 找到 /api/report 请求
- 查看 Request Payload
- 查看 Response
- 检查状态码
```

### 3. 验证 AI 调用

在服务端日志中搜索：
```bash
[ReportGenerator] AI raw response:
```

如果看到这行日志，说明 AI 调用成功。检查响应内容是否是 JSON 格式。

### 4. 测试降级逻辑

临时修改代码测试降级：
```typescript
// 在 report-generator.ts 中
private async extractKeyMoment(...) {
  // 临时抛出错误测试降级
  throw new Error('Test fallback');
  
  // 应该看到默认文案
}
```

---

## 🎯 预期行为

### 正常流程

**首次加载：**
1. 显示骨架屏
2. 进度条：0% → 20% → 60% → 90% → 100%
3. 显示完整报告
4. Toast 提示"报告生成完成！"

**重新生成：**
1. 按钮变为"生成中"，图标旋转
2. 报告内容清空
3. 显示骨架屏
4. 进度条重新开始
5. 显示新报告（内容应与之前不同）
6. Toast 提示"报告生成完成！"

### AI 生成内容的特征

**关键时刻评论：**
- ❌ 默认："这是一个关键时刻"
- ✅ AI 生成："这句话很好地表达了边界感，但可以更温和一些"

**知识建议标题：**
- ❌ 默认："边界感的重要性" / "有效的沟通策略" / "同理心的力量"
- ✅ AI 生成："在坚持原则时保持温度" / "用'我'句式化解冲突"

**知识建议内容：**
- ❌ 默认：通用的沟通原则
- ✅ AI 生成：具体结合对话场景的建议

---

## 🔬 深度调试

### 检查 AI 模型配置

```typescript
// lib/engines/report-generator.ts
model: 'kimi-k2.5'        // 确认模型名称正确
temperature: 1.2          // 高随机性
max_tokens: 300/400       // 足够的输出长度
```

### 检查 API Key

```bash
# 在服务端代码中临时添加
console.log('API Key exists:', !!process.env.MOONSHOT_API_KEY);
console.log('API Key prefix:', process.env.MOONSHOT_API_KEY?.substring(0, 10));
```

### 检查网络请求

```bash
# 使用 curl 测试 API
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": "family-dinner",
    "interventionPointId": "p1",
    "messages": [...],
    "analysisResults": [...],
    "userThoughts": []
  }'
```

---

## 📈 性能监控

### 关键指标

- **API 响应时间**: 应在 3-8 秒内
- **AI 调用次数**: 每次生成调用 2 次（关键时刻 + 知识建议）
- **成功率**: 应 > 95%

### 监控日志

```typescript
// 添加时间戳
console.time('[Report] Generation');
await generator.generateReport(...);
console.timeEnd('[Report] Generation');
```

---

## 🚨 紧急降级方案

如果 AI 持续失败，可以临时使用完全本地化的逻辑：

```typescript
// 在 report-generator.ts 中
async generateReport(...) {
  // 跳过 AI 调用，直接使用本地逻辑
  const keyMoment = {
    quote: userMessages[0].content,
    comment: '这是你的第一句发言',
    speaker: '你',
  };
  
  const knowledge = this.getLocalKnowledge(avgBoundary, avgStrategy, avgEmpathy);
  
  // ...
}
```

---

## ✅ 验证清单

重新生成功能正常的标志：

- [ ] 点击按钮后显示"生成中"状态
- [ ] 页面显示加载骨架屏
- [ ] 进度条从 0 开始增长
- [ ] 浏览器控制台有完整日志
- [ ] 服务端有 AI 调用日志
- [ ] 新报告内容与之前不同
- [ ] 关键时刻评论是个性化的
- [ ] 知识建议是具体的
- [ ] Toast 显示成功提示

---

## 🎓 关键代码位置

### 前端
- 重新生成函数: `app/script/[id]/report/page.tsx:54-126`
- 按钮组件: `app/script/[id]/report/page.tsx:236-250`

### 后端
- API 路由: `app/api/report/route.ts:6-68`
- 报告生成器: `lib/engines/report-generator.ts:20-66`
- 关键时刻提取: `lib/engines/report-generator.ts:102-182`
- 知识生成: `lib/engines/report-generator.ts:204-282`

### 配置
- AI 模型: `kimi-k2.5`
- Temperature: `1.2` (高随机性)
- Base URL: `https://api.moonshot.cn/v1`
