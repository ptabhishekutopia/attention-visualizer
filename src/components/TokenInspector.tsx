import { motion } from 'framer-motion';
import type { TokenInsight } from '../types/attention';

interface TokenInspectorProps {
  tokens: string[];
  insights: TokenInsight[];
  selectedTokenIndex: number;
  onSelectToken: (index: number) => void;
}

export function TokenInspector({
  tokens,
  insights,
  selectedTokenIndex,
  onSelectToken,
}: TokenInspectorProps) {
  const selectedInsight = insights[selectedTokenIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Token Inspector</p>
          <h3 className="mt-2 text-xl font-semibold text-white">What this token attends to most</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Click a token to inspect
        </span>
      </div>

      {tokens.length === 0 ? (
        <p className="text-sm text-slate-400">Run an analysis to inspect tokens.</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {tokens.map((token, index) => {
              const active = index === selectedTokenIndex;
              return (
                <button
                  key={`${token}-${index}`}
                  type="button"
                  onClick={() => onSelectToken(index)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? 'border-sky-400/60 bg-sky-400/15 text-sky-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-sky-400/30 hover:bg-sky-400/10'
                  }`}
                >
                  {token}
                </button>
              );
            })}
          </div>

          {selectedInsight ? (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Selected token</p>
                <p className="mt-2 text-2xl font-semibold text-white">{selectedInsight.token}</p>
                <p className="mt-3 text-sm text-slate-300">
                  Most attended token: <span className="font-semibold text-sky-200">{selectedInsight.bestMatch}</span>
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Attention score: <span className="font-semibold text-white">{selectedInsight.bestScore.toFixed(3)}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Top 5 attended tokens</p>
                <div className="mt-3 space-y-2">
                  {selectedInsight.topTokens.map((entry) => (
                    <div key={`${entry.token}-${entry.index}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-slate-200">{entry.token}</span>
                      <span className="rounded-full bg-slate-900/80 px-2 py-1 text-xs text-sky-200">
                        {entry.score.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </motion.section>
  );
}
