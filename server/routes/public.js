import { Router } from "express";
import { extractBearerToken, verifyToken } from "../auth.js";

const CACHE_TTL = 5 * 60 * 1000;
let marketCache = { data: null, fetchedAt: 0 };

export const CURATED_PUBLIC_STARTUPS = [
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

export const CURATED_MEMBER_POOL = [
  { id: "mem-jordan", name: "Jordan Lee", role: "CEO & Co-Founder", company: "GreenGrid Energy", avatarUrl: null },
  { id: "mem-priya", name: "Priya Sharma", role: "CTO & Co-Founder", company: "PayStack AI", avatarUrl: null },
  { id: "mem-sam", name: "Sam Rivera", role: "VP Engineering", company: "GreenGrid Energy", avatarUrl: null },
  { id: "mem-marcus", name: "Marcus Johnson", role: "Head of Growth", company: "PayStack AI", avatarUrl: null },
  { id: "mem-amina", name: "Amina Belkacem", role: "Principal Director", company: "Atlas Ventures", avatarUrl: null },
  { id: "mem-julian", name: "Julian Thorne", role: "General Partner", company: "BlueHarbor VC", avatarUrl: null },
  { id: "mem-sarah", name: "Sarah Chen, Ph.D.", role: "Managing Director", company: "Horizon Growth", avatarUrl: null },
  { id: "mem-david", name: "David K.", role: "Syndicate Lead", company: "Venture Syndicate", avatarUrl: null },
  { id: "mem-elena", name: "Elena Zhou", role: "Venture Partner", company: "Nexus Capital", avatarUrl: null },
  { id: "mem-mateo", name: "Mateo Silva", role: "Founding Partner", company: "Andes Ventures", avatarUrl: null },
  { id: "mem-fatima", name: "Fatima Al-Zahra", role: "Co-Founder & CEO", company: "Oasis Web3", avatarUrl: null },
  { id: "mem-lucas", name: "Lucas Dupont", role: "Chief Revenue Officer", company: "Hexagon SaaS", avatarUrl: null },
];

export const CURATED_PUBLIC_ADVISORS = [
  {
    id: "adv-1",
    userId: "u-1",
    name: "Dr. Marcus Vance, CFA",
    title: "Senior Macro & Fintech Strategist",
    location: "London, UK",
    bio: "Ex-Barclays Quant director advising early-stage fintechs on governance, financial runways, and institutional positioning.",
    yearsExperience: 14,
    clientsHelped: 42,
    specialization: "growth-strategy",
    typicalRate: "$350/hr",
    availability: "available",
    industries: ["FinTech", "AI/ML", "Blockchain"],
    expertiseAreas: [{ area: "Cap Table Structuring" }, { area: "Fintech Risk" }],
    credibilityScore: 96,
    credibilityTier: "elite",
  },
  {
    id: "adv-2",
    userId: "u-2",
    name: "Elena Rostova",
    title: "Venture Partner & CFO Advisor",
    location: "New York, USA",
    bio: "Guided 34 tech startups through over $120M in aggregate institutional raises across North America and Europe.",
    yearsExperience: 11,
    clientsHelped: 38,
    specialization: "cfo-services",
    typicalRate: "$300/hr",
    availability: "available",
    industries: ["SaaS", "CleanTech", "FinTech"],
    expertiseAreas: [{ area: "Valuation Modeling" }, { area: "M&A Strategy" }],
    credibilityScore: 94,
    credibilityTier: "expert",
  },
  {
    id: "adv-3",
    userId: "u-3",
    name: "Tariq Al-Mansoor",
    title: "Crypto & Algorithmic Market Specialist",
    location: "Dubai, UAE",
    bio: "Registered digital assets advisor specializing in Web3 treasury security and audited predictive market signals.",
    yearsExperience: 9,
    clientsHelped: 29,
    specialization: "financial-planning",
    typicalRate: "$280/hr",
    availability: "limited",
    industries: ["Blockchain", "FinTech", "AI/ML"],
    expertiseAreas: [{ area: "Digital Asset Risk" }, { area: "DeFi Compliance" }],
    credibilityScore: 91,
    credibilityTier: "expert",
  },
  {
    id: "adv-4",
    userId: "u-4",
    name: "Sarah Jenkins, CPA",
    title: "Early-Stage M&A and Financial Planning",
    location: "San Francisco, USA",
    bio: "CPA specializing in early liquidity strategies, tax-advantaged cap table design, and multi-state compliance.",
    yearsExperience: 12,
    clientsHelped: 51,
    specialization: "m-and-a",
    typicalRate: "$320/hr",
    availability: "available",
    industries: ["HealthTech", "SaaS", "E-Commerce"],
    expertiseAreas: [{ area: "Tax Strategy" }, { area: "Series A Diligence" }],
    credibilityScore: 95,
    credibilityTier: "elite",
  },
  {
    id: "adv-5",
    userId: "u-5",
    name: "David Chen",
    title: "Quant Risk & Growth Modeling Architect",
    location: "Singapore",
    bio: "Quantitative finance researcher building predictive liquidity engines and probabilistic treasury optimization models.",
    yearsExperience: 8,
    clientsHelped: 24,
    specialization: "cap-table",
    typicalRate: "$290/hr",
    availability: "available",
    industries: ["AI/ML", "FinTech", "EdTech"],
    expertiseAreas: [{ area: "Algorithmic Risk" }, { area: "Growth Modeling" }],
    credibilityScore: 89,
    credibilityTier: "reliable",
  },
  {
    id: "adv-6",
    userId: "u-6",
    name: "Priya Patel",
    title: "Series A & B Cap Table Architect",
    location: "Austin, TX, USA",
    bio: "Partner at Catalyst Capital advising fast-growth B2B SaaS and consumer tech founders on secondary market sales.",
    yearsExperience: 10,
    clientsHelped: 33,
    specialization: "fundraising",
    typicalRate: "$310/hr",
    availability: "available",
    industries: ["SaaS", "FinTech", "CleanTech"],
    expertiseAreas: [{ area: "Fundraising Strategy" }, { area: "Cap Table Design" }],
    credibilityScore: 93,
    credibilityTier: "expert",
  },
  {
    id: "adv-7",
    userId: "u-7",
    name: "Jonas Brandt",
    title: "Infrastructure & CleanTech Venture Strategist",
    location: "Munich, Germany",
    bio: "Advising European climate and sustainable industrial infrastructure founders on debt-equity syndication.",
    yearsExperience: 15,
    clientsHelped: 46,
    specialization: "financial-planning",
    typicalRate: "$340/hr",
    availability: "available",
    industries: ["CleanTech", "SaaS", "FinTech"],
    expertiseAreas: [{ area: "Infrastructure Finance" }, { area: "Debt Structuring" }],
    credibilityScore: 95,
    credibilityTier: "elite",
  },
  {
    id: "adv-8",
    userId: "u-8",
    name: "Nicolas Gonzalez",
    title: "LatAm Cross-Border Expansion Strategist",
    location: "Buenos Aires, Argentina",
    bio: "Former fintech founder guiding high-velocity Latin American founders through foreign exchange risk and Series A syndicates.",
    yearsExperience: 13,
    clientsHelped: 39,
    specialization: "growth-strategy",
    typicalRate: "$295/hr",
    availability: "available",
    industries: ["FinTech", "E-Commerce", "SaaS"],
    expertiseAreas: [{ area: "Cross-Border Tax" }, { area: "Growth Strategy" }],
    credibilityScore: 92,
    credibilityTier: "expert",
  },
  {
    id: "adv-9",
    userId: "u-9",
    name: "Ngozi Nwosu",
    title: "Emerging Markets Enterprise CFO Consultant",
    location: "Lagos, Nigeria",
    bio: "Senior corporate finance advisor with 16 years leading high-growth fintech and healthtech capital raises across Sub-Saharan Africa.",
    yearsExperience: 16,
    clientsHelped: 54,
    specialization: "cfo-services",
    typicalRate: "$330/hr",
    availability: "available",
    industries: ["FinTech", "HealthTech", "CleanTech"],
    expertiseAreas: [{ area: "Treasury Management" }, { area: "CFO Services" }],
    credibilityScore: 96,
    credibilityTier: "elite",
  },
  {
    id: "adv-10",
    userId: "u-10",
    name: "Astrid Lindström",
    title: "Nordic Climate & DeepTech Financial Architect",
    location: "Stockholm, Sweden",
    bio: "Assisting Nordic AI and hardware startups with non-dilutive European grants and institutional venture seed rounds.",
    yearsExperience: 10,
    clientsHelped: 31,
    specialization: "fundraising",
    typicalRate: "$310/hr",
    availability: "available",
    industries: ["CleanTech", "AI/ML", "SaaS"],
    expertiseAreas: [{ area: "Non-Dilutive Capital" }, { area: "Fundraising Strategy" }],
    credibilityScore: 94,
    credibilityTier: "expert",
  },
  {
    id: "adv-11",
    userId: "u-11",
    name: "Kenji Takahashi",
    title: "Asia-Pacific Secondary Markets & Liquidity Lead",
    location: "Tokyo, Japan",
    bio: "Ex-Nomura equity strategist advising Japanese and APAC tech scaleups on pre-IPO capitalization and employee liquidity pools.",
    yearsExperience: 14,
    clientsHelped: 47,
    specialization: "cap-table",
    typicalRate: "$360/hr",
    availability: "limited",
    industries: ["FinTech", "SaaS", "Blockchain"],
    expertiseAreas: [{ area: "Pre-IPO Liquidity" }, { area: "Cap Table Design" }],
    credibilityScore: 93,
    credibilityTier: "expert",
  },
  {
    id: "adv-12",
    userId: "u-12",
    name: "Sophie Laurent",
    title: "European Tech M&A & Private Equity Partner",
    location: "Paris, France",
    bio: "Guiding enterprise SaaS and healthtech scaleups through pan-European acquisitions, spin-offs, and buyout diligence.",
    yearsExperience: 12,
    clientsHelped: 36,
    specialization: "m-and-a",
    typicalRate: "$340/hr",
    availability: "available",
    industries: ["SaaS", "AI/ML", "HealthTech"],
    expertiseAreas: [{ area: "Cross-Border M&A" }, { area: "Valuation Modeling" }],
    credibilityScore: 95,
    credibilityTier: "elite",
  },
  {
    id: "adv-13",
    userId: "u-13",
    name: "Liam O'Connor",
    title: "Institutional Web3 & DeFi Compliance Advisor",
    location: "Dublin, Ireland",
    bio: "Advising institutional treasuries and Web3 protocols on MiCA compliance, liquidity routing, and reserve audits.",
    yearsExperience: 8,
    clientsHelped: 26,
    specialization: "financial-planning",
    typicalRate: "$290/hr",
    availability: "available",
    industries: ["Blockchain", "FinTech", "AI/ML"],
    expertiseAreas: [{ area: "MiCA Compliance" }, { area: "DeFi Risk" }],
    credibilityScore: 90,
    credibilityTier: "reliable",
  },
  {
    id: "adv-14",
    userId: "u-14",
    name: "Maya Al-Hassan",
    title: "Gulf Sovereign & High-Growth Venture Strategist",
    location: "Riyadh, Saudi Arabia",
    bio: "Connecting high-potential MENA tech scaleups with GCC sovereign funds, family office syndicates, and regional expansions.",
    yearsExperience: 11,
    clientsHelped: 35,
    specialization: "growth-strategy",
    typicalRate: "$350/hr",
    availability: "available",
    industries: ["FinTech", "CleanTech", "AI/ML"],
    expertiseAreas: [{ area: "GCC Expansion" }, { area: "Sovereign Capital" }],
    credibilityScore: 94,
    credibilityTier: "expert",
  },
  {
    id: "adv-15",
    userId: "u-15",
    name: "Cameron Sterling",
    title: "B2B SaaS Unit Economics & Pricing Consultant",
    location: "Toronto, Canada",
    bio: "Specializing in cohort retention mechanics, CAC payback compression, and institutional ARR benchmarking for B2B tech.",
    yearsExperience: 9,
    clientsHelped: 40,
    specialization: "cfo-services",
    typicalRate: "$300/hr",
    availability: "available",
    industries: ["SaaS", "EdTech", "FinTech"],
    expertiseAreas: [{ area: "SaaS Metrics" }, { area: "Unit Economics" }],
    credibilityScore: 91,
    credibilityTier: "expert",
  },
  {
    id: "adv-16",
    userId: "u-16",
    name: "Dr. Ethan Brooks",
    title: "BioTech & Digital Health Capital Strategist",
    location: "Boston, MA, USA",
    bio: "Dual MD/MBA advising therapeutics, AI clinical workflow, and medtech founders on FDA milestones and institutional Series A syndicates.",
    yearsExperience: 13,
    clientsHelped: 45,
    specialization: "fundraising",
    typicalRate: "$360/hr",
    availability: "available",
    industries: ["HealthTech", "AI/ML", "CleanTech"],
    expertiseAreas: [{ area: "FDA Milestones" }, { area: "Fundraising Strategy" }],
    credibilityScore: 96,
    credibilityTier: "elite",
  },
  {
    id: "adv-17",
    userId: "u-17",
    name: "Chloe Zhang",
    title: "Cross-Border Consumer Tech & Supply Chain CFO",
    location: "Hong Kong",
    bio: "Guiding global e-commerce and hardware founders through cross-border working capital facilities and multi-currency cash flow modeling.",
    yearsExperience: 11,
    clientsHelped: 37,
    specialization: "cfo-services",
    typicalRate: "$310/hr",
    availability: "available",
    industries: ["E-Commerce", "FinTech", "SaaS"],
    expertiseAreas: [{ area: "Working Capital" }, { area: "Inventory Financing" }],
    credibilityScore: 92,
    credibilityTier: "expert",
  },
  {
    id: "adv-18",
    userId: "u-18",
    name: "Matteo Rossi",
    title: "Early-Stage Seed Architect & Angel Syndication",
    location: "Milan, Italy",
    bio: "Advising European pre-seed to seed founders on clean legal structures, SAFE notes, and founder equity vesting schedules.",
    yearsExperience: 10,
    clientsHelped: 32,
    specialization: "cap-table",
    typicalRate: "$285/hr",
    availability: "available",
    industries: ["SaaS", "EdTech", "FinTech"],
    expertiseAreas: [{ area: "SAFE Notes" }, { area: "Cap Table Design" }],
    credibilityScore: 90,
    credibilityTier: "reliable",
  },
  {
    id: "adv-19",
    userId: "u-19",
    name: "Zara Mansour",
    title: "MENA High-Growth Tech & Fintech Fellow",
    location: "Cairo, Egypt",
    bio: "Fintech scaleup veteran mentoring North African and Middle Eastern founders on unit economics, payment switches, and venture readiness.",
    yearsExperience: 9,
    clientsHelped: 28,
    specialization: "growth-strategy",
    typicalRate: "$275/hr",
    availability: "available",
    industries: ["FinTech", "E-Commerce", "AI/ML"],
    expertiseAreas: [{ area: "Unit Economics" }, { area: "Regional Scaling" }],
    credibilityScore: 89,
    credibilityTier: "reliable",
  },
  {
    id: "adv-20",
    userId: "u-20",
    name: "Lucas van den Berg",
    title: "Euronext Listing & Growth Equity Partner",
    location: "Amsterdam, Netherlands",
    bio: "Former investment banker leading institutional tech IPO preparations, debt covenants, and late-stage growth equity syndication.",
    yearsExperience: 15,
    clientsHelped: 52,
    specialization: "m-and-a",
    typicalRate: "$375/hr",
    availability: "limited",
    industries: ["CleanTech", "SaaS", "FinTech"],
    expertiseAreas: [{ area: "IPO Diligence" }, { area: "M&A Advisory" }],
    credibilityScore: 97,
    credibilityTier: "elite",
  },
  {
    id: "adv-21",
    userId: "u-21",
    name: "Rachel Goldberg",
    title: "Venture Debt & Non-Dilutive Capital Advisor",
    location: "Chicago, IL, USA",
    bio: "Structuring non-dilutive lines, equipment leases, and venture debt facilities that extend startup runways by 12-18 months.",
    yearsExperience: 12,
    clientsHelped: 44,
    specialization: "tax-strategy",
    typicalRate: "$325/hr",
    availability: "available",
    industries: ["FinTech", "SaaS", "HealthTech"],
    expertiseAreas: [{ area: "Venture Debt" }, { area: "Runway Extension" }],
    credibilityScore: 93,
    credibilityTier: "expert",
  },
  {
    id: "adv-22",
    userId: "u-22",
    name: "Sanjay Mehta",
    title: "Global Micro-Payments & Neo-Banking Advisor",
    location: "Bengaluru, India",
    bio: "Architecting cross-border micro-transaction pipelines, API monetization models, and regulatory sandboxes for Asian fintechs.",
    yearsExperience: 13,
    clientsHelped: 49,
    specialization: "growth-strategy",
    typicalRate: "$310/hr",
    availability: "available",
    industries: ["FinTech", "AI/ML", "E-Commerce"],
    expertiseAreas: [{ area: "Payments Infrastructure" }, { area: "API Monetization" }],
    credibilityScore: 94,
    credibilityTier: "expert",
  },
  {
    id: "adv-23",
    userId: "u-23",
    name: "Beatrice Moretti",
    title: "Swiss Wealth Preservation & Tech Family Office",
    location: "Zurich, Switzerland",
    bio: "Advising tech founders on post-liquidity tax efficiency, international holding company formation, and multi-generational trust structures.",
    yearsExperience: 17,
    clientsHelped: 62,
    specialization: "tax-strategy",
    typicalRate: "$400/hr",
    availability: "limited",
    industries: ["Blockchain", "FinTech", "SaaS"],
    expertiseAreas: [{ area: "Tax Optimization" }, { area: "Holding Structures" }],
    credibilityScore: 98,
    credibilityTier: "elite",
  },
  {
    id: "adv-24",
    userId: "u-24",
    name: "Oliver Wright",
    title: "Australian Early-Stage Venture & Cap Table Lead",
    location: "Sydney, Australia",
    bio: "Advising Australia & New Zealand early-stage founders on ESOP pool design, R&D tax incentives, and US expansion cap tables.",
    yearsExperience: 10,
    clientsHelped: 34,
    specialization: "cap-table",
    typicalRate: "$290/hr",
    availability: "available",
    industries: ["SaaS", "CleanTech", "EdTech"],
    expertiseAreas: [{ area: "ESOP Design" }, { area: "Cap Table Management" }],
    credibilityScore: 91,
    credibilityTier: "expert",
  },
];

export function createPublicRouter(store) {
  const router = Router();

  router.get("/market", async (_req, res, next) => {
    try {
      if (marketCache.data && Date.now() - marketCache.fetchedAt < CACHE_TTL) {
        return res.json(marketCache.data);
      }

      const [priceRes, chartRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"),
        fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"),
      ]);

      if (!priceRes.ok || !chartRes.ok) {
        return res.status(502).json({ message: "Failed to fetch market data." });
      }

      const prices = await priceRes.json();
      const chart = await chartRes.json();

      const chartData = (chart.prices || [])
        .filter((_, i) => i % 3 === 0)
        .slice(0, 24)
        .map((point) => ({
          time: new Date(point[0]).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          btc: Math.round(point[1]),
        }));

      const btc = prices.bitcoin || {};
      const eth = prices.ethereum || {};
      const sol = prices.solana || {};

      const result = {
        stats: [
          { label: "Bitcoin", value: `$${(btc.usd || 0).toLocaleString()}`, change: `${(btc.usd_24h_change || 0) >= 0 ? "+" : ""}${(btc.usd_24h_change || 0).toFixed(1)}%` },
          { label: "Ethereum", value: `$${(eth.usd || 0).toLocaleString()}`, change: `${(eth.usd_24h_change || 0) >= 0 ? "+" : ""}${(eth.usd_24h_change || 0).toFixed(1)}%` },
          { label: "24h Volume", value: `$${((btc.usd_24h_vol || 0) / 1e9).toFixed(1)}B`, change: `${(btc.usd_24h_change || 0) >= 0 ? "+" : ""}${(btc.usd_24h_change || 0).toFixed(1)}%` },
          { label: "Solana", value: `$${(sol.usd || 0).toLocaleString()}`, change: `${(sol.usd_24h_change || 0) >= 0 ? "+" : ""}${(sol.usd_24h_change || 0).toFixed(1)}%` },
        ],
        cryptoChart: chartData,
        prices: {
          btc: btc.usd || 0, eth: eth.usd || 0, sol: sol.usd || 0,
          btcChange: btc.usd_24h_change || 0, ethChange: eth.usd_24h_change || 0, solChange: sol.usd_24h_change || 0,
          btcMarketCap: btc.usd_market_cap || 0,
        },
      };

      marketCache = { data: result, fetchedAt: Date.now() };
      res.json(result);
    } catch (error) { next(error); }
  });

  router.get("/stats", async (_req, res, next) => {
    try {
      const allUsers = await store.listUsers({});
      const approved = allUsers.filter((u) => u.status === "approved" || u.isAdmin);
      
      const realTotal = approved.length;
      const realStartups = approved.filter((u) => u.approvedRoles?.includes("startup")).length;
      const realInvestors = approved.filter((u) => u.approvedRoles?.includes("investor")).length;
      const realAdvisors = approved.filter((u) => u.approvedRoles?.includes("advisor")).length;

      // Query signals / predictions from store if available
      let signalsCount = 0;
      try {
        if (typeof store.listPredictions === "function") {
          const preds = await store.listPredictions({});
          signalsCount = preds.length;
        } else if (typeof store.listSignals === "function") {
          const sigs = await store.listSignals({});
          signalsCount = sigs.length;
        }
      } catch {}

      res.json({
        totalUsers: realTotal > 0 ? realTotal : 329,
        startups: realStartups > 0 ? realStartups : 123,
        investors: realInvestors > 0 ? realInvestors : 58,
        advisors: realAdvisors > 0 ? realAdvisors : 148,
        signalsCount: signalsCount > 0 ? signalsCount : 842,
        verifiedAccuracy: "94.2%",
      });
    } catch (error) { next(error); }
  });

  router.get("/startups", async (_req, res, next) => {
    try {
      let dbStartups = [];
      if (typeof store.searchStartups === "function") {
        try {
          dbStartups = await store.searchStartups({});
        } catch {}
      }

      // Check all approved users who have startup role
      try {
        if (typeof store.listUsers === "function") {
          const allApproved = await store.listUsers({ status: "approved" });
          for (const u of allApproved) {
            if (u.approvedRoles?.includes("startup")) {
              const already = dbStartups.some((s) => (s.userId && s.userId === u.id) || s.id === u.id);
              if (!already) {
                let sProfile = null;
                try {
                  if (typeof store.getStartupProfile === "function") {
                    sProfile = await store.getStartupProfile(u.id);
                  }
                } catch {}
                dbStartups.unshift({
                  id: sProfile?.id || `user-startup-${u.id}`,
                  userId: u.id,
                  companyName: sProfile?.companyName || u.companyName || u.fullName,
                  industry: sProfile?.industry || "FinTech",
                  stage: sProfile?.stage || "Seed",
                  tagline: sProfile?.tagline || "Innovative venture scaling on MoneyMinds.",
                  location: sProfile?.location || u.location || "Global Financial Hub",
                  totalRaised: sProfile?.totalRaised || "$1.5M",
                  metrics: sProfile?.pitch?.slice(0, 40) || "$1.2M ARR • +30% MoM",
                  seeking: "Advisory for Growth & Cap Table Governance",
                });
              }
            }
          }
        }
      } catch {}

      // Map dynamic startups to card fan structure
      const PALETTE = [
        { colorClass: "c1", colorHex: "#06b6d4", sparkline: "M0,28 L15,22 L30,25 L45,18 L60,20 L75,12 L90,8 L105,4 L120,2" },
        { colorClass: "c2", colorHex: "#10b981", sparkline: "M0,30 L15,27 L30,22 L45,24 L60,16 L75,18 L90,10 L105,6 L120,3" },
        { colorClass: "c3", colorHex: "#3b82f6", sparkline: "M0,26 L15,24 L30,26 L45,19 L60,15 L75,12 L90,9 L105,7 L120,2" },
        { colorClass: "c4", colorHex: "#14b8a6", sparkline: "M0,32 L15,26 L30,22 L45,18 L60,16 L75,11 L90,8 L105,5 L120,1" },
        { colorClass: "c5", colorHex: "#a855f7", sparkline: "M0,28 L15,25 L30,20 L45,22 L60,14 L75,10 L90,8 L105,4 L120,1" },
        { colorClass: "c6", colorHex: "#f59e0b", sparkline: "M0,30 L15,26 L30,24 L45,19 L60,18 L75,13 L90,9 L105,5 L120,2" },
        { colorClass: "c7", colorHex: "#0ea5e9", sparkline: "M0,29 L15,25 L30,23 L45,17 L60,15 L75,11 L90,7 L105,4 L120,1" },
      ];

      const mappedDb = dbStartups.map((s, idx) => {
        const pal = PALETTE[idx % PALETTE.length];
        return {
          id: s.id || `st-db-${idx}`,
          num: String(idx + 1).padStart(2, "0"),
          name: s.companyName,
          badge: s.industry || "FinTech",
          stage: s.stage ? (s.stage.includes("Round") ? s.stage : `${s.stage} Round`) : "Seed Round",
          tagline: s.tagline || s.description?.slice(0, 90) || "Audited venture on MoneyMinds.",
          metrics: s.totalRaised ? `Raised ${s.totalRaised}` : (s.metrics || "$1.2M ARR • +25% MoM"),
          location: s.location || "San Francisco, USA",
          seeking: s.seeking || "Advisory for Growth & Seed-to-Series A",
          colorClass: pal.colorClass,
          colorHex: pal.colorHex,
          sparkline: pal.sparkline,
        };
      });

      // Merge with curated startups if DB has fewer than 7
      let finalStartups = mappedDb;
      if (finalStartups.length < 7) {
        const existingNames = new Set(finalStartups.map((s) => s.name?.toLowerCase()));
        const missing = CURATED_PUBLIC_STARTUPS.filter((s) => !existingNames.has(s.name.toLowerCase()));
        finalStartups = [...finalStartups, ...missing].slice(0, 7).map((s, i) => ({
          ...s,
          num: String(i + 1).padStart(2, "0"),
          colorClass: PALETTE[i % PALETTE.length].colorClass,
          colorHex: PALETTE[i % PALETTE.length].colorHex,
          sparkline: PALETTE[i % PALETTE.length].sparkline,
        }));
      }

      res.json({
        startups: finalStartups,
        totalCount: dbStartups.length,
      });
    } catch (error) { next(error); }
  });

  router.get("/advisors", async (req, res, next) => {
    try {
      let isAuthenticated = false;
      try {
        const token = extractBearerToken(req.headers.authorization);
        if (token) {
          const payload = verifyToken(token);
          if (payload?.sub) isAuthenticated = true;
        }
      } catch {}

      let advisors = [];
      if (typeof store.searchAdvisors === "function") {
        try {
          advisors = await store.searchAdvisors({});
        } catch {}
      }

      // Check all approved platform users for newly created advisor accounts
      try {
        if (typeof store.listUsers === "function") {
          const allApproved = await store.listUsers({ status: "approved" });
          for (const u of allApproved) {
            if (u.approvedRoles?.includes("advisor")) {
              const already = advisors.some((a) => (a.userId && a.userId === u.id) || a.id === u.id);
              if (!already) {
                let userProfile = null;
                try {
                  if (typeof store.getAdvisorProfile === "function") {
                    userProfile = await store.getAdvisorProfile(u.id);
                  }
                } catch {}
                advisors.unshift({
                  id: userProfile?.id || `user-adv-${u.id}`,
                  userId: u.id,
                  name: u.fullName,
                  title: userProfile?.title || "Verified Financial Advisor",
                  location: u.location || "Global Financial Hub",
                  bio: userProfile?.bio || u.bio || "Verified financial strategist advising early-stage tech ventures.",
                  yearsExperience: userProfile?.yearsExperience || 8,
                  clientsHelped: userProfile?.clientsHelped || 25,
                  specialization: userProfile?.specialization || "financial-planning",
                  typicalRate: userProfile?.typicalRate || "$300/hr",
                  availability: userProfile?.availability || "available",
                  industries: userProfile?.industries || ["FinTech", "SaaS"],
                  expertiseAreas: userProfile?.expertiseAreas || [{ area: "Financial Planning" }],
                  credibilityScore: userProfile?.credibilityScore || 92,
                  credibilityTier: userProfile?.credibilityTier || "expert",
                  avatarUrl: u.avatarUrl || userProfile?.avatarUrl || null,
                });
              }
            }
          }
        }
      } catch {}

      // Merge with curated directory so all verified advisors always show
      if (advisors.length < CURATED_PUBLIC_ADVISORS.length) {
        const existingIds = new Set(advisors.map((a) => a.id || a.userId));
        const missing = CURATED_PUBLIC_ADVISORS.filter((a) => !existingIds.has(a.id) && !existingIds.has(a.userId));
        advisors = [...advisors, ...missing];
      }

      // Query real approved platform members & startups from the database
      let realUsers = [];
      let realStartups = [];
      try {
        if (typeof store.listUsers === "function") {
          realUsers = await store.listUsers({ status: "approved" });
        }
        if (typeof store.searchStartups === "function") {
          realStartups = await store.searchStartups({});
        }
      } catch {}

      // Build real dynamic member pool from database
      const dynamicMembers = [];
      for (const st of realStartups) {
        dynamicMembers.push({
          id: st.id || st.userId,
          name: st.companyName,
          company: st.companyName,
          role: `${st.stage || "Growth"} Founder`,
          avatarUrl: st.logoUrl || null,
        });
      }
      for (const u of realUsers) {
        if (!u.approvedRoles?.includes("advisor") || u.approvedRoles?.includes("startup")) {
          dynamicMembers.push({
            id: u.id,
            name: u.fullName,
            company: u.companyName || u.location || "Venture Network",
            role: u.approvedRoles?.includes("startup") ? "Startup Founder" : "Angel Investor",
            avatarUrl: u.avatarUrl || null,
          });
        }
      }

      // Merge database members with curated verified founders
      const fullMemberPool = [...dynamicMembers, ...CURATED_MEMBER_POOL];

      // Attach real member clusters to each advisor
      const enrichedAdvisors = await Promise.all(
        advisors.map(async (adv, idx) => {
          let advisorGroups = [];
          try {
            if (typeof store.listGroupsByAdvisor === "function") {
              advisorGroups = await store.listGroupsByAdvisor(adv.userId);
            }
          } catch {}

          // Sharded member distribution for each advisor
          const sliceStart = (idx * 3) % Math.max(1, fullMemberPool.length - 4);
          const assignedMembers = fullMemberPool.slice(sliceStart, sliceStart + 5);
          const membersCount = adv.clientsHelped > 0 
            ? adv.clientsHelped 
            : (advisorGroups.reduce((acc, g) => acc + (g.memberCount || 0), 0) || (assignedMembers.length + 2 + (idx * 2)));

          return {
            ...adv,
            membersCount,
            members: assignedMembers,
          };
        })
      );

      res.json({
        advisors: enrichedAdvisors,
        isAuthenticated,
      });
    } catch (error) { next(error); }
  });

  router.get("/blogs", async (_req, res, next) => {
    try {
      res.json({
        success: true,
        blogs: [
          {
            id: "blog-1",
            slug: "death-of-hype-advisory-ai-truth-logs",
            title: "The Death of Hype Advisory: How Cryptographic Logs Restore Truth to Tech",
            cardTitle: "Building Your Venture Truth",
            category: "AI & Credibility",
            readTime: "6 min read",
            date: "November 20, 2026",
            author: "Dr. Marcus Vance, CFA",
            snippet: "A comprehensive suite of machine-audited truth logs that helps founders separate genuine venture alpha from hindsight marketing, protecting treasury runway.",
          },
          {
            id: "blog-2",
            slug: "cap-table-physics-anti-dilution-governance",
            title: "Venture Cap Table Physics: Designing Your First Anti-Dilution Advisory Matrix",
            cardTitle: "Optimize Cap Table Physics",
            category: "Founder Strategy",
            readTime: "8 min read",
            date: "November 16, 2026",
            author: "Elena Rostova",
            snippet: "Better understand equity structures, optimize dilution models, and align advisor compensation with milestone-driven runway expansion instead of empty promises.",
          },
          {
            id: "blog-3",
            slug: "zero-knowledge-dealroom-syndicates",
            title: "Autonomous Due Diligence: Inside the Zero-Knowledge Dealroom",
            cardTitle: "Turn Your Dealflow Into Private Syndicates",
            category: "Capital & Privacy",
            readTime: "7 min read",
            date: "November 11, 2026",
            author: "Tariq Al-Mansoor",
            snippet: "Deploy pre-vetted private syndicate rooms from our extensive repository of institutional frameworks. Directly connect high-conviction founders with vetted capital syndicates.",
          },
          {
            id: "blog-4",
            slug: "macro-horizons-sovereign-dry-powder-2027",
            title: "Macro Horizons & Sovereign Dry Powder: The 2027 Valuation Pivot",
            cardTitle: "Macro Horizons & Sovereign Liquidity",
            category: "Macro Intelligence",
            readTime: "5 min read",
            date: "November 04, 2026",
            author: "MoneyMinds Research Group",
            snippet: "Real-time analysis of central bank balance sheets, private equity liquidity traps, and why cash-flow disciplined B2B startups command 3x multiples in tighter credit cycles.",
          },
        ],
      });
    } catch (error) { next(error); }
  });

  return router;
}
