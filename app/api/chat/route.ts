import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Mock response if there's no real API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
      
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let mockReply = "I'm a simulated AI assistant since no Gemini API key was provided. But in a real setup, I would give you excellent financial advice!";
      
      if (lastMessage.includes("budget") || lastMessage.includes("save")) {
        mockReply = "A good rule of thumb is the 50/30/20 rule! Allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.";
      } else if (lastMessage.includes("invest")) {
        mockReply = "For students, starting with low-cost index funds through platforms like Robinhood or Fidelity is a great way to let compound interest work for you early on.";
      }
      
      return NextResponse.json({ message: mockReply });
    }

    // Map existing frontend generic format {role: "user" | "assistant", content: string} to Gemini 2 format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Call Google AI Studio
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are a helpful, encouraging financial tutor for university and high school students. Keep your advice practical, safe, and easy to understand.",
      }
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { message: "Sorry! The AI tutor is currently taking a break. Please try again later." },
      { status: 500 }
    );
  }
}
