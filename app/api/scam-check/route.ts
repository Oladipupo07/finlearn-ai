import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a financial scam detection assistant.

Analyze messages and determine whether they may be scams.

Focus on:
- urgency
- guaranteed profits
- suspicious payment requests
- fake investment promises
- phishing attempts

Keep explanations beginner-friendly and concise.

At the end include:
Risk Level: Low / Medium / High
`,
        },
        {
          role: "user",
          content: body.message,
        },
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });
  } catch (error) {
    return Response.json({
      error: "Something went wrong.",
    });
  }
}
