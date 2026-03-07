import { NextRequest, NextResponse } from 'next/server';
import { JokerAnalysisEngine } from '@/lib/engines/joker-analysis-engine';
import { getScriptById } from '@/data/scripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, question, userAnswer, questionIndex, allAnswers } = body;

    console.log('[Joker Analysis API] Request received:', {
      scriptId,
      questionIndex,
      answerLength: userAnswer?.length,
    });

    // 检查 API 密钥
    if (!process.env.MOONSHOT_API_KEY) {
      console.error('[Joker Analysis API] MOONSHOT_API_KEY not configured');
      return NextResponse.json(
        { error: 'API 密钥未配置,请在 .env.local 中设置 MOONSHOT_API_KEY' },
        { status: 500 }
      );
    }

    // 验证必需参数
    if (!scriptId || !question || !userAnswer) {
      console.error('[Joker Analysis API] Missing required parameters');
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // 获取剧本数据
    const script = getScriptById(scriptId);
    if (!script) {
      console.error('[Joker Analysis API] Script not found:', scriptId);
      return NextResponse.json(
        { error: '剧本不存在' },
        { status: 404 }
      );
    }

    console.log('[Joker Analysis API] Initializing analysis engine...');
    
    // 调用分析引擎
    const engine = new JokerAnalysisEngine(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1'
    );

    console.log('[Joker Analysis API] Calling analysis engine...');
    const result = await engine.analyzeUserThought({
      script,
      question,
      userAnswer,
      questionIndex,
      allAnswers,
    });

    console.log('[Joker Analysis API] Analysis completed successfully');
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Joker Analysis API] Error:', error);
    console.error('[Joker Analysis API] Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // 返回友好的降级响应
    return NextResponse.json(
      { 
        analysis: '抱歉,分析过程中出现了问题。但你的思考本身就很有价值!',
        insights: ['继续保持这样的思考深度'],
        encouragement: '每一次思考都是成长的机会。',
      },
      { status: 200 } // 返回 200 以便客户端正常显示降级内容
    );
  }
}


