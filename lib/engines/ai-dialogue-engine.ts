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
      model: 'kimi-k2.5',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 1,
      max_tokens: 200,
    });
    
    console.log('AI completion response:', completion.choices[0]?.message);

    const content = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!content) {
      console.error('AI returned empty content, using fallback');
      const fallbackContent = `（${character.name}沉默了一下，似乎在思考如何回应）`;
      const emotion = 'tense';
      return {
        content: fallbackContent,
        emotion,
        internalThought: this.generateInternalThought(fallbackContent, character),
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

    return `你是 ${character.name}，一个 ${character.age} 岁的 ${character.role}。

角色背景：
${character.background}

核心动机：${character.coreMotivation}
隐藏压力：${character.hiddenPressure}
权力水平：${character.powerLevel}
行为边界：${character.behaviorBoundary}
语言风格：${character.languageStyle}
${userThoughtsContext}

重要规则：
1. 你必须以 ${character.name} 的身份直接回复对话，不要使用旁白或描述性语言
2. 回复必须是具体的对话内容，不能为空
3. 保持角色的语言风格和情绪状态
4. 回复应该简短自然，20-80 字之间
5. 直接说出你想说的话，不要加"我说："、"${character.name}说："等前缀

示例：
错误：（沉默）
错误：${character.name}没有说话
正确：我知道你的意思，但是...
正确：这件事我们能不能换个方式？`;
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
