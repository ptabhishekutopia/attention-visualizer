import { ArrowUpRight, Instagram, Linkedin, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    label: 'Medium',
    href: 'https://medium.com/@ptabhishekutopia',
    description: 'Articles and long-form notes',
    icon: ArrowUpRight,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/ptabhishekutopia/',
    description: 'Visual updates and short posts',
    icon: Instagram,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ptabhishekutopia',
    description: 'Tutorials and walkthroughs',
    icon: Youtube,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ptabhishekutopia/',
    description: 'Professional updates and projects',
    icon: Linkedin,
  },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Connect with me</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Follow along for more AI learning content.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Find more transformer, AI, and educational content on Medium, Instagram, YouTube, and LinkedIn.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-sky-300 transition group-hover:bg-sky-400/15 group-hover:text-sky-200">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{link.label}</span>
                  <span className="block truncate text-xs text-slate-400">{link.description}</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex sm:items-center sm:justify-between">
        <p>Attention Visualizer is fully client-side and deployable on GitHub Pages.</p>
        <p>Built for learning how Transformer attention works.</p>
      </div>
    </motion.footer>
  );
}
