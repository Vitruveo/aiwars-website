"use client";

import { useEffect, useState } from "react";

const START = [
  52, 54, 51, 55, 58, 56, 60, 63, 61, 64, 62, 66, 69, 67, 70, 68, 72, 70, 74,
  71, 68, 72, 75, 73, 76, 74, 71, 74, 77, 75, 78, 76, 73, 70, 72, 69, 71, 74,
  72, 75,
];

export default function LiveSignal() {
  const [points, setPoints] = useState<number[]>(START);

  useEffect(() => {
    const id = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.min(95, Math.max(15, last + (Math.random() - 0.48) * 9));
        return [...prev.slice(1), next];
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const W = 600;
  const H = 120;
  const step = W / (points.length - 1);
  const y = (v: number) => H - (v / 100) * H;
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  const lastY = y(points[points.length - 1]);
  const value = points[points.length - 1];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-3 font-mono text-base uppercase tracking-[0.3em] text-signal">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />
          Battle momentum
        </p>
        <p className="font-mono text-2xl text-ink">{value.toFixed(1)}</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-28 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sigstroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6fd3ff" />
          </linearGradient>
          <linearGradient id="sigfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sigfill)" />
        <path
          d={path}
          fill="none"
          stroke="url(#sigstroke)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ transition: "d 0.6s linear" }}
        />
        <circle cx={W} cy={lastY} r="4" fill="#6fd3ff">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="mt-2 flex justify-between font-mono text-sm tracking-[0.2em] text-faint">
        <span>UPDATES EVERY 5S IN PRODUCTION</span>
        <span>10M MARKET WINDOW</span>
      </div>
    </div>
  );
}
