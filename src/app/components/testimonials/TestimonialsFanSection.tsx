import React, { useState } from "react";
import { Star, CheckCircle2, Play, ShieldCheck, Sparkles, Quote } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  badge: string;
  quote: string;
  videoLength: string;
  videoThumbnail: string;
  embedTitle: string;
}

interface TestimonialReview {
  id: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  cardStyle: {
    bg: string;
    text: string;
    border: string;
    starsColor: string;
    subtext: string;
    dividerColor: string;
    rotation: string;
    zIndex: number;
    desktopPos: string;
  };
}

const FAN_REVIEWS: TestimonialReview[] = [
  {
    id: "rev-1",
    author: "Stephen A.",
    role: "Founder & CEO",
    company: "LedgerLoop",
    rating: 5,
    text: "Within minutes of review, the audited track record confirmed our fractional CFO's 96% accuracy rate. We secured our seed round without endless speculation or deleted past calls.",
    cardStyle: {
      bg: "bg-[#0c1424] text-white",
      text: "text-slate-100",
      border: "border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
      starsColor: "text-purple-400 fill-purple-400",
      subtext: "text-slate-400",
      dividerColor: "border-slate-800",
      rotation: "-rotate-6 md:-rotate-6",
      zIndex: 10,
      desktopPos: "left-[0%] top-[80px]",
    },
  },
  {
    id: "rev-2",
    author: "Julian Thorne",
    role: "General Partner",
    company: "BlueHarbor VC",
    rating: 5,
    text: "Super professional, organised and great to work with. These machine diligence reports were invaluable to our investment committee. Can't recommend enough.",
    cardStyle: {
      bg: "bg-[#3b82f6] text-white",
      text: "text-white",
      border: "border-blue-400/30 shadow-[0_25px_60px_rgba(59,130,246,0.35)]",
      starsColor: "text-white fill-white",
      subtext: "text-blue-100",
      dividerColor: "border-blue-400/40",
      rotation: "rotate-3 md:rotate-3",
      zIndex: 20,
      desktopPos: "left-[20%] top-[15px]",
    },
  },
  {
    id: "rev-3",
    author: "David K.",
    role: "Syndicate Lead",
    company: "Atlas Angels",
    rating: 5,
    text: "Recently used MoneyMinds for our syndicate allocation. The verified prediction logs kept advisors strictly focused on real alpha instead of retrospective hype.",
    cardStyle: {
      bg: "bg-[#f8fafc] dark:bg-[#131d33] text-slate-900 dark:text-white",
      text: "text-slate-700 dark:text-slate-200",
      border: "border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
      starsColor: "text-indigo-500 fill-indigo-500",
      subtext: "text-slate-500 dark:text-slate-400",
      dividerColor: "border-slate-200 dark:border-slate-700",
      rotation: "rotate-2 md:rotate-2",
      zIndex: 15,
      desktopPos: "left-[57%] top-[25px]",
    },
  },
  {
    id: "rev-4",
    author: "Barry W.",
    role: "Co-Founder & COO",
    company: "NeuroPulse Health",
    rating: 5,
    text: "Really useful system. We got an amazing fractional CFO for our $5.2M round and kept our cap table completely clean of dead equity. Absolutely top-tier service.",
    cardStyle: {
      bg: "bg-white dark:bg-[#0e1629] text-slate-900 dark:text-white",
      text: "text-slate-700 dark:text-slate-200",
      border: "border-slate-200 dark:border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)]",
      starsColor: "text-blue-500 fill-blue-500",
      subtext: "text-slate-500 dark:text-slate-400",
      dividerColor: "border-slate-200 dark:border-slate-700",
      rotation: "-rotate-2 md:-rotate-2",
      zIndex: 25,
      desktopPos: "left-[38%] top-[190px]",
    },
  },
  {
    id: "rev-5",
    author: "Simon F.",
    role: "Family Office Director",
    company: "Geneva Capital",
    rating: 5,
    text: "Sorted confidential dealroom access in 48 hours. Timely, verified, and professional. Zero-knowledge privacy guarantees are far superior to standard NDAs.",
    cardStyle: {
      bg: "bg-[#10b981] text-white",
      text: "text-white",
      border: "border-emerald-400/40 shadow-[0_25px_60px_rgba(16,185,129,0.35)]",
      starsColor: "text-slate-900 fill-slate-900",
      subtext: "text-emerald-100",
      dividerColor: "border-emerald-400/40",
      rotation: "rotate-6 md:rotate-6",
      zIndex: 30,
      desktopPos: "left-[73%] top-[120px]",
    },
  },
];

interface TestimonialsFanSectionProps {
  videos: VideoTestimonial[];
  onOpenVideo: (video: VideoTestimonial) => void;
}

