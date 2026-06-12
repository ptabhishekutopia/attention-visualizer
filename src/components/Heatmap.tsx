import { useMemo, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

import { getLayerMatrix } from "../lib/attention";

import { useAttentionStore } from "../stores/useAttentionStore";

import type {
  AttentionMatrix,
} from "../types/attention";

interface HeatmapTooltip {
  x: number;
  y: number;
  source: string;
  target: string;
  score: number;
}

export function Heatmap() {
  const [tooltip, setTooltip] =
    useState<HeatmapTooltip | null>(
      null
    );

  const tokens =
    useAttentionStore(
      (state) => state.tokens
    );

  const attentions =
    useAttentionStore(
      (state) => state.attentions
    );

  const selectedLayer =
    useAttentionStore(
      (state) =>
        state.selectedLayer
    );

  const selectedHead =
    useAttentionStore(
      (state) =>
        state.selectedHead
    );

  const setSelectedTokenIndex =
    useAttentionStore(
      (state) =>
        state.setSelectedTokenIndex
    );

  const matrix =
    useMemo<AttentionMatrix>(
      () =>
        getLayerMatrix(
          attentions,
          selectedLayer,
          selectedHead
        ),
      [
        attentions,
        selectedLayer,
        selectedHead,
      ]
    );

  if (
    !tokens.length ||
    !matrix.length ||
    !matrix[0]?.length
  ) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center text-slate-400"
      >
        Run an analysis to see
        the heatmap.
      </motion.div>
    );
  }

  const width = Math.max(
    560,
    tokens.length * 60 + 180
  );

  const height = Math.max(
    420,
    tokens.length * 60 + 160
  );

  const margin = {
    top: 120,
    right: 40,
    bottom: 60,
    left: 120,
  };

  const innerWidth =
    width -
    margin.left -
    margin.right;

  const innerHeight =
    height -
    margin.top -
    margin.bottom;

  const xScale =
    d3
      .scaleBand<number>()
      .domain(
        d3.range(tokens.length)
      )
      .range([0, innerWidth])
      .padding(0.08);

  const yScale =
    d3
      .scaleBand<number>()
      .domain(
        d3.range(tokens.length)
      )
      .range([0, innerHeight])
      .padding(0.08);

  const maxValue =
    d3.max(matrix.flat()) ??
    1;

  const colorScale =
    d3
      .scaleSequential(
        d3.interpolatePlasma
      )
      .domain([
        0,
        maxValue,
      ]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
            Attention Heatmap
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-white">
            Source → Target
            Attention
          </h3>
        </div>

        <div className="flex gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Layer{" "}
            {selectedLayer + 1}
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Head{" "}
            {selectedHead + 1}
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-900/60">
        <svg
          width={width}
          height={height}
          className="block min-w-full"
        >
          <g
            transform={`translate(${margin.left},${margin.top})`}
          >
            {/* Column Labels */}
            {tokens.map(
              (
                token,
                index
              ) => (
                <g
                  key={`col-${index}`}
                  transform={`translate(${xScale(index) ?? 0}, -10)`}
                >
                  <foreignObject
                    width={
                      xScale.bandwidth()
                    }
                    height={
                      100
                    }
                    x={0}
                    y={-90}
                  >
                    <button
                      type="button"
                      title={
                        token
                      }
                      onClick={() =>
                        setSelectedTokenIndex(
                          index
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-200"
                    >
                      {token}
                    </button>
                  </foreignObject>
                </g>
              )
            )}

            {/* Row Labels */}
            {tokens.map(
              (
                token,
                index
              ) => (
                <g
                  key={`row-${index}`}
                  transform={`translate(-10, ${yScale(index) ?? 0})`}
                >
                  <foreignObject
                    width={
                      100
                    }
                    height={
                      yScale.bandwidth()
                    }
                    x={
                      -110
                    }
                    y={0}
                  >
                    <button
                      type="button"
                      title={
                        token
                      }
                      onClick={() =>
                        setSelectedTokenIndex(
                          index
                        )
                      }
                      className="flex h-full w-full items-center justify-end rounded-lg border border-white/10 bg-slate-900/80 px-2 text-[11px] text-slate-200"
                    >
                      {token}
                    </button>
                  </foreignObject>
                </g>
              )
            )}

            {/* Heatmap Cells */}
            {tokens.map(
              (
                sourceToken,
                sourceIndex
              ) =>
                tokens.map(
                  (
                    targetToken,
                    targetIndex
                  ) => {
                    const score =
                      matrix[
                        sourceIndex
                      ]?.[
                        targetIndex
                      ] ?? 0;

                    const x =
                      xScale(
                        targetIndex
                      ) ?? 0;

                    const y =
                      yScale(
                        sourceIndex
                      ) ?? 0;

                    const w =
                      xScale.bandwidth();

                    const h =
                      yScale.bandwidth();

                    return (
                      <g
                        key={`${sourceIndex}-${targetIndex}`}
                      >
                        <rect
                          x={
                            x
                          }
                          y={
                            y
                          }
                          width={
                            w
                          }
                          height={
                            h
                          }
                          rx={
                            8
                          }
                          fill={colorScale(
                            score
                          )}
                          fillOpacity={Math.max(
                            0.15,
                            score
                          )}
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth={
                            1
                          }
                          className="cursor-pointer"
                          onMouseEnter={(
                            e
                          ) =>
                            setTooltip(
                              {
                                x: e.clientX,
                                y: e.clientY,
                                source:
                                  sourceToken,
                                target:
                                  targetToken,
                                score,
                              }
                            )
                          }
                          onMouseMove={(
                            e
                          ) =>
                            setTooltip(
                              (
                                prev
                              ) =>
                                prev
                                  ? {
                                      ...prev,
                                      x: e.clientX,
                                      y: e.clientY,
                                    }
                                  : null
                            )
                          }
                          onMouseLeave={() =>
                            setTooltip(
                              null
                            )
                          }
                          onClick={() =>
                            setSelectedTokenIndex(
                              sourceIndex
                            )
                          }
                        />

                        <text
                          x={
                            x +
                            w /
                              2
                          }
                          y={
                            y +
                            h /
                              2
                          }
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="10"
                          pointerEvents="none"
                        >
                          {score.toFixed(
                            2
                          )}
                        </text>
                      </g>
                    );
                  }
                )
            )}
          </g>
        </svg>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-white"
          style={{
            left:
              tooltip.x +
              16,
            top:
              tooltip.y +
              16,
          }}
        >
          <div className="font-semibold">
            {
              tooltip.source
            }{" "}
            →
            {
              tooltip.target
            }
          </div>

          <div>
            Attention:{" "}
            {tooltip.score.toFixed(
              4
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}