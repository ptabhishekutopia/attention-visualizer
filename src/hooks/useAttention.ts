import { useCallback, useMemo } from "react";

import {
  TransformerAttention,
  createEmbeddings,
  tokenize,
} from "../lib/tranformer";

import { buildTokenInsights } from "../lib/attention";

import type {
  AttentionAnalysisResult,
} from "../types/attention";

export function useAttention() {
  const loadBundle =
    useCallback(async () => {
      return true;
    }, []);

  const analyzeText =
    useCallback(
      async (
        text: string
      ): Promise<AttentionAnalysisResult> => {
        const cleaned =
          text.trim();

        if (!cleaned) {
          throw new Error(
            "Please enter text."
          );
        }

        const tokens =
          tokenize(cleaned);

        const embeddings =
          await createEmbeddings(
            tokens.length,
            64
          );

        const transformer =
          new TransformerAttention(
            64
          );

        const result =
          await transformer.forward(
            embeddings
          );

        embeddings.dispose();
        transformer.dispose();

        const attentions: number[][][][] =
          [
            [
              result.attentionWeights,
            ],
          ];

        return {
          tokens,
          attentions,
          numLayers: 1,
          numHeads: 1,
        };
      },
      []
    );

  return useMemo(
    () => ({
      loadBundle,
      analyzeText,
      buildInsights:
        buildTokenInsights,
    }),
    [
      analyzeText,
      loadBundle,
    ]
  );
}