export const TestimonialsFanSection: React.FC<TestimonialsFanSectionProps> = ({
  videos,
  onOpenVideo,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 sm:px-8 lg:px-12 xl:px-16 bg-slate-50/70 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800/80 w-full overflow-hidden transition-colors">
      <div className="w-full max-w-[1780px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 uppercase mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Institutional Trust &amp; Verified Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4">
            Trusted by Elite Founders &amp; Syndicates
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Accredited funds, angel syndicate leads, and venture founders on how MoneyMinds replaces blind trust with mathematical verification.
          </p>
        </div>

        {/* TOP: Video Testimonials with Precision Institutional Architecture (No Border Radius) */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="rounded-none bg-white dark:bg-[#080d18] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-500/80 transition-all duration-300 relative group flex flex-col justify-between"
            >
              {/* Precision Fintech Corner Crosshairs */}
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity z-20" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity z-20" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity z-20" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity z-20" />

              {/* Video Thumbnail with Precision Play HUD */}
              <div
                className="relative h-64 w-full overflow-hidden cursor-pointer rounded-none border-b border-slate-200 dark:border-slate-800/80 bg-slate-950"
                onClick={() => onOpenVideo(vid)}
              >
                <img
                  src={vid.videoThumbnail}
                  alt={vid.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d18] via-black/40 to-black/20" />

                {/* Subtle tech grid scanlines */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_51%)] bg-[size:100%_4px] pointer-events-none" />

                {/* Precision Centered Play HUD */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute h-20 w-20 rounded-none border border-emerald-500/30 animate-ping pointer-events-none" />
                    <div className="h-16 w-16 rounded-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-all duration-200 border border-emerald-300">
                      <Play className="h-7 w-7 ml-1 fill-slate-950 text-slate-950" />
                    </div>
                  </div>
                </div>

                {/* Top Corner Telemetry Tag */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-none bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>DILIGENCE RECORD // ARCHIVED</span>
                </div>

                {/* Bottom Length & Title Badges */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-none bg-black/85 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold">
                  {vid.videoLength}
                </div>
                <div className="absolute bottom-3 left-3 max-w-[75%] px-2.5 py-1 rounded-none bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-semibold truncate drop-shadow-md">
                  {vid.embedTitle}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                        {vid.name}
                      </h4>
                      <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                        {vid.role}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-none self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-wider border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5">
                      {vid.badge}
                    </Badge>
                  </div>
                  <div className="border-l-2 border-emerald-500/50 pl-3.5 py-0.5">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      &ldquo;{vid.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Machine-Verified Audio Transcript
                  </span>
                  <span className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => onOpenVideo(vid)}>
                    Watch Clip &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM: THE SPREAD / FAN REVIEWS SECTION (MATCHING THE 2ND IMAGE) */}
        <div className="relative mt-4 pt-4">
          {/* Desktop Scattered Overlapping Fan Container Spread Full Width */}
          <div className="hidden lg:block relative w-full h-[560px] max-w-[1720px] mx-auto my-4 px-2">
            {FAN_REVIEWS.map((rev, idx) => {
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={rev.id}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`absolute w-[360px] p-6 rounded-[24px] border transition-all duration-500 ease-out cursor-pointer ${
                    rev.cardStyle.bg
                  } ${rev.cardStyle.border} ${
                    isHovered
                      ? "z-50 scale-105 rotate-0 shadow-[0_35px_80px_rgba(0,0,0,0.35)] -translate-y-4"
                      : `${rev.cardStyle.rotation}`
                  } ${rev.cardStyle.desktopPos}`}
                  style={{
                    zIndex: isHovered ? 50 : rev.cardStyle.zIndex,
                  }}
                >
                  {/* Stars Row */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {Array.from({ length: rev.rating }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`h-4 w-4 ${rev.cardStyle.starsColor}`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className={`text-xs sm:text-[13px] leading-relaxed font-medium mb-6 ${rev.cardStyle.text}`}>
                    {rev.text}
                  </p>

                  {/* Clean Bottom Divider */}
                  <div className={`pt-3 border-t ${rev.cardStyle.dividerColor} flex items-center justify-between`}>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block">
                        {rev.author}
                      </span>
                      <span className={`text-[11px] font-medium ${rev.cardStyle.subtext}`}>
                        {rev.role} • {rev.company}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-90">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile / Tablet Responsive Grid Fallback */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {FAN_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className={`p-6 rounded-2xl border ${rev.cardStyle.bg} ${rev.cardStyle.border}`}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  {Array.from({ length: rev.rating }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`h-4 w-4 ${rev.cardStyle.starsColor}`}
                    />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${rev.cardStyle.text}`}>
                  &ldquo;{rev.text}&rdquo;
                </p>
                <div className={`pt-3 border-t ${rev.cardStyle.dividerColor} flex items-center justify-between text-xs`}>
                  <div>
                    <span className="font-bold block">{rev.author}</span>
                    <span className={`text-[11px] ${rev.cardStyle.subtext}`}>
                      {rev.role} • {rev.company}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
