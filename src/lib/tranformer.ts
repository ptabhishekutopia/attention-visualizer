import * as tf from "@tensorflow/tfjs";

export interface AttentionResult {
  attentionWeights: number[][];
}

export class TransformerAttention {
  private embeddingDim: number;

  private Wq: tf.Variable;
  private Wk: tf.Variable;
  private Wv: tf.Variable;

  constructor(embeddingDim = 64) {
    this.embeddingDim = embeddingDim;

    this.Wq = tf.variable(
      tf.randomNormal([embeddingDim, embeddingDim])
    );

    this.Wk = tf.variable(
      tf.randomNormal([embeddingDim, embeddingDim])
    );

    this.Wv = tf.variable(
      tf.randomNormal([embeddingDim, embeddingDim])
    );
  }

  async forward(
    embeddings: tf.Tensor2D
  ): Promise<AttentionResult> {
    const q = embeddings.matMul(this.Wq);

    const k = embeddings.matMul(this.Wk);

    const v = embeddings.matMul(this.Wv);

    const scores = q
      .matMul(k.transpose())
      .div(Math.sqrt(this.embeddingDim));

    const weights = tf.softmax(scores);

    const result = {
      attentionWeights:
        (await weights.array()) as number[][],
    };

    q.dispose();
    k.dispose();
    v.dispose();
    scores.dispose();
    weights.dispose();

    return result;
  }

  dispose() {
    this.Wq.dispose();
    this.Wk.dispose();
    this.Wv.dispose();
  }
}

export async function createEmbeddings(
  tokenCount: number,
  embeddingDim = 64
) {
  return tf.randomNormal([
    tokenCount,
    embeddingDim,
  ]);
}
export interface AttentionResult {
  embeddings: number[][];
  q: number[][];
  k: number[][];
  v: number[][];
  attentionScores: number[][];
  attentionWeights: number[][];
  output: number[][];
}

export interface AttentionAnalysisResult {
  tokens: string[];
  attentions: number[][][]; // [layer][head][token][token]
  numLayers: number;
  numHeads: number;
}

export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((token) => token.length > 0);
}