import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { getLayerMatrix, normalizeScore } from '@/lib/attention';
import { useAttentionStore } from '@/stores/useAttentionStore';
import type { AttentionMatrix } from '@/types/attention';

interface HeatmapTooltip {
  x: number;
  y: number;
  source: string;
  target: string;
  score: number;
}

export function Heatmap() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<HeatmapTooltip | null>(null);

  const tokens = useAttentionStore((state) => state.tokens);
  const attentions = useAttentionStore((state) => state.attentions);
  const selectedLayer = useAttentionStore((state) => state.selectedLayer);
  const selectedHead = useAttentionStore((state) => state.selectedHead);
  const setSelectedTokenIndex = useAttentionStore((state) => state.setSelectedTokenIndex);

  const matrix = useMemo<AttentionMatrix>(() => {
    const layer = getLayerMatrix(attentions, selectedLayer, selectedHead);
    return layer.map((row) => row.map((value) => normalizeScore(value)));
  }, [attentions, selectedHead, selectedLayer]);

  const width = Math.max(560, tokens.length * 56 + 180);
  const height = Math.max(420, tokens.length * 56 + 160);
  const margin = { top: 120, right: 40, bottom: 60, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () => d3.scaleBand().domain(tokens).range([0, innerWidth]).padding(0.1),
    [innerWidth, tokens],
  );
  const yScale = useMemo(
    () => d3.scaleBand().domain(tokens).range([0, innerHeight]).padding(0.1),
    [innerHeight, tokens],
  );
  const colorScale = useMemo(
    () => d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]),
    [],
  );

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const zoom = d3
      .zoom()
      .scaleExtent([0.75, 8])
      .on('zoom', (event: any) => {
        root.attr('transform', `translate(${margin.left},${margin.top}) ${event.transform}`);
      });

    svg.call(zoom as any);
  }, [innerHeight, innerWidth, margin.left, margin.top]);

  if (tokens.length === 0 || matrix.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center text-slate-400"
      >
        Run an analysis to see the heatmap.
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Attention heatmap</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Source tokens vs target tokens</h3>
        </div>
        <div className="flex gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Layer {selectedLayer + 1}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Head {selectedHead + 1}</span>
        </div>
      </div>

      <div ref={wrapperRef} className="relative overflow-auto rounded-2xl border border-white/10 bg-slate-900/60">
        <svg ref={svgRef} width={width} height={height} className="block min-w-full" role="img" aria-label="Attention heatmap">
          <defs>
            <filter id="heatmap-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              />
            </filter>
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {tokens.map((token, index) => (
              <g key={`column-${token}-${index}`} transform={`translate(${xScale(token) ?? 0}, -12)`}>
                <foreignObject width={(xScale.bandwidth() || 44) + 4} height={100} x={-2} y={-92}>
                  <button
                    type="button"
                    onClick={() => setSelectedTokenIndex(index)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1 text-left text-[11px] leading-4 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                    title={token}
                  >
                    {token}
                  </button>
                </foreignObject>
              </g>
            ))}

            {tokens.map((token, index) => (
              <g key={`row-${token}-${index}`} transform={`translate(-12, ${yScale(token) ?? 0})`}>
                <foreignObject width={110} height={(yScale.bandwidth() || 44) + 4} x={-112} y={-2}>
                  <button
                    type="button"
                    onClick={() => setSelectedTokenIndex(index)}
                    className="flex h-full w-full items-center justify-end rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1 text-right text-[11px] leading-4 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                    title={token}
                  >
                    {token}
                  </button>
                </foreignObject>
              </g>
            ))}

            {tokens.map((sourceToken, sourceIndex) =>
              tokens.map((targetToken, targetIndex) => {
                const score = matrix[sourceIndex]?.[targetIndex] ?? 0;
                const x = xScale(targetToken) ?? 0;
                const y = yScale(sourceToken) ?? 0;
                const cellWidth = xScale.bandwidth();
                const cellHeight = yScale.bandwidth();

                return (
                  <rect
                    key={`${sourceIndex}-${targetIndex}`}
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    rx={8}
                    fill={colorScale(score)}
                    fillOpacity={0.15 + score * 0.85}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                    className="cursor-pointer transition hover:opacity-100"
                    onMouseEnter={(event) =>
                      setTooltip({
                        x: event.clientX,
                        y: event.clientY,
                        source: sourceToken,
                        target: targetToken,
                        score,
                      })
                    }
                    onMouseMove={(event) =>
                      setTooltip((current) =>
                        current
                          ? {
                              ...current,
                              x: event.clientX,
                              y: event.clientY,
                              source: sourceToken,
                              target: targetToken,
                              score,
                            }
                          : current,
                      )
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => setSelectedTokenIndex(sourceIndex)}
                  />
                );
              }),
            )}
          </g>
        </svg>
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-2xl shadow-slate-950/60"
          style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}
        >
          <p className="font-semibold text-white">{tooltip.source} → {tooltip.target}</p>
          <p className="mt-1 text-slate-300">Attention: {tooltip.score.toFixed(4)}</p>
        </div>
      ) : null}
    </motion.section>
  );
}
