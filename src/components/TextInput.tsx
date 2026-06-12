import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAttentionStore } from '@/stores/useAttentionStore';

interface TextInputProps {
  onVisualize: () => void;
  isBusy: boolean;
}

export function TextInput({ onVisualize, isBusy }: TextInputProps) {
  const inputText = useAttentionStore((state) => state.inputText);
  const setInputText = useAttentionStore((state) => state.setInputText);
  const error = useAttentionStore((state) => state.error);
  const setError = useAttentionStore((state) => state.setError);

  useEffect(() => {
    if (error && inputText.trim().length > 0) {
      setError(null);
    }
  }, [error, inputText, setError]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Input</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Paste a sentence to inspect self-attention</h2>
        </div>
        <button
          type="button"
          onClick={onVisualize}
          disabled={isBusy}
          className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'Analyzing...' : 'Visualize attention'}
        </button>
      </div>

      <label className="mb-3 block text-sm font-medium text-slate-300" htmlFor="attention-input">
        Example: “The cat sat on the mat because it was tired.”
      </label>
      <textarea
        id="attention-input"
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        rows={4}
        className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/30"
        placeholder="Type a sentence here..."
      />
      {error ? (
        <p className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </motion.section>
  );
}
