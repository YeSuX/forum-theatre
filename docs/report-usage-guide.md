# Report 页面使用指南

## 📖 功能概览

Report 页面是用户完成对话后的分析报告页面，提供：
- 对话统计概览
- 英雄类型评定
- 沟通能力分析（边界感、策略性、同理心）
- 关键时刻回顾
- AI 角色内心独白
- 对话回放
- 个性化沟通建议
- 报告分享功能

---

## 🎯 页面流程

```
对话页面 (dialogue) 
  → 点击"生成报告"
  → Report 页面
    1. 显示加载进度（分析对话 → 评估能力 → 生成建议）
    2. 展示完整报告
    3. 提供分享、重试、返回等操作
```

---

## 🎨 设计特性

### 主题支持
- ✅ 自动适配系统主题（亮色/暗色）
- ✅ 所有颜色使用 CSS 变量
- ✅ 完整的 shadcn 设计系统

### 响应式布局
- **移动端** (< 640px): 单列布局，紧凑间距
- **平板** (640px - 768px): 优化的两列布局
- **桌面** (> 768px): 完整的多列布局

### 动画效果
- 渐入动画：从上到下依次展示
- 进度条动画：平滑的填充效果
- 加载状态：脉冲动画和旋转加载

---

## 📊 报告内容详解

### 1. 对话概览
显示本次对话的基本统计：
- 总消息数：所有发言总数
- 你的发言：用户发言数
- 对方回应：AI 回应数
- 分析轮次：对话分析次数
- 介入点信息：场景和冲突描述

### 2. 英雄类型
基于三维能力评分，系统会判定用户的沟通风格：
- 🕊️ 和平主义小白鸽
- 🛡️ 硬核边界守卫者
- 🧠 逻辑流吐槽怪
- 🤝 外交官
- ⚔️ 理想主义战士
- 🧘 佛系观察者
- 💪 情绪化战士
- 📊 冷静分析师

### 3. 能力维度分析
三个维度的详细评分：

**边界感** (Shield 图标)
- 评分范围：0-100
- 评级：优秀(80+) / 良好(60-79) / 中等(40-59) / 待提升(<40)
- 含义：清晰表达底线和原则的能力

**策略性** (Target 图标)
- 评分范围：0-100
- 评级：同上
- 含义：采用有效沟通策略的能力

**同理心** (Heart 图标)
- 评分范围：0-100
- 评级：同上
- 含义：理解对方感受和处境的能力

### 4. 关键时刻
AI 从对话中提取最能体现用户沟通能力的一句话：
- 显示原话和说话人
- 提供专业评论和建议
- 指出亮点或可改进之处

### 5. 角色内心独白
展示 AI 角色在对话中的真实想法：
- 显示角色名称和头像
- 揭示角色的隐藏压力
- 帮助用户理解对方视角

### 6. 对话回放
展示前 6 条对话消息：
- 用户消息：右侧，主题色背景
- AI 消息：左侧，灰色背景
- 显示角色头像和名称
- 超过 6 条时显示剩余数量

### 7. 个性化建议
基于用户表现和反思生成的建议：
- 针对最弱维度
- 具体可操作
- 结合场景上下文
- 鼓励性语气

---

## 🔧 技术实现

### 数据流
```typescript
// 1. 从 dialogue store 获取数据
const { messages, analysisResults, userThoughts } = useDialogueStore();

// 2. 调用 API 生成报告
POST /api/report
{
  scriptId,
  interventionPointId,
  messages,           // 对话历史
  analysisResults,    // 分析结果
  userThoughts,       // 用户反思
}

// 3. AI 处理
- 计算能力维度平均分
- 判定英雄类型
- 提取关键时刻（分析完整对话上下文）
- 生成个性化建议（结合场景和用户反思）

// 4. 返回报告数据
{
  report: {
    heroType,
    dimensions,
    keyMoment,
    aiThoughts,
    knowledge,
  }
}
```

