import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-3 text-sky-200">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: 'linear' }}
        className="h-6 w-6 rounded-full border-2 border-sky-300/20 border-t-sky-300"
      />
      <span className="text-sm font-medium tracking-wide text-slate-300">Loading model and running inference...</span>
    </div>
  );
}
