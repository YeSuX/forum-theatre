# 对话页面移动端适配文档

## 概述

对对话页面进行了全面的移动端适配，确保在手机、平板等不同尺寸设备上都有良好的用户体验。

## 主要改进

### 1. 响应式侧边栏（使用 shadcn Sheet 组件）

#### 桌面端（≥768px）
- 侧边栏固定在左侧，宽度 320px
- 始终可见，方便快速切换角色
- 使用标准 `<aside>` 元素

#### 移动端（<768px）
- 侧边栏默认隐藏，节省屏幕空间
- 通过菜单按钮（汉堡图标）打开
- 使用 shadcn Sheet 组件，提供标准的抽屉体验
- 自动包含遮罩层、关闭按钮、滑动动画
- 支持键盘 ESC 关闭、点击外部关闭

**实现代码**：
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const [showSidebar, setShowSidebar] = useState(false);

// 桌面端侧边栏
<aside className="hidden md:block w-80 border-r bg-muted/30 overflow-y-auto">
  <div className="p-4 space-y-4">
    {/* 角色选择内容 */}
  </div>
</aside>

// 移动端 Sheet
<Sheet open={showSidebar} onOpenChange={setShowSidebar}>
  <SheetContent side="left" className="w-80 p-0">
    <SheetHeader className="p-4 pb-0">
      <SheetTitle>角色设置</SheetTitle>
      <SheetDescription>
        选择你要扮演的角色和对话对象
      </SheetDescription>
    </SheetHeader>
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
      {/* 角色选择内容 */}
    </div>
  </SheetContent>
</Sheet>
```

**Sheet 组件优势**：
- ✅ 标准的 shadcn 组件，设计一致
- ✅ 内置遮罩层和关闭逻辑
- ✅ 支持键盘导航（ESC 关闭）
- ✅ 无障碍访问（ARIA 属性）
- ✅ 流畅的动画效果
- ✅ 自动管理焦点

### 2. 顶部工具栏优化

#### 移动端适配
- 标题文字使用 `truncate` 防止溢出
- 添加菜单按钮（仅移动端显示）
- 部分按钮在小屏幕隐藏（僵局、已达上限、生成报告）
- 使用 `shrink-0` 防止按钮被压缩

**实现代码**：
```tsx
<div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
  <Button
    variant="ghost"
    size="icon"
    onClick={handleBack}
    className="shrink-0"
  >
    <ArrowLeft className="w-4 h-4" />
  </Button>
  <div className="min-w-0 flex-1">
    <h1 className="text-sm font-semibold truncate">{point.title}</h1>
    <p className="text-xs text-muted-foreground">
      第 {act?.actNumber} 幕
    </p>
  </div>
</div>

