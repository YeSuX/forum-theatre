# 动态上下文优化文档

## 概述

本次优化实现了根据用户扮演角色和对话对象动态调整 AI 上下文的功能，使 AI 的回应更加符合角色关系和场景设定。

## 问题分析

### 改进前的问题

1. **上下文固定**：无论用户扮演哪个角色、与谁对话，AI 的系统提示词都是固定的
2. **缺少对话对象信息**：AI 不知道它在和谁对话，无法根据对方的身份调整回应
3. **关系感缺失**：AI 无法体现角色之间的权力差异、亲疏关系等
4. **参数未传递**：前端传递了 `userCharacterId` 和 `aiCharacterId`，但后端未使用

### 示例场景

假设剧本中有：
- **邱华**（母亲，权力水平高）
- **小明**（儿子，权力水平低）
- **老师**（教育者，权力水平中）

**改进前**：
- 用户扮演邱华 vs 老师：AI 回应固定
- 用户扮演小明 vs 老师：AI 回应固定（不合理，应该更权威）

**改进后**：
- 用户扮演邱华 vs 老师：AI（老师）会考虑邱华的母亲身份，语气更专业但尊重
- 用户扮演小明 vs 老师：AI（老师）会考虑小明的学生身份，语气更权威和教导性

## 技术实现

### 1. API 层改进

#### 接收新参数

```typescript
const { 
  scriptId, 
  interventionPointId, 
  messages, 
  userThoughts,
  userCharacterId,    // 新增：用户扮演的角色 ID
  aiCharacterId       // 新增：AI 扮演的角色 ID（对话对象）
} = body;
```

#### 获取双方角色信息

```typescript
// 获取用户扮演的角色
const userCharacter = script.characters.find(
  (c) => c.id === (userCharacterId || interventionPoint.userPlaysAs),
);

// 获取 AI 扮演的角色（对话对象）
const aiCharacter = script.characters.find(
  (c) => c.id === (aiCharacterId || interventionPoint.dialogueWith),
);
```

#### 传递上下文

```typescript
const response = await aiEngine.generateResponse(
  {
    scriptId,
    characterId: aiCharacter.id,
    interventionPointId,
    dialogueHistory: messages,
    userInput: lastUserMessage.content,
    context: {
      userThoughts: userThoughts || [],
      userCharacter,  // 传递用户扮演的角色完整信息
    },
  },
  aiCharacter,
);
```

### 2. 类型定义扩展

```typescript
export interface AIDialogueRequest {
  scriptId: string;
  characterId: string;
  interventionPointId: string;
  dialogueHistory: Message[];
  userInput: string;
  context: {
    userThoughts: string[];
    userCharacter?: {  // 新增：用户扮演的角色信息
      id: string;
      name: string;
      age: number;
      role: string;
      background: string;
      coreMotivation: string;
      hiddenPressure: string;
      powerLevel: string;
      behaviorBoundary: string;
      languageStyle: string;
    };
  };
}
```

### 3. AI 引擎优化

#### 动态构建系统提示词

```typescript
private buildSystemPrompt(
  character: Character,
  request: AIDialogueRequest,
): string {
  // 构建对话对象信息
  const userCharacterContext = request.context.userCharacter
    ? `
# 对话对象信息
你正在与 ${request.context.userCharacter.name} 对话。

关于 ${request.context.userCharacter.name}：
- 身份：${request.context.userCharacter.age} 岁的 ${request.context.userCharacter.role}
- 背景：${request.context.userCharacter.background}
- 核心动机：${request.context.userCharacter.coreMotivation}
- 隐藏压力：${request.context.userCharacter.hiddenPressure}
- 权力水平：${request.context.userCharacter.powerLevel}
- 行为边界：${request.context.userCharacter.behaviorBoundary}
- 语言风格：${request.context.userCharacter.languageStyle}

你需要根据 ${request.context.userCharacter.name} 的身份、背景和性格特点来调整你的回应方式。
考虑你们之间的关系、权力差异、以及对方可能的动机和压力。
`
    : '';

  return `你是 ${character.name}，一个 ${character.age} 岁的 ${character.role}。

# 你的角色设定
- 背景：${character.background}
- 核心动机：${character.coreMotivation}
- 隐藏压力：${character.hiddenPressure}
- 权力水平：${character.powerLevel}
- 行为边界：${character.behaviorBoundary}
- 语言风格：${character.languageStyle}
${userCharacterContext}

# 任务说明
你正在与 ${request.context.userCharacter?.name || '对方'} 进行真实的对话。你需要：

