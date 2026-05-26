import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "mock-key",
});

// Helper for mock roadmap fallback
function generateMockRoadmap(inputs: {
  age: number;
  isStudent: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  financialGoal: string;
}) {
  const { age, isStudent, monthlyIncome, monthlyExpenses, savingsGoal, financialGoal } = inputs;
  
  let title = `Personalized ${financialGoal} Plan`;
  let weeks = [];

  if (financialGoal.toLowerCase().includes("budget")) {
    title = "Your 30-Day Budgeting Mastery Plan";
    weeks = [
      {
        weekNumber: 1,
        title: "Week 1: Tracking & Awareness",
        goal: "Understand your current cash flow and list all fixed vs variable expenses.",
        learningRecommendation: "Read about the 50/30/20 budgeting rule.",
        tasks: [
          { id: "w1_t1", text: `Log your current income of ₦${monthlyIncome.toLocaleString()} and expenses of ₦${monthlyExpenses.toLocaleString()} in the Budget Planner`, completed: false },
          { id: "w1_t2", text: "Identify 3 non-essential subscriptions or spending habits to cut back", completed: false },
          { id: "w1_t3", text: "Categorize all purchases made in the last 7 days", completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Week 2: Designing Your Budget Structure",
        goal: "Set realistic targets for categories like food, transport, and utilities.",
        learningRecommendation: "Learn how to build a zero-based budget.",
        tasks: [
          { id: "w2_t1", text: "Create limits for food and entertainment categories in the app", completed: false },
          { id: "w2_t2", text: "Allocate 20% of your remaining balance to savings directly", completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Week 3: Implementation & Discipline",
        goal: "Stick to your limits and find alternative low-cost options.",
        learningRecommendation: "Discover smart saving tips for students in Nigeria.",
        tasks: [
          { id: "w3_t1", text: "Cook at home instead of ordering takeout at least 4 times", completed: false },
          { id: "w3_t2", text: "Check your remaining budget balance before making any purchase", completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Week 4: Review & Reflection",
        goal: "Compare actual spending against your budget limits.",
        learningRecommendation: "Learn how to adjust your budget for next month.",
        tasks: [
          { id: "w4_t1", text: "Generate a report card to see your budgeting consistency", completed: false },
          { id: "w4_t2", text: "Adjust next month's limits based on what you spent this week", completed: false }
        ]
      }
    ];
  } else if (financialGoal.toLowerCase().includes("invest")) {
    title = "Your 30-Day Smart Investing Blueprint";
    weeks = [
      {
        weekNumber: 1,
        title: "Week 1: Investment Foundations",
        goal: "Understand the differences between stocks, bonds, and mutual funds.",
        learningRecommendation: "Read the Guide to Compound Interest.",
        tasks: [
          { id: "w1_t1", text: "Define your risk tolerance (Conservative, Moderate, or Aggressive)", completed: false },
          { id: "w1_t2", text: "Calculate how compound interest grows a monthly investment of ₦5,000", completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Week 2: Nigeria's Investment Options",
        goal: "Identify safe and regulated investment opportunities in Nigeria.",
        learningRecommendation: "Learn about FGN Savings Bonds and Treasury Bills.",
        tasks: [
          { id: "w2_t1", text: "Research 2 SEC-regulated fintech platforms for investing", completed: false },
          { id: "w2_t2", text: "Compare the interest rate of a standard bank account vs a mutual fund", completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Week 3: Diversification and ETFs",
        goal: "Learn how to build a portfolio that spreads risk across asset classes.",
        learningRecommendation: "Understand Mutual Funds vs Exchange Traded Funds (ETFs).",
        tasks: [
          { id: "w3_t1", text: "Write down a hypothetical portfolio mix (e.g. 70% equities, 30% fixed income)", completed: false },
          { id: "w3_t2", text: "Explain the risk of putting all your money in a single company stock", completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Week 4: Setting Up Your Plan",
        goal: "Start your dollar-cost averaging journey with low amounts.",
        learningRecommendation: "Master consistency over timing the market.",
        tasks: [
          { id: "w4_t1", text: "Commit to allocating ₦2,000 monthly to an index fund or mutual fund", completed: false },
          { id: "w4_t2", text: "Complete the investment quiz on AtlasLearn to test your knowledge", completed: false }
        ]
      }
    ];
  } else {
    // Default fallback roadmap
    title = `Your 30-Day Growth Plan: ${financialGoal}`;
    weeks = [
      {
        weekNumber: 1,
        title: "Week 1: Assessment & Setup",
        goal: "Analyze your current habits and establish concrete targets.",
        learningRecommendation: "Read general personal finance principles.",
        tasks: [
          { id: "w1_t1", text: `Review your target savings goal of ₦${savingsGoal.toLocaleString()}`, completed: false },
          { id: "w1_t2", text: "Track all daily expenses in your budget log", completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: "Week 2: Knowledge Building",
        goal: "Deep dive into financial literature related to your goal.",
        learningRecommendation: `Learn key strategies for: ${financialGoal}`,
        tasks: [
          { id: "w2_t1", text: "Ask Atlas Coach 3 specific questions about your financial goal", completed: false },
          { id: "w2_t2", text: "Write down 2 actions that will help you prevent impulse purchases", completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: "Week 3: Behavioral Adjustments",
        goal: "Implement changes in your routine to improve outcomes.",
        learningRecommendation: "How to stay motivated while saving.",
        tasks: [
          { id: "w3_t1", text: "Save at least ₦1,000 extra this week by skipping a non-essential", completed: false },
          { id: "w3_t2", text: "Complete the daily finance challenge in the dashboard", completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: "Week 4: Review and Next Steps",
        goal: "Measure your success and set the plan for next month.",
        learningRecommendation: "Setting lifelong financial milestones.",
        tasks: [
          { id: "w4_t1", text: "Review your task completions and budget control percentage", completed: false },
          { id: "w4_t2", text: "Establish 3 new habits to carry forward into the next month", completed: false }
        ]
      }
    ];
  }

  return { title, weeks };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { age, isStudent, monthlyIncome, monthlyExpenses, savingsGoal, financialGoal } = body;

    // Check if API Key exists and is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here" || process.env.GEMINI_API_KEY === "mock-key") {
      const mockRoadmap = generateMockRoadmap({
        age: Number(age || 20),
        isStudent: Boolean(isStudent),
        monthlyIncome: Number(monthlyIncome || 0),
        monthlyExpenses: Number(monthlyExpenses || 0),
        savingsGoal: Number(savingsGoal || 0),
        financialGoal: String(financialGoal || "Learn budgeting")
      });
      return NextResponse.json(mockRoadmap);
    }

    const prompt = `Generate a 4-week personalized financial roadmap for a ${age}-year-old ${isStudent ? 'student' : 'non-student'} with a monthly income of ₦${monthlyIncome}, monthly expenses of ₦${monthlyExpenses}, savings goal of ₦${savingsGoal}, and primary financial goal: "${financialGoal}".`;

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
        systemInstruction: `You are an expert financial advisor. Create a personalized 4-week financial learning and growth roadmap based on the user's details.
Return ONLY a JSON object that strictly adheres to the following structure:
{
  "title": "Roadmap title, e.g. Your 30-Day Budgeting Journey",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Week Title",
      "goal": "Week 1 goal description",
      "learningRecommendation": "Recommended topic/article to learn",
      "tasks": [
        { "id": "w1_t1", "text": "Task 1 text", "completed": false },
        { "id": "w1_t2", "text": "Task 2 text", "completed": false },
        { "id": "w1_t3", "text": "Task 3 text", "completed": false }
      ]
    },
    ...
  ]
}
Each week must have between 2 and 4 realistic, actionable tasks. For each task, generate a unique ID string like 'wX_tY' (where X is the week number and Y is the task number, e.g. w1_t1, w1_t2, w2_t1). All tasks must start with completed: false.
The recommendations and tasks must be culturally relevant to Nigeria (mentioning Naira ₦ and Nigerian financial context if relevant).
Do not include any formatting other than the raw JSON itself. Make sure it is valid parseable JSON.`
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    if (!parsedData.title || !parsedData.weeks) {
      throw new Error("Invalid output format from model");
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Roadmap API Error:", error);
    // Fallback to mock roadmap
    try {
      const body = await req.json();
      const fallback = generateMockRoadmap({
        age: Number(body.age || 20),
        isStudent: Boolean(body.isStudent),
        monthlyIncome: Number(body.monthlyIncome || 0),
        monthlyExpenses: Number(body.monthlyExpenses || 0),
        savingsGoal: Number(body.savingsGoal || 0),
        financialGoal: String(body.financialGoal || "Learn budgeting")
      });
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json(
        { error: "Failed to generate roadmap." },
        { status: 500 }
      );
    }
  }
}
