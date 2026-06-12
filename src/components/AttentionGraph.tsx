import { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { buildGraphEdges, getLayerMatrix, normalizeScore } from '../lib/attention';
import { useAttentionStore } from '../stores/useAttentionStore';

interface NodePosition {
  index: number;
  token: string;
  x: number;
  y: number;
}

export function AttentionGraph() {
  const tokens = useAttentionStore((state) => state.tokens);
  const attentions = useAttentionStore((state) => state.attentions);
  const selectedLayer = useAttentionStore((state) => state.selectedLayer);
  const selectedHead = useAttentionStore((state) => state.selectedHead);
  const threshold = useAttentionStore((state) => state.threshold);
  const setThreshold = useAttentionStore((state) => state.setThreshold);
  const setSelectedTokenIndex = useAttentionStore((state) => state.setSelectedTokenIndex);

  const [hoveredNode, setHoveredNode] = useState<NodePosition | null>(null);

  const matrix = useMemo(
    () => getLayerMatrix(attentions, selectedLayer, selectedHead).map((row) => row.map(normalizeScore)),
    [attentions, selectedHead, selectedLayer],
  );

  const nodes = useMemo(
    () => tokens.map((token, index) => ({ index, token })),
    [tokens],
  );

  const links = useMemo(() => buildGraphEdges(matrix, threshold), [matrix, threshold]);

  const dimensions = { width: Math.max(640, tokens.length * 78), height: 520 };

  const layout = useMemo(() => {
    const simulationNodes = nodes.map((node) => ({ ...node, x: dimensions.width / 2, y: dimensions.height / 2 }));
    const simulation = d3
      .forceSimulation(simulationNodes as any)
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((node: any) => node.index)
          .distance((link: any) => 120 - link.score * 60),
      )
      .force('collide', d3.forceCollide(42));

    for (let tick = 0; tick < 220; tick += 1) {
      simulation.tick();
    }

    simulation.stop();

    return {
      nodes: simulationNodes.map((node) => ({
        index: node.index,
        token: node.token,
        x: node.x ?? dimensions.width / 2,
        y: node.y ?? dimensions.height / 2,
      })),
      links: links.map((link) => ({
        ...link,
      })),
    };
  }, [dimensions.height, dimensions.width, links, nodes]);

  if (tokens.length === 0 || matrix.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center text-slate-400"
      >
        Run an analysis to see the graph.
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Attention graph</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Token relationships above the threshold</h3>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span className="font-medium text-slate-200">Edge threshold: {threshold.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-sky-400"
            />
          </label>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-900/60">
        <svg width={dimensions.width} height={dimensions.height} role="img" aria-label="Attention graph">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.9)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.35)" />
            </linearGradient>
          </defs>

          {layout.links.map((link) => {
            const source = layout.nodes[link.source];
            const target = layout.nodes[link.target];
            if (!source || !target) {
              return null;
            }

            return (
              <line
                key={`${link.source}-${link.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#edge-gradient)"
                strokeOpacity={0.15 + link.score * 0.85}
                strokeWidth={1 + link.score * 4}
              />
            );
          })}

          {layout.nodes.map((node) => {
            const isActive = hoveredNode?.index === node.index;
            return (
              <g
                key={node.index}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedTokenIndex(node.index)}
                className="cursor-pointer"
              >
                <circle
                  r={isActive ? 24 : 20}
                  fill={isActive ? 'rgba(56, 189, 248, 0.32)' : 'rgba(255, 255, 255, 0.08)'}
                  stroke={isActive ? 'rgba(125, 211, 252, 0.95)' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={2}
                />
                <circle
                  r={isActive ? 8 : 6}
                  fill={isActive ? 'rgba(125, 211, 252, 1)' : 'rgba(148, 163, 184, 1)'}
                />
                <text
                  y={34}
                  textAnchor="middle"
                  className="fill-slate-200 text-[11px] font-medium"
                >
                  {node.token}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </motion.section>
  );
}
