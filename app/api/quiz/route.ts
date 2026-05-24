import { NextResponse } from 'next/server';

const MOCK_QUESTIONS = [
  {
    id: 1, difficulty: "Easy",
    question: "What is a budget?",
    options: ["A wish list of things to buy", "A plan for managing income and expenses", "A type of savings account", "A government tax document"],
    correctIndex: 1,
    explanation: "A budget is a financial plan that tracks your income and expenses so you can make informed spending decisions."
  },
  {
    id: 2, difficulty: "Medium",
    question: "What is compound interest?",
    options: ["Interest calculated solely on the principal", "Interest calculated on the initial principal and accumulated interest", "A penalty fee for late payments", "A flat rate bank fee"],
    correctIndex: 1,
    explanation: "Compound interest is 'interest on interest' — your earnings are reinvested to generate even more earnings over time."
  },
  {
    id: 3, difficulty: "Hard",
    question: "What is an ETF?",
    options: ["Emergency Trust Fund", "Exchange Traded Fund", "Electronic Transfer Fee", "Early Tax Filing"],
    correctIndex: 1,
    explanation: "An Exchange Traded Fund (ETF) is a basket of securities that trades on a stock exchange, offering built-in diversification."
  },
  {
    id: 4, difficulty: "Easy",
    question: "What should you do before investing in the stock market?",
    options: ["Borrow money to invest", "Build an emergency fund first", "Quit your job", "Buy a new car"],
    correctIndex: 1,
    explanation: "Always build an emergency fund covering 3–6 months of expenses before exposing capital to market risk."
  },
  {
    id: 5, difficulty: "Medium",
    question: "What does the 50/30/20 budgeting rule suggest?",
    options: ["50% savings, 30% wants, 20% needs", "50% needs, 30% wants, 20% savings/debt", "50% investments, 30% needs, 20% fun", "50% income tax, 30% rent, 20% food"],
    correctIndex: 1,
    explanation: "The 50/30/20 rule: 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment."
  },
  {
    id: 6, difficulty: "Hard",
    question: "What does 'diversification' mean in investing?",
    options: ["Putting all money into one stock", "Spreading investments across different assets to reduce risk", "Changing jobs frequently", "Buying only government bonds"],
    correctIndex: 1,
    explanation: "Diversification spreads your investments so a loss in one area doesn't wipe out your entire portfolio."
  },
  {
    id: 7, difficulty: "Easy",
    question: "What is a credit score used for?",
    options: ["Determining how smart you are", "Measuring your ability to repay loans", "Tracking your savings balance", "Calculating your annual income"],
    correctIndex: 1,
    explanation: "A credit score reflects your creditworthiness — lenders use it to decide whether to approve loans and at what interest rate."
  },
  {
    id: 8, difficulty: "Medium",
    question: "What is the difference between a debit card and a credit card?",
    options: ["There is no difference", "A debit card uses your own money; a credit card borrows money", "A credit card is only for businesses", "A debit card charges interest"],
    correctIndex: 1,
    explanation: "A debit card draws directly from your bank balance, while a credit card lets you borrow money you must repay — often with interest."
  },
  {
    id: 9, difficulty: "Hard",
    question: "What is inflation's main effect on purchasing power?",
    options: ["It increases purchasing power", "It decreases purchasing power over time", "It has no effect on purchasing power", "It only affects luxury goods"],
    correctIndex: 1,
    explanation: "Inflation erodes purchasing power — the same amount of money buys fewer goods and services as prices rise over time."
  },
  {
    id: 10, difficulty: "Easy",
    question: "What is an emergency fund?",
    options: ["Money set aside for vacations", "Money saved for unexpected expenses like job loss or medical bills", "A retirement account", "A loan from the bank"],
    correctIndex: 1,
    explanation: "An emergency fund is a readily accessible cash reserve to cover unexpected expenses without going into debt."
  },
  {
    id: 11, difficulty: "Medium",
    question: "What does APR stand for in finance?",
    options: ["Annual Profit Rate", "Annual Percentage Rate", "Adjusted Payment Ratio", "Asset Purchase Requirement"],
    correctIndex: 1,
    explanation: "APR (Annual Percentage Rate) represents the yearly cost of borrowing money, including fees and interest."
  },
  {
    id: 12, difficulty: "Hard",
    question: "Which type of account typically offers the highest interest rate?",
    options: ["Current account", "Regular savings account", "Fixed deposit / term deposit", "Salary account"],
    correctIndex: 2,
    explanation: "Fixed deposit accounts lock your money for a set period, which is why banks reward you with a higher interest rate."
  },
  {
    id: 13, difficulty: "Easy",
    question: "What is a liability?",
    options: ["Something you own that has value", "Money owed to someone else", "A type of investment", "A bank account with high interest"],
    correctIndex: 1,
    explanation: "A liability is a financial obligation — money you owe to others, such as a loan, mortgage, or credit card debt."
  },
  {
    id: 14, difficulty: "Medium",
    question: "What is the purpose of a tax-advantaged retirement account (like a pension)?",
    options: ["To pay current taxes immediately", "To grow retirement savings with tax benefits", "To avoid paying any taxes ever", "To store physical gold"],
    correctIndex: 1,
    explanation: "Tax-advantaged accounts let your retirement savings grow with reduced tax liability, helping you build wealth faster."
  },
  {
    id: 15, difficulty: "Hard",
    question: "What is dollar-cost averaging?",
    options: ["Buying a currency at the lowest possible price", "Investing a fixed amount at regular intervals regardless of price", "Converting all savings to USD", "Averaging the cost of daily expenses"],
    correctIndex: 1,
    explanation: "Dollar-cost averaging means investing a consistent amount regularly, buying more shares when prices are low and fewer when high."
  },
  {
    id: 16, difficulty: "Easy",
    question: "Which of the following is an example of a fixed expense?",
    options: ["Groceries", "Monthly rent", "Entertainment outings", "Clothing"],
    correctIndex: 1,
    explanation: "Fixed expenses remain constant each month — rent, mortgage payments, and insurance premiums are common examples."
  },
  {
    id: 17, difficulty: "Medium",
    question: "What is net worth?",
    options: ["Total income earned per year", "Assets minus liabilities", "The balance in your savings account", "Your monthly take-home pay"],
    correctIndex: 1,
    explanation: "Net worth = Total Assets − Total Liabilities. It is the most accurate snapshot of your overall financial health."
  },
  {
    id: 18, difficulty: "Hard",
    question: "What is a bull market?",
    options: ["A market where prices are falling", "A market characterised by rising prices and investor optimism", "A market for agricultural goods", "A market with no trading activity"],
    correctIndex: 1,
    explanation: "A bull market is a period of rising stock prices (typically 20%+ from recent lows), driven by strong economic conditions and investor confidence."
  },
  {
    id: 19, difficulty: "Medium",
    question: "Why is it important to pay yourself first?",
    options: ["To avoid paying bills", "To ensure savings happen before discretionary spending", "To get a higher salary", "To reduce income tax immediately"],
    correctIndex: 1,
    explanation: "'Pay yourself first' means automatically moving money into savings before spending on anything else, building wealth consistently."
  },
  {
    id: 20, difficulty: "Hard",
    question: "What is liquidity in personal finance?",
    options: ["The interest rate on a loan", "How easily an asset can be converted to cash without losing value", "The total amount of debt owed", "Monthly cashflow from investments"],
    correctIndex: 1,
    explanation: "Liquidity describes how quickly and easily an asset can be turned into cash. Cash is the most liquid asset; real estate is relatively illiquid."
  }
];

export async function GET() {
  try {
    return NextResponse.json({ questions: MOCK_QUESTIONS });
  } catch (error) {
    console.error("Quiz API Error:", error);
    return NextResponse.json(
      { message: "Failed to load quiz questions." },
      { status: 500 }
    );
  }
}
