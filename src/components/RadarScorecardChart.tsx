"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RadarScorecardProps {
  candidateName: string;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
    depth?: number;
    architecture?: number;
  };
  jobBenchmark?: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
    depth?: number;
    architecture?: number;
  };
}

declare global {
  interface Window {
    echarts?: any;
  }
}

export const RadarScorecardChart: React.FC<RadarScorecardProps> = ({
  candidateName,
  scores,
  jobBenchmark = {
    skills: 85,
    experience: 80,
    projects: 85,
    qualifications: 80,
    depth: 85,
    architecture: 80,
  },
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  const indicators = [
    { name: "Skills (50%)", max: 100, candVal: scores.skills, targetVal: jobBenchmark.skills },
    { name: "Experience (25%)", max: 100, candVal: scores.experience, targetVal: jobBenchmark.experience },
    { name: "Projects (15%)", max: 100, candVal: scores.projects, targetVal: jobBenchmark.projects },
    { name: "Qualifications (10%)", max: 100, candVal: scores.qualifications, targetVal: jobBenchmark.qualifications },
    { name: "Tech Depth", max: 100, candVal: scores.depth || Math.min(100, Math.round(scores.skills * 1.05)), targetVal: jobBenchmark.depth || 85 },
    { name: "Systems Design", max: 100, candVal: scores.architecture || Math.min(100, Math.round(scores.projects * 1.02)), targetVal: jobBenchmark.architecture || 80 },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    let chartInstance: any = null;
    let resizeHandler: (() => void) | null = null;
    let intervalId: any = null;
    let attempts = 0;

    const tryInitChart = () => {
      attempts++;
      if (window.echarts && chartRef.current) {
        try {
          if (intervalId) clearInterval(intervalId);
          // If previous instance exists, dispose it cleanly
          if (chartInstance) {
            chartInstance.dispose();
          }

          chartInstance = window.echarts.init(chartRef.current, "dark", {
            renderer: "canvas",
          });

          const option = {
            backgroundColor: "transparent",
            tooltip: {
              trigger: "item",
              backgroundColor: "#18181b",
              borderColor: "#27272a",
              textStyle: { color: "#f4f4f5", fontSize: 12 },
            },
            legend: {
              bottom: 8,
              itemGap: 28,
              data: [candidateName, "Target Benchmark"],
              textStyle: { color: "#a1a1aa", fontSize: 11, padding: [0, 4] },
              selectedMode: false,
            },
            radar: {
              shape: "polygon",
              center: ["50%", "44%"],
              radius: "56%",
              indicator: indicators.map((ind) => ({ name: ind.name, max: ind.max })),
              splitNumber: 4,
              axisName: {
                color: "#d4d4d8",
                fontSize: 10,
                fontWeight: 500,
                padding: [4, 6],
              },
              splitLine: {
                lineStyle: {
                  color: [
                    "rgba(63, 63, 70, 0.4)",
                    "rgba(63, 63, 70, 0.6)",
                    "rgba(63, 63, 70, 0.8)",
                    "rgba(82, 82, 91, 1)",
                  ],
                },
              },
              splitArea: {
                show: true,
                areaStyle: {
                  color: [
                    "rgba(24, 24, 27, 0.7)",
                    "rgba(39, 39, 42, 0.5)",
                    "rgba(24, 24, 27, 0.6)",
                    "rgba(39, 39, 42, 0.4)",
                  ],
                },
              },
              axisLine: {
                lineStyle: {
                  color: "rgba(113, 113, 122, 0.4)",
                },
              },
            },
            series: [
              {
                name: "Assessment Alignment",
                type: "radar",
                data: [
                  {
                    value: indicators.map((ind) => ind.candVal),
                    name: candidateName,
                    symbol: "circle",
                    symbolSize: 6,
                    itemStyle: { color: "#10b981" },
                    lineStyle: { width: 2.5, color: "#10b981" },
                    areaStyle: {
                      color: "rgba(16, 185, 129, 0.25)",
                    },
                  },
                  {
                    value: indicators.map((ind) => ind.targetVal),
                    name: "Target Benchmark",
                    symbol: "none",
                    lineStyle: {
                      width: 1.5,
                      type: "dashed",
                      color: "#6366f1",
                    },
                    areaStyle: {
                      color: "rgba(99, 102, 241, 0.08)",
                    },
                  },
                ],
              },
            ],
          };

          chartInstance.setOption(option);
          setUseSvgFallback(false);

          resizeHandler = () => chartInstance?.resize();
          window.addEventListener("resize", resizeHandler);
          return true;
        } catch (e) {
          console.warn("ECharts init error, using SVG fallback:", e);
          setUseSvgFallback(true);
        }
      }

      if (attempts >= 15) {
        if (intervalId) clearInterval(intervalId);
        setUseSvgFallback(true);
      }
      return false;
    };

    const succeeded = tryInitChart();
    if (!succeeded) {
      setUseSvgFallback(true);
      intervalId = setInterval(tryInitChart, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (chartInstance) chartInstance.dispose();
    };
  }, [candidateName, scores, jobBenchmark]);

  return (
    <div className="relative w-full h-72 flex items-center justify-center bg-zinc-900/60 rounded-xl border border-zinc-800 p-2">
      {/* Container for Apache ECharts Canvas */}
      <div
        ref={chartRef}
        className={`w-full h-full ${useSvgFallback ? "hidden" : "block"}`}
        style={{ minHeight: "260px" }}
      />

      {/* Resilient High-Contrast SVG Fallback for sandbox environments */}
      {useSvgFallback && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
          <svg viewBox="0 0 300 225" className="w-full h-full max-w-[320px]">
            {/* Concentric Hexagons */}
            {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
              const r = 72 * scale;
              const points = indicators
                .map((_, i) => {
                  const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
                  const x = 150 + r * Math.cos(angle);
                  const y = 110 + r * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={sIdx}
                  points={points}
                  fill={sIdx % 2 === 0 ? "rgba(39, 39, 42, 0.3)" : "rgba(24, 24, 27, 0.4)"}
                  stroke="#3f3f46"
                  strokeWidth="1"
                  strokeDasharray={scale === 1.0 ? "none" : "2,2"}
                />
              );
            })}

            {/* Radial Axes */}
            {indicators.map((_, i) => {
              const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
              const x2 = 150 + 72 * Math.cos(angle);
              const y2 = 110 + 72 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="150"
                  y1="110"
                  x2={x2}
                  y2={y2}
                  stroke="#52525b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Benchmark Polygon (Dashed Purple) */}
            {(() => {
              const points = indicators
                .map((ind, i) => {
                  const ratio = ind.targetVal / 100;
                  const r = 72 * ratio;
                  const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
                  const x = 150 + r * Math.cos(angle);
                  const y = 110 + r * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  points={points}
                  fill="rgba(99, 102, 241, 0.15)"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
              );
            })()}

            {/* Candidate Polygon (Solid Glowing Emerald) */}
            {(() => {
              const points = indicators
                .map((ind, i) => {
                  const ratio = ind.candVal / 100;
                  const r = 72 * ratio;
                  const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
                  const x = 150 + r * Math.cos(angle);
                  const y = 110 + r * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  points={points}
                  fill="rgba(16, 185, 129, 0.3)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              );
            })()}

            {/* Candidate Vertex Points */}
            {indicators.map((ind, i) => {
              const ratio = ind.candVal / 100;
              const r = 72 * ratio;
              const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
              const cx = 150 + r * Math.cos(angle);
              const cy = 110 + r * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#10b981"
                  stroke="#064e3b"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Indicator Labels */}
            {indicators.map((ind, i) => {
              const angle = (Math.PI * 2 * i) / indicators.length - Math.PI / 2;
              const lx = 150 + 96 * Math.cos(angle);
              const ly = 110 + 90 * Math.sin(angle);
              return (
                <text
                  key={i}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-zinc-300 text-[10px] font-mono font-medium"
                >
                  {ind.name.split(" ")[0]} ({ind.candVal}%)
                </text>
              );
            })}
          </svg>

          {/* Fallback legend */}
          <div className="flex items-center justify-center gap-6 text-xs font-mono text-zinc-400 mt-3 pt-1.5 border-t border-zinc-800/40 w-full">
            <span className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>{candidateName} ({scores.skills}%)</span>
            </span>
            <span className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-800/40">
              <span className="w-3.5 h-0.5 border-b border-dashed border-indigo-400 inline-block"></span>
              <span>Benchmark (80%)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
