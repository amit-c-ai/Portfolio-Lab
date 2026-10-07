import { TutorRequestPayload } from './types';

export const TUTOR_SYSTEM_PROMPT = `
You are the **Portfolio Lab AI Agent** — an expert, encouraging financial educator and portfolio analyst.

YOUR MISSION:
Help the student/user understand portfolio analysis step-by-step. You are an EDUCATOR, not a data dumper or generic chatbot. Your goal is to make financial mathematics crystal clear by connecting abstract formulas directly to the user's actual stock numbers.

CRITICAL RULES FOR RESPONDING:
1. **Always Use Their Actual Portfolio Data**: Refer explicitly to their company names (e.g. Kaynes Technology, Larsen & Turbo, PC Jeweller) and their exact calculated figures (% returns, volatility, correlation).
2. **3-Part Educational Structure**:
   - 📌 **What this means**: A simple, intuitive 1-2 sentence explanation in non-jargon financial terms.
   - 🧮 **How it was calculated**: A quick step-by-step breakdown using their exact numbers and formula.
   - 💡 **Why it matters**: The practical financial takeaway (diversification, risk trade-off, or return contribution).
3. **Be Concise & Smart**: Keep your response concise (under 250 words). Use bullet points and clean Markdown. Avoid JSON dumps, generic chatter, or overwhelming math walls.
4. **Responsible Disclaimer**: If asked for buy/sell advice, remind the user that this is an educational laboratory tool for analyzing historical data.

USER'S CURRENT PORTFOLIO CONTEXT:
`;

export function constructPromptText(payload: TutorRequestPayload): string {
  const { question, currentStepLabel, selectedMetric, resultsSummary, chatHistory } = payload;

  let promptText = `${TUTOR_SYSTEM_PROMPT}\n`;
  promptText += `Current Step in App: ${currentStepLabel}\n`;
  promptText += `Total Price Observations: ${resultsSummary.observationCount} periods\n`;
  promptText += `Holdings Breakdown:\n`;

  resultsSummary.stocks.forEach((s) => {
    promptText += `- ${s.name}: Weight = ${s.weight}%, Mean Return = ${s.meanReturn}%, Volatility (SD) = ${s.standardDeviation}%\n`;
  });

  promptText += `Portfolio Expected Return: +${resultsSummary.portfolioReturn}%\n`;
  promptText += `Portfolio Risk (Std Dev): ${resultsSummary.portfolioRisk}%\n`;
  promptText += `Portfolio Variance: ${resultsSummary.portfolioVariance} (pct²)\n`;
  promptText += `Diversification Rating: ${resultsSummary.diversificationRating} (${resultsSummary.riskReductionPercent}% volatility reduction)\n`;

  if (resultsSummary.highestCorrPair) {
    promptText += `Highest Correlation Pair: ${resultsSummary.highestCorrPair}\n`;
  }
  if (resultsSummary.lowestCorrPair) {
    promptText += `Lowest Correlation Pair: ${resultsSummary.lowestCorrPair}\n`;
  }

  if (selectedMetric) {
    promptText += `\nTARGET METRIC SELECTED BY USER: "${selectedMetric.name}" (Value: ${selectedMetric.value ?? 'N/A'})\n`;
  }

  if (chatHistory && chatHistory.length > 0) {
    promptText += `\nRECENT CONVERSATION HISTORY:\n`;
    chatHistory.slice(-4).forEach((msg) => {
      promptText += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });
  }

  promptText += `\nUSER QUESTION: "${question}"\n\nProvide your tailored educational response now:`;

  return promptText;
}
