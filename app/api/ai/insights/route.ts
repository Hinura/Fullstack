import { NextRequest, NextResponse } from "next/server";
import { openai, defaultModel, hardCapTokens } from "@/lib/ai/openai";
import { insightsPrompt } from "@/lib/ai/prompts";
import { checkRate } from "@/lib/ai/guard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!checkRate(ip, "insights", 8, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  // Expect: { age, aggregates: { avgScore, quizzes, bySubject }, trendText }
  const { age, aggregates, trendText } = body || {};
  if (!aggregates) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const prompt = insightsPrompt({ age: Number(age) || null, aggregates, trendText: trendText || "" });
  const maxTokens = hardCapTokens(240, process.env.OPENAI_MAX_TOKENS_SUMMARY, 350);

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
  } catch (e: any) {
    return NextResponse.json({ error: "AI insights failed", detail: e.message }, { status: 500 });
  }
}