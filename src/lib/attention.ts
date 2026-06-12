import type { AttentionMatrix, AttentionTensor, TokenInsight } from '../types/attention';

export function getLayerMatrix(attentions: AttentionTensor, layerIndex: number, headIndex: number) {
  return attentions[layerIndex]?.[headIndex] ?? [];
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function normalizeScore(value: number) {
  return Number.isFinite(value) ? clamp01(value) : 0;
}

export function buildTokenInsights(tokens: string[], matrix: AttentionMatrix): TokenInsight[] {
  return tokens.map((token, index) => {
    const row = matrix[index] ?? [];
    const scored = row.map((score, targetIndex) => ({
      token: tokens[targetIndex] ?? `[${targetIndex}]`,
      index: targetIndex,
      score: normalizeScore(score),
    }));

    const topTokens = [...scored]
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);

    const [bestToken] = topTokens;

    return {
      token,
      index,
      bestMatch: bestToken?.token ?? token,
      bestMatchIndex: bestToken?.index ?? index,
      bestScore: bestToken?.score ?? 0,
      topTokens,
    };
  });
}

export function buildGraphEdges(matrix: AttentionMatrix, threshold: number) {
  const edges: Array<{
    source: number;
    target: number;
    score: number;
  }> = [];

  matrix.forEach((row, source) => {
    const ranked = row
      .map((score, target) => ({ target, score: normalizeScore(score) }))
      .filter((entry) => entry.score >= threshold)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);

    ranked.forEach((entry) => {
      edges.push({
        source,
        target: entry.target,
        score: entry.score,
      });
    });
  });

  return edges;
}