<div className="flex items-center gap-1 md:gap-2 shrink-0">
  {/* 移动端菜单按钮 */}
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setShowSidebar(!showSidebar)}
    className="md:hidden"
  >
    {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
  </Button>
  
  {/* 其他按钮使用 hidden sm:flex 等响应式类 */}
</div>
```

### 3. 消息区域优化

#### 间距调整
- 移动端：`space-y-4`（16px）
- 桌面端：`space-y-6`（24px）

#### 消息气泡
- 头像尺寸：移动端 32px，桌面端 36px
- 内边距：移动端 `px-3 py-2`，桌面端 `px-4 py-2.5`
- 最大宽度：移动端 85%，桌面端 80%
- 添加 `wrap-break-word` 防止长单词溢出

**实现代码**：
```tsx
<div className="space-y-4 md:space-y-6">
  <motion.div className={`flex gap-2 md:gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
    <Avatar className="w-8 h-8 md:w-9 md:h-9 shrink-0">
      {/* ... */}
    </Avatar>
    <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[80%]`}>
      <div className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg`}>
        <p className="text-sm leading-relaxed wrap-break-word">
          {message.content}
        </p>
      </div>
    </div>
  </motion.div>
</div>
```

### 4. 输入区域优化

#### 高度调整
- 移动端：`min-h-[60px]`，2 行
- 桌面端：`min-h-[80px]`，3 行

#### 按钮尺寸
- 移动端：`w-10 h-10`
- 桌面端：`w-12 h-12`

#### 安全区域支持
- 添加 `safe-area-bottom` 类，支持 iPhone 底部安全区域
- 避免输入框被底部手势条遮挡

**实现代码**：
```tsx
<footer className="bg-background border-t safe-area-bottom">
  <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 max-w-4xl">
    <div className="space-y-2 md:space-y-3">
      <div className="flex gap-2 md:gap-3">
        <Textarea
          className="flex-1 min-h-[60px] md:min-h-[80px] resize-none text-sm md:text-base"
          rows={2}
        />
        <Button
          size="icon"
          className="shrink-0 w-10 h-10 md:w-12 md:h-12"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{input.length} / 500 字</span>
        <span className="hidden sm:inline">Enter 发送 · Shift+Enter 换行</span>
      </div>
    </div>
  </div>
</footer>
```

### 5. 空状态优化

当没有消息时，移动端显示"选择角色"按钮：

```tsx
<motion.div className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[400px] text-center px-4">
  <div className="space-y-2">
    <p className="text-base md:text-lg font-medium">开始你的对话</p>
    <p className="text-sm text-muted-foreground">
      你正在扮演 {userCharacter?.name}，与 {aiCharacter?.name} 对话
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowSidebar(true)}
      className="md:hidden mt-4"
    >
      <Users className="w-4 h-4 mr-2" />
      选择角色
    </Button>
  </div>
</motion.div>
```

### 6. 全局样式增强

添加安全区域支持：

```css
@layer utilities {
  /* 移动端安全区域支持 */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
}
```

## 响应式断点

使用 Tailwind CSS 默认断点：

| 断点 | 最小宽度 | 说明 |
|------|---------|------|
| `sm` | 640px | 小屏手机横屏 |
| `md` | 768px | 平板竖屏 |
| `lg` | 1024px | 平板横屏/小笔记本 |
| `xl` | 1280px | 桌面显示器 |

主要使用 `md` 断点（768px）区分移动端和桌面端。

## 交互优化

### 1. 侧边栏交互（Sheet 组件）

**打开方式**：
- 点击顶部菜单按钮
- 空状态时点击"选择角色"按钮

**关闭方式**：
- 点击右上角关闭按钮（X 图标）
- 点击遮罩层（Sheet 外部区域）
- 按 ESC 键
- 选择角色后自动关闭（可选）

**Sheet 组件特性**：
- 自动管理打开/关闭状态
- 内置无障碍支持（ARIA 标签）
- 自动捕获和恢复焦点
- 防止背景滚动
- 支持多种打开方向（left/right/top/bottom）

### 2. 触摸优化

- 所有可点击元素有足够的触摸区域（≥44px）
- 按钮使用 `shrink-0` 防止被压缩
- 输入框高度适中，方便输入

### 3. 滚动优化

- 消息区域独立滚动
- 侧边栏独立滚动
- 新消息自动滚动到底部

## 性能优化

### 1. 动画性能

使用 shadcn Sheet 组件，内置优化的动画：
- 使用 Radix UI 的 Dialog 原语
- 基于 CSS transform 实现滑动效果
- 使用 Framer Motion 或 CSS transitions
- 硬件加速，性能优异

### 2. 条件渲染

桌面端和移动端使用不同的渲染方式：
```tsx
// 桌面端：标准侧边栏，始终渲染
<aside className="hidden md:block w-80">
  {/* 内容 */}
</aside>

// 移动端：Sheet 组件，按需渲染
<Sheet open={showSidebar} onOpenChange={setShowSidebar}>
  <SheetContent side="left">
    {/* 内容 */}
  </SheetContent>
</Sheet>
```

### 3. 图标优化

使用 Lucide React 图标库，按需加载：
```tsx
import { Menu, X, Users, Send } from "lucide-react";
```

## 测试建议

### 功能测试
- [ ] 侧边栏在移动端可以正常打开/关闭
- [ ] 点击遮罩层可以关闭侧边栏
- [ ] 角色选择功能正常
- [ ] 消息发送和接收正常
- [ ] 输入框在移动端高度合适

### 视觉测试
- [ ] 在不同屏幕尺寸下布局正常
- [ ] 文字不会溢出或被截断
- [ ] 按钮和图标大小合适
- [ ] 间距和内边距协调
- [ ] 动画流畅自然

### 设备测试
- [ ] iPhone SE（小屏手机）
- [ ] iPhone 14 Pro（标准手机）
- [ ] iPhone 14 Pro Max（大屏手机）
- [ ] iPad Mini（小平板）
- [ ] iPad Pro（大平板）
- [ ] 桌面浏览器（不同窗口大小）

### 交互测试
- [ ] 触摸操作响应灵敏
- [ ] 滚动流畅
- [ ] 输入法兼容性好
- [ ] 横屏和竖屏切换正常

## 已知限制

1. **侧边栏动画**：在低端设备上可能不够流畅
2. **输入法高度**：移动端输入法弹出时可能遮挡部分内容
3. **横屏支持**：小屏手机横屏时侧边栏可能占用过多空间

## 后续优化方向

### 1. 手势支持

添加滑动手势打开/关闭侧边栏：
```tsx
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedRight: () => setShowSidebar(true),
  onSwipedLeft: () => setShowSidebar(false),
});
```

### 2. 虚拟滚动

对于长对话历史，使用虚拟滚动优化性能：
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 3. PWA 支持

添加 PWA 配置，支持离线使用和添加到主屏幕：
```json
{
  "name": "论坛剧场",
  "short_name": "剧场",
  "display": "standalone",
  "orientation": "portrait"
}
```

### 4. 输入法优化

监听输入法高度变化，动态调整布局：
```tsx
useEffect(() => {
  const handleResize = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    // 调整布局
  };
  
  window.visualViewport?.addEventListener('resize', handleResize);
}, []);
```

### 5. 触觉反馈

在关键操作时添加触觉反馈：
```tsx
const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};
```

## 技术栈

### shadcn Sheet 组件

使用 shadcn 的 Sheet 组件实现移动端侧边栏，基于：
- **Radix UI Dialog**: 提供底层的对话框原语
- **Tailwind CSS**: 样式和动画
- **TypeScript**: 类型安全

**Sheet 组件特性**：
```tsx
<Sheet 
  open={boolean}              // 控制打开/关闭
  onOpenChange={function}     // 状态变化回调
>
  <SheetContent 
    side="left"               // 打开方向: left/right/top/bottom
    className="w-80"          // 自定义宽度
  >
    <SheetHeader>             // 标题区域
      <SheetTitle />          // 标题
      <SheetDescription />    // 描述
    </SheetHeader>
    {/* 内容 */}
  </SheetContent>
</Sheet>
```

## 总结

本次移动端适配实现了：
- ✅ 使用 shadcn Sheet 组件实现响应式侧边栏
- ✅ 桌面端固定侧边栏，移动端抽屉式
- ✅ 优化的顶部工具栏，适配小屏幕
- ✅ 调整消息气泡尺寸和间距
- ✅ 优化输入区域高度和按钮大小
- ✅ 支持安全区域（iPhone 底部手势条）
- ✅ 流畅的动画和过渡效果
- ✅ 良好的触摸交互体验
- ✅ 完整的无障碍支持
- ✅ 键盘导航支持（ESC 关闭）

用户现在可以在手机上流畅地使用对话功能，体验与桌面端一致，并且符合 shadcn 的设计规范。
