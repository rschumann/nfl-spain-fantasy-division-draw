import type { DeterministicRandomStream } from './random-stream.js';

export function fisherYatesShuffle<T>(
  items: readonly T[],
  stream: DeterministicRandomStream
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = stream.nextUniformInt(i + 1);
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}
