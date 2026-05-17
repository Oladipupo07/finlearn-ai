import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mock response if there's no real API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "AIzaSyC-LbfoCRTZ1hdUO5Iu4mYSKo51q1uiItg") {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
      return NextResponse.json({
        result: "(Simulated) Risk Level: Medium\n\nI detect some urgency here, but this is a simulated response since no real Gemini API key is configured.",
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: body.message }]
        }
      ],
      config: {
        systemInstruction: `You are a financial scam detection assistant.

Analyze messages and determine whether they may be scams.

Focus on:
- urgency
- guaranteed profits
- suspicious payment requests
- fake investment promises
- phishing attempts

Keep explanations beginner-friendly and concise.

At the end include:
Risk Level: Low / Medium / High`,
      }
    });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error) {
    console.error("Scam Check API Error:", error);
    return NextResponse.json({
      error: "Something went wrong.",
    });
  }
}
