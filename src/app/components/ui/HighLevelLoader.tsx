import React, { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";
import { Shield, TrendingUp, Zap, CheckCircle2, Lock, Activity, Sparkles } from "lucide-react";

interface HighLevelLoaderProps {
  onComplete?: () => void;
  minDuration?: number; // Minimum milliseconds to show (default 2400ms for cinematic feel)
  statusText?: string;
}

export function HighLevelLoader({
  onComplete,
  minDuration = 2400,
  statusText,
}: HighLevelLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const stages = [
    { title: "INITIALIZING AUDIT ENGINE", detail: "Connecting to Verified Diligence Protocol...", code: "ENGINE_BOOT_01" },
    { title: "CALIBRATING QUANTITATIVE SIGNALS", detail: "Auditing multi-asset alpha matrices...", code: "QUANT_MATRIX_OK" },
    { title: "VERIFYING CRYPTOGRAPHIC LEDGER", detail: "Zero-Knowledge proofs validated without hindsight...", code: "ZK_SNARK_VERIFIED" },
    { title: "SECURE INTERFACE READY", detail: "Institutional grade clearance granted.", code: "MM_CORE_DEPLOYED" },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDuration) * 100));
      setProgress(pct);

      if (pct < 30) setStageIndex(0);
      else if (pct < 65) setStageIndex(1);
      else if (pct < 90) setStageIndex(2);
      else setStageIndex(3);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600); // Allow fade out to finish
        }, 350);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020611] select-none transition-all duration-700 ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-live="polite"
    >
      <style>{`
        @keyframes mmRadarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mmRadarSpinRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes mmPulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
        @keyframes mmWaveDash {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes mmScanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes mmCandleAnim {
          0%, 100% { transform: scaleY(0.7); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes mmFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-radar-spin {
          animation: mmRadarSpin 9s linear infinite;
        }
        .animate-radar-spin-fast {
          animation: mmRadarSpin 3.5s linear infinite;
        }
        .animate-radar-spin-rev {
          animation: mmRadarSpinRev 14s linear infinite;
        }
        .animate-pulse-glow {
          animation: mmPulseGlow 3s ease-in-out infinite;
        }
        .animate-chart-dash {
          stroke-dasharray: 800;
          animation: mmWaveDash 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float-peak {
          animation: mmFloat 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient Neon Lighting Radial Spheres */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-600/20 via-teal-500/15 to-emerald-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Floating Telemetry Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-cyan-900/30 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-ping" />
          <span className="text-cyan-300 font-semibold tracking-wider uppercase text-[11px]">
            MoneyMinds • Quantitative Diligence Terminal
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline text-[10px]">
            PROTOCOL_VERSION: v2.4.9-AUDITED
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Lock className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-400">ENCRYPTION:</span>
            <span className="text-cyan-400 font-bold">AES-256 / TLS</span>
          </div>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>HASH:</span>
            <span className="text-emerald-400 font-mono">0x7F9B...4D21</span>
          </div>
        </div>
      </div>

      {/* CENTERPIECE: SHIELD LOGO + RADAR RINGS + DYNAMIC GRAPH */}
      <div className="relative flex flex-col items-center justify-center max-w-xl w-full px-4">
        
        {/* Graph & Radar Stage Container */}
        <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">

          {/* 1. Outer Radar Sweep Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex items-center justify-center">
            {/* Spinning radar ray sweep */}
            <div 
              className="absolute inset-0 rounded-full animate-radar-spin-fast opacity-30 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, transparent 65deg, transparent 360deg)"
              }}
            />
          </div>

          {/* 2. Concentric Dashed Orbital Rings */}
          <div className="absolute inset-4 rounded-full border border-dashed border-cyan-400/30 animate-radar-spin" />
          <div className="absolute inset-12 rounded-full border border-dashed border-emerald-400/25 animate-radar-spin-rev" />
          <div className="absolute inset-20 rounded-full border border-slate-700/60" />

          {/* 3. Crosshairs / Target Reticles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
          </div>

          {/* 4. DYNAMIC NEON FINANCIAL GRAPH (The "Banger Graph" Element) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-full">
            <svg 
              className="w-full h-full opacity-90" 
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Neon Graph Gradient Fill */}
                <linearGradient id="mmGraphArea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#040817" stopOpacity="0" />
                </linearGradient>

                {/* Neon Stroke Glow */}
                <linearGradient id="mmGraphStroke" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="40%" stopColor="#06b6d4" />
                  <stop offset="80%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>

                <filter id="mmNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dynamic Horizontal Benchmark Grid Lines */}
              <line x1="40" y1="120" x2="360" y2="120" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />
              <line x1="40" y1="200" x2="360" y2="200" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />
              <line x1="40" y1="280" x2="360" y2="280" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />

              {/* Volume Candlestick Bars */}
              <g opacity="0.35">
                <rect x="70" y="270" width="5" height="30" fill="#06b6d4" rx="1.5" style={{ animation: "mmCandleAnim 2s ease-in-out infinite" }} />
                <rect x="95" y="250" width="5" height="50" fill="#10b981" rx="1.5" style={{ animation: "mmCandleAnim 2.2s ease-in-out infinite 0.2s" }} />
                <rect x="120" y="280" width="5" height="20" fill="#06b6d4" rx="1.5" style={{ animation: "mmCandleAnim 1.8s ease-in-out infinite 0.4s" }} />
                <rect x="145" y="240" width="5" height="60" fill="#10b981" rx="1.5" style={{ animation: "mmCandleAnim 2.4s ease-in-out infinite 0.1s" }} />
                <rect x="250" y="220" width="5" height="80" fill="#10b981" rx="1.5" style={{ animation: "mmCandleAnim 2.1s ease-in-out infinite 0.5s" }} />
                <rect x="275" y="190" width="5" height="110" fill="#10b981" rx="1.5" style={{ animation: "mmCandleAnim 2.5s ease-in-out infinite 0.3s" }} />
                <rect x="300" y="160" width="5" height="140" fill="#34d399" rx="1.5" style={{ animation: "mmCandleAnim 2s ease-in-out infinite 0.6s" }} />
              </g>

              {/* Shaded Area Under Curve */}
              <path
                d="M 40 310 Q 90 290 130 250 T 210 220 T 290 150 T 360 90 L 360 330 L 40 330 Z"
                fill="url(#mmGraphArea)"
              />

              {/* Ascending Alpha Line Curve */}
              <path
                d="M 40 310 Q 90 290 130 250 T 210 220 T 290 150 T 360 90"
                stroke="url(#mmGraphStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#mmNeonGlow)"
                className="animate-chart-dash"
              />

              {/* Peak Pulse Beacon & Alpha Tag */}
              <g className="animate-float-peak">
                {/* Ripple ring at graph peak (360, 90) */}
                <circle cx="360" cy="90" r="14" stroke="#34d399" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                <circle cx="360" cy="90" r="7" fill="#34d399" filter="url(#mmNeonGlow)" />
                <circle cx="360" cy="90" r="3" fill="#ffffff" />
              </g>
            </svg>
          </div>

          {/* 5. Peak Floating Metric Badge */}
          <div className="absolute top-12 right-0 sm:right-4 z-20 flex items-center gap-2 bg-[#09152b]/95 border border-emerald-500/50 rounded-lg px-2.5 py-1 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-float-peak backdrop-blur-md">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold text-white tracking-wide">
              +28.4% Alpha
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold">
              ATH
            </span>
          </div>

          {/* 6. Base Valuation Badge */}
          <div className="absolute bottom-12 left-0 sm:left-4 z-20 flex items-center gap-1.5 bg-[#09152b]/95 border border-cyan-500/40 rounded-lg px-2.5 py-1 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-300">
              $61,582.00 BTC
            </span>
          </div>

          {/* 7. THE EXACT MONEYMINDS SHIELD LOGO (Pure Real Logo without box or outline) */}
          <div className="relative z-30 flex items-center justify-center">
            {/* Ambient Multi-layered Shield Glowing Aura */}
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-cyan-500/30 via-teal-400/20 to-emerald-400/30 blur-2xl animate-pulse pointer-events-none" />

            {/* Exact Shield Logo Image */}
            <img
              src={logoImg}
              alt="MoneyMinds Exact Logo Shield"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_0_24px_rgba(6,182,212,0.85)] transform hover:scale-105 transition-transform duration-300 relative z-10"
            />
          </div>
        </div>

        {/* BRAND TITLE & QUANT BADGE */}
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Money<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Minds</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              AUDITED PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 tracking-wider uppercase font-semibold">
            Audited Financial Intelligence & Quantitative Signals
          </p>
        </div>

        {/* PROGRESS BAR & STAGE METRICS */}
        <div className="w-full max-w-md mt-6 space-y-3">
          
          {/* Status Label & Percentage */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold tracking-wider">
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>{stages[stageIndex].title}</span>
            </div>
            <span className="text-emerald-400 font-bold tracking-widest text-sm">
              {progress}%
            </span>
          </div>

          {/* High-Tech Progress Track */}
          <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-cyan-900/60 p-[1px] shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-75 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Luminous Glow Head */}
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white rounded-full shadow-[0_0_10px_#ffffff,0_0_20px_#06b6d4]" />
            </div>
          </div>

          {/* Detail Line */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="text-slate-400 truncate max-w-[280px]">
              {statusText || stages[stageIndex].detail}
            </span>
            <span className="text-cyan-500/80 font-bold shrink-0">
              [{stages[stageIndex].code}]
            </span>
          </div>
        </div>

        {/* FOOTER BADGES */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Zero-Hindsight Audit</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
            <Shield className="h-3 w-3 text-cyan-400" />
            <span>Ledger Proofs</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Multi-Asset Alpha</span>
          </div>
        </div>

      </div>

    </div>
  );
}