1. **在推理过程中**（reasoning）：
   - 分析 ${request.context.userCharacter?.name || '对方'} 说了什么
   - 思考 ${character.name} 此刻的内心感受
   - 考虑 ${character.name} 的隐藏压力和动机
   - 考虑你和 ${request.context.userCharacter?.name || '对方'} 之间的关系和权力差异
   - 决定如何回应

2. **在最终回复中**（content）：
   - 必须输出 ${character.name} 实际说出的话
   - 使用 ${character.name} 的语言风格
   - 根据你和 ${request.context.userCharacter?.name || '对方'} 的关系调整语气和态度
   - 20-80 字之间
   - 直接对话，不要加"我说："等前缀

记住：你必须说出具体的话，体现角色的性格、处境，以及你和对方之间的关系。`;
}
```

## 效果对比

### 场景：老师与不同角色对话

#### 用户扮演母亲（邱华）

**系统提示词包含**：
```
# 对话对象信息
你正在与 邱华 对话。

关于 邱华：
- 身份：45 岁的 母亲
- 权力水平：高（家庭决策者）
- 语言风格：焦虑、防御性、情绪化

你需要根据 邱华 的身份、背景和性格特点来调整你的回应方式。
考虑你们之间的关系、权力差异、以及对方可能的动机和压力。
```

**AI 回应特点**：
- 更专业和尊重
- 考虑家长的焦虑情绪
- 使用更正式的语言

#### 用户扮演学生（小明）

**系统提示词包含**：
```
# 对话对象信息
你正在与 小明 对话。

关于 小明：
- 身份：12 岁的 学生
- 权力水平：低（被管理者）
- 语言风格：简单、直接、有时叛逆

你需要根据 小明 的身份、背景和性格特点来调整你的回应方式。
考虑你们之间的关系、权力差异、以及对方可能的动机和压力。
```

**AI 回应特点**：
- 更权威和教导性
- 语气更直接
- 可能带有批评或鼓励

## 优势

### 1. 关系感增强
- AI 能够根据角色关系调整语气和态度
- 体现权力差异（上下级、师生、亲子等）
- 更真实的人际互动

### 2. 上下文丰富
- AI 知道对方的背景、动机、压力
- 可以做出更符合逻辑的回应
- 考虑双方的隐藏动机和冲突点

### 3. 灵活性提升
- 用户可以自由切换扮演角色
- 每次切换都会动态调整 AI 上下文
- 支持多样化的对话场景

### 4. 教育价值
- 用户可以体验不同角色视角
- 理解不同身份在冲突中的处境
- 培养同理心和换位思考能力

## 后续优化方向

### 1. 历史关系记忆
- 记录角色之间的历史互动
- 在新对话中引用过去的事件
- 构建更连贯的角色关系网

### 2. 情感状态追踪
- 追踪角色在对话中的情感变化
- 根据情感状态调整回应强度
- 实现情感的累积和爆发

### 3. 多人对话支持
- 支持 3 人或更多人的群体对话
- 处理复杂的多方关系
- 实现联盟、对立等群体动态

### 4. 场景感知
- 根据具体场景（家庭、学校、公共场所）调整对话
- 考虑环境因素对角色行为的影响
- 实现场景切换时的上下文转换

### 5. 文化和社会背景
- 考虑角色的文化背景
- 体现社会规范和期望
- 处理跨文化沟通的差异

## 测试建议

### 功能测试
- [ ] 切换扮演角色后，AI 回应发生变化
- [ ] 切换对话对象后，AI 回应发生变化
- [ ] 权力差异在对话中得到体现
- [ ] 角色关系影响语气和态度

### 场景测试
- [ ] 母亲 vs 老师：专业且尊重
- [ ] 学生 vs 老师：权威且教导
- [ ] 母亲 vs 孩子：亲密但可能控制
- [ ] 同事 vs 同事：平等且合作

### 边界测试
- [ ] 未传递 userCharacter 时的降级处理
- [ ] 角色信息不完整时的处理
- [ ] 快速切换角色时的上下文更新

## 总结

本次优化通过动态构建 AI 上下文，实现了：
- ✅ 根据用户扮演角色和对话对象调整 AI 回应
- ✅ 体现角色之间的关系和权力差异
- ✅ 提供更真实、更有教育价值的对话体验
- ✅ 支持灵活的角色切换和多样化场景

这为论坛剧场的核心体验奠定了坚实基础，让用户能够真正体验到不同角色视角下的冲突和沟通。
