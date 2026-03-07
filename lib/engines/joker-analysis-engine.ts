import OpenAI from 'openai';
import { Script } from '@/lib/types/script';

export interface JokerAnalysisRequest {
  script: Script;
  question: string;
  userAnswer: string;
  questionIndex: number;
  allAnswers: Record<string, string>;
}

export interface JokerAnalysisResponse {
  analysis: string;
  insights: string[];
  encouragement: string;
}

export class JokerAnalysisEngine {
  private openai: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async analyzeUserThought(
    request: JokerAnalysisRequest
  ): Promise<JokerAnalysisResponse> {
    const systemPrompt = this.buildSystemPrompt(request);

    const completion = await this.openai.chat.completions.create({
      model: 'kimi-k2.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.userAnswer },
      ],
      temperature: 1,
      max_tokens: 800,
    });

    const responseContent = completion.choices[0]?.message?.content?.trim() || '';

    // 解析响应
    return this.parseResponse(responseContent);
  }

  private buildSystemPrompt(request: JokerAnalysisRequest): string {
    const { script, question, questionIndex } = request;

    // 构建剧情概要
    const scriptSummary = `
剧本：${script.title}
描述：${script.description}

角色信息：
${script.characters.map((char) => `
- ${char.name}（${char.age}岁，${char.role}）
  背景：${char.background}
  核心动机：${char.coreMotivation}
  隐藏压力：${char.hiddenPressure}
`).join('\n')}

剧情概要：
${script.acts.map((act, i) => `
第${i + 1}幕：${act.title}
${act.description}
`).join('\n')}
`;

    // 构建之前的回答上下文
    const previousAnswers = Object.entries(request.allAnswers)
      .filter(([key]) => key !== `q${questionIndex + 1}`)
      .map(([, value]) => `- ${value}`)
      .join('\n');

    const previousContext = previousAnswers
      ? `\n用户之前的思考：\n${previousAnswers}\n`
      : '';

    return `你是一位富有洞察力的论坛剧场引导者（Joker），擅长帮助观众深入理解冲突和人性。

# 剧情背景
${scriptSummary}

# 当前问题
${question}
${previousContext}

# 你的任务
分析用户的回答，提供有深度的反馈。你的分析应该：

1. **肯定用户的思考**：认可他们的观察和思考
2. **提供新的视角**：结合剧情和角色背景，提供用户可能没注意到的洞察
3. **引发深入思考**：提出启发性的观点，帮助用户更深入理解冲突
4. **保持中立和开放**：不要给出标准答案，而是拓展思考空间

# 输出格式
请按以下格式输出（严格遵守格式）：

[分析]
（200-300字的深度分析，结合剧情和角色背景）

[洞察]
- 洞察点1
- 洞察点2
- 洞察点3

[鼓励]
（50-80字的鼓励性总结）

# 注意事项
- 使用温和、启发性的语气
- 避免说教或给出标准答案
- 结合具体的剧情细节和角色特点
- 帮助用户看到冲突的复杂性和多面性`;
  }

  private parseResponse(content: string): JokerAnalysisResponse {
    const lines = content.split('\n').filter((line) => line.trim());

    let analysis = '';
    let insights: string[] = [];
    let encouragement = '';

    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('[分析]')) {
        currentSection = 'analysis';
        continue;
      } else if (trimmedLine.startsWith('[洞察]')) {
        currentSection = 'insights';
        continue;
      } else if (trimmedLine.startsWith('[鼓励]')) {
        currentSection = 'encouragement';
        continue;
      }

      if (currentSection === 'analysis') {
        analysis += trimmedLine + '\n';
      } else if (currentSection === 'insights') {
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          insights.push(trimmedLine.replace(/^[-•]\s*/, ''));
        }
      } else if (currentSection === 'encouragement') {
        encouragement += trimmedLine + ' ';
      }
    }

    // 如果解析失败,使用整个内容作为分析
    if (!analysis && !insights.length && !encouragement) {
      analysis = content;
      insights = ['继续深入思考这个问题'];
      encouragement = '你的思考很有价值,继续探索!';
    }

    return {
      analysis: analysis.trim(),
      insights: insights.length > 0 ? insights : ['继续深入思考这个问题'],
      encouragement: encouragement.trim() || '你的思考很有价值,继续探索!',
    };
  }
}
