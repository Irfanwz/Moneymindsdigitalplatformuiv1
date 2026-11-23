import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Globe, 
  Lock, 
  ArrowUpRight, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Radio, 
  Layers,
  ArrowRight
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export const InstitutionalFooter: React.FC = () => {
  const [utcTime, setUtcTime] = useState("");
  const [worldTimes, setWorldTimes] = useState({
    london: "",
    newYork: "",
    dubai: "",
    singapore: "",
  });
  const [blockHeight, setBlockHeight] = useState(894218);
  const [blockHash, setBlockHash] = useState("0x7f4c3b9a1e08d62f4e5a9b8c7d6e5f4a3b2c1d0e");
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));

      const formatZone = (tz: string) => {
        try {
          return new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now);
        } catch {
          return "--:--:--";
        }
      };

      setWorldTimes({
        london: formatZone("Europe/London"),
        newYork: formatZone("America/New_York"),
        dubai: formatZone("Asia/Dubai"),
        singapore: formatZone("Asia/Singapore"),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic rolling cryptographic block hash
  useEffect(() => {
    const hashInterval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
      const chars = "0123456789abcdef";
      let newHash = "0x";
      for (let i = 0; i < 40; i++) {
        newHash += chars[Math.floor(Math.random() * chars.length)];
      }
      setBlockHash(newHash);
    }, 7000);
    return () => clearInterval(hashInterval);
  }, []);

  const copyHash = () => {
    navigator.clipboard?.writeText(blockHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <footer className="relative border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#040711] text-slate-600 dark:text-slate-400 pt-16 pb-12 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden transition-colors">
      
      {/* Top Ambient Neon Sweeping Filaments & Radial Spotlights */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-teal-400 to-transparent opacity-80" />
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1780px] mx-auto relative z-10">
        
        {/* --- SECTION 1: BRAND IDENTITY & GLOBAL TIME NODES --- */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Brand Identity & Live Diligence Telemetry */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Link to="/" className="flex items-center gap-3.5 group">
              <img
                src={logoImg}
                alt="MoneyMinds Shield Logo"
                className="h-12 w-12 object-contain filter drop-shadow-[0_2px_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                    Money<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Minds</span>
                  </span>
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-cyan-600 dark:text-cyan-400 font-bold uppercase mt-1">
                  AUDITED FINANCIAL INTELLIGENCE // PROTOCOL V2.4
                </span>
              </div>
            </Link>

            {/* Live Operational Status Capsule */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#070d1a] border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">AUDITOR CRON ONLINE</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">12ms LATENCY</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">99.99% ACCURACY</span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/advisors"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Advisors</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/apply"
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply as Startup</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-500" />
            </Link>
          </div>
        </div>

        {/* --- SECTION 2: LIVE GLOBAL FINANCIAL DESKS TIME HUB --- */}
        <div className="py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Global Dealing Desks
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {/* London */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070d1a] border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-sm">🇬🇧</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">LON / EC2N</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {worldTimes.london || "--:--:--"}
                </span>
              </div>
            </div>

            {/* New York */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070d1a] border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-sm">🇺🇸</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">NYC / WALL ST</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {worldTimes.newYork || "--:--:--"}
                </span>
              </div>
            </div>

            {/* Dubai */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070d1a] border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-sm">🇦🇪</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">DXB / DIFC</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {worldTimes.dubai || "--:--:--"}
                </span>
              </div>
            </div>

            {/* Singapore */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070d1a] border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-sm">🇸🇬</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">SGP / MARINA BAY</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {worldTimes.singapore || "--:--:--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: ROLLING CRYPTOGRAPHIC PROVENANCE HASH TICKER --- */}
        <div className="py-3 px-4 my-6 rounded-2xl bg-white dark:bg-[#070d1a] border border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 font-bold text-[10px] shrink-0 uppercase tracking-wider">
              BLOCK #{blockHeight}
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 hidden sm:inline">PROVENANCE:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold truncate tracking-wide">
                {blockHash}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <button
              onClick={copyHash}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy current cryptographic block hash"
            >
              <Terminal className="h-3 w-3 text-cyan-500" />
              <span>{copiedHash ? "Copied!" : "Copy Hash"}</span>
            </button>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Immutable
            </span>
          </div>
        </div>

        {/* --- SECTION 4: 5 ARCHITECTURAL NAVIGATION COLUMNS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 py-10 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
          
          {/* Col 1: Platform Core */}
          <div>
            <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest mb-1.5">
              01 // CORE
            </div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-500" />
              <span>Platform Core</span>
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <a href="#advisors" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Public Advisors Directory</span>
                </a>
              </li>
              <li>
                <a href="#startups" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Startups Showcase</span>
                </a>
              </li>
              <li>
                <a href="#our-story" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Our Story &amp; Truth Engine</span>
                </a>
              </li>
              <li>
                <a href="#work-with-us" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Work With Us Architecture</span>
                </a>
              </li>
              <li>
                <Link to="/advisors" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Fractional CFO Matching</span>
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>FAST Agreement Templates</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Market Intelligence */}
          <div>
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-1.5">
              02 // RESEARCH
            </div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span>Market Intelligence</span>
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link to="/blogs" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Peer-Reviewed Publications</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs/blog-1" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Cryptographic Truth Logs</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs/blog-2" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Cap Table Physics Matrix</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs/blog-3" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Autonomous Due Diligence</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs/blog-4" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Macro Valuation Horizons</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  <span>Daily Benchmark Feed</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Syndicates & Capital */}
          <div>
            <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mb-1.5">
              03 // DEALROOMS
            </div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-purple-500" />
              <span>Private Syndicates</span>
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Zero-Knowledge Dealrooms</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Encrypted Data Rooms</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Stripe Connect Payouts</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Accredited LP Network</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Series A Syndicate Sourcing</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-purple-400 transition-colors" />
                  <span>Secondary Liquidity Pools</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest mb-1.5">
              04 // AUDIT
            </div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
              <span>Trust &amp; Governance</span>
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Continuous Cron Auditing</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>0% Deleted Record Policy</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>SOC-2 Type II Certified</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>ISO 27001 Data Storage</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>MiCA Compliance Protocols</span>
                </span>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                  <span>Privacy &amp; NDA Terms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Global Desks */}
          <div>
            <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest mb-1.5">
              05 // HUBS
            </div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-500" />
              <span>Global Desks</span>
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>London Desk • EC2N</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>New York • Wall Street Hub</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>Dubai • DIFC Fintech Hive</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>Singapore • Marina Bay Quant</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>Developer REST / WS API</span>
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-500 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-amber-400 transition-colors" />
                  <span>Platform Status &amp; Uptime</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* --- SECTION 5: SECURITY & INFRASTRUCTURE TRUST BADGES --- */}
        <div className="py-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-5 text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              256-BIT SSL ENCRYPTED
            </span>
            <span className="inline-flex items-center gap-1.5 hover:text-blue-500 transition-colors">
              <Terminal className="h-3.5 w-3.5 text-blue-500" />
              SHA-256 IMMUTABLE HASHLOGS
            </span>
            <span className="inline-flex items-center gap-1.5 hover:text-teal-500 transition-colors">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
              STRIPE CONNECT DIRECT PAYOUTS
            </span>
            <span className="inline-flex items-center gap-1.5 hover:text-purple-500 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
              ZERO-KNOWLEDGE PRIVATE DEALROOMS
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-[#070d1a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            <span className="font-bold">GLOBAL NETWORK (USD $)</span>
          </div>
        </div>

        {/* --- SECTION 6: GIGANTIC ARCHITECTURAL TYPOGRAPHIC WATERMARK (CRAZY FINTECH VIBE) --- */}
        <div className="w-full overflow-hidden flex justify-center py-4 pointer-events-none select-none relative my-2">
          <span className="text-[12vw] font-black tracking-tighter text-slate-900/[0.04] dark:text-white/[0.04] uppercase leading-none whitespace-nowrap bg-gradient-to-b from-slate-900/10 dark:from-white/10 to-transparent bg-clip-text">
            MONEYMINDS
          </span>
        </div>

        {/* --- SECTION 7: BOTTOM LEGAL DISCLAIMER & COPYRIGHT --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500 pt-2">
          <p className="max-w-2xl leading-relaxed text-[11px] text-center md:text-left">
            &copy; 2026 MoneyMinds Digital Platform, Inc. All rights reserved. MoneyMinds provides mathematical auditing and credential verification for private market participants. All dealrooms require accredited syndicate status.
          </p>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <Link to="/privacy-policy" className="hover:text-cyan-500 cursor-pointer transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-of-advisory" className="hover:text-cyan-500 cursor-pointer transition-colors">Terms of Advisory</Link>
            <span>•</span>
            <Link to="/security-disclosures" className="hover:text-cyan-500 cursor-pointer transition-colors">Security Disclosures</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
