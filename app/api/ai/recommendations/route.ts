import { NextRequest, NextResponse } from "next/server";
import { openai, defaultModel, hardCapTokens } from "@/lib/ai/openai";
import { recommendationsPrompt } from "@/lib/ai/prompts";
import { checkRate } from "@/lib/ai/guard";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!checkRate(ip, "recommendations", 10, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const { origin } = body || {};

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // load profile for age
  const { data: profile } = await supabase
    .from("profiles")
    .select("age, math_level, english_level, science_level")
    .eq("id", user.id)
    .single();

  // recent attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("subject, difficulty, score_percentage, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(12);

  const recent = (attempts ?? []).map(a => ({
    subject: a.subject,
    difficulty: a.difficulty,
    score: Math.round(Number(a.score_percentage) || 0),
    when: new Date(a.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }));

  const skillLevels = profile ? {
    math: profile.math_level,
    english: profile.english_level,
    science: profile.science_level
  } : null;

  const prompt = recommendationsPrompt({
    age: profile?.age ?? null,
    skillLevels,
    recent
  });

  const maxTokens = hardCapTokens(220, process.env.OPENAI_MAX_TOKENS_SUMMARY, 350);

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      temperature: origin === "assessment" ? 0.3 : 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const json = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    return NextResponse.json({ data: json });
  } catch (e: any) {
    return NextResponse.json({ error: "AI recommendations failed", detail: e.message }, { status: 500 });
  }
}