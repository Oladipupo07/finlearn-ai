import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

export async function POST(req: Request) {
  try {
    const { messages, userData } = await req.json();

    const income = Number(userData?.income || 0);
    const totalExpenses = Number(userData?.totalExpenses || 0);
    const savingsGoal = Number(userData?.savingsGoal || 100000);
    const remainingBalance = income - totalExpenses;
    const streak = Number(userData?.streak || 0);
    const level = Number(userData?.level || 1);
    const xp = Number(userData?.xp || 0);
    const roadmapProgress = Number(userData?.roadmapProgress || 0);
    const latestReportScore = userData?.latestReportScore ?? "Not generated yet";

    // Mock response if there's no real API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here" || process.env.GEMINI_API_KEY === "mock-key") {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let mockReply = `Hi! I'm Atlas Coach, your personalized AI Finance Coach. (Simulated Response)

Based on your profile:
- Monthly Income: **₦${income.toLocaleString()}**
- Total Expenses: **₦${totalExpenses.toLocaleString()}**
- Remaining Balance: **₦${remainingBalance.toLocaleString()}**
- Streak: **${streak} days**
- Level: **Level ${level}**
- Roadmap Completion: **${roadmapProgress}%**
- Report Card Score: **${latestReportScore}%**

How can I help you optimize your cash flow today?`;

      if (lastMessage.includes("budget") || lastMessage.includes("help me budget")) {
        mockReply = `### Your Personalized Budget Advice
Based on your income of **₦${income.toLocaleString()}** and expenses of **₦${totalExpenses.toLocaleString()}** (${income > 0 ? Math.round((totalExpenses / income) * 100) : 0}% used):

1. **Rule of Thumb**: Try to allocate **₦${Math.round(income * 0.5).toLocaleString()}** (50%) to Fixed Needs, **₦${Math.round(income * 0.3).toLocaleString()}** (30%) to Wants, and **₦${Math.round(income * 0.2).toLocaleString()}** (20%) to Savings.
2. **Current Savings**: You have **₦${remainingBalance.toLocaleString()}** left over.
3. **Action Step**: Reduce non-essential expenses by 10% next week to speed up your savings goal of **₦${savingsGoal.toLocaleString()}**!`;
      } else if (lastMessage.includes("score") || lastMessage.includes("improve my financial score")) {
        mockReply = `### How to Improve Your Financial Score
Your current report card score is **${latestReportScore}%**. Here is what to focus on:

- **Consistency**: Maintain your current **${streak}-day streak** by logging in daily.
- **Budget Control**: Keep expenses below **70%** of your income. Currently you are at **${income > 0 ? Math.round((totalExpenses / income) * 100) : 0}%**.
- **Scam Detection**: Run suspicious offers through the Scam Checker to bump your Scam Spotting rating!`;
      } else if (lastMessage.includes("scam") || lastMessage.includes("detect scam")) {
        mockReply = `### Scam Spotting Checklist
If you receive any offer via SMS, WhatsApp, or email, check for these warning signs:
1. **Guaranteed Returns**: High yield with "zero risk" is a 100% scam.
2. **Urgency**: "Deposit in 10 minutes or lose your spot."
3. **Direct Payments**: Sending money to personal accounts instead of accredited platforms.

> **Coach's Tip**: Copy/paste any text message you are unsure about into our **Scam Checker** page for a detailed safety analysis!`;
      } else if (lastMessage.includes("next step") || lastMessage.includes("recommend next step")) {
        mockReply = `### Your Recommended Next Step
Based on your level (**Level ${level}**) and roadmap progress (**${roadmapProgress}%**):

- **Next Action**: Go to your **AI Financial Roadmap** page and tick off the next incomplete task in Week 1!
- **Daily Challenge**: Complete today's daily challenge in the dashboard to earn **+20 XP** and maintain your active streak.`;
      } else if (lastMessage.includes("explain finance") || lastMessage.includes("explain finance simply")) {
        mockReply = `### Key Finance Concepts (Simplified)
Here are three simple ideas that will make you wealthy:
1. **Compound Interest**: Earning interest on your interest. It's how small amounts like **₦2,000/month** grow into millions over a decade.
2. **Pay Yourself First**: Save a fixed percentage of your income the moment you receive it, before paying bills or spending.
3. **Assets vs Liabilities**: Assets put money in your pocket (stocks, businesses, mutual funds). Liabilities take money out (expensive phones, designer clothes).`;
      } else if (lastMessage.includes("study plan") || lastMessage.includes("create study plan")) {
        mockReply = `### Your Personalized 7-Day Study Plan
- **Day 1**: Take the dynamic quiz on AtlasLearn to test your baseline score.
- **Day 2**: Read about mutual funds vs fixed deposits in Nigeria.
- **Day 3**: Ask Atlas Coach to explain inflation.
- **Day 4**: Log an expense in the Budget Planner.
- **Day 5**: Run a scam check on a sample spam message.
- **Day 6**: Spend 10 minutes reviewing your category breakdown chart.
- **Day 7**: Generate a new Financial Report Card to check your score increase!`;
      }

      return NextResponse.json({ message: mockReply });
    }

    // Map frontend generic format {role: "user" | "assistant", content: string} to Gemini contents format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `You are Atlas Coach, an encouraging, expert personal finance coach for university and high school students in Nigeria.

You have access to the user's real-time financial stats to give highly personalized, context-aware advice:
- Monthly Income: ₦${income.toLocaleString()}
- Monthly Expenses: ₦${totalExpenses.toLocaleString()}
- Current Savings Goal: ₦${savingsGoal.toLocaleString()}
- Remaining Cash Balance: ₦${remainingBalance.toLocaleString()}
- Active Daily Streak: ${streak} days
- Account Level: Level ${level} (with ${xp} XP)
- AI Roadmap Completion: ${roadmapProgress}% completed
- Latest Financial Report Card Score: ${latestReportScore}%

Coaching Rules:
1. Always reference their actual budget, streak, or goals when giving advice (e.g. "Since your expenses are ₦${totalExpenses.toLocaleString()}, you have ₦${remainingBalance.toLocaleString()} left...").
2. Keep your replies concise, actionable, and friendly.
3. Organize longer answers with clear Markdown: headings, lists, bold text, and > blockquote tips.
4. Support Nigerian context: use ₦ Naira and talk about realistic Nigerian saving/spending concepts.
5. If they ask about quick actions (like Help Me Budget, Improve Score, Explain Simply, Detect Scam, Next Step, Study Plan), structure your answer specifically to address that action with steps.

Example of personalized advice:
"Your spending increased this week. Reduce entertainment spending by 15%."
"Congratulations on your ${streak}-day streak! You are only a few days away from unlocking the Consistency Champion badge!"`;

    // Call Google AI Studio
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error("Coach API Error:", error);
    return NextResponse.json(
      { message: "Sorry! The AI Coach is currently taking a break. Please try again later." },
      { status: 500 }
    );
  }
}
