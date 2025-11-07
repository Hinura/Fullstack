import { NextRequest, NextResponse } from "next/server";
import { openai, defaultModel, hardCapTokens } from "@/lib/ai/openai";
import { explanationPrompt } from "@/lib/ai/prompts";
import { checkRate } from "@/lib/ai/guard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!checkRate(ip, "explain", 20, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const { subject, age, question, options, correctAnswer, userAnswer } = body || {};
  if (!subject || !question || !Array.isArray(options) || !correctAnswer) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const prompt = explanationPrompt({
    subject,
    age: Number(age) || null,
    question,
    options,
    correctAnswer,
    userAnswer: userAnswer ?? null,
  });

  const maxTokens = hardCapTokens(180, process.env.OPENAI_MAX_TOKENS_EXPLAIN, 300);

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const json = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    return NextResponse.json({ data: json });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: "AI explanation failed", detail: e.message }, { status: 500 });
  }
}