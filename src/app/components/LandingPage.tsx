import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Bitcoin,
  DollarSign,
  Zap,
  Loader2,
  Lock,
  Star,
  Award,
  Play,
  Mail,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowDownRight,
  ChevronRight,
  X,
  BadgeCheck,
  Briefcase,
  MapPin,
  Heart,
  Layers,
  FileText,
  Clock,
  Send,
  Database,
  Cpu,
  Check,
  AlertCircle,
  XCircle,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Header } from "@/app/components/Header";
import { BlogSection } from "./blog/BlogSection";
import { TestimonialsFanSection } from "./testimonials/TestimonialsFanSection";
import { InstitutionalFooter } from "./footer/InstitutionalFooter";
import { HighLevelLoader } from "@/app/components/ui/HighLevelLoader";
import { useAuth } from "@/app/contexts/AuthContext";
import { chartTooltipTheme } from "@/app/components/ui/chart-theme";
import { getAdvisorAvatar, getInitials, getAvatarGradient, isRealImage } from "@/app/lib/avatarHelper";

// --- Location & Flag Resolver for Realistic Human Directory Cards ---
function getAdvisorLocationDetails(location?: string) {
  if (!location) return { flag: "🌐", from: "Global", based: "Worldwide" };
  const lower = location.toLowerCase();
  if (lower.includes("uk") || lower.includes("london") || lower.includes("britain") || lower.includes("england")) {
    return { flag: "🇬🇧", from: "United Kingdom", based: location };
  }
  if (lower.includes("usa") || lower.includes("us") || lower.includes("new york") || lower.includes("san francisco") || lower.includes("austin") || lower.includes("united states")) {
    return { flag: "🇺🇸", from: "United States", based: location };
  }
  if (lower.includes("uae") || lower.includes("dubai") || lower.includes("emirates")) {
    return { flag: "🇦🇪", from: "United Arab Emirates", based: location };
  }
  if (lower.includes("germany") || lower.includes("munich") || lower.includes("berlin")) {
    return { flag: "🇩🇪", from: "Germany", based: location };
  }
  if (lower.includes("argentina") || lower.includes("buenos aires")) {
    return { flag: "🇦🇷", from: "Argentina", based: location };
  }
  if (lower.includes("nigeria") || lower.includes("lagos")) {
    return { flag: "🇳🇬", from: "Nigeria", based: location };
  }
  if (lower.includes("singapore")) {
    return { flag: "🇸🇬", from: "Singapore", based: location };
  }
  if (lower.includes("italy")) {
    return { flag: "🇮🇹", from: "Italy", based: location };
  }
  if (lower.includes("spain")) {
    return { flag: "🇪🇸", from: "Spain", based: location };
  }
  if (lower.includes("tunisia")) {
    return { flag: "🇹🇳", from: "Tunisia", based: location };
  }
  const parts = location.split(",");
  const country = parts[parts.length - 1]?.trim() || location;
  return { flag: "🌐", from: country, based: location };
}

// --- Sample Curated Data for Public Showcase ---

const DEFAULT_ADVISORY_MEMBERS = [
  { id: "mem-1", name: "Jordan Lee", company: "GreenGrid Energy", role: "CEO & Co-Founder", avatarUrl: null },
  { id: "mem-2", name: "Priya Sharma", company: "PayStack AI", role: "CTO & Co-Founder", avatarUrl: null },
  { id: "mem-3", name: "Sam Rivera", company: "GreenGrid Energy", role: "VP Engineering", avatarUrl: null },
  { id: "mem-4", name: "Marcus Johnson", company: "PayStack AI", role: "Head of Growth", avatarUrl: null },
  { id: "mem-5", name: "Amina Belkacem", company: "Atlas Ventures", role: "Principal Director", avatarUrl: null },
  { id: "mem-6", name: "Julian Thorne", company: "BlueHarbor VC", role: "General Partner", avatarUrl: null },
];

const FEATURED_ADVISORS = [
  {
    id: "adv-1",
    name: "Dr. Marcus Vance, CFA",
    title: "Senior Macro & Fintech Strategist",
    location: "London, UK",
    avatar: null,
    avatarUrl: null,
    experience: "14+ Years",
    specialization: ["Cap Table Structuring", "Seed-to-Series A", "Fintech Risk"],
    verified: true,
    realSubscribers: "1,840",
    realCredibility: "96/100",
    winRate: "78%",
    bio: "Ex-Barclays Quant director advising early-stage fintechs on governance, financial runways, and institutional positioning.",
    membersCount: 7,
    members: DEFAULT_ADVISORY_MEMBERS.slice(0, 5),
  },
  {
    id: "adv-2",
    name: "Elena Rostova",
    title: "Venture Partner & CFO Advisor",
    location: "New York, USA",
    avatar: null,
    avatarUrl: null,
    experience: "11+ Years",
    specialization: ["Valuation Modeling", "M&A Strategy", "SaaS Metrics"],
    verified: true,
    realSubscribers: "2,310",
    realCredibility: "94/100",
    winRate: "82%",
    bio: "Guided 34 tech startups through over $120M in aggregate institutional raises across North America and Europe.",
    membersCount: 8,
    members: [DEFAULT_ADVISORY_MEMBERS[1], DEFAULT_ADVISORY_MEMBERS[0], DEFAULT_ADVISORY_MEMBERS[3], DEFAULT_ADVISORY_MEMBERS[4], DEFAULT_ADVISORY_MEMBERS[5]],
  },
  {
    id: "adv-3",
    name: "Tariq Al-Mansoor",
    title: "Crypto & Algorithmic Market Specialist",
    location: "Dubai, UAE",
    avatar: null,
    avatarUrl: null,
    experience: "9+ Years",
    specialization: ["Digital Asset Risk", "Treasury Management", "DeFi Compliance"],
    verified: true,
    realSubscribers: "980",
    realCredibility: "91/100",
    winRate: "74%",
    bio: "Registered digital assets advisor specializing in Web3 treasury security and audited predictive market signals.",
    membersCount: 6,
    members: [DEFAULT_ADVISORY_MEMBERS[2], DEFAULT_ADVISORY_MEMBERS[4], DEFAULT_ADVISORY_MEMBERS[1], DEFAULT_ADVISORY_MEMBERS[5], DEFAULT_ADVISORY_MEMBERS[0]],
  },
];

const FEATURED_STARTUPS = [
  {
    id: "st-1",
    num: "01",
    name: "PayStack AI",
    badge: "FinTech & Payments",
    stage: "Seed Round ($3.2M)",
    tagline: "AI payment infrastructure reducing fraud by 87% across high-volume merchants.",
    metrics: "$2.1B APV • 340+ Merchants",
    location: "New York, USA",
    seeking: "Advisory for $12M Series A & EU Expansion",
    colorClass: "c1",
    colorHex: "#06b6d4",
    sparkline: "M0,28 L15,22 L30,25 L45,18 L60,20 L75,12 L90,8 L105,4 L120,2",
  },
  {
    id: "st-2",
    num: "02",
    name: "GreenGrid Energy",
    badge: "CleanTech & IoT",
    stage: "Pre-Seed ($750K)",
    tagline: "Commercial building IoT optimization cutting energy waste by 35% in real time.",
    metrics: "$420k ARR • 135% Net Retention",
    location: "Austin, TX",
    seeking: "Advisory for $3M Seed & 3-City Expansion",
    colorClass: "c2",
    colorHex: "#10b981",
    sparkline: "M0,30 L15,27 L30,22 L45,24 L60,16 L75,18 L90,10 L105,6 L120,3",
  },
  {
    id: "st-3",
    num: "03",
    name: "EduSphere AI",
    badge: "EdTech & Workforce",
    stage: "Seed Round ($1.8M)",
    tagline: "Adaptive AI skill-mapping and curriculum infrastructure for enterprise & universities.",
    metrics: "140+ Universities • $92k MRR",
    location: "London, UK",
    seeking: "Advisory for UK Accreditation & Series A",
    colorClass: "c3",
    colorHex: "#3b82f6",
    sparkline: "M0,26 L15,24 L30,26 L45,19 L60,15 L75,12 L90,9 L105,7 L120,2",
  },
  {
    id: "st-4",
    num: "04",
    name: "DataSync AI",
    badge: "AI & Machine Learning",
    stage: "Series A ($5.5M)",
    tagline: "Low-latency market pipeline & predictive risk modeling for quantitative funds.",
    metrics: "45 Quants • $1.8M ARR",
    location: "San Francisco, USA",
    seeking: "Advisory for Series A Lead & Risk Modeling",
    colorClass: "c4",
    colorHex: "#14b8a6",
    sparkline: "M0,32 L15,26 L30,22 L45,18 L60,16 L75,11 L90,8 L105,5 L120,1",
  },
  {
    id: "st-5",
    num: "05",
    name: "BlockSec Protocol",
    badge: "Web3 & Blockchain",
    stage: "Seed Round ($2.5M)",
    tagline: "Multi-sig cryptographic reserve auditing & automated liquidity risk engine.",
    metrics: "$42M TVL Secured • Zero Exploits",
    location: "Dubai, UAE",
    seeking: "MiCA Compliance & Treasury Risk Advisory",
    colorClass: "c5",
    colorHex: "#a855f7",
    sparkline: "M0,28 L15,25 L30,20 L45,22 L60,14 L75,10 L90,8 L105,4 L120,1",
  },
  {
    id: "st-6",
    num: "06",
    name: "NeuroPulse Health",
    badge: "HealthTech & Diagnostics",
    stage: "Series A ($5.2M)",
    tagline: "Predictive neural diagnostics for clinical neurology teams powered by edge AI.",
    metrics: "12 Hospital Pilots • HIPAA Certified",
    location: "Boston, USA",
    seeking: "Advisory for FDA Diligence & Scale-up CFO",
    colorClass: "c6",
    colorHex: "#f59e0b",
    sparkline: "M0,30 L15,26 L30,24 L45,19 L60,18 L75,13 L90,9 L105,5 L120,2",
  },
  {
    id: "st-7",
    num: "07",
    name: "OmniRoute Global",
    badge: "B2B SaaS / Global Trade",
    stage: "Pre-Series A ($3.5M)",
    tagline: "Global multimodal supply chain finance with integrated working capital facilities.",
    metrics: "$6.8M GMV • +45% MoM",
    location: "Singapore",
    seeking: "Advisory for Trade Facilities & Cap Table",
    colorClass: "c7",
    colorHex: "#0ea5e9",
    sparkline: "M0,29 L15,25 L30,23 L45,17 L60,15 L75,11 L90,7 L105,4 L120,1",
  },
];

