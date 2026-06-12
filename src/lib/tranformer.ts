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
  private embeddingDim: number;

  private Wq: tf.Variable;
  private Wk: tf.Variable;
  private Wv: tf.Variable;

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

    const attentionScores = q
      .matMul(k.transpose())
      .div(Math.sqrt(this.embeddingDim));

    const attentionWeights =
      tf.softmax(attentionScores);

    const output =
      attentionWeights.matMul(v);

    const result: AttentionResult = {
      embeddings:
        (await embeddings.array()) as number[][],

      q: (await q.array()) as number[][],

      k: (await k.array()) as number[][],

      v: (await v.array()) as number[][],

      attentionScores:
        (await attentionScores.array()) as number[][],

      attentionWeights:
        (await attentionWeights.array()) as number[][],

      output:
        (await output.array()) as number[][],
    };

    q.dispose();
    k.dispose();
    v.dispose();
    attentionScores.dispose();
    attentionWeights.dispose();
    output.dispose();

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
): Promise<tf.Tensor2D> {
  return tf.randomNormal([
    tokenCount,
    embeddingDim,
  ]);
}

export function tokenize(
  text: string
): string[] {
  return [
    "[CLS]",
    ...text
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
    "[SEP]",
  ];
}