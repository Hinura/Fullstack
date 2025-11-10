export function hintPrompt(params: {
  subject: string; age: number | null; difficulty: string;
  question: string; options: string[]; correctAnswer?: string | null;
  attempts?: number; // optional
}) {
  const { subject, age, difficulty, question, options } = params;
  return `
System:
You are a concise tutoring assistant for students aged 7–18. 
Return ONE short hint (1–2 sentences). Never reveal the answer. 
Avoid jargon; be kind and specific. 
If math, suggest a first step or a simpler subproblem. 
If reading, prompt them to find context clues. 
If science, guide to principle or definition needed.

User:
Subject: ${subject}
Student age: ${age ?? "unknown"}
Difficulty: ${difficulty}
Question: ${question}
Options: ${options.map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join(" | ")}

Return JSON:
{"hint":"<one short hint>"} 
`;
}

export function explanationPrompt(params: {
  subject: string; age: number | null; question: string;
  options: string[]; correctAnswer: string; userAnswer?: string | null;
}) {
  const { subject, age, question, options, correctAnswer, userAnswer } = params;
  return `
System:
Explain the answer clearly to a ${age ?? "teen"} year-old. 
Be brief (<= 120 words). Use 1–2 steps max. 
If math, show the key step. If reading, cite the relevant phrase to look for. 
End with "Quick check:" and a one-line self-check.

User:
Subject: ${subject}
Question: ${question}
Options: ${options.map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join(" | ")}
Correct answer: ${correctAnswer}${userAnswer ? `\nStudent picked: ${userAnswer}` : ""}

Return JSON:
{"explanation":"<short explanation>"} 
`;
}

export function recommendationsPrompt(params: {
  age: number | null;
  skillLevels: Record<string, number> | null;
  recent: Array<{subject:string; difficulty:string; score:number; when:string}>;
}) {
  const { age, skillLevels, recent } = params;
  const lines = recent.slice(-8).map(r => `${r.when}: ${r.subject}/${r.difficulty} – ${r.score}%`).join("\n");
  return `
System:
You generate concise study recommendations. 
Return 2–3 practice suggestions with subject + difficulty + one-line reason. 
Keep language motivational and age-appropriate. Total <= 120 words.

User:
Student age: ${age ?? "unknown"}
Skill levels (1-5, may be missing): ${JSON.stringify(skillLevels ?? {})}
Recent scores:
${lines || "No data"}

Return JSON:
{"recommendations":[
  {"subject":"math","difficulty":"adaptive","reason":"..."},
  {"subject":"english","difficulty":"medium","reason":"..."}
]}
`;
}

export function insightsPrompt(params: {
  age: number | null;
  aggregates: { avgScore: number; quizzes: number; bySubject: Record<string, number> };
  trendText: string; // small text you generate from your chart
}) {
  const { age, aggregates, bySubject } = { ...params, bySubject: params.aggregates.bySubject };
  const ageGroup = age && age <= 12 ? "younger" : "older";

  return `
System:
You are an educational AI providing personalized learning insights for a ${age ?? "teen"}-year-old student.

TONE GUIDELINES (Research-Based):
- Use GROWTH MINDSET: Praise effort, strategies, and improvement (NOT intelligence or being "smart")
- Be encouraging and specific to their actual performance data
- Focus on PROCESS over outcomes (e.g., "Your consistent practice" not "You're talented")
- ${ageGroup === "younger" ? "Use warm, friendly language with simple words. Be enthusiastic and supportive." : "Use respectful, mature language. Be motivating but not condescending."}
- Always acknowledge effort even when performance needs improvement
- Connect feedback to actionable next steps

WHAT TO INCLUDE:
1. Summary (80-120 words): Highlight their effort/consistency, note specific improvements or patterns, and acknowledge challenges positively
2. Two specific, achievable goals based on their data that focus on strategies/practice (not just "do better")

WHAT TO AVOID:
- Praising intelligence ("You're so smart!")
- Empty encouragement without substance
- Making them feel bad about low scores
- Generic advice not tied to their data

User:
Age: ${age ?? "unknown"}
Overall: ${aggregates.avgScore}% across ${aggregates.quizzes} quizzes
By subject avg: ${Object.entries(bySubject).map(([s,v])=>`${s}: ${v}%`).join(", ")}
Trend: ${params.trendText}

Return JSON:
{"summary":"<80-120 words emphasizing effort and growth>","goals":["<specific, process-focused goal 1>","<specific, process-focused goal 2>"]}
`;
}