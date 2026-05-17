import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

export async function GET() {
  try {
    // Return mock data if no real API key is ready yet
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here" || process.env.GEMINI_API_KEY === "mock-key") {
       await new Promise(r => setTimeout(r, 2000));
       return NextResponse.json({ questions: [
         {
           id: 1, difficulty: "Medium",
           question: "What is compound interest?",
           options: ["Interest calculated solely on the principal", "Interest calculated on the initial principal and accumulated interest", "A penalty fee for late payments", "A flat rate bank fee"],
           correctIndex: 1,
           explanation: "Compound interest is 'interest on interest', making your wealth grow faster over time."
         },
         {
           id: 2, difficulty: "Hard",
           question: "What is an ETF?",
           options: ["Emergency Trust Fund", "Exchange Traded Fund", "Electronic Transfer Fee", "Early Tax Filing"],
           correctIndex: 1,
           explanation: "An Exchange Traded Fund (ETF) is a basket of securities that trades on an exchange just like a stock."
         },
         {
            id: 3, difficulty: "Easy",
            question: "What should you do before investing in the stock market?",
            options: ["Borrow money", "Build an emergency fund", "Quit your job", "Buy a new car"],
            correctIndex: 1,
            explanation: "Always ensure you have 3-6 months of expenses saved up in an emergency fund before exposing your capital to risk."
          }
       ]});
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 5 multiple-choice questions about personal finance, investing, and budgeting. Ensure the difficulty varies between 'Easy', 'Medium', and 'Hard'. Return raw JSON only, adhering to exactly this schema: { questions: [{ id: number, difficulty: string, question: string, options: string[], correctIndex: number, explanation: string }] }. No markdown blocks.",
      config: {
        responseMimeType: "application/json",
      }
    });

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText.replace(/```json/gi, '').replace(/```/g, '').trim());

    return NextResponse.json({ questions: parsed.questions });
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return NextResponse.json(
      { message: "Failed to generate dynamic quiz." },
      { status: 500 }
    );
  }
}
