import OpenAI from 'openai';
import {
  Report,
  DialogueAnalysis,
  Message,
  Character,
  HERO_TYPES,
} from '@/lib/types';

export class ReportGenerator {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async generateReport(
    scriptId: string,
    interventionPointId: string,
    messages: Message[],
    analysisResults: DialogueAnalysis[],
    characters: Character[],
  ): Promise<Report> {
    const avgBoundary =
      analysisResults.reduce((sum, a) => sum + a.boundary, 0) /
        analysisResults.length || 0;
    const avgStrategy =
      analysisResults.reduce((sum, a) => sum + a.strategy, 0) /
        analysisResults.length || 0;
    const avgEmpathy =
      analysisResults.reduce((sum, a) => sum + a.empathy, 0) /
        analysisResults.length || 0;

    const heroType = this.determineHeroType(
      avgBoundary,
      avgStrategy,
      avgEmpathy,
    );

    const keyMoment = await this.extractKeyMoment(messages);
    const aiThoughts = this.extractAIThoughts(messages, characters);
    const knowledge = await this.generateKnowledge(
      messages,
      avgBoundary,
      avgStrategy,
      avgEmpathy,
    );

    return {
      scriptId,
      interventionPointId,
      heroType,
      dimensions: {
        boundary: Math.round(avgBoundary),
        strategy: Math.round(avgStrategy),
        empathy: Math.round(avgEmpathy),
      },
      keyMoment,
      aiThoughts,
      knowledge,
      createdAt: Date.now(),
    };
  }

  private determineHeroType(
    boundary: number,
    strategy: number,
    empathy: number,
  ) {
    if (boundary > 70 && strategy > 70 && empathy > 70) {
      return HERO_TYPES.IDEALIST_WARRIOR;
    }
    if (boundary > 60 && empathy > 60) {
      return HERO_TYPES.DIPLOMAT;
    }
    if (boundary > 70) {
      return HERO_TYPES.BOUNDARY_GUARDIAN;
    }
    if (strategy > 70) {
      return HERO_TYPES.LOGIC_MASTER;
    }
    if (empathy > 70) {
      return HERO_TYPES.EMOTIONAL_FIGHTER;
    }
    if (boundary < 40 && strategy < 40) {
      return HERO_TYPES.ZEN_OBSERVER;
    }
    if (empathy < 40) {
      return HERO_TYPES.CALM_ANALYST;
    }
    return HERO_TYPES.PEACEFUL_DOVE;
  }

  private async extractKeyMoment(
    messages: Message[],
  ): Promise<{ quote: string; comment: string }> {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) {
      return {
        quote: '暂无对话',
        comment: '请先进行对话',
      };
    }

    const prompt = `从以下对话中找出最关键的一句用户发言，并给出简短评论：

${userMessages.map((m, i) => `${i + 1}. ${m.content}`).join('\n')}

请以 JSON 格式返回：
{
  "quote": "用户的原话",
  "comment": "简短评论（不超过50字）"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    try {
      const result = JSON.parse(content);
      return {
        quote: result.quote || userMessages[0].content,
        comment: result.comment || '这是一个关键时刻',
      };
    } catch {
      return {
        quote: userMessages[0].content,
        comment: '这是一个关键时刻',
      };
    }
  }

  private extractAIThoughts(
    messages: Message[],
    characters: Character[],
  ): { characterName: string; thought: string }[] {
    const aiMessages = messages.filter((m) => m.role === 'ai');
    const thoughts: { characterName: string; thought: string }[] = [];

    aiMessages.forEach((msg) => {
      const character = characters.find((c) => c.id === msg.characterId);
      if (character) {
        thoughts.push({
          characterName: character.name,
          thought: `${character.name}内心想：${character.hiddenPressure}`,
        });
      }
    });

    return thoughts.slice(0, 3);
  }

  private async generateKnowledge(
    messages: Message[],
    boundary: number,
    strategy: number,
    empathy: number,
  ): Promise<{ title: string; content: string }> {
    const weakestDimension =
      boundary < strategy && boundary < empathy
        ? 'boundary'
        : strategy < empathy
          ? 'strategy'
          : 'empathy';

    const knowledgeMap = {
      boundary: {
        title: '边界感的重要性',
        content:
          '在沟通中，清晰地表达自己的底线和原则是非常重要的。这不是自私，而是对自己和他人的尊重。',
      },
      strategy: {
        title: '有效的沟通策略',
        content:
          '好的沟通不仅需要真诚，还需要策略。尝试用"我"开头的句子表达感受，而不是指责对方。',
      },
      empathy: {
        title: '同理心的力量',
        content:
          '理解对方的感受和处境，不代表你要放弃自己的立场。同理心是建立连接的桥梁。',
      },
    };

    return knowledgeMap[weakestDimension];
  }
}
