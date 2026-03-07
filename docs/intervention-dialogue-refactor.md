# 介入点与对话页面重构文档

## 概述

本次重构优化了介入点选择和对话交互流程，使用 shadcn UI 组件库的标准设计模式，提供更清晰的角色选择和切换功能。

## 主要改进

### 1. Intervention 页面（介入点选择）

#### 改进前的问题：
- 用户无法在进入对话前选择扮演的角色
- 信息过载，卡片展示过多细节但缺少关键的角色选择
- 直接跳转到对话页面，流程不连贯
- 使用深色主题硬编码样式，不符合 shadcn 设计规范

#### 改进后：
- **角色选择对话框**：点击介入点后弹出对话框，展示该幕所有可用角色
- **清晰的信息层级**：
  - 卡片主要展示：标题、场景、冲突、挑战
  - 次要信息：幕数、进度、能力类型
- **使用 shadcn 标准组件**：
  - `Dialog` - 角色选择对话框
  - `RadioGroup` - 单选角色
  - `Avatar` - 角色头像
  - `Badge` - 标签展示
- **遵循 shadcn 设计规范**：
  - 使用 `bg-background`、`text-muted-foreground` 等语义化颜色
  - 统一的 hover 状态和过渡效果
  - 响应式布局

#### 核心代码：

```typescript
// 角色选择对话框
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>选择你要扮演的角色</DialogTitle>
    </DialogHeader>
    <RadioGroup value={selectedCharacter} onValueChange={setSelectedCharacter}>
      {availableCharacters.map((character) => (
        <div key={character.id} className="flex items-center space-x-3">
          <RadioGroupItem value={character.id} />
          <Avatar>
            <AvatarImage src={character.avatar} />
          </Avatar>
          <Label>{character.name}</Label>
        </div>
      ))}
    </RadioGroup>
  </DialogContent>
</Dialog>
```

### 2. Dialogue 页面（对话交互）

#### 改进前的问题：
- 角色固定，用户只能扮演预设角色
- 对话对象单一，无法与其他角色互动
- 缺少角色切换机制
- 布局单一，没有清晰的信息分区

#### 改进后：
- **左侧角色面板**：
  - 我扮演的角色（可切换）
  - 对话对象（可切换）
  - 场景信息（场景、冲突、挑战）
- **右侧消息区域**：
  - 消息列表
  - 输入框
- **智能角色切换**：
  - 切换扮演角色时，自动调整可选对话对象
  - 防止自己和自己对话
- **使用 shadcn 标准组件**：
  - `Select` - 角色和对话对象选择
  - `Card` - 信息卡片
  - `Separator` - 分隔线
  - `Avatar` - 角色头像

#### 核心代码：

```typescript
// 左侧角色面板
<aside className="w-80 border-r bg-muted/30">
  <Card>
    <CardHeader>
      <CardTitle>我扮演的角色</CardTitle>
    </CardHeader>
    <CardContent>
      <Select value={selectedCharacter} onValueChange={handleCharacterChange}>
        <SelectTrigger>
          <SelectValue placeholder="选择角色" />
        </SelectTrigger>
        <SelectContent>
          {availableCharacters.map((char) => (
            <SelectItem key={char.id} value={char.id}>
              {char.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
</aside>
```

## 技术实现细节

### 角色选择逻辑

**扮演角色**：用户可以选择剧本中的任何角色

```typescript
// 所有角色都可以被扮演
const availableCharacters = script.characters;
```

**对话对象**：只能选择该幕中出现的其他角色（排除扮演角色）

```typescript
// 获取该幕中出现的角色（通过对话中的发言人）
const actCharacterIds = act
  ? new Set(act.dialogues.map((d) => d.speaker))
  : new Set<string>();

// 获取可对话的角色：该幕中出现的角色，但排除扮演角色
const dialogueTargets = script.characters.filter(
  (char) => actCharacterIds.has(char.id) && char.id !== selectedCharacter
);
```

这样设计的原因：
- 用户可以自由选择任何角色进行扮演，增加灵活性
- 对话对象限定在该幕中，确保对话的合理性（该幕中没出现的角色无法对话）
- 防止自己和自己对话

