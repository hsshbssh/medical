import { NextRequest, NextResponse } from 'next/server';
import { simplifyCareInstructions } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { sourceText, targetLanguage } = body;

    if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Source clinical instruction text is required.' },
        { status: 400 }
      );
    }

    const result = await simplifyCareInstructions({
      sourceText,
      targetLanguage: targetLanguage || 'both',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Care instruction simplification error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing instruction simplification.' },
      { status: 500 }
    );
  }
}