### 错误处理
```typescript
// 多层错误处理
try {
  // API 调用
} catch (error) {
  // 1. 设置错误状态
  setError(errorMessage);
  
  // 2. 显示 toast 提示
  toast.error(errorMessage);
  
  // 3. 提供重试按钮
  <Button onClick={handleRetry}>重新生成</Button>
}

// AI 调用降级
try {
  // 调用 AI 生成
} catch {
  // 使用本地逻辑生成默认内容
  return defaultKnowledge;
}
```

### 加载状态管理
```typescript
const [progress, setProgress] = useState(0);

// 分阶段更新进度
setProgress(20);  // 开始请求
setProgress(60);  // 收到响应
setProgress(90);  // 处理数据
setProgress(100); // 完成

// 动态提示文案
{progress < 30 && '分析对话内容...'}
{progress >= 30 && progress < 70 && '评估沟通能力...'}
{progress >= 70 && progress < 95 && '生成个性化建议...'}
{progress >= 95 && '即将完成...'}
```

---

## 🎭 使用场景

### 正常流程
1. 用户完成对话
2. 点击"生成报告"按钮
3. 显示加载状态（3-5秒）
4. 展示完整报告
5. 用户可以分享、重试或返回

### 错误场景
1. **无对话记录**: 显示错误提示，引导返回对话页面
2. **API 失败**: 显示错误信息和重试按钮
3. **网络超时**: 提示网络问题，提供重试选项
4. **数据格式错误**: 使用降级方案生成基础报告

### 边界情况
- 对话消息为空：显示友好提示
- 分析结果为空：使用默认评分
- AI 返回空内容：使用本地逻辑生成
- 用户未填写反思：仍可生成报告（建议会更通用）

---

## 🎁 分享功能

### 工作流程
1. 点击"分享报告"按钮
2. 自动生成报告卡片图片
3. 提供下载和复制选项

### 分享卡片内容
- 英雄类型名称和描述
- 三维能力评分
- 品牌标识
- 使用主题色渐变背景

### 技术实现
```typescript
// 使用 html2canvas 生成图片
const canvas = await html2canvas(reportRef.current, {
  scale: 2,           // 高清图片
  backgroundColor: '#ffffff',
  useCORS: true,
});

const url = canvas.toDataURL('image/png');
```

---

## 🔍 调试指南

### 检查数据流
```typescript
// 在浏览器控制台
console.log('Messages:', messages);
console.log('Analysis:', analysisResults);
console.log('Thoughts:', userThoughts);
console.log('Report:', report);
```

### 常见问题

**Q: 报告生成失败**
- 检查 MOONSHOT_API_KEY 是否配置
- 查看浏览器控制台错误
- 检查 messages 是否为空

**Q: 显示空白页面**
- 检查是否有对话记录
- 验证 script 和 pointId 参数
- 查看 Network 标签页的 API 响应

**Q: 主题色不正确**
- 确认 globals.css 中的 CSS 变量已定义
- 检查是否使用了硬编码颜色
- 验证 Tailwind 配置

**Q: 移动端布局异常**
- 检查响应式断点是否正确
- 验证容器宽度限制
- 测试不同设备尺寸

---

## 📈 性能优化

### 已实现
- ✅ 组件懒加载（通过 Next.js 自动处理）
- ✅ 图片按需生成（仅在打开分享对话框时）
- ✅ 合理的动画延迟（避免卡顿）
- ✅ 骨架屏优化首屏体验

### 可选优化
- 报告数据缓存（localStorage）
- 图片预生成（后台任务）
- 虚拟滚动（对话回放超过 100 条时）
- Service Worker 离线支持

---

## 🎨 自定义指南

### 修改颜色主题
编辑 `app/globals.css`:
```css
:root {
  --chart-1: oklch(0.809 0.105 251.813);  /* 边界感颜色 */
  --chart-2: oklch(0.623 0.214 259.815);  /* 策略性颜色 */
  --chart-3: oklch(0.546 0.245 262.881);  /* 同理心颜色 */
}
```

### 修改英雄类型图标
编辑 `components/report/hero-type-badge.tsx`:
```typescript
const heroTypeIcons: Record<string, string> = {
  'peaceful-dove': '🕊️',
  'boundary-guardian': '🛡️',
  // 添加或修改图标
};
```

