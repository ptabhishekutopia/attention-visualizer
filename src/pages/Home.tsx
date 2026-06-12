import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAttention } from '../hooks/useAttention';
import { buildTokenInsights } from '../lib/attention';
import { useAttentionStore } from '../stores/useAttentionStore';
import { AttentionGraph } from '../components/AttentionGraph';
import { EducationalSection } from '../components/EducationalSection';
import { Footer } from '../components/Footer';
import { HeadSelector } from '../components/HeadSelector';
import { Heatmap } from '../components/Heatmap';
import { LayerSelector } from '../components/LayerSelector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TextInput } from '../components/TextInput';
import { TokenInspector } from '../components/TokenInspector';

export function Home() {
  const { analyzeText } = useAttention();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    inputText,
    tokens,
    attentions,
    numLayers,
    numHeads,
    selectedLayer,
    selectedHead,
    threshold,
    selectedTokenIndex,
    insights,
    setResults,
    setLoading,
    setError,
    setSelectedLayer,
    setSelectedHead,
    setSelectedTokenIndex,
  } = useAttentionStore();

  const currentMatrix = useMemo(
    () => attentions[selectedLayer]?.[selectedHead] ?? [],
    [attentions, selectedHead, selectedLayer],
  );

  const currentInsights = useMemo(
    () => buildTokenInsights(tokens, currentMatrix),
    [currentMatrix, tokens],
  );

  const selectedInsight = insights[selectedTokenIndex];

  async function handleVisualize() {
    const cleaned = inputText.trim();
    if (!cleaned) {
      setError('Please enter text before running the visualization.');
      return;
    }

    setIsAnalyzing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeText(cleaned);
      setResults({
        tokens: result.tokens,
        attentions: result.attentions,
        numLayers: result.numLayers,
        numHeads: result.numHeads,
        insights: buildTokenInsights(result.tokens, result.attentions[0]?.[0] ?? []),
      });
      setSelectedLayer(0);
      setSelectedHead(0);
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'The model could not be loaded in this browser.';
      setError(
        message.includes('memory') || message.includes('OOM')
          ? 'The browser ran out of memory while loading the model. Close other tabs and try again.'
          : message,
      );
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-hero-gradient text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.2),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                Attention Visualizer
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
               self-attention patterns in transformers, visualized.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Analyze a sentence locally in the browser with Transformers.js, then inspect the attention
                patterns through an interactive heatmap, graph, and token inspector.
              </p>
    
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 shadow-glow">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">How it works</p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">1. Tokenize input text with the BERT tokenizer.</li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">2. Run the model locally with output attentions enabled.</li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">3. Inspect layers, heads, heatmaps, graphs, and token summaries.</li>
              </ol>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6 rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Quick guide</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">How to use the visualizer</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              '1. Enter a sentence and click Visualize attention.',
              '2. Pick a layer and head to compare patterns.',
              '3. Hover the heatmap or graph to inspect token relationships.',
              '4. Adjust the threshold to show only stronger attention edges.',
            ].map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                {step}
              </div>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            

            <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Model controls</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Select a layer and head</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {numLayers} layers · {numHeads} heads
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <LayerSelector value={selectedLayer} maxLayers={Math.max(numLayers, 1)} onChange={setSelectedLayer} />
                <HeadSelector value={selectedHead} maxHeads={Math.max(numHeads, 1)} onChange={setSelectedHead} />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <TextInput onVisualize={handleVisualize} isBusy={isAnalyzing} />
            <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Processing</p>
              <div className="mt-4 flex min-h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6">
                {isAnalyzing ? <LoadingSpinner /> : <p className="text-sm text-slate-300">Ready to analyze attention patterns.</p>}
              </div>
            </section>
          </div>
        </div>
        
        <TokenInspector
              tokens={tokens}
              insights={currentInsights.length > 0 ? currentInsights : insights}
              selectedTokenIndex={selectedTokenIndex}
              onSelectToken={setSelectedTokenIndex}
         />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <h2 className="text-2xl font-semibold text-white">Attention Heatmap</h2>
          <Heatmap />
          <AttentionGraph />
        </div>

        <div className="mt-6">
          <EducationalSection />
        </div>

        <Footer />

        {currentMatrix.length === 0 && !isAnalyzing ? null : (
          <p className="mt-6 text-center text-sm text-slate-400">
            Attention is extracted from the locally loaded model and cached after the first run.
          </p>
        )}
      </div>
    </main>
  );
}
