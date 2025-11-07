import { NextRequest, NextResponse } from "next/server";
import { openai, defaultModel, hardCapTokens } from "@/lib/ai/openai";
import { hintPrompt } from "@/lib/ai/prompts";
import { checkRate, getCache, setCache } from "@/lib/ai/guard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!checkRate(ip, "hint", 30, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const { subject, age, difficulty, question, options } = body || {};

  if (!subject || !question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // cache key = subject|question text fingerprint
  const key = `hint:${subject}:${question.slice(0, 200)}`;
  const cached = getCache(key);
  if (cached) return NextResponse.json({ data: cached });

  const prompt = hintPrompt({ subject, age: Number(age) || null, difficulty, question, options });
  const maxTokens = hardCapTokens(120, process.env.OPENAI_MAX_TOKENS_HINT, 200);

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(text);
    setCache(key, json, 5 * 60_000); // 5 min
    return NextResponse.json({ data: json });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: "AI hint failed", detail: e.message }, { status: 500 });
  }
}