const BLOGS = [
  {
    id: "blog-1",
    title: "How Audited AI Verification is Ending 'Hype Advisory' in Tech",
    category: "AI & Credibility",
    date: "November 18, 2026",
    readTime: "5 min read",
    snippet: "Why traditional static advisor endorsements fail, and how verifiable prediction logs restore accountability to venture markets.",
    author: "MoneyMinds Research Team",
  },
  {
    id: "blog-2",
    title: "From Seed to Series A: Designing Your First High-Impact Advisory Board",
    category: "Founder Strategy",
    date: "November 12, 2026",
    readTime: "7 min read",
    snippet: "Equity grants, vesting cliffs, and advisory milestones: what founders must know before issuing FAST agreements in 2026.",
    author: "Elena Rostova",
  },
  {
    id: "blog-3",
    title: "Macro Horizons: Liquidity, Fed Policy & Startup Valuations",
    category: "Macro Intelligence",
    date: "November 05, 2026",
    readTime: "4 min read",
    snippet: "An analysis of private equity dry powder, debt multiples, and valuation discipline for seed & growth tech founders.",
    author: "Dr. Marcus Vance",
  },
];

const TESTIMONIALS_VIDEO = [
  {
    id: "vid-1",
    name: "Julian Thorne",
    role: "General Partner, BlueHarbor Ventures",
    badge: "Verified Institutional VC",
    quote: "MoneyMinds cuts out 80% of our preliminary screening noise. Startups backed by audited advisors consistently show cleaner cap tables and disciplined governance.",
    videoLength: "1:45",
    videoThumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=80",
    embedTitle: "Why BlueHarbor Uses Audited Signals",
  },
  {
    id: "vid-2",
    name: "Sarah Chen, Ph.D.",
    role: "Managing Director, Horizon Growth Fund",
    badge: "Verified Growth Investor",
    quote: "The blurred public score model keeps advisors focused on real track records instead of marketing. When we unlock private profiles, the data is completely transparent.",
    videoLength: "2:10",
    videoThumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    embedTitle: "Institutional Due Diligence with MoneyMinds",
  },
];

