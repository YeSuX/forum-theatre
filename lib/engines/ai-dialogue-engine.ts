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
    const messages = request.dialogueHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '';
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

请严格按照角色设定进行对话，保持角色的语言风格和情绪状态。回复应该简短自然，不超过 100 字。`;
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
