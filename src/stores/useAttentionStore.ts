import { create } from 'zustand';
import type { AttentionTensor, TokenInsight } from '../types/attention';

interface AttentionState {
  inputText: string;
  tokens: string[];
  attentions: AttentionTensor;
  numLayers: number;
  numHeads: number;
  selectedLayer: number;
  selectedHead: number;
  threshold: number;
  selectedTokenIndex: number;
  isLoading: boolean;
  error: string | null;
  insights: TokenInsight[];
  setInputText: (inputText: string) => void;
  setResults: (payload: {
    tokens: string[];
    attentions: AttentionTensor;
    numLayers: number;
    numHeads: number;
    insights: TokenInsight[];
  }) => void;
  setSelectedLayer: (selectedLayer: number) => void;
  setSelectedHead: (selectedHead: number) => void;
  setThreshold: (threshold: number) => void;
  setSelectedTokenIndex: (selectedTokenIndex: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const sampleText = 'The cat sat on the mat because it was tired.';

export const useAttentionStore = create<AttentionState>((set) => ({
  inputText: sampleText,
  tokens: [],
  attentions: [],
  numLayers: 12,
  numHeads: 12,
  selectedLayer: 0,
  selectedHead: 0,
  threshold: 0.15,
  selectedTokenIndex: 0,
  isLoading: false,
  error: null,
  insights: [],
  setInputText: (inputText) => set({ inputText }),
  setResults: ({ tokens, attentions, numLayers, numHeads, insights }) =>
    set({
      tokens,
      attentions,
      numLayers,
      numHeads,
      insights,
      selectedLayer: Math.min(0, numLayers - 1),
      selectedHead: Math.min(0, numHeads - 1),
      selectedTokenIndex: 0,
      error: null,
      isLoading: false,
    }),
  setSelectedLayer: (selectedLayer) => set({ selectedLayer }),
  setSelectedHead: (selectedHead) => set({ selectedHead }),
  setThreshold: (threshold) => set({ threshold }),
  setSelectedTokenIndex: (selectedTokenIndex) => set({ selectedTokenIndex }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