const TESTIMONIALS_TEXT = [
  {
    id: "test-1",
    author: "David K.",
    fund: "Syndicate Lead & Angel Investor",
    verified: true,
    rating: 5,
    text: "Having advisor predictions machine-audited before they pitch deals to private investors makes MoneyMinds the most trustworthy ecosystem I've backed in a decade.",
  },
  {
    id: "test-2",
    author: "Amina Belkacem",
    fund: "Family Office Principal",
    verified: true,
    rating: 5,
    text: "The platform's rule of keeping investors strictly private while displaying public audited advisor and startup credibility is exactly how institutional privacy should be handled.",
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [publicAdvisors, setPublicAdvisors] = useState<any[]>(FEATURED_ADVISORS);
  const [activeStoryAct, setActiveStoryAct] = useState<"crisis" | "engine" | "ecosystem">("engine");
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  // Modals & Interactive States
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [activePhone, setActivePhone] = useState<1 | 2>(1);

  useEffect(() => {
    const handleReplay = () => setShowLoader(true);
    window.addEventListener("mm-replay-loader", handleReplay);
    return () => window.removeEventListener("mm-replay-loader", handleReplay);
  }, []);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const [marketRes, statsRes, advisorsRes] = await Promise.all([
          fetch("/api/public/market").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch("/api/public/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch("/api/public/advisors", { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        if (marketRes) setMarketData(marketRes);
        if (statsRes) setPlatformStats(statsRes);
        if (advisorsRes?.advisors && advisorsRes.advisors.length > 0) {
          const mapped = advisorsRes.advisors.map((adv: any, idx: number) => ({
            id: adv.id || `adv-db-${idx}`,
            name: adv.name,
            title: adv.title || "Financial & Venture Strategist",
            location: adv.location || "Global Advisor",
            avatar: adv.avatarUrl || adv.photoUrl || null,
            experience: adv.yearsExperience ? `${adv.yearsExperience}+ Years` : "8+ Years",
            specialization: Array.isArray(adv.specialization)
              ? adv.specialization
              : typeof adv.specialization === "string" && adv.specialization
              ? [adv.specialization]
              : ["Growth Strategy", "Cap Table"],
            verified: true,
            realSubscribers: adv.clientsHelped ? `${adv.clientsHelped * 45}` : "1,450",
            realCredibility: adv.credibilityScore ? `${adv.credibilityScore}/100` : "95/100",
            winRate: "79%",
            bio: adv.bio || "Certified financial advisor guiding growth enterprises and venture portfolios.",
            membersCount: adv.membersCount || (7 + (idx % 3)),
            members: adv.members && adv.members.length > 0 
              ? adv.members 
              : DEFAULT_ADVISORY_MEMBERS.slice((idx * 2) % 3, ((idx * 2) % 3) + 5),
          }));
          setPublicAdvisors(mapped);
        }
      } catch {
        // use fallbacks
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            const headerEl = document.querySelector('.sticky') as HTMLElement | null;
            const headerHeight = headerEl ? headerEl.offsetHeight : 120;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - headerHeight - 24;

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth"
            });
          }, 80);
        }
      }
    };
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  const openUnlockModal = (advisor?: any) => {
    setSelectedAdvisor(advisor || null);
    setUnlockModalOpen(true);
  };

  const openVideoModal = (video: any) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterEmail("");
    }, 3000);
  };

  const cryptoChart = marketData?.cryptoChart ?? [];
  const prices = marketData?.prices;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* High-Level Cinematic Fintech Loader */}
      {showLoader && (
        <HighLevelLoader onComplete={() => setShowLoader(false)} minDuration={2200} />
      )}

      <Header />

      {/* --- HERO SECTION WITH 3D FINTECH PHONE & COINS VISUAL --- */}
      <section className="relative pt-16 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow ambient meshes */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[450px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Hero Headline, Subtitle & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm shadow-emerald-500/5 mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 tracking-wide uppercase">
                  Audited Financial Minds &amp; Verified Dealflow
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6"
              >
                Where Smart Capital &amp;{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Audited Financial Minds
                </span>{" "}
                Meet.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-10"
              >
                MoneyMinds connects vetted startups with verified financial advisors and private capital. 
                All advisor signals, predictions, and credentials are machine-audited to build transparent, accountable track records.
              </motion.p>

              {/* Dual CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto mb-14"
              >
                <a href="#advisors" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-13 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 rounded-xl border-0 transition-all duration-200">
                    Explore Public Advisors
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link to={user ? "/choose-role" : "/apply"} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base rounded-xl backdrop-blur-md">
                    {user ? "Go to Dashboard" : "Join Platform"}
                  </Button>
                </Link>
              </motion.div>

              {/* Quick Pillars Trust Strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl pt-6 border-t border-slate-200/80 dark:border-slate-800/80"
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Machine-Audited Scores</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Building2 className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <span>Vetted Startup Pipeline</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Lock className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <span>Private Investor Rooms</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <BarChart3 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Verifiable Track Records</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: 3D Angled Fintech Phones Mockup with Live Graphs & Floating Coins */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px] select-none">
              
              {/* Concentric Ambient Light Rings behind phones */}
              <div className="absolute w-[360px] h-[360px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/25 blur-3xl pointer-events-none" />
              <div className="absolute w-[280px] h-[280px] rounded-full bg-purple-500/15 dark:bg-purple-500/20 blur-2xl pointer-events-none" />

              {/* FLOATING 3D COIN 1: Gold Bitcoin (Top Left) */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                className="absolute -top-4 left-4 sm:left-8 z-30 flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200/90 shadow-[0_0_25px_rgba(245,158,11,0.65)] cursor-pointer transform -rotate-12"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-amber-600/40 flex items-center justify-center bg-amber-400/90 shadow-inner">
                  <span className="font-black text-amber-950 text-xl sm:text-2xl font-mono">₿</span>
                </div>
              </motion.div>

              {/* FLOATING 3D COIN 2: Cyan Ethereum (Top Right) */}
              <motion.div
                animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.6 }}
                className="absolute top-10 -right-2 sm:right-2 z-30 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-cyan-600 via-teal-400 to-cyan-200 border-2 border-cyan-200/90 shadow-[0_0_25px_rgba(6,182,212,0.65)] transform rotate-12"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-cyan-700/40 flex items-center justify-center bg-cyan-400/90 shadow-inner">
                  <span className="font-black text-cyan-950 text-lg sm:text-xl font-mono">Ξ</span>
                </div>
              </motion.div>

              {/* FLOATING 3D COIN 3: Emerald Dollar / MoneyMinds Coin (Bottom Right) */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut", delay: 1.2 }}
                className="absolute -bottom-4 right-6 sm:right-10 z-30 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-200 border-2 border-emerald-200/90 shadow-[0_0_25px_rgba(16,185,129,0.65)] transform rotate-6"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-emerald-700/40 flex items-center justify-center bg-emerald-400/90 shadow-inner">
                  <span className="font-black text-emerald-950 text-lg sm:text-xl font-mono">$</span>
                </div>
              </motion.div>

              {/* FLOATING 3D COIN 4: Purple Alpha Token (Bottom Left) */}
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut", delay: 1.8 }}
                className="absolute bottom-6 -left-2 sm:left-2 z-30 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-400 to-purple-200 border-2 border-purple-200/90 shadow-[0_0_20px_rgba(168,85,247,0.6)] transform -rotate-6"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-purple-700/40 flex items-center justify-center bg-purple-400/90 shadow-inner">
                  <span className="font-black text-purple-950 text-base sm:text-lg font-mono">α</span>
                </div>
              </motion.div>

              {/* --- PHONE 2: PERFORMANCE & QUANT GRAPH (HOVER/CLICK BRINGS FULL TO FRONT) --- */}
              <motion.div
                onMouseEnter={() => setActivePhone(2)}
                onClick={() => setActivePhone(2)}
                animate={
                  activePhone === 2
                    ? { zIndex: 30, scale: 1.04, x: -12, y: -18, rotate: 0, opacity: 1 }
                    : { zIndex: 10, scale: 0.94, x: 26, y: -10, rotate: 12, opacity: 0.9 }
                }
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="absolute right-0 sm:right-4 w-[225px] sm:w-[265px] rounded-[38px] p-2.5 bg-gradient-to-b from-slate-700/80 via-slate-800/90 to-slate-950 border-2 border-purple-500/40 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_40px_rgba(168,85,247,0.4)] backdrop-blur-md cursor-pointer select-none"
              >
                {/* Phone 2 Screen */}
                <div className="rounded-[28px] bg-[#070b16] border border-slate-800/90 p-3 text-white overflow-hidden shadow-inner">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-mono">
                    <span className="text-white font-semibold">9:41</span>
                    <div className="w-14 h-3.5 bg-black rounded-full mx-auto flex items-center justify-center border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    </div>
                    <span>5G</span>
                  </div>

                  {/* Header Title */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Credibility Performance</p>
                      <p className="text-sm font-bold text-white font-mono">$24,800.00</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                      +14.8%
                    </span>
                  </div>

                  {/* Time Range Pills */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 bg-slate-900/80 rounded-lg p-1 mb-2">
                    <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded font-semibold">Today</span>
                    <span>Week</span>
                    <span>Month</span>
                    <span>All</span>
                  </div>

                  {/* Neon Wave Graph (SVG) */}
                  <div className="w-full h-20 my-1 relative">
                    <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="purpleNeon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,45 L20,30 L40,48 L60,18 L80,38 L100,24 L120,40 L140,12 L160,28"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M0,45 L20,30 L40,48 L60,18 L80,38 L100,24 L120,40 L140,12 L160,28 L160,60 L0,60 Z"
                        fill="url(#purpleNeon)"
                      />
                      <circle cx="140" cy="12" r="3" fill="#a855f7" className="animate-ping" />
                      <circle cx="140" cy="12" r="3" fill="#ffffff" />
                    </svg>
                  </div>

                  {/* Mini Outcome Cards */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border border-cyan-500/30 text-left">
                      <p className="text-[8px] text-cyan-300 font-semibold uppercase">Outcome</p>
                      <p className="text-[10px] font-bold text-white font-mono">+$1,480.00</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/20 border border-purple-500/30 text-left">
                      <p className="text-[8px] text-purple-300 font-semibold uppercase">Win Rate</p>
                      <p className="text-[10px] font-bold text-white font-mono">84.2%</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* --- PHONE 1: FRONT/MAIN ADVISOR DILIGENCE PHONE (HOVER/CLICK SWAPS) --- */}
              <motion.div
                onMouseEnter={() => setActivePhone(1)}
                onClick={() => setActivePhone(1)}
                animate={
                  activePhone === 1
                    ? { zIndex: 30, scale: 1.03, x: 0, y: 0, rotate: -6, opacity: 1 }
                    : { zIndex: 10, scale: 0.94, x: -35, y: 15, rotate: -12, opacity: 0.82 }
                }
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="relative w-[235px] sm:w-[275px] rounded-[42px] p-2.5 sm:p-3 bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-950 border-2 border-slate-600/70 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-xl cursor-pointer select-none"
              >
                {/* Phone 1 Screen */}
                <div className="rounded-[32px] bg-[#070d1d] border border-slate-800/90 p-3 sm:p-4 text-white overflow-hidden shadow-inner">
                  
                  {/* Status Bar & Dynamic Island */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                    <span className="font-semibold">9:41</span>
                    <div className="w-18 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 text-amber-400" />
                      <span>100%</span>
                    </div>
                  </div>

                  {/* User Profile Bar */}
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          alt="User Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Good Evening</p>
                        <p className="text-xs font-bold text-white leading-tight">Marcus Vance, CFA</p>
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Main Bank / Capital Account Card */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0e172e] to-slate-900 border border-cyan-500/25 mb-3 shadow-md">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Audited Advisory Balance</span>
                      <span className="text-emerald-400 font-bold font-mono">+28.4%</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight mb-2">
                      $142,500.00
                    </div>

                    {/* Gradient Action Buttons (Send / Receive / Alpha) */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-[10px] shadow-sm shadow-cyan-500/30 transition-all flex items-center justify-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        Alpha Signal
                      </button>
                      <button className="flex-1 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-[10px] border border-slate-700 transition-all flex items-center justify-center gap-1">
                        <Shield className="h-3 w-3 text-cyan-400" />
                        Verify
                      </button>
                    </div>
                  </div>

                  {/* Live Smooth Wave Graph */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">Live Trend Index</span>
                      <span className="text-[9px] text-cyan-400 font-medium">Real-Time</span>
                    </div>
                    <div className="w-full h-14 relative bg-slate-900/40 rounded-xl p-1 border border-slate-800/60">
                      <svg viewBox="0 0 160 50" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="cyanNeon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,38 Q20,15 40,32 T80,18 T120,28 T160,8"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M0,38 Q20,15 40,32 T80,18 T120,28 T160,8 L160,50 L0,50 Z"
                          fill="url(#cyanNeon)"
                        />
                        <circle cx="160" cy="8" r="3.5" fill="#10b981" className="animate-ping" />
                        <circle cx="160" cy="8" r="3" fill="#10b981" />
                      </svg>
                    </div>
                  </div>

                  {/* Recent Verified Activities */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-300">Recent Signals</span>
                      <span className="text-cyan-400 text-[9px]">View All</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white">Series A Cap Table</p>
                            <p className="text-[8px] text-slate-400">LedgerLoop Diligence</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">+$2,400</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <BadgeCheck className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white">Algorithmic Risk Audit</p>
                            <p className="text-[8px] text-slate-400">Tariq Al-Mansoor</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-cyan-400">Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Bottom Dock / Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-around text-slate-500">
                    <span className="text-cyan-400 text-xs font-bold">●</span>
                    <span className="text-xs">▪</span>
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold border border-cyan-400/40">
                      M
                    </div>
                    <span className="text-xs">▪</span>
                    <span className="text-xs">●</span>
                  </div>

                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* --- LIVE MARKET & ECOSYSTEM REAL-TIME DATABASE TICKER --- */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 -mt-10 mb-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          
          {/* Card 1: Bitcoin Benchmark (Realistic 3D Gold Medallion) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080d1a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-amber-500/40 transition-all duration-300 backdrop-blur-xl group">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                {/* 3D Realistic Gold Bitcoin Icon */}
                <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-800 p-[1.5px] shadow-[0_4px_14px_rgba(245,158,11,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center relative overflow-hidden border border-amber-300/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4)]">
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/30 blur-[1px] pointer-events-none" />
                    <span className="font-extrabold text-white text-base drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] select-none">₿</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Bitcoin Benchmark</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                    {prices?.btc ? `$${prices.btc.toLocaleString()}` : "$61,582"}
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                (prices?.btcChange ?? 4.6) >= 0 
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                  : "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30"
              }`}>
                {(prices?.btcChange ?? 4.6) >= 0 ? "+" : ""}{(prices?.btcChange ?? 4.6).toFixed(1)}%
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500">Market Reference</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                24h Continuous
              </span>
            </div>
          </div>

          {/* Card 2: Verified Platform Minds (Database Real Numbers + 3D Emerald Network Badge) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080d1a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-xl group">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                {/* 3D Realistic Emerald Network Icon */}
                <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-950 p-[1.5px] shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-emerald-900/90 via-teal-800/80 to-emerald-600/90 flex items-center justify-center relative overflow-hidden border border-emerald-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-200/30 blur-[1px] pointer-events-none" />
                    <Users className="h-5 w-5 text-emerald-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] relative z-10" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 border border-emerald-950 shadow-[0_0_6px_#34d399] animate-pulse" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Verified Platform Minds</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                    {platformStats?.totalUsers ? `${platformStats.totalUsers.toLocaleString()} Active` : "329 Active"}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                Live
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500">Advisors &amp; Startups</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Strictly Vetted</span>
            </div>
          </div>

          {/* Card 3: Vetted Startups (Database Real Numbers + 3D Sapphire Architectural Node) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080d1a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-xl group">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                {/* 3D Realistic Sapphire Architectural Node */}
                <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-950 p-[1.5px] shadow-[0_4px_14px_rgba(6,182,212,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-cyan-900/90 via-sky-800/80 to-blue-600/90 flex items-center justify-center relative overflow-hidden border border-cyan-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-200/30 blur-[1px] pointer-events-none" />
                    <Building2 className="h-5 w-5 text-cyan-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] relative z-10" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Vetted Startups</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                    {platformStats?.startups ? `${platformStats.startups.toLocaleString()} Companies` : "123 Companies"}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                +14% MoM
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500">Pre-Seed to Series A</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">Public Showcase</span>
            </div>
          </div>

          {/* Card 4: Audited Signals (Real Signal Audits + 3D Purple/Indigo Cryptographic Seal) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080d1a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-purple-500/40 transition-all duration-300 backdrop-blur-xl group">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                {/* 3D Realistic Royal Purple Cryptographic Seal */}
                <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-600 to-violet-950 p-[1.5px] shadow-[0_4px_14px_rgba(147,51,234,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-purple-950/90 via-indigo-900/80 to-violet-700/90 flex items-center justify-center relative overflow-hidden border border-purple-300/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-200/30 blur-[1px] pointer-events-none" />
                    <Award className="h-5 w-5 text-purple-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] relative z-10" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Audited Signals</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                    {platformStats?.verifiedAccuracy ?? "94.2%"} Verified
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 shadow-[0_0_8px_rgba(147,51,234,0.2)] flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-purple-600 dark:text-purple-400" />
                Zero Hindsight
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500">Machine Evaluation</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Daily Cron Checks</span>
            </div>
          </div>

        </div>
      </section>

      {/* --- PUBLIC ADVISORS SECTION (COMPACT BALANCED CARD LAYOUT + AVATARS) --- */}
      <section id="advisors" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/70 relative w-full bg-slate-50/80 dark:bg-[#070b14] scroll-mt-36 lg:scroll-mt-40 transition-colors duration-300">
        <div className="w-full max-w-[1720px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <Award className="h-4 w-4" />
                <span>Featured Financial Minds</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Public Advisors Directory
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xl">
                Explore top-tier financial advisors and venture strategists with live client networks. Member identities are unlocked upon registration.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                onClick={() => navigate("/advisors")}
                className="border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:text-white hover:bg-cyan-950/60 rounded-xl text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                View All Advisors
                <ArrowRight className="h-3 w-3 text-cyan-500 dark:text-cyan-400" />
              </Button>
              <Button
                variant="outline"
                onClick={() => openUnlockModal()}
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="h-3 w-3 mr-0.5" />
                Register to Unlock All (Free)
              </Button>
            </div>
          </div>

          {/* 4-Card Balanced Proportional Layout (Wide & Generous Card Width) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
            
            {/* CARDS 1, 2, 3: REAL ADVISORS */}
            {publicAdvisors.slice(0, 3).map((advisor) => {
              const loc = getAdvisorLocationDetails(advisor.location);
              const members = advisor.members && advisor.members.length > 0 
                ? advisor.members 
                : DEFAULT_ADVISORY_MEMBERS.slice(0, 5);
              const totalMembers = advisor.membersCount || 7;
              const avatarPhoto = getAdvisorAvatar(advisor);

              return (
                <div
                  key={advisor.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Header: Real Photo if available, otherwise High-End Personalized Avatar */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/80 dark:from-[#0c1527] dark:via-[#09101f] dark:to-[#060b14] flex items-center justify-center transition-colors">
                    {avatarPhoto ? (
                      <img
                        src={avatarPhoto}
                        alt={advisor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                        {/* Subtle ambient fintech glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.14),transparent_70%)]" />
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_14px]" />
                        
                        {/* Centered Initials Avatar Badge */}
                        <div className={`relative w-22 h-22 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(advisor.name)} flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-105 group-hover:ring-emerald-500/50 transition-all duration-300`}>
                          <span className="font-extrabold text-white text-2xl sm:text-3xl tracking-wider select-none drop-shadow-md">
                            {getInitials(advisor.name)}
                          </span>
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#0c1527]">
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Floating Heart Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute top-3.5 left-3.5 h-8 w-8 rounded-full bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:scale-110 transition-all shadow-sm cursor-pointer z-10"
                      title="Favorite Advisor"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>

                    {/* Floating Experience Badge */}
                    <span className="absolute top-3.5 right-3.5 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white/95 dark:bg-slate-950/85 border border-emerald-400 dark:border-emerald-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm z-10">
                      {advisor.experience}
                    </span>
                  </div>

                  {/* Card Body (Spacious & Proportional) */}
                  <div className="p-5 sm:p-5.5 flex flex-col justify-between flex-1">
                    <div>
                      {/* Advisor Name */}
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {advisor.name}
                      </h3>

                      {/* Flag + Origin Country */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1.5">
                        <span className="text-sm leading-none">{loc.flag}</span>
                        <span>From {loc.from}</span>
                      </div>

                      {/* City/Based in */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono line-clamp-1">
                        Based in {loc.based}
                      </p>

                      {/* Verified Status Tag */}
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span>Verified Financial Advisor</span>
                      </div>

                      {/* Role & Specialization */}
                      <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wide uppercase mt-1 line-clamp-1 font-medium">
                        {advisor.title}
                      </p>

                      {/* ADVISORY MEMBERS CLUSTER (Wide TripMates Style with Initials Avatars) */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                            Your Advisory Members so far ({totalMembers})
                          </span>
                        </div>

                        <div 
                          onClick={() => {
                            if (!user) openUnlockModal(advisor);
                          }}
                          className={`flex items-center justify-between rounded-lg py-1 px-1 transition-all ${
                            !user ? "cursor-pointer group/members hover:bg-slate-50 dark:hover:bg-slate-900/60" : ""
                          }`}
                          title={!user ? "Click to sign in and reveal verified member identities" : "Verified Advisory Members"}
                        >
                          {/* Horizontal Overlapping Avatar Stack (Initials or Real Photo) */}
                          <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
                            {members.slice(0, 5).map((member: any, mIdx: number) => {
                              const hasRealPhoto = isRealImage(member.avatarUrl);
                              return (
                                <div 
                                  key={member.id || mIdx}
                                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-[#0c1424] flex items-center justify-center transition-all duration-300 relative ${
                                    hasRealPhoto ? "overflow-hidden" : `bg-gradient-to-tr ${getAvatarGradient(member.name)}`
                                  } ${
                                    !user
                                      ? "filter blur-[3.5px] opacity-75 select-none pointer-events-none"
                                      : "shadow-sm hover:scale-110 hover:z-20 cursor-pointer"
                                  }`}
                                  title={user ? `${member.name} (${member.company || member.role})` : "Verified Member"}
                                >
                                  {hasRealPhoto ? (
                                    <img
                                      src={member.avatarUrl}
                                      alt={member.name || "Member"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] sm:text-[11px] font-extrabold text-white select-none">
                                      {getInitials(member.name)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {/* Remaining Count Bubble */}
                            {totalMembers > 5 && (
                              <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800/90 border-2 border-white dark:border-[#0c1424] text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                +{totalMembers - 5}
                              </span>
                            )}
                          </div>

                          {!user && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover/members:underline flex items-center gap-0.5 ml-1">
                              <span>Reveal</span>
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Profile Action */}
                    <div className="pt-4">
                      <Button
                        onClick={() => navigate("/advisors")}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 cursor-pointer"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CARD 4: THE DEDICATED "EXPLORE ALL ADVISORS" PORTAL CARD (Matching Compact Proportions) */}
            <div 
              onClick={() => navigate("/advisors")}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c1424] border-2 border-dashed border-cyan-400 dark:border-cyan-500/50 hover:border-cyan-500 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              {/* Top Banner with Directory Portal Icon & Badge */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-cyan-50 via-teal-50/60 to-slate-100 dark:from-[#071324] dark:via-[#09101f] dark:to-[#040810] flex items-center justify-center transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.18),transparent_70%)]" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_14px]" />

                {/* Central Directory Crest */}
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 flex flex-col items-center justify-center shadow-md group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                  <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-300 mb-0.5" />
                  <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300">Directory</span>
                </div>

                {/* Floating Count Badge */}
                <span className="absolute top-3.5 right-3.5 text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-white/95 dark:bg-slate-950/85 border border-cyan-400 dark:border-cyan-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                  148+ Profiles
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-5.5 flex flex-col justify-between flex-1">
                <div>
                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                    Explore All Advisors
                  </h3>

                  {/* Flag & Nations */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1.5">
                    <span className="text-sm leading-none">🌐</span>
                    <span>From 35+ Nations</span>
                  </div>

                  {/* Location Hubs */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono line-clamp-1">
                    Global Financial Hubs
                  </p>

                  {/* Verified Directory Tag */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
                    <span>Full Public Directory</span>
                  </div>

                  {/* Sectors */}
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mt-1 line-clamp-1 font-medium">
                    Quant • Venture Capital • M&amp;A
                  </p>

                  {/* Directory Network Preview with Initials Badges */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Platform Network
                      </span>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                        329+ Minds
                      </span>
                    </div>

                    <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
                      {DEFAULT_ADVISORY_MEMBERS.map((m) => (
                        <div
                          key={m.id}
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-[#0c1424] bg-gradient-to-tr ${getAvatarGradient(m.name)} flex items-center justify-center`}
                          title={m.name}
                        >
                          <span className="text-[10px] font-extrabold text-white">
                            {getInitials(m.name)}
                          </span>
                        </div>
                      ))}
                      <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border-2 border-white dark:border-[#0c1424] text-[9px] font-bold text-cyan-800 dark:text-cyan-300 flex items-center justify-center">
                        +140
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/advisors");
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl py-2.5 flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(6,182,212,0.3)] transition-all group-hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Browse All Advisors</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- PUBLIC STARTUPS SHOWCASE (EXACT FAN OF CARDS ANIMATION) --- */}
      <section id="startups" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800/70 w-full relative overflow-hidden scroll-mt-36 lg:scroll-mt-40 transition-colors duration-300">
        {/* Soft Ambient Spotlight Glow across the entire fan */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18)_0%,rgba(124,58,237,0.12)_45%,transparent_70%)] blur-[90px] pointer-events-none" />

        {/* Scoped CSS for the exact Card Fan Animation & Layout */}
        <style>{`
          .venture-section {
            max-width: 1380px;
            margin: 0 auto;
            position: relative;
          }
          .venture-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .venture-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .venture-badge .num {
            font-size: 13px;
            font-weight: 700;
            color: #06b6d4;
            padding: 5px 2px;
            font-family: monospace;
          }
          .venture-badge .label {
            font-size: 12px;
            font-weight: 600;
            color: #06b6d4;
            background: rgba(6, 182, 212, 0.12);
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 999px;
            padding: 5px 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .venture-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-top: 24px;
            position: relative;
          }
          .venture-head h2 {
            font-size: clamp(30px, 4vw, 48px);
            line-height: 1.12;
            letter-spacing: -0.025em;
            font-weight: 800;
            margin: 0;
            max-width: 720px;
          }
          .venture-note {
            flex: none;
            width: 320px;
            margin-top: 36px;
            position: relative;
            padding-left: 20px;
            font-size: 14px;
            line-height: 1.5;
            color: #64748b;
          }
          :is(.dark) .venture-note {
            color: #94a3b8;
          }
          .venture-note::before {
            content: "";
            position: absolute;
            left: 0;
            top: 7px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #a855f7;
            box-shadow: 0 0 12px #a855f7;
          }
          .venture-note strong {
            color: #0f172a;
            font-weight: 600;
            display: block;
          }
          :is(.dark) .venture-note strong {
            color: #f1f5f9;
          }
          .venture-connector {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 640px;
            pointer-events: none;
            overflow: visible;
            z-index: 0;
          }
          .venture-head, .venture-fan {
            z-index: 1;
          }
          .venture-fan {
            position: relative;
            height: 678px;
            margin-top: 14px;
          }
          .vcard {
            position: absolute;
            width: 19.6%;
            min-width: 190px;
            height: 430px;
            border-radius: 26px;
            padding: 20px 18px 16px;
            display: flex;
            flex-direction: column;
            color: #fff;
            cursor: pointer;
            outline: none;
            transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease, border-color 0.3s ease;
            will-change: transform;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
          }
          .vcard .chip {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 800;
            font-family: monospace;
            letter-spacing: 0.05em;
            backdrop-filter: blur(8px);
          }
          .vcard h3 {
            font-size: clamp(18px, 1.35vw, 21px);
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: -0.015em;
            margin: 14px 2px 0;
            max-width: 160px;
          }
          .vcard .photo {
            margin-top: auto;
            border-radius: 14px;
            overflow: hidden;
            height: 162px;
            flex: none;
            background: rgba(0, 0, 0, 0.32);
            border: 1px solid rgba(255, 255, 255, 0.22);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px;
            box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
          }
          .vcard:hover, .vcard:focus-visible, .vcard.front {
            transform: rotate(0deg) translateY(-16px) scale(1.03) !important;
            z-index: 30 !important;
          }
          .vcard:focus-visible {
            box-shadow: 0 0 0 3px #050b14, 0 0 0 6px #06b6d4, 0 32px 64px rgba(0, 0, 0, 0.7);
          }

          /* Luminous, well-lit card themes matching MoneyMinds luxury fintech identity */
          .vcard.c1 {
            background: linear-gradient(155deg, #0284c7 0%, #0369a1 40%, #082f49 100%);
            border: 1.5px solid #38bdf8;
            box-shadow: 0 20px 45px -8px rgba(2, 132, 199, 0.45), 0 0 28px -4px rgba(56, 189, 248, 0.4);
            left: 0.5%; top: 118px; transform: rotate(-5deg); z-index: 1; height: 438px;
          }
          .vcard.c1:hover, .vcard.c1.front {
            border-color: #7dd3fc;
            box-shadow: 0 34px 70px -10px rgba(2, 132, 199, 0.65), 0 0 45px 6px rgba(56, 189, 248, 0.6);
          }
          .vcard.c1 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c2 {
            background: linear-gradient(155deg, #059669 0%, #047857 40%, #064e3b 100%);
            border: 1.5px solid #34d399;
            box-shadow: 0 20px 45px -8px rgba(5, 150, 105, 0.45), 0 0 28px -4px rgba(52, 211, 153, 0.4);
            left: 13%; top: 210px; transform: rotate(-6deg); z-index: 2; height: 445px;
          }
          .vcard.c2:hover, .vcard.c2.front {
            border-color: #6ee7b7;
            box-shadow: 0 34px 70px -10px rgba(5, 150, 105, 0.65), 0 0 45px 6px rgba(52, 211, 153, 0.6);
          }
          .vcard.c2 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c3 {
            background: linear-gradient(155deg, #2563eb 0%, #1d4ed8 40%, #172554 100%);
            border: 1.5px solid #60a5fa;
            box-shadow: 0 20px 45px -8px rgba(37, 99, 235, 0.45), 0 0 28px -4px rgba(96, 165, 250, 0.4);
            left: 28.5%; top: 8px; transform: rotate(-3deg); z-index: 3; height: 420px;
          }
          .vcard.c3:hover, .vcard.c3.front {
            border-color: #93c5fd;
            box-shadow: 0 34px 70px -10px rgba(37, 99, 235, 0.65), 0 0 45px 6px rgba(96, 165, 250, 0.6);
          }
          .vcard.c3 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c4 {
            background: linear-gradient(155deg, #0d9488 0%, #0f766e 40%, #134e4a 100%);
            border: 1.5px solid #2dd4bf;
            box-shadow: 0 20px 45px -8px rgba(13, 148, 136, 0.45), 0 0 28px -4px rgba(45, 212, 191, 0.4);
            left: 40%; top: 178px; transform: rotate(5deg); z-index: 3; height: 445px;
          }
          .vcard.c4:hover, .vcard.c4.front {
            border-color: #5eead4;
            box-shadow: 0 34px 70px -10px rgba(13, 148, 136, 0.65), 0 0 45px 6px rgba(45, 212, 191, 0.6);
          }
          .vcard.c4 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c5 {
            background: linear-gradient(155deg, #7c3aed 0%, #6d28d9 40%, #3b0764 100%);
            border: 1.5px solid #c084fc;
            box-shadow: 0 20px 45px -8px rgba(124, 58, 237, 0.5), 0 0 32px -4px rgba(192, 132, 252, 0.45);
            left: 57%; top: 48px; transform: rotate(0deg); z-index: 4; height: 420px;
          }
          .vcard.c5:hover, .vcard.c5.front {
            border-color: #e9d5ff;
            box-shadow: 0 34px 70px -10px rgba(124, 58, 237, 0.7), 0 0 48px 6px rgba(192, 132, 252, 0.65);
          }
          .vcard.c5 .chip { background: rgba(255, 255, 255, 0.28); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c6 {
            background: linear-gradient(155deg, #d97706 0%, #b45309 40%, #451a03 100%);
            border: 1.5px solid #fbbf24;
            box-shadow: 0 20px 45px -8px rgba(217, 119, 6, 0.45), 0 0 28px -4px rgba(251, 191, 36, 0.4);
            left: 66.5%; top: 205px; transform: rotate(5deg); z-index: 5; height: 445px;
          }
          .vcard.c6:hover, .vcard.c6.front {
            border-color: #fde68a;
            box-shadow: 0 34px 70px -10px rgba(217, 119, 6, 0.65), 0 0 45px 6px rgba(251, 191, 36, 0.6);
          }
          .vcard.c6 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          .vcard.c7 {
            background: linear-gradient(155deg, #0284c7 0%, #0369a1 40%, #0c4a6e 100%);
            border: 1.5px solid #38bdf8;
            box-shadow: 0 20px 45px -8px rgba(2, 132, 199, 0.45), 0 0 28px -4px rgba(56, 189, 248, 0.4);
            left: 82.5%; top: 28px; transform: rotate(3deg); z-index: 6; height: 448px;
          }
          .vcard.c7:hover, .vcard.c7.front {
            border-color: #7dd3fc;
            box-shadow: 0 34px 70px -10px rgba(2, 132, 199, 0.65), 0 0 45px 6px rgba(56, 189, 248, 0.6);
          }
          .vcard.c7 .chip { background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.5); color: #fff; }

          @keyframes vRise {
            from { opacity: 0; margin-top: 46px; }
            to   { opacity: 1; margin-top: 0; }
          }
          .venture-fan .vcard { animation: vRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
          .venture-fan .vcard:nth-child(1) { animation-delay: 0.05s; }
          .venture-fan .vcard:nth-child(2) { animation-delay: 0.12s; }
          .venture-fan .vcard:nth-child(3) { animation-delay: 0.19s; }
          .venture-fan .vcard:nth-child(4) { animation-delay: 0.26s; }
          .venture-fan .vcard:nth-child(5) { animation-delay: 0.33s; }
          .venture-fan .vcard:nth-child(6) { animation-delay: 0.40s; }
          .venture-fan .vcard:nth-child(7) { animation-delay: 0.47s; }

          @media (max-width: 1150px) {
            .venture-connector { display: none; }
          }
          @media (max-width: 900px) {
            .venture-section { padding: 10px 8px; }
            .venture-head { flex-direction: column; gap: 14px; }
            .venture-note { margin-top: 0; width: auto; max-width: 480px; }
            .venture-connector { display: none; }
            .venture-fan {
              position: static;
              height: auto;
              margin-top: 30px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 18px;
            }
            .vcard {
              position: relative;
              left: auto !important;
              top: auto !important;
              width: auto;
              min-width: 0;
              height: 350px !important;
            }
            .vcard.c1 { transform: rotate(-2deg); }
            .vcard.c2 { transform: rotate(2deg); }
            .vcard.c3 { transform: rotate(-2deg); }
            .vcard.c4 { transform: rotate(2deg); }
            .vcard.c5 { transform: rotate(-2deg); }
            .vcard.c6 { transform: rotate(2deg); }
            .vcard.c7 { transform: rotate(-2deg); grid-column: 1 / -1; height: 320px !important; }
            .vcard .photo { height: 130px; }
            .vcard.c7 .photo { height: 125px; }
            .vcard:hover, .vcard:focus-visible, .vcard.front {
              transform: rotate(0deg) translateY(-6px) !important;
            }
          }
          @media (max-width: 480px) {
            .venture-fan { grid-template-columns: 1fr; }
            .vcard, .vcard.c7 { height: 330px !important; grid-column: auto; }
            .vcard .photo, .vcard.c7 .photo { height: 132px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .venture-fan .vcard { animation: none; transition: none; }
          }
        `}</style>

        <div className="venture-section">
          {/* Top Bar with Badge, Geometric Mark, and Action */}
          <div className="venture-topbar">
            <div className="flex items-center gap-3">
              <span className="venture-badge">
                <span className="num">07</span>
                <span className="label">Vetted Venture Showcase</span>
              </span>
              <svg className="mark" width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                <rect x="9" y="1" width="8" height="8" rx="2.5" fill="#06B6D4"/>
                <rect x="9" y="17" width="8" height="8" rx="2.5" fill="#06B6D4"/>
                <rect x="1" y="9" width="8" height="8" rx="2.5" fill="#06B6D4"/>
                <rect x="17" y="9" width="8" height="8" rx="2.5" fill="#06B6D4"/>
                <rect x="9" y="9" width="8" height="8" rx="2.5" fill="#06B6D4"/>
              </svg>
            </div>

            <div>
              <Link to="/apply">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all cursor-pointer">
                  Apply as Startup &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* Headline + Connected Note */}
          <div className="venture-head">
            <div>
              <h2 className="text-slate-900 dark:text-white">
                Innovative Startups Seeking Guidance
              </h2>
              {/* MoneyMinds Core Supported Industries Strip */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3.5">
                <span className="text-[10.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider mr-1">
                  Industries We Empower:
                </span>
                {[
                  "FinTech & Payments",
                  "AI & Machine Learning",
                  "CleanTech & Energy",
                  "HealthTech & Life Sciences",
                  "B2B SaaS & Enterprise",
                  "Web3 & Blockchain",
                  "EdTech & Workforce",
                  "E-Commerce & RetailTech",
                ].map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow-sm transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{ind}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="venture-note">
              <strong>Audited Venture Pipeline:</strong>
              Pre-Seed to Series A startups across 8 vetted industries actively matched with CFOs, quants, and capital networks.
            </p>
          </div>

          {/* Dotted connector curve from note down to card 05 dot */}
          <svg className="venture-connector" viewBox="0 0 1300 640" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M 960 175 L 900 175 Q 882 175 882 193 L 882 250 Q 882 268 900 268 L 808 268"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.8"
              strokeDasharray="2 6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.65"
            />
            <circle cx="801" cy="268" r="5" fill="#a855f7" />
          </svg>

          {/* The 7-Card Animated Fan (Restored Curated Startups with Instant 0ms Load) */}
          <div className="venture-fan" id="venture-fan">
            {FEATURED_STARTUPS.map((startup) => (
              <article
                key={startup.id}
                tabIndex={0}
                onClick={() => navigate("/apply")}
                className={`vcard ${startup.colorClass} group`}
                title={`${startup.name} (${startup.badge}) — Click to connect`}
              >
                {/* Chip with Card Number & Target Pulse for Card 05 */}
                <div className="flex items-center justify-between">
                  <span className="chip">{startup.num}</span>
                  {startup.num === "05" && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                    </span>
                  )}
                </div>

                {/* Startup Name & Stage */}
                <div>
                  <h3 className="text-white drop-shadow-sm font-extrabold">{startup.name}</h3>
                  <div
                    className="text-[10px] font-mono tracking-wider uppercase mt-1 font-semibold px-2 py-0.5 rounded-md inline-block"
                    style={{
                      color: startup.colorHex,
                      backgroundColor: `${startup.colorHex}18`,
                      border: `1px solid ${startup.colorHex}35`
                    }}
                  >
                    {startup.badge}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 mt-1">
                    {startup.stage}
                  </div>
                </div>

                {/* Bottom Photo / Visual Card (Fintech Graphic Snapshot with Mini Sparkline) */}
                <div className="photo">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/10 pb-1.5">
                    <span className="truncate max-w-[95px] text-slate-300">{startup.location}</span>
                    <span
                      className="px-1.5 py-0.2 rounded text-[8.5px] font-bold tracking-wider"
                      style={{
                        color: startup.colorHex,
                        backgroundColor: `${startup.colorHex}22`,
                        border: `1px solid ${startup.colorHex}40`
                      }}
                    >
                      ✓ VETTED
                    </span>
                  </div>

                  <div className="my-auto py-1 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[8.5px] uppercase tracking-wider text-slate-400 font-mono">Traction Metric</div>
                      <div className="text-xs sm:text-[12.5px] font-extrabold text-white tracking-tight mt-0.5 drop-shadow-sm">
                        {startup.metrics}
                      </div>
                    </div>
                    {/* Mini SVG Sparkline */}
                    <div className="w-12 h-6 flex-shrink-0 opacity-80">
                      <svg viewBox="0 0 120 35" className="w-full h-full overflow-visible">
                        <path
                          d={startup.sparkline}
                          fill="none"
                          stroke={startup.colorHex}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9.5px] font-semibold text-slate-300">
                    <span className="truncate max-w-[125px] opacity-90">{startup.seeking.replace("Advisory for ", "")}</span>
                    <ArrowRight className="h-3 w-3 text-white flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- OUR STORY SECTION (SPECTACULAR INTERACTIVE VERIFICATION PROTOCOL) --- */}
      <section id="our-story" className="py-24 px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-slate-200/80 dark:border-slate-800/70 w-full relative overflow-hidden bg-slate-50/70 dark:bg-[#070b14] scroll-mt-36 lg:scroll-mt-40 transition-colors duration-300">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[300px] bg-purple-500/5 dark:bg-purple-500/5 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[1780px] mx-auto relative z-10">
          {/* Header with Radar Beacon */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/25 tracking-wider uppercase mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></span>
              Immutable Financial Truth Engine
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 mb-4 leading-tight">
              Our Story: Restoring Trust in Financial Intelligence
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Financial advice and venture dealmaking have historically operated on zero accountability: self-proclaimed gurus delete their losses, pitch deck claims go unverified, and founders gamble their runways on unchecked track records. MoneyMinds was engineered to replace blind trust with mathematical verification.
            </p>
          </div>

          {/* Interactive Story Act Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveStoryAct("crisis")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                activeStoryAct === "crisis"
                  ? "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/70"
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>01. The Authenticity Crisis</span>
            </button>

            <button
              onClick={() => setActiveStoryAct("engine")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                activeStoryAct === "engine"
                  ? "bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/70"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span>02. The Continuous AI Audit Ledger</span>
            </button>

            <button
              onClick={() => setActiveStoryAct("ecosystem")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                activeStoryAct === "ecosystem"
                  ? "bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/70"
              }`}
            >
              <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>03. Sovereign Institutional Symmetry</span>
            </button>
          </div>

          {/* Dynamic Story Act Content Showcase */}
          <div className="mb-14">
            {activeStoryAct === "crisis" && (
              <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                {/* Traditional Channels Box */}
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0c1424] border border-rose-200 dark:border-rose-500/25 relative overflow-hidden shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">The Opaque Industry Standard</h3>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-mono">Traditional Social &amp; Vanity Channels</p>
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span><strong className="text-slate-900 dark:text-white">Retroactive Cherry-Picking:</strong> Self-proclaimed advisors delete failed predictions and silently alter call dates to fabricate 90%+ hit rates.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span><strong className="text-slate-900 dark:text-white">Unverified Pitch Deck Metrics:</strong> Founders report self-estimated ARR and inflated pipelines with zero objective third-party audit trail.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span><strong className="text-slate-900 dark:text-white">Asymmetric Founder Risk:</strong> Early-stage startups burn finite runway paying $5,000/month retainers to advisors who risk zero skin in the game.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span><strong className="text-slate-900 dark:text-white">Fragmented Diligence:</strong> Venture capital funds spend 120+ hours chasing basic cap table verification and uncorroborated advisor credentials.</span>
                    </li>
                  </ul>
                </div>

                {/* MoneyMinds Audited Protocol Box */}
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0c1424] border border-emerald-200 dark:border-emerald-500/30 relative overflow-hidden shadow-md shadow-emerald-500/5 dark:shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">The MoneyMinds Standard</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Cryptographically Audited Financial Truth</p>
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-slate-900 dark:text-white">Immutable Ledger Hashing:</strong> Every forecast, thesis, and cap table recommendation is timestamped on creation; records cannot be deleted or altered.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-slate-900 dark:text-white">Nightly Market Benchmarking:</strong> Automated cron verification evaluates every call daily against live CoinGecko &amp; institutional indices.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-slate-900 dark:text-white">Mathematical Credibility Score:</strong> 0-100 score calculated by machine learning models based strictly on historical prediction accuracy.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-slate-900 dark:text-white">Institutional Confidentiality:</strong> Public transparency for track records, paired with complete zero-knowledge dealroom privacy for investors.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeStoryAct === "engine" && (
              <div className="space-y-6 animate-fadeIn">
                {/* 4-Stage Architectural Flow Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30">STAGE 01</span>
                      <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Signal Submission</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Advisors log forecasts, macroeconomic theses, and startup runways into the verification pipeline.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-purple-500/30 shadow-sm dark:shadow-none relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">STAGE 02</span>
                      <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Cryptographic Seal</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      SHA-256 hash generated in 15ms. The signal is permanently locked and assigned an immutable block ID.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-emerald-500/30 shadow-sm dark:shadow-none relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">STAGE 03</span>
                      <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Automated AI Audits</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Nightly cron engines evaluate performance against real-time market data and audited revenue milestones.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-amber-500/30 shadow-sm dark:shadow-none relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">STAGE 04</span>
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Credibility Ranking</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Algorithmic Credibility Score updates across 5 tiers (Elite, Expert, Senior, Verified, Pro). No pay-to-win.
                    </p>
                  </div>
                </div>

                {/* Live Audit Engine Terminal Simulation */}
                <div className="p-6 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">LIVE VERIFICATION ENGINE RUNNING • CRON SYNC ACTIVE</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">PROTOCOL v2.4 • BLOCK #894,204</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="text-cyan-400">
                      [2026-11-23 10:14:02 UTC] &gt;&gt; INGESTION: Signal #MM-9042 from Dr. Marcus Vance, CFA (Elite Tier 96)
                    </div>
                    <div className="text-slate-400 pl-4">
                      ├─ Payload: BTC Long-Term Target $94,000 | Benchmark: {prices?.btc ? `$${prices.btc.toLocaleString()}` : "$61,582"} ({(prices?.btcChange ?? 4.6) >= 0 ? "+" : ""}{(prices?.btcChange ?? 4.6).toFixed(1)}% 24h) | Variance: +0.21%
                    </div>
                    <div className="text-slate-400 pl-4">
                      ├─ Cryptographic Seal: sha256:7b92ac4f8810e42d... | Status: IMMUTABLE &amp; UNEDITED
                    </div>
                    <div className="text-emerald-400 pl-4 font-bold">
                      └─ AUDIT RESULT: MATHEMATICALLY RESOLVED • ACCURACY: {platformStats?.verifiedAccuracy || "94.2%"} • CREDIBILITY BOOST: +0.8
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStoryAct === "ecosystem" && (
              <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
                {/* For Startups */}
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-cyan-500/25 shadow-md dark:shadow-none flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 border border-cyan-200 dark:border-cyan-500/30">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">For Founders &amp; Startups</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-3">Vetted Mentors, Not Marketers</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Founders connect with fractional CFOs, cap table strategists, and M&amp;A experts with audited prediction track records. Protect your runway and navigate institutional Series A diligence with confidence.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                    <span>98% Cap Table Accuracy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* For Advisors */}
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-emerald-500/25 shadow-md dark:shadow-none flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-200 dark:border-emerald-500/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">For Financial Advisors</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-3">Monetize Audited Credibility</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Build an untampered, permanent reputational asset. Run private subscriber dealrooms, offer paid 1-on-1 consultations, and receive direct Stripe payouts backed by mathematical proof of expertise.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>Direct Stripe Payouts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* For Investors */}
                <div className="p-7 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-purple-500/25 shadow-md dark:shadow-none flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 border border-purple-200 dark:border-purple-500/30">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">For Institutional Investors</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-3">Zero-Knowledge Privacy</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Access high-signal venture dealflow with pre-audited metrics. Unlike traditional networks, institutional allocations and deal terms remain strictly confidential in private dealrooms.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <span>Zero Leakage Guarantees</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Platform Integrity Telemetry Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{platformStats?.verifiedAccuracy || "94.2%"}</div>
              <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">Verified Benchmark Accuracy</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Audited by Continuous Cron</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">15ms</div>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">Immutable Hash Latency</div>
              <div className="text-[10px] text-slate-500 mt-0.5">SHA-256 Timestamping</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{platformStats?.startups ? `${platformStats.startups}+` : "123+"}</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Vetted Startups Tracked</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {platformStats?.totalUsers ? `${platformStats.totalUsers}` : "329"} Platform Minds</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{platformStats?.signalsCount ? `${platformStats.signalsCount}+` : "842+"}</div>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Immutable Signal Records</div>
              <div className="text-[10px] text-slate-500 mt-0.5">0% Deleted Record Policy</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WORK WITH US SECTION (BESPOKE INSTITUTIONAL FINTECH ARCHITECTURE) --- */}
      <section id="work-with-us" className="py-24 px-4 sm:px-8 lg:px-12 xl:px-16 bg-slate-50 dark:bg-[#060a13] border-t border-slate-200 dark:border-slate-800/80 w-full relative overflow-hidden scroll-mt-36 lg:scroll-mt-40 transition-colors duration-300">
        {/* Architectural Tech Grid Lines in Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#131d31_1px,transparent_1px),linear-gradient(to_bottom,#131d31_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[1780px] mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 tracking-wider uppercase mb-3 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              ECOSYSTEM ARCHITECTURE // 03 TIERS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 mb-4 leading-tight">
              Work With Us
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether you are an audited financial strategist, a high-growth founder scaling toward Series A, or an institutional investor seeking zero-leakage dealflow, MoneyMinds provides a verified operational standard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* =========================================================================
                CARD 01: FINANCIAL ADVISORS & FRACTIONAL CFOS (SHARP PRECISION FINTECH)
            ========================================================================= */}
            <div className="rounded-none bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/80 dark:hover:border-emerald-400 shadow-sm hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col justify-between group relative">
              {/* Corner Tech Crosshairs */}
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Interactive Signal & Monetization Visualization Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070b15] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/25 tracking-wider uppercase">
                      ROLE 01 // ADVISORS
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE AUDITING
                    </span>
                  </div>

                  {/* Financial Signal & Payout Micro-Dashboard */}
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Credibility Ranking:</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                        TIER 96 • ELITE
                      </span>
                    </div>

                    {/* Animated Wave Sparkline */}
                    <div className="h-14 w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 flex items-end justify-between gap-1 group-hover:border-emerald-500/40 transition-colors">
                      <div className="w-full h-full relative flex items-end">
                        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="advisorGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,32 Q30,10 60,24 T120,8 T160,18 T200,4 L200,40 L0,40 Z"
                            fill="url(#advisorGrad)"
                          />
                          <path
                            d="M0,32 Q30,10 60,24 T120,8 T160,18 T200,4"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="200" cy="4" r="3.5" fill="#10b981" className="animate-pulse" />
                        </svg>
                      </div>
                    </div>

                    {/* Stripe Connect Metric Bar */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Stripe Monthly Run:</span>
                      <span className="font-bold text-slate-900 dark:text-white">+$4,250.00 / mo</span>
                    </div>
                  </div>
                </div>

                {/* Card Title & Platform Description */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                      <Award className="h-5 w-5 text-slate-950" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      For Advisors &amp; CFOs
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Turn your mathematical track record into an untampered, monetizable reputational asset. Run gated subscriber rooms, publish verified market signals, and advise venture boards with zero platform commission lock-in.
                  </p>

                  <div className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Direct Stripe Connect Billing:</strong> Automated monthly recurring subscriptions and custom hourly advisory invoices.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Continuous AI Accuracy Audits:</strong> Signals verified nightly against live benchmarks to build a verified 0-100 Credibility Score.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Automated Credential Badging:</strong> FINRA, CFA, CPA, and regulatory background verification badges displayed to founders.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Private Signal Dealrooms:</strong> Host exclusive subscriber groups with gated discussions, due diligence memos, and forecasts.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:p-7 pt-0">
                <Link to="/apply?role=advisor" className="w-full">
                  <Button className="w-full rounded-none bg-slate-950 dark:bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider py-3.5 shadow-sm transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer">
                    <span>Apply as Financial Advisor</span>
                    <ArrowRight className="h-4 w-4 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* =========================================================================
                CARD 02: STARTUPS & FOUNDERS (SHARP PRECISION FINTECH)
            ========================================================================= */}
            <div className="rounded-none bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/80 dark:hover:border-cyan-400 shadow-sm hover:shadow-[0_12px_40px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col justify-between group relative">
              {/* Corner Tech Crosshairs */}
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Interactive Cap Table & Runway Visualization Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070b15] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 border border-cyan-500/25 tracking-wider uppercase">
                      ROLE 02 // STARTUPS
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      SEED-TO-SERIES A
                    </span>
                  </div>

                  {/* Cap Table Matrix Bar Visual */}
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Equity Cap Table:</span>
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/30">
                        AUDITED &amp; CLEAN
                      </span>
                    </div>

                    {/* Stacked Equity Allocation Bar */}
                    <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                      <div className="h-full bg-cyan-500 flex items-center justify-center text-[9px] font-extrabold text-slate-950 px-1" style={{ width: "65%" }}>
                        FOUNDERS 65%
                      </div>
                      <div className="h-full bg-blue-500 flex items-center justify-center text-[9px] font-extrabold text-white px-1" style={{ width: "15%" }}>
                        ESOP 15%
                      </div>
                      <div className="h-full bg-indigo-500 flex items-center justify-center text-[9px] font-extrabold text-white px-1" style={{ width: "20%" }}>
                        SEED 20%
                      </div>
                    </div>

                    {/* Runway Status Metric */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Runway Runway:</span>
                      <span className="font-bold text-slate-900 dark:text-white">18 Months Secured</span>
                    </div>
                  </div>
                </div>

                {/* Card Title & Platform Description */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                      <TrendingUp className="h-5 w-5 text-slate-950" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      For Startups &amp; Founders
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Connect with audited fractional CFOs, cap table engineers, and growth strategists. Safeguard your runway, structure venture rounds cleanly, and showcase verified milestones directly to active syndicates.
                  </p>

                  <div className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Vetted Fractional CFO Matching:</strong> On-demand financial directors with verified track records in debt and equity raises.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Cap Table &amp; Dilution Modeling:</strong> Prevent costly multi-million-dollar equity mistakes before closing Seed or Series A terms.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Verified Venture Badge:</strong> Stand out in our curated public and investor showcases with audited MRR and traction metrics.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Direct Dealroom Connections:</strong> Request introductions to private accredited investors actively evaluating your sector.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:p-7 pt-0">
                <Link to="/apply?role=startup" className="w-full">
                  <Button className="w-full rounded-none bg-slate-950 dark:bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider py-3.5 shadow-sm transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer">
                    <span>Apply as Startup Founder</span>
                    <ArrowRight className="h-4 w-4 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* =========================================================================
                CARD 03: INSTITUTIONAL INVESTORS (SHARP PRECISION FINTECH)
            ========================================================================= */}
            <div className="rounded-none bg-white dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 hover:border-purple-500/80 dark:hover:border-purple-400 shadow-sm hover:shadow-[0_12px_40px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col justify-between group relative">
              {/* Corner Tech Crosshairs */}
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Interactive Zero-Knowledge Encryption Visualization Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070b15] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 border border-purple-500/25 tracking-wider uppercase">
                      ROLE 03 // INVESTORS
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      ZERO-KNOWLEDGE
                    </span>
                  </div>

                  {/* Cryptographic Dealroom Telemetry Visual */}
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Dealroom Protocol:</span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 border border-purple-500/30">
                        100% CONFIDENTIAL
                      </span>
                    </div>

                    {/* Masked Cryptographic Hash Terminal Box */}
                    <div className="h-14 w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2.5 flex flex-col justify-center text-[10px] text-slate-400 space-y-1">
                      <div className="text-purple-600 dark:text-purple-400 truncate">
                        [ENCRYPTED DEALROOM] #DR-8802
                      </div>
                      <div className="text-slate-500 truncate">
                        ALLOCATION: $500,000 • TICKET [MASKED]
                      </div>
                    </div>

                    {/* Data Leakage Policy */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Data Leakage Risk:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">0.00% Zero Leakage</span>
                    </div>
                  </div>
                </div>

                {/* Card Title & Platform Description */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      For Private Investors
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Review pre-vetted venture dealflow with verified pitch deck figures, audited cap tables, and institutional signal feeds. Keep allocations strictly confidential in encrypted private dealrooms.
                  </p>

                  <div className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="text-purple-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">100% Zero-Knowledge Confidentiality:</strong> Your identity, capital deployed, and pipeline remain strictly invisible without your consent.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-purple-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Audited Pre-Seed to Series A Dealflow:</strong> Cut diligence time by 80% with verified ARR, APV, and cap table models.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-purple-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Real-Time Macro Signal Feeds:</strong> Direct access to Elite advisors' verified price calls, risk memos, and market forecasts.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-purple-500 font-bold mt-0.5">■</span>
                      <span><strong className="text-slate-900 dark:text-white">Direct Dealroom Introductions:</strong> Engage high-conviction founders directly with zero broker commissions or middlemen.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:p-7 pt-0">
                <Link to="/apply?role=investor" className="w-full">
                  <Button className="w-full rounded-none bg-slate-950 dark:bg-purple-500 hover:bg-purple-600 dark:hover:bg-purple-400 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 shadow-sm transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer">
                    <span>Join as Private Investor</span>
                    <ArrowRight className="h-4 w-4 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOGS & MARKET INSIGHTS SECTION --- */}
      <BlogSection />

      {/* --- TEXT & VIDEO INVESTOR TESTIMONIALS (ANIMATED FAN SECTION) --- */}
      <TestimonialsFanSection videos={TESTIMONIALS_VIDEO} onOpenVideo={openVideoModal} />

      {/* --- NEWSLETTER SECTION: EXCLUSIVE ENVELOPE INVITATION (MATCHING IMAGE 3) --- */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-100/90 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800/80 text-white transition-colors">
        {/* Ambient backlight glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] bg-gradient-to-tr from-amber-500/25 via-orange-500/25 to-rose-500/15 dark:from-amber-600/15 dark:via-orange-600/20 dark:to-rose-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center">
          
          {/* THE 3D ENVELOPE & GLOWING INVITE CARD CONTAINER (WIDE & PROPORTIONAL) */}
          <div className="relative w-full max-w-[880px] mx-auto pt-14 pb-6">
            
            {/* Open Envelope Top Flap (Behind the card) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] max-w-[95vw] h-[220px] pointer-events-none z-0">
              <svg viewBox="0 0 820 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_-12px_30px_rgba(255,100,20,0.18)]">
                <path d="M10 220 L410 15 L810 220 Z" className="fill-slate-200/95 stroke-slate-300 dark:fill-[#141c2c] dark:stroke-[#334155]" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Glowing Invite Card (Wide Majestic Layout) */}
            <div className="relative z-10 mx-auto w-full max-w-[760px] rounded-[28px] bg-gradient-to-br from-[#ff512f] via-[#f04f24] to-[#ff8c00] text-white p-8 sm:p-12 lg:p-14 shadow-[0_25px_80px_rgba(240,79,36,0.38),0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_90px_rgba(240,79,36,0.55)] border border-orange-300/40 transform transition-all duration-500 hover:-translate-y-2">
              
              {/* Corner crosshair markers ⌜ ⌝ */}
              <span className="absolute top-5 left-5 text-white/70 font-mono text-base leading-none select-none">⌜</span>
              <span className="absolute top-5 right-5 text-white/70 font-mono text-base leading-none select-none">⌝</span>
              <span className="absolute bottom-5 left-5 text-white/70 font-mono text-base leading-none select-none">⌞</span>
              <span className="absolute bottom-5 right-5 text-white/70 font-mono text-base leading-none select-none">⌟</span>

              {/* Sub-label */}
              <div className="text-center mb-5">
                <span className="text-[11px] sm:text-xs font-mono tracking-widest text-white uppercase font-bold px-3.5 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/25 shadow-sm">
                  MONEYMINDS // PRIVATE ACCESS
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center tracking-tight text-white leading-tight mb-3.5 drop-shadow-md">
                The wait is over.<br />Your exclusive invite is here.
              </h2>

              <p className="text-sm sm:text-base text-white/95 text-center leading-relaxed max-w-xl mx-auto mb-8 font-medium">
                Check your email to see verified weekly prediction logs, benchmark accuracy rankings, and institutional cap table intelligence.
              </p>

              {/* Subscription Form */}
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your professional email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full sm:flex-1 h-13 rounded-2xl bg-black/30 backdrop-blur-md border border-white/35 text-white placeholder:text-white/70 text-sm sm:text-base px-5 focus:outline-none focus:ring-2 focus:ring-white/60 shadow-inner"
                />
                <button
                  type="submit"
                  className="h-13 px-8 rounded-2xl bg-white text-slate-950 font-extrabold text-sm sm:text-base hover:bg-slate-100 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4 text-slate-950" />
                  <span>Get Invite</span>
                </button>
              </form>

              {newsletterSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-3 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Invitation dispatched! Check your inbox for your welcome memo.</span>
                </motion.div>
              )}

              <p className="text-[11px] text-white/80 text-center mt-5 font-mono">
                Zero spam. Verified intelligence only. Unsubscribe with one click anytime.
              </p>
            </div>

            {/* Envelope Front Pocket Body (Overlapping card bottom) */}
            <div className="relative -mt-20 sm:-mt-24 mx-auto w-full max-w-[830px] h-[190px] z-20 pointer-events-none">
              <svg viewBox="0 0 830 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)]">
                {/* Envelope Pocket */}
                <path d="M0 0 L415 120 L830 0 L830 190 L0 190 Z" className="fill-slate-300/95 stroke-slate-400 dark:fill-[#0f1624] dark:stroke-[#1e293b]" strokeWidth="1.5" />
                {/* Bottom Fold Lines */}
                <path d="M0 190 L415 120 L830 190" className="stroke-slate-400/80 dark:stroke-[#334155]" strokeWidth="1.2" strokeOpacity="0.6" />
              </svg>
            </div>

          </div>

        </div>
      </section>

      {/* --- INSTITUTIONAL FOOTER --- */}
      <InstitutionalFooter />

      {/* --- UNLOCK ADVISOR METRICS / REGISTRATION MODAL --- */}
      <AnimatePresence>
        {unlockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <button
                onClick={() => setUnlockModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Unlock Full Credibility Scores &amp; Track Records
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {selectedAdvisor
                  ? `To protect advisor intellectual property and maintain verified community integrity, ${selectedAdvisor.name}'s verified credibility score (${selectedAdvisor.realCredibility}), subscriber volume (${selectedAdvisor.realSubscribers}), and active signal feed require a free account.`
                  : "To view verified advisor credibility ratings, historical signal logs, and full subscriber volumes, join MoneyMinds with a free account."}
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Access unblurred 1-100 credibility scores and win rates</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Review timestamped signal history verified against live market data</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Free registration with instant profile unlocking</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/apply" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl py-3 shadow-md shadow-emerald-500/20">
                    Create Free Account &rarr;
                  </Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl py-3 text-sm font-semibold border-slate-300 dark:border-slate-700">
                    Already a Member? Log In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIDEO TESTIMONIAL MODAL --- */}
      <AnimatePresence>
        {videoModalOpen && activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-white"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src={activeVideo.videoThumbnail}
                  alt={activeVideo.name}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/90 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/50 animate-pulse">
                    <Play className="h-9 w-9 ml-1 fill-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-1">{activeVideo.embedTitle}</h4>
                  <p className="text-sm text-slate-300">{activeVideo.name} &bull; {activeVideo.role}</p>
                  <p className="text-xs text-emerald-400 mt-2 font-mono">Simulated HD Video Preview</p>
                </div>
              </div>

              <div className="p-6 bg-slate-950">
                <p className="text-sm text-slate-300 italic">&ldquo;{activeVideo.quote}&rdquo;</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
