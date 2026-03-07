import OpenAI from 'openai';
import { Message, DialogueAnalysis } from '@/lib/types';

export class DialogueAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async analyzeDialogue(messages: Message[]): Promise<DialogueAnalysis> {
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0];

    if (!lastUserMessage) {
      return {
        sentiment: 0,
        strategy: 0,
        boundary: 0,
        empathy: 0,
        tensionLevel: 'low',
      };
    }

    const prompt = `请分析以下对话中用户的表现，从以下四个维度打分（0-100）：

1. 边界感（boundary）：用户是否清晰表达了自己的底线和原则
2. 策略性（strategy）：用户是否采用了有效的沟通策略
3. 同理心（empathy）：用户是否理解对方的感受和处境

对话内容：
${messages.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n')}

请以 JSON 格式返回分析结果：
{
  "boundary": 数字,
  "strategy": 数字,
  "empathy": 数字,
  "tensionLevel": "low" | "medium" | "high"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    try {
      const result = JSON.parse(content);
      return {
        sentiment: 0,
        strategy: result.strategy || 0,
        boundary: result.boundary || 0,
        empathy: result.empathy || 0,
        tensionLevel: result.tensionLevel || 'low',
      };
    } catch {
      return {
        sentiment: 0,
        strategy: 0,
        boundary: 0,
        empathy: 0,
        tensionLevel: 'low',
      };
    }
  }

  detectDeadlock(messages: Message[]): boolean {
    const recentMessages = messages.slice(-6);
    const userMessages = recentMessages.filter((m) => m.role === 'user');

    if (userMessages.length < 3) return false;

    const similarityThreshold = 0.7;
    let similarCount = 0;

    for (let i = 1; i < userMessages.length; i++) {
      const similarity = this.calculateSimilarity(
        userMessages[i - 1].content,
        userMessages[i].content,
      );
      if (similarity > similarityThreshold) {
        similarCount++;
      }
    }

    return similarCount >= 2;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(''));
    const words2 = new Set(text2.split(''));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}
