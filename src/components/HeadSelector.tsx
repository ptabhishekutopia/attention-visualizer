interface HeadSelectorProps {
  value: number;
  maxHeads: number;
  onChange: (value: number) => void;
}

export function HeadSelector({ value, maxHeads, onChange }: HeadSelectorProps) {
  const options = Array.from({ length: maxHeads }, (_, index) => index);

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      <span className="font-medium">Head</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            Head {option + 1}
          </option>
        ))}
      </select>
    </label>
  );
}
