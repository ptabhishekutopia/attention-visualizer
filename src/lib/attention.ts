import type {
  AttentionMatrix,
  AttentionTensor,
  TokenInsight,
} from "../types/attention";

export function clamp01(
  value: number
): number {
  return Math.min(
    1,
    Math.max(0, value)
  );
}

export function normalizeScore(
  value: number
): number {
  return Number.isFinite(value)
    ? clamp01(value)
    : 0;
}

export function normalizeRow(
  row: number[] = []
): number[] {
  if (row.length === 0) {
    return [];
  }

  const cleaned = row.map(
    normalizeScore
  );

  const sum = cleaned.reduce(
    (acc, curr) => acc + curr,
    0
  );

  if (sum <= 0) {
    return cleaned.map(
      () => 0
    );
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
    !attentions ||
    attentions.length === 0
  ) {
    return [];
  }

  const layer =
    attentions[layerIndex];

  if (!layer) {
    return [];
  }

  const head =
    layer[headIndex];

  if (!head) {
    return [];
  }

  return head;
}

export function buildTokenInsights(
  tokens: string[],
  matrix: AttentionMatrix
): TokenInsight[] {
  if (
    tokens.length === 0 ||
    matrix.length === 0
  ) {
    return tokens.map(
      (
        token,
        index
      ): TokenInsight => ({
        token,
        index,
        bestMatch: token,
        bestMatchIndex:
          index,
        bestScore: 0,
        topTokens: [],
      })
    );
  }

  return tokens.map(
    (
      token,
      sourceIndex
    ): TokenInsight => {
      const row =
        normalizeRow(
          matrix[
            sourceIndex
          ] ?? []
        );

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
        index:
          sourceIndex,

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

export interface GraphEdge {
  source: number;
  target: number;
  score: number;
}

export function buildGraphEdges(
  matrix: AttentionMatrix,
  threshold = 0.05
): GraphEdge[] {
  if (
    !matrix ||
    matrix.length === 0
  ) {
    return [];
  }

  const edges: GraphEdge[] =
    [];

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
            sourceIndex ===
            targetIndex
          ) {
            return;
          }

          if (
            score <
            threshold
          ) {
            return;
          }

          edges.push({
            source:
              sourceIndex,
            target:
              targetIndex,
            score,
          });
        }
      );
    }
  );

  return edges.sort(
    (a, b) =>
      b.score - a.score
  );
}

export function debugAttentionMatrix(
  matrix: AttentionMatrix,
  tokens: string[]
): void {
  console.group(
    "Attention Matrix"
  );

  console.log(
    "Tokens:",
    tokens.length
  );

  console.log(
    "Rows:",
    matrix.length
  );

  if (
    matrix.length === 0
  ) {
    console.warn(
      "Empty matrix"
    );
    console.groupEnd();
    return;
  }

  matrix.forEach(
    (
      row,
      index
    ) => {
      const sum =
        row.reduce(
          (
            acc,
            curr
          ) =>
            acc + curr,
          0
        );

      console.log({
        token:
          tokens[index],
        rowLength:
          row.length,
        rowSum:
          Number(
            sum.toFixed(
              4
            )
          ),
      });
    }
  );

  console.groupEnd();
}