export type AttentionTensor = number[][][][];
export type AttentionMatrix = number[][];

export interface TokenInsight {
  token: string;
  index: number;
  bestMatch: string;
  bestMatchIndex: number;
  bestScore: number;
  topTokens: Array<{
    token: string;
    index: number;
    score: number;
  }>;
}

export interface AttentionAnalysisResult {
  tokens: string[];
  attentions: AttentionTensor;
  numLayers: number;
  numHeads: number;
}
