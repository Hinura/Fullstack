import { NextRequest, NextResponse } from "next/server";
import { openai, defaultModel, hardCapTokens } from "@/lib/ai/openai";
import { recommendationsPrompt } from "@/lib/ai/prompts";
import { checkRate } from "@/lib/ai/guard";
import { requireAuth } from '@/lib/api-middleware';
import { RATE_LIMITS } from "@/lib/constants/game-config";
import { logger } from "@/lib/logger";
import { toErrorResponse } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!checkRate(ip, "recommendations", RATE_LIMITS.AI_RECOMMENDATIONS.MAX_REQUESTS, RATE_LIMITS.AI_RECOMMENDATIONS.WINDOW_MS)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const { origin } = body || {};

  const auth = await requireAuth(req)
  if (auth.error) return auth.error
  const { user, supabase } = auth

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
  } catch (error: unknown) {
    logger.error("AI recommendations generation failed", error, { userId: user.id, ip });
    const response = toErrorResponse(error);
    return NextResponse.json(response, { status: response.statusCode });
  }
}