### 修改能力维度配置
编辑 `components/report/dimension-chart.tsx`:
```typescript
const dimensionConfig = {
  boundary: {
    label: '边界感',
    icon: Shield,
    description: '你的描述',
  },
  // 修改配置
};
```

### 调整评分等级
编辑 `components/report/dimension-chart.tsx`:
```typescript
const getScoreLevel = (score: number) => {
  if (score >= 80) return { label: '优秀', variant: 'default' };
  if (score >= 60) return { label: '良好', variant: 'secondary' };
  // 调整阈值
};
```

---

## 🧪 测试用例

### 单元测试建议
```typescript
describe('ReportPage', () => {
  it('should show loading state initially', () => {
    // 测试加载状态
  });

  it('should display report after generation', () => {
    // 测试报告展示
  });

  it('should handle API errors gracefully', () => {
    // 测试错误处理
  });

  it('should be responsive on mobile', () => {
    // 测试移动端适配
  });
});
```

### E2E 测试建议
```typescript
test('complete dialogue and generate report', async ({ page }) => {
  // 1. 完成对话
  await page.goto('/script/family-dinner/dialogue?point=p1');
  await page.fill('textarea', '测试消息');
  await page.click('button[type="submit"]');
  
  // 2. 生成报告
  await page.click('text=生成报告');
  
  // 3. 验证报告内容
  await expect(page.locator('h1')).toContainText('你的参演报告');
  await expect(page.locator('[data-testid="hero-type"]')).toBeVisible();
  
  // 4. 测试分享功能
  await page.click('text=分享报告');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

---

## 📱 移动端测试清单

- [ ] iPhone SE (375px): 所有内容可见，无横向滚动
- [ ] iPhone 12/13 (390px): 布局合理，触摸友好
- [ ] iPad (768px): 充分利用空间
- [ ] iPad Pro (1024px): 接近桌面体验
- [ ] 横屏模式：布局正常
- [ ] 安全区域：底部按钮不被遮挡

---

## 🔗 相关文档

- [重构说明](./report-page-refactor.md) - 详细的重构文档
- [视觉对比](./report-visual-comparison.md) - 重构前后对比
- [API 文档](./api-documentation.md) - API 接口说明
- [类型定义](../lib/types/report.ts) - TypeScript 类型

---

## 💡 最佳实践

### 1. 数据准备
确保在调用报告 API 前：
- ✅ 至少有 1 条对话消息
- ✅ analysisResults 不为空（至少 1 次分析）
- ✅ script 和 interventionPoint 数据完整

### 2. 错误处理
始终提供：
- ✅ 清晰的错误提示
- ✅ 重试机制
- ✅ 返回上一步的选项
- ✅ 降级方案

### 3. 用户体验
- ✅ 加载状态要有进度反馈
- ✅ 动画不要过于花哨
- ✅ 信息层次要清晰
- ✅ 操作按钮要明显

### 4. 性能考虑
- ✅ 避免不必要的重渲染
- ✅ 图片按需生成
- ✅ 合理使用动画延迟
- ✅ 大列表使用虚拟滚动

---

## 🚀 部署注意事项

### 环境变量
确保生产环境配置：
```bash
MOONSHOT_API_KEY=your_api_key
```

### 构建检查
```bash
npm run build  # 确保构建成功
npm run lint   # 检查代码质量
```

### 监控指标
关注以下指标：
- 报告生成成功率
- API 响应时间
- 错误率
- 用户分享率

---

## 🎓 学习要点

### shadcn 设计系统
- 使用 CSS 变量而非硬编码颜色
- 遵循组件变体系统（default, outline, ghost 等）
- 利用主题切换能力

### 响应式设计
- 移动优先思维
- 合理使用 Tailwind 断点
- 触摸友好的交互设计

### React 最佳实践
- 状态管理清晰
- 错误边界完整
- 副作用控制合理
- 组件职责单一

### TypeScript 类型安全
- 完整的类型定义
- 避免 any 类型
- 利用类型推断
- 接口设计合理
