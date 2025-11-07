// lib/ai/openai.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY!;
export const openai = new OpenAI({ apiKey });

export const defaultModel =
  process.env.OPENAI_MODEL || "gpt-4o-mini"; // sensible default

export function hardCapTokens(requested: number, envCap: string | undefined, absoluteMax: number) {
  const cap = Number(envCap ?? 0);
  if (Number.isFinite(cap) && cap > 0) return Math.min(requested, cap, absoluteMax);
  return Math.min(requested, absoluteMax);
}

// Very small utility to keep prompts compact
export function trim(str: string, max = 6000) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "\n\n…(truncated)";
}