import type {
  AttentionMatrix,
  AttentionTensor,
  TokenInsight,
} from "../types/attention";

/**
 * Clamp value between 0 and 1
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Safe normalization for attention scores
 */
export function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    console.warn("[normalizeScore] Invalid value:", value);
    return 0;
  }

  return clamp01(value);
}

/**
 * Normalize an entire attention row
 * Ensures row sums to 1
 */
export function normalizeRow(row: number[]): number[] {
  if (!row.length) {
    console.warn("[normalizeRow] Empty row received");
    return [];
  }

  const cleaned = row.map((v) =>
    Number.isFinite(v) ? Math.max(v, 0) : 0
  );

  const sum = cleaned.reduce((acc, curr) => acc + curr, 0);

  if (sum === 0) {
    console.warn("[normalizeRow] Row sum is zero", row);

    return cleaned.map(() => 0);
  }

  return cleaned.map((v) => v / sum);
}

/**
 * Get matrix for selected layer/head
 */
export function getLayerMatrix(
  attentions: AttentionTensor,
  layerIndex: number,
  headIndex: number
): AttentionMatrix {
  console.group(
    `[Attention] Loading Layer=${layerIndex}, Head=${headIndex}`
  );

  if (!attentions?.length) {
    console.error("[Attention] Empty attention tensor");
    console.groupEnd();
    return [];
  }

  if (layerIndex < 0 || layerIndex >= attentions.length) {
    console.error(
      `[Attention] Invalid layer index ${layerIndex}`
    );
    console.groupEnd();
    return [];
  }

  const layer = attentions[layerIndex];

  if (!layer?.length) {
    console.error(
      `[Attention] Layer ${layerIndex} is empty`
    );
    console.groupEnd();
    return [];
  }

  if (headIndex < 0 || headIndex >= layer.length) {
    console.error(
      `[Attention] Invalid head index ${headIndex}`
    );
    console.groupEnd();
    return [];
  }

  const matrix = layer[headIndex];

  console.log(
    `[Attention] Matrix Size: ${matrix.length} x ${
      matrix[0]?.length ?? 0
    }`
  );

  console.groupEnd();

  return matrix ?? [];
}

/**
 * Build token insights
 */
export function buildTokenInsights(
  tokens: string[],
  matrix: AttentionMatrix
): TokenInsight[] {
  console.group("[TokenInsights]");

  if (!tokens.length) {
    console.warn("[TokenInsights] Empty token list");
    console.groupEnd();
    return [];
  }

  const insights = tokens.map((token, sourceIndex) => {
    const rawRow = matrix[sourceIndex] ?? [];

    const row = normalizeRow(rawRow);

    const scored = row
      .map((score, targetIndex) => ({
        token: tokens[targetIndex] ?? `[${targetIndex}]`,
        index: targetIndex,
        score,
      }))
      .filter((item) => item.index !== sourceIndex);

    const topTokens = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const bestToken = topTokens[0];

    const result: TokenInsight = {
      token,
      index: sourceIndex,
      bestMatch: bestToken?.token ?? token,
      bestMatchIndex:
        bestToken?.index ?? sourceIndex,
      bestScore: bestToken?.score ?? 0,
      topTokens,
    };

    console.log(
      `[Token ${sourceIndex}] "${token}" → "${result.bestMatch}" (${(
        result.bestScore * 100
      ).toFixed(2)}%)`
    );

    return result;
  });

  console.groupEnd();

  return insights;
}

/**
 * Build graph edges from attention matrix
 */
export function buildGraphEdges(
  matrix: AttentionMatrix,
  threshold = 0.05
) {
  console.group("[GraphEdges]");

  const edges: Array<{
    source: number;
    target: number;
    score: number;
  }> = [];

  matrix.forEach((rawRow, sourceIndex) => {
    const row = normalizeRow(rawRow);

    const ranked = row
      .map((score, targetIndex) => ({
        target: targetIndex,
        score,
      }))
      .filter(
        (item) =>
          item.target !== sourceIndex &&
          item.score >= threshold
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    ranked.forEach((item) => {
      edges.push({
        source: sourceIndex,
        target: item.target,
        score: item.score,
      });
    });
  });

  console.log(
    `Generated ${edges.length} edges`
  );

  const strongestEdge = [...edges].sort(
    (a, b) => b.score - a.score
  )[0];

  if (strongestEdge) {
    console.log(
      "Strongest Edge:",
      strongestEdge
    );
  }

  console.groupEnd();

  return edges;
}

/**
 * Debug helper
 */
export function debugAttentionMatrix(
  matrix: AttentionMatrix,
  tokens: string[]
) {
  console.group("[Attention Matrix Debug]");

  console.log("Token Count:", tokens.length);
  console.log("Row Count:", matrix.length);

  matrix.forEach((row, index) => {
    const sum = row.reduce(
      (acc, curr) => acc + curr,
      0
    );

    console.log(
      `Row ${index} (${tokens[index]}):`,
      {
        length: row.length,
        sum,
        max: Math.max(...row),
        min: Math.min(...row),
      }
    );
  });

  console.table(
    matrix.map((row, index) => ({
      token: tokens[index],
      rowSum: row.reduce(
        (acc, curr) => acc + curr,
        0
      ),
      maxAttention: Math.max(...row),
    }))
  );

  console.groupEnd();
}