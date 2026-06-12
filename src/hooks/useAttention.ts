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

let cachedBundle: Promise<ModelBundle> | null = null;

async function getBundle(): Promise<ModelBundle> {
  if (!cachedBundle) {
    cachedBundle = Promise.all([
      AutoTokenizer.from_pretrained(MODEL_ID),

      AutoModel.from_pretrained(MODEL_ID, {
        dtype: "fp32",
      }),
    ]).then(([tokenizer, model]) => ({
      tokenizer,
      model,
    }));
  }

  return cachedBundle;
}

/**
 * Convert tensor -> array
 */
function tensorToArray(value: any): any {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value.tolist === "function") {
    return value.tolist();
  }

  if (value.data && value.dims) {
    return reshapeFlatArray(
      Array.from(value.data),
      value.dims
    );
  }

  return value;
}

/**
 * Reshape flat tensor data
 */
function reshapeFlatArray(
  values: number[],
  dims: number[]
): any {
  if (dims.length === 0) {
    return values[0];
  }

  const [current, ...rest] = dims;

  const chunkSize =
    rest.length === 0
      ? 1
      : rest.reduce(
          (acc, value) => acc * value,
          1
        );

  const result = [];

  for (
    let index = 0;
    index < current;
    index++
  ) {
    const start = index * chunkSize;

    const chunk = values.slice(
      start,
      start + chunkSize
    );

    result.push(
      rest.length
        ? reshapeFlatArray(chunk, rest)
        : chunk
    );
  }

  return result;
}

/**
 * Extract readable tokens
 */
function getTokenList(
  tokenizer: any,
  inputIds: number[]
): string[] {
  try {
    return inputIds.map((id) =>
      tokenizer.decode([id], {
        skip_special_tokens: false,
      })
    );
  } catch (error) {
    console.error(
      "Token decode failed:",
      error
    );

    return inputIds.map(String);
  }
}

/**
 * Convert attentions to:
 * [layers][heads][seq][seq]
 */
function resolveAttentions(
  modelOutput: any
): number[][][][] {
  const raw =
    modelOutput?.attentions ??
    modelOutput?.attention;

  if (!raw) {
    console.error(
      "No attentions returned by model"
    );

    console.log(
      "Model output:",
      modelOutput
    );

    return [];
  }

  const layers = tensorToArray(raw);

  console.log(
    "Raw Attention Layers:",
    layers.length
  );

  const processed = layers.map(
    (layer: any, index: number) => {
      const layerArray =
        tensorToArray(layer);

      /**
       * Transformers.js often returns:
       * [batch][heads][seq][seq]
       */

      if (
        Array.isArray(layerArray) &&
        Array.isArray(layerArray[0]) &&
        Array.isArray(layerArray[0][0]) &&
        Array.isArray(layerArray[0][0][0])
      ) {
        console.log(
          `Layer ${index}: removing batch dimension`
        );

        return layerArray[0];
      }

      return layerArray;
    }
  );

  return processed;
}

function debugAttentionShape(
  attentions: number[][][][]
) {
  console.group(
    "ATTENTION SHAPE DEBUG"
  );

  console.log(
    "Layers:",
    attentions.length
  );

  console.log(
    "Heads:",
    attentions?.[0]?.length
  );

  console.log(
    "Rows:",
    attentions?.[0]?.[0]?.length
  );

  console.log(
    "Columns:",
    attentions?.[0]?.[0]?.[0]?.length
  );

  console.groupEnd();
}

export function useAttention() {
  const loadBundle =
    useCallback(async () => {
      return getBundle();
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
            "Enter some text before visualizing attention."
          );
        }

        const {
          tokenizer,
          model,
        } = await getBundle();

        const encoded =
          await tokenizer(
            cleaned,
            {
              padding: false,
              truncation: true,

              // IMPORTANT
              return_tensors: true,
            }
          );

        console.log(
          "Encoded:",
          encoded
        );

        const modelOutput =
          await model(encoded, {
            output_attentions: true,
          });

        console.log(
          "Model Output Keys:",
          Object.keys(
            modelOutput
          )
        );

        console.log(
          "Model Output:",
          modelOutput
        );

        const attentions =
          resolveAttentions(
            modelOutput
          );

        debugAttentionShape(
          attentions
        );

        const inputIdsRaw =
          tensorToArray(
            encoded.input_ids
          );

        const tokenIds =
          Array.isArray(
            inputIdsRaw?.[0]
          )
            ? inputIdsRaw[0]
            : inputIdsRaw;

        const tokens =
          getTokenList(
            tokenizer,
            tokenIds
          );

        console.log(
          "Tokens:",
          tokens
        );

        const numLayers =
          attentions.length;

        const numHeads =
          attentions?.[0]
            ?.length ?? 0;

        return {
          tokens,
          attentions,
          numLayers,
          numHeads,
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