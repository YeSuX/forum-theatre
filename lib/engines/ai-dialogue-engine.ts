import OpenAI from 'openai';
import { Character, AIDialogueRequest, AIDialogueResponse } from '@/lib/types';

export class AIDialogueEngine {
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
    const systemPrompt = this.buildSystemPrompt(character, request);

    console.log('Raw dialogue history:', request.dialogueHistory);

    const messages = request.dialogueHistory
      .filter((msg) => msg.content && msg.content.trim().length > 0)
      .map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

    console.log('Filtered messages for AI:', messages);
    console.log('System prompt:', systemPrompt);

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2-turbo-preview',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 1,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0]?.message;
    console.log('AI completion response:', responseMessage);

    const content = responseMessage?.content?.trim() || '';

    console.log('Extracted content (dialogue):', content);

    if (!content) {
      console.error('AI returned empty dialogue content, using fallback');
      const fallbackContent = `我...我不太会说话...`;
      const emotion = 'tense';
      return {
        content: fallbackContent,
        emotion,
        internalThought: `${character.name}内心很复杂，不知道该如何表达...`,
      };
    }

    const emotion = this.detectEmotion(content);

    return {
      content,
      emotion,
      internalThought: this.generateInternalThought(content, character),
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

你需要根据 ${request.context.userCharacter.name} 的身份、背景和性格特点来调整你的回应方式。考虑你们之间的关系、权力差异、以及对方可能的动机和压力。
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
${userCharacterContext}${userThoughtsContext}

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
   - 不能为空，不能是描述性文字如"（沉默）"

# 回复示例

错误示例：
- "（沉默）"
- "${character.name}没有说话"
- "我说："
- ""（空内容）

正确示例：
- "哎呀，我...我这不是想帮忙嘛..."
- "你别这么说，我心里也不好受..."
- "那...那我下次注意就是了..."

记住：你必须说出具体的话，体现角色的性格、处境，以及你和 ${request.context.userCharacter?.name || '对方'} 之间的关系。`;
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
    return `${character.name}内心想：${character.hiddenPressure}`;
  }
}
