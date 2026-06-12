import type {
  AttentionMatrix,
  AttentionTensor,
  TokenInsight,
} from "../types/attention";

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeScore(
  value: number
): number {
  return Number.isFinite(value)
    ? clamp01(value)
    : 0;
}

export function normalizeRow(
  row?: number[]
): number[] {
  if (!Array.isArray(row) || row.length === 0) {
    return [];
  }

  const cleaned = row.map((value) =>
    Number.isFinite(value)
      ? Math.max(0, value)
      : 0
  );

  const sum = cleaned.reduce(
    (acc, curr) => acc + curr,
    0
  );

  if (sum <= 0) {
    return cleaned.map(() => 0);
  }

  return cleaned.map(
    (value) => value / sum
  );
}

export function getLayerMatrix(
  attentions: AttentionTensor,
  layerIndex: number,
  headIndex: number
): AttentionMatrix {
  if (
    !Array.isArray(attentions) ||
    attentions.length === 0
  ) {
    return [];
  }

  const layer =
    attentions[layerIndex];

  if (!layer) {
    return [];
  }

  const matrix =
    layer[headIndex];

  if (
    !Array.isArray(matrix)
  ) {
    return [];
  }

  return matrix;
}

export function buildTokenInsights(
  tokens: string[],
  matrix: AttentionMatrix
): TokenInsight[] {
  if (!tokens.length) {
    return [];
  }

  if (!matrix.length) {
    return tokens.map(
      (token, index) => ({
        token,
        index,
        bestMatch: token,
        bestMatchIndex: index,
        bestScore: 0,
        topTokens: [],
      })
    );
  }

  return tokens.map(
    (token, sourceIndex) => {
      const row =
        normalizeRow(
          matrix[sourceIndex]
        );

      if (!row.length) {
        return {
          token,
          index: sourceIndex,
          bestMatch: token,
          bestMatchIndex:
            sourceIndex,
          bestScore: 0,
          topTokens: [],
        };
      }

      const scored = row
        .map(
          (
            score,
            targetIndex
          ) => ({
            token:
              tokens[
                targetIndex
              ] ??
              `[${targetIndex}]`,
            index:
              targetIndex,
            score,
          })
        )
        .filter(
          (item) =>
            item.index !==
            sourceIndex
        );

      const topTokens =
        scored
          .sort(
            (a, b) =>
              b.score -
              a.score
          )
          .slice(0, 5);

      const best =
        topTokens[0];

      return {
        token,
        index: sourceIndex,
        bestMatch:
          best?.token ??
          token,
        bestMatchIndex:
          best?.index ??
          sourceIndex,
        bestScore:
          best?.score ??
          0,
        topTokens,
      };
    }
  );
}

export function buildGraphEdges(
  matrix: AttentionMatrix,
  threshold = 0.05
) {
  const edges: Array<{
    source: number;
    target: number;
    score: number;
  }> = [];

  if (!matrix.length) {
    return edges;
  }

  matrix.forEach(
    (
      row,
      sourceIndex
    ) => {
      const normalized =
        normalizeRow(row);

      normalized.forEach(
        (
          score,
          targetIndex
        ) => {
          if (
            targetIndex !==
              sourceIndex &&
            score >=
              threshold
          ) {
            edges.push({
              source:
                sourceIndex,
              target:
                targetIndex,
              score,
            });
          }
        }
      );
    }
  );

  return edges;
}

export function debugAttentionMatrix(
  matrix: AttentionMatrix,
  tokens: string[]
) {
  console.group(
    "Attention Debug"
  );

  console.log(
    "Tokens:",
    tokens.length
  );

  console.log(
    "Rows:",
    matrix.length
  );

  if (!matrix.length) {
    console.warn(
      "Empty attention matrix"
    );

    console.groupEnd();
    return;
  }

  matrix.forEach(
    (
      row,
      index
    ) => {
      console.log({
        token:
          tokens[index],
        rowLength:
          row.length,
        rowSum:
          row.reduce(
            (a, b) =>
              a + b,
            0
          ),
      });
    }
  );

  console.groupEnd();
}