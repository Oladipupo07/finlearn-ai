import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

// Heuristics for mock report card fallback
function generateMockReportCard(stats: any) {
  const { budget, gamification, streak, quizzes } = stats;

  const income = Number(budget?.income || 0);
  const totalExpenses = Number(budget?.totalExpenses || 0);
  const savingsGoal = Number(budget?.savingsGoal || 100000);
  const remaining = income - totalExpenses;
  
  // Calculate scores
  const budgetScore = income > 0 ? Math.round(Math.max(0, 100 - (totalExpenses / income) * 100)) : 50;
  const savingsScore = savingsGoal > 0 ? Math.round(Math.min(100, (Math.max(0, remaining) / savingsGoal) * 100)) : 50;
  
  // Learning Score based on quizzes and AI questions
  let quizAvg = 70;
  if (quizzes && quizzes.length > 0) {
    const totalScore = quizzes.reduce((sum: number, q: any) => sum + (q.score / (q.total || 5)) * 100, 0);
    quizAvg = Math.round(totalScore / quizzes.length);
  }
  const aiCount = Number(gamification?.aiQuestionsCount || 0);
  const learningScore = Math.round(Math.min(100, (quizAvg * 0.7) + (aiCount * 6)));

  // Scam Awareness Score
  const scamChecks = Number(gamification?.scamChecksCount || 0);
  const scamScore = Math.round(Math.min(100, 40 + (scamChecks * 15)));

  // Consistency Score
  const curStreak = Number(streak?.currentStreak || 0);
  const maxStreak = Number(streak?.longestStreak || 0);
  const consistencyScore = Math.round(Math.min(100, 30 + (curStreak * 10) + (maxStreak * 2)));

  // Overall Score (Weighted average)
  const overallScore = Math.round(
    (budgetScore * 0.3) +
    (savingsScore * 0.25) +
    (learningScore * 0.15) +
    (scamScore * 0.15) +
    (consistencyScore * 0.15)
  );

  // Generate Strengths, Weaknesses, Recommendations based on scores
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (budgetScore >= 75) {
    strengths.push("Excellent budgeting: You keep your monthly expenses well within your income limits.");
  } else {
    weaknesses.push("High spending: Your monthly expenses consume a significant portion of your income.");
    recommendations.push("Implement the 50/30/20 budget rule to divide your income into fixed needs, wants, and savings.");
  }

  if (savingsScore >= 50) {
    strengths.push("Good savings progress: You are moving steadily towards your savings target.");
  } else {
    weaknesses.push("Insufficient emergency buffer: Your remaining balance is low relative to your savings goal.");
    recommendations.push("Set up automatic weekly savings of ₦2,000 to steadily build up your financial cushion.");
  }

  if (learningScore >= 70) {
    strengths.push("Active learning: You complete quizzes regularly and use AI to expand your finance knowledge.");
  } else {
    weaknesses.push("Low quiz activity: You haven't completed many finance quizzes recently.");
    recommendations.push("Set a goal to complete at least one finance quiz per week on AtlasLearn.");
  }

  if (scamScore >= 75) {
    strengths.push("High scam awareness: You actively analyze suspicious messages using the scam checker.");
  } else {
    weaknesses.push("Vulnerability to online fraud: You rarely test messages with the scam checker.");
    recommendations.push("Double check any SMS or WhatsApp message promising quick wealth with the Scam Checker.");
  }

  if (consistencyScore >= 70) {
    strengths.push("Consistency: You have maintained a solid daily learning streak on the platform.");
  } else {
    weaknesses.push("Inconsistent routine: Your daily streak is low.");
    recommendations.push("Log in daily to read the quick AI tip and maintain your streak.");
  }

  // Ensure default items if lists are empty
  if (strengths.length === 0) strengths.push("Starting your financial journey: You've set up your AtlasLearn account!");
  if (weaknesses.length === 0) weaknesses.push("None identified! Maintain your current financial habits.");
  if (recommendations.length === 0) recommendations.push("Continue learning and complete the remaining badges to unlock Atlas Scholar.");

  return {
    score: overallScore,
    categories: {
      budgeting: budgetScore,
      savings: savingsScore,
      learning: learningScore,
      scamAwareness: scamScore,
      consistency: consistencyScore
    },
    strengths,
    weaknesses,
    recommendations
  };
}

export async function POST(req: Request) {
  try {
    const stats = await req.json();

    // Check if API Key exists and is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here" || process.env.GEMINI_API_KEY === "mock-key") {
      const mockReport = generateMockReportCard(stats);
      return NextResponse.json(mockReport);
    }

    const prompt = `Analyze the following user financial statistics and generate a Financial Report Card.
User Stats:
- Monthly Income: ₦${stats.budget?.income || 0}
- Monthly Expenses: ₦${stats.budget?.totalExpenses || 0}
- Remaining Balance: ₦${(stats.budget?.income || 0) - (stats.budget?.totalExpenses || 0)}
- Savings Goal: ₦${stats.budget?.savingsGoal || 100000}
- Quizzes Completed: ${stats.quizzes?.length || 0}
- Daily Streak: ${stats.streak?.currentStreak || 0} days
- Longest Streak: ${stats.streak?.longestStreak || 0} days
- AI Tutor Questions Asked: ${stats.gamification?.aiQuestionsCount || 0}
- Scam Checks Run: ${stats.gamification?.scamChecksCount || 0}
- Budgets Created: ${stats.gamification?.budgetsCreatedCount || 0}

Evaluate this data and return ONLY a JSON object that adheres to this structure:
{
  "score": 85, // Overall financial score between 0 and 100
  "categories": {
    "budgeting": 80, // Score 0-100
    "savings": 65, // Score 0-100
    "learning": 90, // Score 0-100
    "scamAwareness": 75, // Score 0-100
    "consistency": 85 // Score 0-100
  },
  "strengths": [
    "Strength 1 description with context",
    "Strength 2 description"
  ],
  "weaknesses": [
    "Weakness 1 description",
    "Weakness 2 description"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}

Ensure evaluations and suggestions are culturally relevant to Nigeria (mentioning Naira ₦ where appropriate) and tailored specifically to the user's statistics. Make sure the JSON is valid parseable JSON. Do not include markdown tags other than the JSON itself.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    if (typeof parsedData.score !== 'number' || !parsedData.categories) {
      throw new Error("Invalid output format from model");
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Report Card API Error:", error);
    try {
      const stats = await req.json();
      const fallback = generateMockReportCard(stats);
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json(
        { error: "Failed to generate report card." },
        { status: 500 }
      );
    }
  }
}
