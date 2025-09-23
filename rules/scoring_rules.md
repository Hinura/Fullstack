# Scoring & Adaptive Rules (MVP)

## Scoring
- correctness: boolean from `checkAnswer(exerciseId, userAnswer)`
- points: **10 if correct**, else **0**
- optional v2: **streak bonus** (+5 for every 3 consecutive correct answers)

## Adaptive Difficulty (3 levels: easy=1, medium=2, hard=3)
Let `r` = correct rate of the last 5 answers for the topic:
- if `r >= 0.8` → increase difficulty by 1 (max 3)
- if `r <= 0.4` → decrease difficulty by 1 (min 1)
- else keep current level

---

## Pseudocode

```js
function checkAnswer(exerciseId, userAnswer) {
  const ex = find(exercises, e => e.id === exerciseId)
  return ex && Number(userAnswer) === ex.answer
}
