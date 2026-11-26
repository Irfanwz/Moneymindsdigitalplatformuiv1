import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Share2, Check, Copy, Bookmark, Twitter, Linkedin, ShieldCheck, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { BLOG_ARTICLES, BlogArticle } from "./blogData";
import { Header } from "@/app/components/Header";
import { InstitutionalFooter } from "@/app/components/footer/InstitutionalFooter";

export const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Find article by id or slug
  const article = BLOG_ARTICLES.find(
    (a) => a.id === id || a.slug === id
  ) || BLOG_ARTICLES[0];

  const currentIndex = BLOG_ARTICLES.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? BLOG_ARTICLES[currentIndex - 1] : null;
  const nextArticle = currentIndex < BLOG_ARTICLES.length - 1 ? BLOG_ARTICLES[currentIndex + 1] : null;
  const relatedArticles = BLOG_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  // Scroll to top on mount or article change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [article.id]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Publication URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Reading "${article.title}" on MoneyMinds Intelligence`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Main App Navigation */}
      <Header />

      <main className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <Link
            to="/#blogs"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Market Intelligence</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="h-9 w-9 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on X"
              className="h-9 w-9 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors shadow-sm"
            >
              <Twitter className="h-4 w-4" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              title="Share on LinkedIn"
              className="h-9 w-9 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Linkedin className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSaved(!saved);
                toast(saved ? "Removed from saved articles" : "Saved to your reading list");
              }}
              title="Bookmark"
              className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors shadow-sm"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-amber-500 text-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Article Header */}
        <article className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {article.badge}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {article.date}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {article.snippet}
            </p>
          </div>

          {/* Author Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${article.author.avatarBg} text-white flex items-center justify-center text-base font-bold shadow`}>
              {article.author.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {article.author.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Author
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {article.author.role} • MoneyMinds Market Intelligence
              </p>
            </div>
          </div>

          {/* Editorial 3D Hero Graphic matching the aesthetic of the first image */}
          <div className={`relative w-full h-[260px] sm:h-[340px] rounded-[28px] overflow-hidden p-8 sm:p-12 flex flex-col justify-end text-white shadow-xl bg-gradient-to-br ${article.accentGradient}`}>
            {/* 3D Geometric Overlay Layers */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
              <svg viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                <path d="M300 40 L450 120 L300 200 L150 120 Z" fill="#ffffff" fillOpacity="0.45" />
                <path d="M150 120 L300 200 L300 320 L150 240 Z" fill="#000000" fillOpacity="0.3" />
                <path d="M300 200 L450 120 L450 240 L300 320 Z" fill="#ffffff" fillOpacity="0.2" />

                <path d="M470 160 L570 210 L470 260 L370 210 Z" fill="#ffffff" fillOpacity="0.35" />
                <path d="M370 210 L470 260 L470 340 L370 290 Z" fill="#000000" fillOpacity="0.25" />
                <path d="M470 260 L570 210 L570 290 L470 340 Z" fill="#ffffff" fillOpacity="0.15" />
              </svg>
            </div>

            {/* Glossy sheen */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            {/* Content banner */}
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{article.graphicSubtitle}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                {article.cardTitle}
              </h2>
            </div>
          </div>

          {/* Executive Summary Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-500 dark:border-blue-400 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Executive Summary
            </h3>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {article.executiveSummary}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {article.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {m.label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight block">
                  {m.value}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {m.trend}
                </span>
              </div>
            ))}
          </div>

          {/* Body Content Sections */}
          <div className="pt-6 space-y-10">
            {article.contentSections.map((sec, secIdx) => (
              <section key={secIdx} className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {sec.heading}
                </h2>

                <div className="space-y-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Callout quote if present */}
                {sec.callout && (
                  <blockquote className="my-6 p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border-l-4 border-slate-900 dark:border-white italic text-slate-800 dark:text-slate-200">
                    <p className="text-lg font-medium leading-relaxed mb-2">
                      &ldquo;{sec.callout.quote}&rdquo;
                    </p>
                    <cite className="not-italic text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                      — {sec.callout.source}
                    </cite>
                  </blockquote>
                )}

                {/* Data comparison table if present */}
                {sec.table && (
                  <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-sm">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {sec.table.title}
                      </h4>
                    </div>
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          {sec.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-3 sm:p-4 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-3 sm:p-4 ${
                                  cIdx === 0
                                    ? "font-semibold text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
              Tags:
            </span>
            {article.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Previous / Next Article Navigation Bar */}
          <div className="pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <Link
                to={`/blogs/${prevArticle.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between group shadow-sm"
              >
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Previous Article
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {prevArticle.title}
                </span>
              </Link>
            ) : <div />}

            {nextArticle && (
              <Link
                to={`/blogs/${nextArticle.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between text-right group shadow-sm"
              >
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-end gap-1">
                  Next Article
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {nextArticle.title}
                </span>
              </Link>
            )}
          </div>

          {/* Related Articles Showcase */}
          <div className="pt-16">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              More From MoneyMinds Intelligence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blogs/${rel.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mb-2">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {rel.snippet}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{rel.readTime}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      {/* Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
};
