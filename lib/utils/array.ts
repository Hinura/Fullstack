// lib/utils/array.ts
// Array utility functions

/**
 * Fisher-Yates shuffle algorithm (unbiased)
 * Better than Array.sort(() => Math.random() - 0.5)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Get random items from array without replacement
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  if (count >= array.length) return shuffleArray(array)

  const shuffled = shuffleArray(array)
  return shuffled.slice(0, count)
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }

  return chunks
}

// REPLACE THIS:
// questions.sort(() => Math.random() - 0.5)
//
// WITH THIS:
// import { shuffleArray } from '@/lib/utils/array'
// const shuffled = shuffleArray(questions)
