import { NextRequest, NextResponse } from 'next/server';
import { AIDialogueEngine } from '@/lib/engines/ai-dialogue-engine';
import { DialogueAnalyzer } from '@/lib/engines/dialogue-analyzer';
import { getScriptById } from '@/data/scripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      scriptId, 
      interventionPointId, 
      messages, 
      userThoughts,
      userCharacterId,
      aiCharacterId 
    } = body;

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    const script = getScriptById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    const interventionPoint = script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!interventionPoint) {
      console.error('Intervention point not found:', interventionPointId);
      return NextResponse.json(
        { error: 'Intervention point not found' },
        { status: 404 },
      );
    }

    // 获取用户扮演的角色
    const userCharacter = script.characters.find(
      (c) => c.id === (userCharacterId || interventionPoint.userPlaysAs),
    );
    if (!userCharacter) {
      console.error(`User character not found: ${userCharacterId}`);
      return NextResponse.json(
        { error: 'User character not found' },
        { status: 404 },
      );
    }

    // 获取 AI 扮演的角色（对话对象）
    const aiCharacter = script.characters.find(
      (c) => c.id === (aiCharacterId || interventionPoint.dialogueWith),
    );
    if (!aiCharacter) {
      console.error(`AI character not found: ${aiCharacterId}`);
      return NextResponse.json(
        { 
          error: 'AI character not found',
          details: {
            requestedId: aiCharacterId,
            availableIds: script.characters.map(c => c.id)
          }
        },
        { status: 404 },
      );
    }

    console.log('User plays as:', { id: userCharacter.id, name: userCharacter.name });
    console.log('AI plays as:', { id: aiCharacter.id, name: aiCharacter.name });

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .slice(-1)[0];
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 },
      );
    }

    if (!process.env.MOONSHOT_API_KEY) {
      console.error('MOONSHOT_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    console.log('Initializing AI engines...');
    const aiEngine = new AIDialogueEngine(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    const analyzer = new DialogueAnalyzer(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    console.log('Generating AI response...');

    const response = await aiEngine.generateResponse(
      {
        scriptId,
        characterId: aiCharacter.id,
        interventionPointId,
        dialogueHistory: messages,
        userInput: lastUserMessage.content,
        context: {
          userThoughts: userThoughts || [],
          userCharacter,  // 传递用户扮演的角色信息
        },
      },
      aiCharacter,
    );

    console.log('AI response generated:', response);

    const analysis = await analyzer.analyzeDialogue(messages);
    const hasDeadlock = analyzer.detectDeadlock(messages);

    console.log('Analysis complete:', { analysis, hasDeadlock });

    const result = {
      response,
      analysis,
      hasDeadlock,
      character: {
        id: aiCharacter.id,
        name: aiCharacter.name,
        avatar: aiCharacter.avatar,
      },
    };

    console.log('Returning result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Dialogue API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
