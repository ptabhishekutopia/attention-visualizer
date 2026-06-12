import { useCallback, useMemo } from 'react';
import {
  AutoModel,
  AutoTokenizer,
  env,
} from '@huggingface/transformers';
import { buildTokenInsights } from '@/lib/attention';
import type { AttentionAnalysisResult } from '@/types/attention';

const MODEL_ID = 'Xenova/bert-base-uncased';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

type ModelBundle = {
  tokenizer: any;
  model: any;
};

let cachedBundle: Promise<ModelBundle> | null = null;

async function getBundle() {
  if (!cachedBundle) {
    cachedBundle = Promise.all([
      AutoTokenizer.from_pretrained(MODEL_ID),
      AutoModel.from_pretrained(MODEL_ID),
    ]).then(([tokenizer, model]) => ({ tokenizer, model }));
  }

  return cachedBundle;
}

function reshapeFlatArray(values: ArrayLike<number>, dims: number[]): any {
  if (dims.length === 0) {
    return values[0];
  }

  const [dimension, ...rest] = dims;
  const chunkSize = rest.reduce((product, current) => product * current, 1);
  const reshaped: any[] = [];

  for (let index = 0; index < dimension; index += 1) {
    const offset = index * chunkSize;
    const slice = Array.from(values).slice(offset, offset + chunkSize);
    reshaped.push(rest.length > 0 ? reshapeFlatArray(slice, rest) : slice);
  }

  return reshaped;
}

function tensorToArray(tensor: any) {
  if (!tensor) {
    return [];
  }

  if (Array.isArray(tensor)) {
    return tensor;
  }

  if (typeof tensor.tolist === 'function') {
    return tensor.tolist();
  }

  if (tensor.dims && tensor.data) {
    return reshapeFlatArray(tensor.data, tensor.dims);
  }

  return tensor;
}

function getTokenList(tokenizer: any, text: string, tokenIds: number[]) {
  if (typeof tokenizer.tokenize === 'function') {
    const tokens = tokenizer.tokenize(text, { add_special_tokens: true });
    if (Array.isArray(tokens) && tokens.length > 0) {
      return tokens;
    }
  }

  if (typeof tokenizer.batch_decode === 'function') {
    const decoded = tokenizer.batch_decode([tokenIds], {
      skip_special_tokens: false,
      clean_up_tokenization_spaces: false,
    });
    if (Array.isArray(decoded) && decoded[0]) {
      return decoded[0].split(/\s+/).filter(Boolean);
    }
  }

  if (typeof tokenizer.decode === 'function') {
    const decoded = tokenizer.decode(tokenIds, {
      skip_special_tokens: false,
      clean_up_tokenization_spaces: false,
    });
    return decoded.split(/\s+/).filter(Boolean);
  }

  return tokenIds.map((tokenId) => String(tokenId));
}

function resolveAttentions(modelOutput: any) {
  const rawAttentions = modelOutput?.attentions ?? modelOutput?.attention ?? [];
  return tensorToArray(rawAttentions).map((layer: any) => tensorToArray(layer));
}

export function useAttention() {
  const loadBundle = useCallback(async () => getBundle(), []);

  const analyzeText = useCallback(async (text: string): Promise<AttentionAnalysisResult> => {
    const cleaned = text.trim();

    if (!cleaned) {
      throw new Error('Enter some text before visualizing attention.');
    }

    const { tokenizer, model } = await getBundle();
    const encoded = await tokenizer(cleaned, {
      padding: false,
      truncation: true,
      return_tensor: true,
    });

    const modelOutput = await model(encoded, { output_attentions: true });
    const attentions = resolveAttentions(modelOutput) as number[][][][];
    const tokenIds = Array.isArray(encoded.input_ids)
      ? encoded.input_ids
      : tensorToArray(encoded.input_ids)?.[0] ?? [];
    const tokens = getTokenList(tokenizer, cleaned, tokenIds);

    const numLayers = attentions.length;
    const numHeads = attentions[0]?.length ?? 0;

    return {
      tokens,
      attentions,
      numLayers,
      numHeads,
    };
  }, []);

  return useMemo(
    () => ({
      loadBundle,
      analyzeText,
      buildInsights: buildTokenInsights,
    }),
    [analyzeText, loadBundle],
  );
}
