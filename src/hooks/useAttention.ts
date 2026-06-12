import { useCallback, useMemo } from "react";
import {
  AutoModel,
  AutoTokenizer,
  env,
} from "@huggingface/transformers";

import { buildTokenInsights } from "../lib/attention";
import type {
  AttentionAnalysisResult,
} from "../types/attention";

const MODEL_ID = "Xenova/bert-base-uncased";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

type ModelBundle = {
  tokenizer: any;
  model: any;
};

let cachedBundle: Promise<ModelBundle> | null =
  null;

async function getBundle(): Promise<ModelBundle> {
  if (!cachedBundle) {
    cachedBundle = Promise.all([
      AutoTokenizer.from_pretrained(
        MODEL_ID
      ),

      AutoModel.from_pretrained(
        MODEL_ID,
        {
          dtype: "fp32",
        }
      ),
    ]).then(
      ([tokenizer, model]) => ({
        tokenizer,
        model,
      })
    );
  }

  return cachedBundle;
}

function tensorToArray(
  value: any
): any {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (
    typeof value.tolist ===
    "function"
  ) {
    return value.tolist();
  }

  if (
    value.data &&
    value.dims
  ) {
    return reshapeFlatArray(
      Array.from(value.data),
      value.dims
    );
  }

  return value;
}

function reshapeFlatArray(
  values: number[],
  dims: number[]
): any {
  if (dims.length === 0) {
    return values[0];
  }

  const [current, ...rest] =
    dims;

  const chunkSize =
    rest.length === 0
      ? 1
      : rest.reduce(
          (a, b) => a * b,
          1
        );

  const result = [];

  for (
    let i = 0;
    i < current;
    i++
  ) {
    const start =
      i * chunkSize;

    const chunk =
      values.slice(
        start,
        start + chunkSize
      );

    result.push(
      rest.length
        ? reshapeFlatArray(
            chunk,
            rest
          )
        : chunk
    );
  }

  return result;
}

function getTokenList(
  tokenizer: any,
  ids: number[]
): string[] {
  return ids.map((id) =>
    tokenizer.decode([id], {
      skip_special_tokens: false,
    })
  );
}

/**
 * Cosine similarity fallback
 */
function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return (
    dot /
    (Math.sqrt(normA) *
      Math.sqrt(normB) +
      1e-8)
  );
}

/**
 * Build pseudo attention matrix
 */
function buildPseudoAttention(
  embeddings: number[][]
): number[][] {
  const seqLen =
    embeddings.length;

  const matrix =
    Array.from(
      { length: seqLen },
      () =>
        Array(seqLen).fill(0)
    );

  for (
    let i = 0;
    i < seqLen;
    i++
  ) {
    let rowSum = 0;

    for (
      let j = 0;
      j < seqLen;
      j++
    ) {
      const score =
        Math.max(
          0,
          cosineSimilarity(
            embeddings[i],
            embeddings[j]
          )
        );

      matrix[i][j] = score;
      rowSum += score;
    }

    for (
      let j = 0;
      j < seqLen;
      j++
    ) {
      matrix[i][j] /=
        rowSum || 1;
    }
  }

  return matrix;
}

/**
 * Returns:
 * [layers][heads][seq][seq]
 */
function resolveAttentions(
  modelOutput: any
): number[][][][] {
  const raw =
    modelOutput?.attentions ??
    modelOutput?.attention;

  /**
   * Real attentions
   */
  if (raw) {
    const layers =
      tensorToArray(raw);

    return layers.map(
      (layer: any) => {
        const arr =
          tensorToArray(
            layer
          );

        if (
          Array.isArray(arr) &&
          Array.isArray(
            arr[0]
          ) &&
          Array.isArray(
            arr[0][0]
          ) &&
          Array.isArray(
            arr[0][0][0]
          )
        ) {
          return arr[0];
        }

        return arr;
      }
    );
  }

  /**
   * Fallback using hidden states
   */
  console.warn(
    "No attentions returned. Using pseudo attention."
  );

  const hidden =
    tensorToArray(
      modelOutput?.last_hidden_state
    );

  const embeddings =
    Array.isArray(
      hidden?.[0]?.[0]
    )
      ? hidden[0]
      : hidden;

  if (
    !Array.isArray(
      embeddings
    ) ||
    embeddings.length === 0
  ) {
    return [];
  }

  const matrix =
    buildPseudoAttention(
      embeddings
    );

  return [[matrix]];
}

export function useAttention() {
  const loadBundle =
    useCallback(
      async () =>
        getBundle(),
      []
    );

  const analyzeText =
    useCallback(
      async (
        text: string
      ): Promise<AttentionAnalysisResult> => {
        const cleaned =
          text.trim();

        if (!cleaned) {
          throw new Error(
            "Enter text first."
          );
        }

        const {
          tokenizer,
          model,
        } =
          await getBundle();

        const encoded =
          await tokenizer(
            cleaned,
            {
              padding:
                false,
              truncation:
                true,
              return_tensors:
                "pt",
            }
          );

        const modelOutput =
          await model(
            encoded
          );

        console.log(
          "Output Keys:",
          Object.keys(
            modelOutput
          )
        );

        const attentions =
          resolveAttentions(
            modelOutput
          );

        const rawIds =
          tensorToArray(
            encoded.input_ids
          );

        const tokenIds =
          Array.isArray(
            rawIds?.[0]
          )
            ? rawIds[0]
            : rawIds;

        const tokens =
          getTokenList(
            tokenizer,
            tokenIds
          );

        return {
          tokens,
          attentions,
          numLayers:
            attentions.length,
          numHeads:
            attentions[0]
              ?.length ??
            0,
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