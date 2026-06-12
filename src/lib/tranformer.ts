import * as tf from "@tensorflow/tfjs";

export interface AttentionResult {
  embeddings: number[][];
  q: number[][];
  k: number[][];
  v: number[][];
  attentionScores: number[][];
  attentionWeights: number[][];
  output: number[][];
}

export class TransformerAttention {
  embeddingDim: number;

  Wq: tf.Variable;
  Wk: tf.Variable;
  Wv: tf.Variable;

  constructor(embeddingDim = 64) {
    this.embeddingDim = embeddingDim;

    this.Wq = tf.variable(
      tf.randomNormal([
        embeddingDim,
        embeddingDim,
      ])
    );

    this.Wk = tf.variable(
      tf.randomNormal([
        embeddingDim,
        embeddingDim,
      ])
    );

    this.Wv = tf.variable(
      tf.randomNormal([
        embeddingDim,
        embeddingDim,
      ])
    );
  }

  async forward(
    embeddings: tf.Tensor2D
  ): Promise<AttentionResult> {
    const q = embeddings.matMul(this.Wq);
    const k = embeddings.matMul(this.Wk);
    const v = embeddings.matMul(this.Wv);

    const dk = Math.sqrt(
      this.embeddingDim
    );

    const scores = q
      .matMul(k.transpose())
      .div(dk);

    const weights = tf.softmax(
      scores,
      -1
    );

    const output =
      weights.matMul(v);

    return {
      embeddings:
        (await embeddings.array()) as number[][],

      q: (await q.array()) as number[][],

      k: (await k.array()) as number[][],

      v: (await v.array()) as number[][],

      attentionScores:
        (await scores.array()) as number[][],

      attentionWeights:
        (await weights.array()) as number[][],

      output:
        (await output.array()) as number[][],
    };
  }
}