### URL 参数传递

从介入点页面传递选中的角色到对话页面：

```typescript
// Intervention 页面
router.push(
  `/script/${params.id}/dialogue?point=${selectedPoint}&character=${selectedCharacter}`
);

// Dialogue 页面
const initialCharacter = searchParams.get("character");
```

### 智能角色切换

切换扮演角色时，自动调整对话对象：

```typescript
const handleCharacterChange = (newCharacterId: string) => {
  setSelectedCharacter(newCharacterId);
  
  // 计算新的可对话角色列表
  const newDialogueTargets = script.characters.filter(
    (char) => actCharacterIds.has(char.id) && char.id !== newCharacterId
  );
  
  // 如果当前对话对象无效（是自己或不在该幕中），自动选择第一个有效对话对象
  const isCurrentTargetValid = newDialogueTargets.some(
    (char) => char.id === dialogueTarget
  );
  
  if (!isCurrentTargetValid && newDialogueTargets.length > 0) {
    setDialogueTarget(newDialogueTargets[0].id);
  }
};
```

智能切换逻辑：
1. 用户切换扮演角色时，重新计算可对话的角色列表
2. 检查当前对话对象是否仍然有效（不是自己且在该幕中）
3. 如果无效，自动选择第一个有效的对话对象
4. 如果该幕没有其他角色，显示友好提示

## UI/UX 改进

### 1. 信息层级优化
- **介入点页面**：突出标题和场景，次要信息使用 Badge
- **对话页面**：左侧面板集中展示角色和场景信息，右侧专注对话

### 2. 交互流程优化
- **明确的步骤**：选择介入点 → 选择角色 → 开始对话
- **即时反馈**：角色切换后立即更新界面和可选项
- **防错设计**：禁止自己和自己对话，输入框根据状态禁用

### 3. 视觉一致性
- 统一使用 shadcn 设计系统
- 语义化颜色变量（`bg-background`、`text-muted-foreground`）
- 一致的间距、圆角、阴影

## 兼容性说明

### API 调整

对话 API 需要支持新的参数：

```typescript
// 新增参数
{
  userCharacterId: string;  // 用户扮演的角色
  aiCharacterId: string;    // AI 扮演的角色（对话对象）
}
```

如果 API 尚未支持，需要在 `/api/dialogue/route.ts` 中添加处理逻辑。

### 后续优化建议

1. **类型系统增强**：
   - 在 `Act` 类型中添加 `characterIds` 字段，避免运行时计算
   
2. **性能优化**：
   - 缓存角色列表计算结果
   - 使用 `useMemo` 优化角色过滤

3. **功能增强**：
   - 支持多人对话（群聊模式）
   - 添加角色关系图谱
   - 保存用户的角色偏好

4. **可访问性**：
   - 添加键盘导航支持
   - 增强屏幕阅读器支持
   - 添加 ARIA 标签

## 测试建议

### 功能测试
- [ ] 介入点列表正确展示
- [ ] 角色选择对话框正常弹出
- [ ] 选择角色后正确跳转到对话页面
- [ ] 对话页面角色切换功能正常
- [ ] 对话对象切换功能正常
- [ ] 防止自己和自己对话
- [ ] 消息发送和接收正常

### 边界情况测试
- [ ] 扮演角色不在该幕中时的处理
- [ ] 该幕只有一个角色时的处理（无法对话）
- [ ] 切换扮演角色时对话对象自动调整
- [ ] 网络错误时的提示
- [ ] 快速切换角色时的状态管理

### UI/UX 测试
- [ ] 响应式布局在不同屏幕尺寸下正常
- [ ] 动画过渡流畅
- [ ] 加载状态清晰
- [ ] 错误提示友好

## 总结

本次重构显著提升了用户体验：
- ✅ 使用 shadcn 标准设计模式，视觉一致性更好
- ✅ 角色选择流程更清晰，减少用户困惑
- ✅ 支持灵活的角色切换，增强互动性
- ✅ 信息层级优化，减少认知负担
- ✅ 代码结构更清晰，易于维护和扩展
