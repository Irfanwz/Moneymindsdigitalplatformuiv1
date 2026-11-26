import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Compass, Shield, Activity, BarChart3, Lock, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { BLOG_ARTICLES, BlogArticle } from "./blogData";

export const BlogSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalCards = BLOG_ARTICLES.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  };

  const handleCardClick = (article: BlogArticle) => {
    navigate(`/blogs/${article.id}`);
  };

  return (
    <section id="blogs" className="relative py-24 px-4 sm:px-8 lg:px-12 xl:px-16 w-full overflow-hidden bg-[#fafafa] dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors scroll-mt-36 lg:scroll-mt-40">
      {/* Generative dotted spiral / particle arc background matching the design */}
      <div className="absolute right-0 top-0 w-[550px] h-[550px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-slate-400 dark:text-slate-600">
          <g>
            {Array.from({ length: 18 }).map((_, ring) => {
              const radius = 60 + ring * 22;
              const count = 14 + ring * 4;
              return Array.from({ length: count }).map((__, dot) => {
                const angle = (dot / count) * Math.PI * 0.9 + (ring * 0.08);
                const cx = 450 - radius * Math.cos(angle);
                const cy = 30 + radius * Math.sin(angle);
                const opacity = Math.max(0.15, 1 - (ring / 18));
                return (
                  <circle
                    key={`dot-${ring}-${dot}`}
                    cx={cx}
                    cy={cy}
                    r={1.25}
                    fill="currentColor"
                    fillOpacity={opacity}
                  />
                );
              });
            })}
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[1780px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Header, Pill Button, Subtext & Navigation Controls */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between h-full pt-2">
            <div>
              {/* Title with exact "↴" arrow */}
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6">
                Market Blogs <span className="inline-block transform translate-y-1 text-slate-800 dark:text-slate-200">↴</span>
              </h2>

              {/* Pill Button: Our Story ↗ */}
              <div className="mb-12">
                <a
                  href="#our-story"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-none border border-slate-900 dark:border-white/90 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-200 group shadow-sm cursor-pointer"
                >
                  <span>Our Story</span>
                  <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Bottom-left area: Supporting text & Navigation arrows */}
            <div className="mt-8 lg:mt-32 space-y-8">
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[240px]">
                Peer-Reviewed Market Briefs, Diligence Memos &amp; Algorithmic Venture Intelligence.
              </p>

              {/* Arrow Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="h-10 w-10 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="h-10 w-10 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Slider Track with 4 Cards */}
          <div className="lg:col-span-8 xl:col-span-9 overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-6 transition-transform duration-500 ease-out py-2"
              style={{
                transform: `translateX(-${currentIndex * 340}px)`,
              }}
            >
              {BLOG_ARTICLES.map((article, index) => {
                const isHeroCard = index === 0;

                return (
                  <div
                    key={article.id}
                    onClick={() => handleCardClick(article)}
                    className="flex-shrink-0 w-[300px] sm:w-[330px] rounded-[28px] bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                    style={{ minHeight: "470px" }}
                  >
                    <div>
                      {/* Top circular icon badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
                          {index === 0 && <Sparkles className="h-4 w-4 text-blue-500" />}
                          {index === 1 && <BarChart3 className="h-4 w-4 text-emerald-500" />}
                          {index === 2 && <Shield className="h-4 w-4 text-purple-500" />}
                          {index === 3 && <Compass className="h-4 w-4 text-amber-500" />}
                        </div>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500">
                          {article.readTime}
                        </span>
                      </div>

                      {/* CARD 1: Vibrant 3D Visual Box matching the uploaded image */}
                      {isHeroCard ? (
                        <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden mb-6 p-5 flex flex-col justify-end text-white shadow-inner bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500">
                          {/* 3D Geometric Blocks in background */}
                          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                            <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                              {/* Isometric 3D Cubes */}
                              <path d="M150 20 L220 60 L150 100 L80 60 Z" fill="#ffffff" fillOpacity="0.4" />
                              <path d="M80 60 L150 100 L150 180 L80 140 Z" fill="#000000" fillOpacity="0.25" />
                              <path d="M150 100 L220 60 L220 140 L150 180 Z" fill="#ffffff" fillOpacity="0.15" />
                              
                              <path d="M230 90 L280 120 L230 150 L180 120 Z" fill="#ffffff" fillOpacity="0.3" />
                              <path d="M180 120 L230 150 L230 195 L180 165 Z" fill="#000000" fillOpacity="0.2" />
                              <path d="M230 150 L280 120 L280 165 L230 195 Z" fill="#ffffff" fillOpacity="0.1" />
                            </svg>
                          </div>
                          
                          {/* Glossy top glass reflection highlight */}
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                          <div className="relative z-10">
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
                              {article.cardTitle}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        /* CARDS 2, 3, 4: Clean, high-impact titles matching the design */
                        <div className="mb-4 pt-1">
                          <h3 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {article.cardTitle}
                          </h3>
                        </div>
                      )}

                      {/* Minimalist Separator Line "—" */}
                      <div className="h-[2px] w-6 bg-slate-300 dark:bg-slate-700 my-4 rounded-full group-hover:w-10 group-hover:bg-blue-500 transition-all duration-300" />

                      {/* Detailed Description Paragraph */}
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                        {article.snippet}
                      </p>
                    </div>

                    {/* Bottom Metadata & Icon */}
                    <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${article.author.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
                          {article.author.initials}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {article.author.name}
                        </span>
                      </div>

                      <div className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Right: Slider Progress Bar Indicator */}
            <div className="mt-8 flex items-center justify-end gap-2 pr-4">
              {BLOG_ARTICLES.map((_, dotIdx) => (
                <button
                  key={`progress-${dotIdx}`}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    currentIndex === dotIdx
                      ? "w-8 bg-slate-900 dark:bg-white"
                      : "w-4 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
