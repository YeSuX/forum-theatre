import OpenAI from 'openai';
import {
  Report,
  DialogueAnalysis,
  Message,
  Character,
  HERO_TYPES,
  InterventionPoint,
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
    interventionPoint: InterventionPoint,
    userThoughts: string[],
  ): Promise<Report> {
    console.log('[ReportGenerator] Starting report generation...');
    console.log('[ReportGenerator] Analysis results:', analysisResults);
    console.log('[ReportGenerator] Analysis results count:', analysisResults.length);

    const avgBoundary =
      analysisResults.reduce((sum, a) => sum + a.boundary, 0) /
      analysisResults.length || 0;
    const avgStrategy =
      analysisResults.reduce((sum, a) => sum + a.strategy, 0) /
      analysisResults.length || 0;
    const avgEmpathy =
      analysisResults.reduce((sum, a) => sum + a.empathy, 0) /
      analysisResults.length || 0;

    console.log('[ReportGenerator] Calculated averages:', {
      boundary: avgBoundary,
      strategy: avgStrategy,
      empathy: avgEmpathy,
    });

    const heroType = this.determineHeroType(
      avgBoundary,
      avgStrategy,
      avgEmpathy,
    );

    console.log('[ReportGenerator] Determined hero type:', heroType.name);

    const keyMoment = await this.extractKeyMoment(messages, characters);
    console.log('[ReportGenerator] Key moment extracted:', keyMoment);

    const knowledge = await this.generateKnowledge(
      messages,
      userThoughts,
      avgBoundary,
      avgStrategy,
      avgEmpathy,
      interventionPoint,
    );
    console.log('[ReportGenerator] Knowledge generated:', knowledge);

    const report = {
      scriptId,
      interventionPointId,
      heroType,
      dimensions: {
        boundary: Math.round(avgBoundary),
        strategy: Math.round(avgStrategy),
        empathy: Math.round(avgEmpathy),
      },
      keyMoment,
      aiThoughts: [], // 移除 AI 内心独白
      knowledge,
      createdAt: Date.now(),
    };

    console.log('[ReportGenerator] Final report:', report);

    return report;
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
    characters: Character[],
  ): Promise<{ quote: string; comment: string; speaker: string }> {
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) {
      return {
        quote: '暂无对话',
        comment: '请先进行对话',
        speaker: '未知',
      };
    }

    const conversationContext = messages.map((m) => {
      const char = characters.find((c) => c.id === m.characterId);
      const role = m.role === 'user' ? '你' : char?.name || 'AI';
      return `${role}: ${m.content}`;
    }).join('\n');

    const prompt = `分析以下对话，找出最能体现用户沟通能力或最有突破性的一句发言：

${conversationContext}

要求：
1. 选择最能展现用户沟通技巧、情感表达或问题解决能力的一句话
2. 给出专业且有洞察力的评论，指出这句话的亮点或可改进之处
3. 评论应具体、有建设性，不超过60字

请以 JSON 格式返回：
{
  "quote": "用户的原话",
  "comment": "专业评论"
}`;

    try {
      console.log('[ReportGenerator] Calling AI to extract key moment...');
      console.log('[ReportGenerator] Conversation context length:', conversationContext.length);

      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1,
        max_tokens: 300,
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      console.log('[ReportGenerator] AI raw response:', rawContent);

      // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
      let jsonContent = rawContent;
      const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        console.log('[ReportGenerator] Extracted JSON from markdown:', jsonContent);
      }

      const result = JSON.parse(jsonContent);
      console.log('[ReportGenerator] Parsed key moment:', result);

      const selectedMessage = userMessages.find((m) => m.content === result.quote) || userMessages[0];
      const speaker = characters.find((c) => c.id === selectedMessage.characterId)?.name || '你';

      return {
        quote: result.quote || userMessages[0].content,
        comment: result.comment || '这是一个关键时刻',
        speaker,
      };
    } catch (error) {
      console.error('[ReportGenerator] Failed to extract key moment:', error);
      console.error('[ReportGenerator] Error details:', error instanceof Error ? error.message : error);

      const firstMessage = userMessages[0];
      const speaker = characters.find((c) => c.id === firstMessage.characterId)?.name || '你';

      return {
        quote: firstMessage.content,
        comment: '这是一个关键时刻',
        speaker,
      };
    }
  }


  private async generateKnowledge(
    messages: Message[],
    userThoughts: string[],
    boundary: number,
    strategy: number,
    empathy: number,
    interventionPoint: InterventionPoint,
  ): Promise<{ title: string; content: string }> {
    const conversationSummary = messages.slice(0, 10).map((m) =>
      `${m.role === 'user' ? '你' : 'AI'}: ${m.content}`
    ).join('\n');

    const thoughtsContext = userThoughts.length > 0
      ? `\n\n用户的反思：\n${userThoughts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
      : '';

    const prompt = `基于以下对话场景和用户表现，生成一条个性化的沟通建议：

# 场景信息
冲突：${interventionPoint.conflict}
挑战：${interventionPoint.challenge}

# 对话片段
${conversationSummary}
${thoughtsContext}

# 能力评分
边界感：${boundary}/100
策略性：${strategy}/100
同理心：${empathy}/100

请生成一条针对性的建议，包括：
1. 一个吸引人的标题（8-15字）
2. 具体、可操作的建议内容（60-120字）

要求：
- 基于用户的实际表现和最弱的维度
- 给出具体的改进方法，而不是泛泛而谈
- 语气温和、鼓励性，但要有洞察力

请以 JSON 格式返回：
{
  "title": "标题",
  "content": "建议内容"
}`;

    try {
      console.log('[ReportGenerator] Calling AI to generate knowledge...');
      console.log('[ReportGenerator] Conversation summary:', conversationSummary.substring(0, 200));

      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1,
        max_tokens: 400,
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      console.log('[ReportGenerator] AI knowledge response:', rawContent);

      // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
      let jsonContent = rawContent;
      const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        console.log('[ReportGenerator] Extracted JSON from markdown:', jsonContent);
      }

      const result = JSON.parse(jsonContent);
      console.log('[ReportGenerator] Parsed knowledge:', result);

      return {
        title: result.title || '沟通建议',
        content: result.content || '继续保持真诚和开放的态度，在沟通中不断学习和成长。',
      };
    } catch (error) {
      console.error('[ReportGenerator] Failed to generate knowledge:', error);
      console.error('[ReportGenerator] Error details:', error instanceof Error ? error.message : error);

      // 降级方案：基于最弱维度提供建议
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
            '在沟通中，清晰地表达自己的底线和原则是非常重要的。这不是自私，而是对自己和他人的尊重。尝试在下次对话中，更明确地表达你的需求和界限。',
        },
        strategy: {
          title: '有效的沟通策略',
          content:
            '好的沟通不仅需要真诚，还需要策略。尝试用"我"开头的句子表达感受，而不是指责对方。这样能减少对方的防御心理，让对话更顺畅。',
        },
        empathy: {
          title: '同理心的力量',
          content:
            '理解对方的感受和处境，不代表你要放弃自己的立场。同理心是建立连接的桥梁。试着在表达自己观点前，先确认你理解了对方的感受。',
        },
      };

      return knowledgeMap[weakestDimension];
    }
  }
}
