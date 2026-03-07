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
      console.log('[DialogueAnalyzer] No user messages found');
      return {
        sentiment: 0,
        strategy: 0,
        boundary: 0,
        empathy: 0,
        tensionLevel: 'low',
      };
    }

    const prompt = `请分析以下对话中用户的表现，从以下三个维度打分（0-100）：

1. 边界感（boundary）：用户是否清晰表达了自己的底线和原则
2. 策略性（strategy）：用户是否采用了有效的沟通策略
3. 同理心（empathy）：用户是否理解对方的感受和处境

对话内容：
${messages.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n')}

要求：
- 每个维度给出 0-100 的具体分数
- 评估紧张程度：low（平和）/ medium（有张力）/ high（激烈）
- 必须返回纯 JSON 格式，不要有其他文字

请以 JSON 格式返回：
{
  "boundary": 65,
  "strategy": 70,
  "empathy": 75,
  "tensionLevel": "medium"
}`;

    try {
      console.log('[DialogueAnalyzer] Calling AI to analyze dialogue...');
      console.log('[DialogueAnalyzer] Messages count:', messages.length);

      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      console.log('[DialogueAnalyzer] AI raw response:', rawContent);

      // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
      let jsonContent = rawContent;
      const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        console.log('[DialogueAnalyzer] Extracted JSON from markdown:', jsonContent);
      }

      const result = JSON.parse(jsonContent);
      console.log('[DialogueAnalyzer] Parsed analysis:', result);

      const analysis = {
        sentiment: 0,
        strategy: Number(result.strategy) || 0,
        boundary: Number(result.boundary) || 0,
        empathy: Number(result.empathy) || 0,
        tensionLevel: result.tensionLevel || 'low',
      };

      console.log('[DialogueAnalyzer] Final analysis:', analysis);

      return analysis;
    } catch (error) {
      console.error('[DialogueAnalyzer] Failed to analyze dialogue:', error);
      console.error('[DialogueAnalyzer] Error details:', error instanceof Error ? error.message : error);
      
      // 降级方案：基于消息内容简单评估
      const userMessages = messages.filter((m) => m.role === 'user');
      const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
      
      // 简单启发式评分
      const baseScore = Math.min(50 + Math.floor(avgLength / 10), 80);
      
      return {
        sentiment: 0,
        strategy: baseScore,
        boundary: baseScore,
        empathy: baseScore,
        tensionLevel: 'medium',
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
