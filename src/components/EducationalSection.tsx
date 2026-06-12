import { motion } from 'framer-motion';

const topics = [
  {
    title: 'What is Attention?',
    text:
      'Self-attention lets a Transformer look at every token in the sequence and decide which other tokens matter most for understanding the current word.',
  },
  {
    title: 'What are Query, Key, and Value?',
    text:
      'Query is the token asking a question, Key is what each token offers, and Value is the information that gets blended together after matching the query with compatible keys.',
  },
  {
    title: 'Why do different heads behave differently?',
    text:
      'Each attention head learns a different relationship pattern. One head may focus on nearby words, while another may track grammar, coreference, or sentence structure.',
  },
  {
    title: 'What do darker heatmap cells mean?',
    text:
      'Darker cells represent stronger attention scores, meaning the source token gave more weight to the target token when forming its contextual representation.',
  },
];

export function EducationalSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Learn the concept</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Educational explanation</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <article key={topic.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-semibold text-white">{topic.title}</h4>
            <p className="mt-2 text-sm leading-7 text-slate-300">{topic.text}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
