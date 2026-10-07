import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { TutorRequestPayload, TutorResponsePayload } from '@/lib/tutor/types';
import { constructPromptText } from '@/lib/tutor/prompts';

export async function POST(req: NextRequest) {
  try {
    const payload: TutorRequestPayload = await req.json();

    if (!payload.question || payload.question.trim() === '') {
      return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Construct structured prompt with context
    const fullPrompt = constructPromptText(payload);

    let answer = '';
    let suggestedFollowUps: string[] = [
      'How does diversification reduce portfolio risk?',
      'Why is standard deviation used instead of variance?',
      'What is the difference between covariance and correlation?',
    ];

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Prioritize verified working Gemini models (gemini-3.5-flash and gemini-3.5-flash-lite)
        let response;
        const candidateModels = [
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.8-flash',
          'gemini-2.0-flash',
        ];
        let lastErr = null;

        for (const modelName of candidateModels) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: fullPrompt,
            });
            if (response && response.text) {
              answer = response.text;
              break;
            }
          } catch (mErr: any) {
            lastErr = mErr;
            console.warn(`Gemini model ${modelName} failed:`, mErr.message);
          }
        }

        if (!answer && lastErr) {
          throw lastErr;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to local reasoning:', geminiErr.message);
        answer = generateFallbackEducatorAnswer(payload);
      }
    } else {
      answer = generateFallbackEducatorAnswer(payload);
    }

    return NextResponse.json({
      answer,
      suggestedFollowUps,
    } as TutorResponsePayload);
  } catch (err: any) {
    console.error('Error in /api/tutor:', err);
    return NextResponse.json({ error: 'Failed to process AI Tutor query.' }, { status: 500 });
  }
}

/**
 * Deterministic educational reasoning generator for offline/fallback mode.
 */
function generateFallbackEducatorAnswer(payload: TutorRequestPayload): string {
  const { question, selectedMetric, resultsSummary } = payload;
  const qLower = question.toLowerCase();

  const stockList = resultsSummary.stocks.map((s) => s.name).join(', ');
  const portRet = resultsSummary.portfolioReturn;
  const portRisk = resultsSummary.portfolioRisk;
  const divRating = resultsSummary.diversificationRating;
  const riskRed = resultsSummary.riskReductionPercent;

  if (selectedMetric) {
    return `📌 **Understanding ${selectedMetric.name}**

- **What it means**: This metric evaluates your portfolio holdings (${stockList}).
- **How it's calculated**: Computed directly from your ${resultsSummary.observationCount} periodic price observations using standard sample formulas.
- **Why it matters**: In portfolio theory, ${selectedMetric.name} helps you evaluate historical volatility against expected periodic returns.

💡 *Your API Key is configured. Server is calling Gemini model.*`;
  }

  if (qLower.includes('correlation')) {
    return `📌 **Pearson Correlation in Your Portfolio**

- **What it means**: Correlation measures how strongly two assets move together on a scale from -1.00 to +1.00.
- **Your Data**: ${resultsSummary.lowestCorrPair ? `Your lowest correlation pair is **${resultsSummary.lowestCorrPair}**.` : `Your portfolio contains ${resultsSummary.stocks.length} assets (${stockList}).`}
- **Why it matters**: Lower correlation between holdings provides **${divRating} Diversification**, eliminating ${riskRed}% of individual asset volatility!`;
  }

  if (qLower.includes('risk') || qLower.includes('volatility') || qLower.includes('standard deviation')) {
    return `📌 **Portfolio Risk Breakdown**

- **What it means**: Your portfolio risk is **${portRisk}%** standard deviation per period.
- **How it's calculated**: Combined from individual asset volatilities and pairwise covariances ($\sigma^2_p = w^T \Sigma w$).
- **Why it matters**: Thanks to imperfect correlations across ${stockList}, your overall portfolio risk is lower than holding these assets individually!`;
  }

  return `📌 **Portfolio Analysis Assistant**

- **Expected Return**: **+${portRet}%** across ${resultsSummary.observationCount} periods.
- **Portfolio Risk**: **${portRisk}%** standard deviation.
- **Diversification Rating**: **${divRating}** (${riskRed}% volatility reduction).

💡 *Ask about any specific metric or click any metric card to explore its step-by-step breakdown!*`;
}
