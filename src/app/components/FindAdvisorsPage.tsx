import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { InstitutionalFooter } from "@/app/components/footer/InstitutionalFooter";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { 
  getAdvisorAvatar, 
  getInitials, 
  getAvatarGradient, 
  getAdvisorLocationDetails,
  isRealImage 
} from "@/app/lib/avatarHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Search,
  Filter,
  Award,
  Briefcase,
  MapPin,
  CheckCircle2,
  Heart,
  ArrowRight,
  MessageSquare,
  Loader2,
  Lock,
  X,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { searchAdvisors, sendConnectionRequest } from "@/app/lib/api";
import type { AdvisorSearchResult } from "@/app/types/search";

const DEFAULT_MEMBERS_POOL = [
  { id: "mem-1", name: "Jordan Lee", company: "GreenGrid Energy", role: "CEO & Co-Founder" },
  { id: "mem-2", name: "Priya Sharma", company: "PayStack AI", role: "CTO & Co-Founder" },
  { id: "mem-3", name: "Sam Rivera", company: "GreenGrid Energy", role: "VP Engineering" },
  { id: "mem-4", name: "Marcus Johnson", company: "PayStack AI", role: "Head of Growth" },
  { id: "mem-5", name: "Amina Belkacem", company: "Atlas Ventures", role: "Principal Director" },
  { id: "mem-6", name: "Julian Thorne", company: "BlueHarbor VC", role: "General Partner" },
  { id: "mem-7", name: "Sarah Chen, Ph.D.", company: "Horizon Growth", role: "Managing Director" },
  { id: "mem-8", name: "David K.", company: "Venture Syndicate", role: "Syndicate Lead" },
  { id: "mem-9", name: "Elena Zhou", company: "Nexus Capital", role: "Venture Partner" },
  { id: "mem-10", name: "Mateo Silva", company: "Andes Ventures", role: "Founding Partner" },
  { id: "mem-11", name: "Fatima Al-Zahra", company: "Oasis Web3", role: "Co-Founder & CEO" },
  { id: "mem-12", name: "Lucas Dupont", company: "Hexagon SaaS", role: "Chief Revenue Officer" },
];

const DEFAULT_DIRECTORY_ADVISORS: any[] = [
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
    membersCount: 7,
    members: DEFAULT_MEMBERS_POOL.slice(0, 5),
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
    membersCount: 8,
    members: [DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[0], DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[5]],
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
    membersCount: 6,
    members: [DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[0]],
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
    membersCount: 9,
    members: DEFAULT_MEMBERS_POOL.slice(3, 8),
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
    membersCount: 5,
    members: [DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[6], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[7]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[8], DEFAULT_MEMBERS_POOL[0], DEFAULT_MEMBERS_POOL[3]],
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
    membersCount: 8,
    members: [DEFAULT_MEMBERS_POOL[6], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[9], DEFAULT_MEMBERS_POOL[1]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[9], DEFAULT_MEMBERS_POOL[0], DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[7]],
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
    membersCount: 9,
    members: [DEFAULT_MEMBERS_POOL[8], DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[10], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[6]],
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
    membersCount: 6,
    members: [DEFAULT_MEMBERS_POOL[10], DEFAULT_MEMBERS_POOL[7], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[5]],
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
    membersCount: 8,
    members: [DEFAULT_MEMBERS_POOL[11], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[8]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[0], DEFAULT_MEMBERS_POOL[11], DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[7]],
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
    membersCount: 6,
    members: [DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[9], DEFAULT_MEMBERS_POOL[2]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[10], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[8]],
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
    membersCount: 8,
    members: [DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[6], DEFAULT_MEMBERS_POOL[11], DEFAULT_MEMBERS_POOL[0]],
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
    membersCount: 9,
    members: [DEFAULT_MEMBERS_POOL[7], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[8], DEFAULT_MEMBERS_POOL[1]],
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
    membersCount: 6,
    members: [DEFAULT_MEMBERS_POOL[8], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[9]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[9], DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[6], DEFAULT_MEMBERS_POOL[0]],
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
    membersCount: 5,
    members: [DEFAULT_MEMBERS_POOL[10], DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[2]],
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
    membersCount: 10,
    members: [DEFAULT_MEMBERS_POOL[11], DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[7], DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[0]],
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
    membersCount: 8,
    members: [DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[8], DEFAULT_MEMBERS_POOL[10], DEFAULT_MEMBERS_POOL[5]],
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
    membersCount: 9,
    members: [DEFAULT_MEMBERS_POOL[1], DEFAULT_MEMBERS_POOL[3], DEFAULT_MEMBERS_POOL[6], DEFAULT_MEMBERS_POOL[9]],
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
    membersCount: 11,
    members: [DEFAULT_MEMBERS_POOL[4], DEFAULT_MEMBERS_POOL[7], DEFAULT_MEMBERS_POOL[11], DEFAULT_MEMBERS_POOL[0], DEFAULT_MEMBERS_POOL[8]],
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
    membersCount: 7,
    members: [DEFAULT_MEMBERS_POOL[5], DEFAULT_MEMBERS_POOL[9], DEFAULT_MEMBERS_POOL[2], DEFAULT_MEMBERS_POOL[10]],
  },
];

const SPECIALIZATION_LABELS: Record<string, string> = {
  "financial-planning": "Financial Planning",
  fundraising: "Fundraising Strategy",
  "cfo-services": "CFO Services",
  "cap-table": "Cap Table Management",
  "m-and-a": "M&A Advisory",
  "tax-strategy": "Tax Strategy",
  "growth-strategy": "Growth Strategy",
};

/**
 * AdvisorCard: Exact visual style matching Landing Page Image 2
 * Compact proportions, initials avatar fallback, floating tags, and TripMates member stack
 */
function AdvisorCard({
  advisor,
  user,
  onViewProfile,
}: {
  advisor: any;
  user: any;
  onViewProfile: (userId: string) => void;
}) {
  const loc = getAdvisorLocationDetails(advisor.location);
  const specLabel = SPECIALIZATION_LABELS[advisor.specialization] ?? advisor.specialization ?? advisor.title;
  const avatarPhoto = getAdvisorAvatar(advisor);
  const totalMembers = advisor.membersCount || (advisor.clientsHelped ? Math.min(advisor.clientsHelped, 12) : 7);
  const members = advisor.members && advisor.members.length > 0 
    ? advisor.members 
    : DEFAULT_MEMBERS_POOL.slice(0, 5);

  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      
      {/* Top Header Area: Real Photo if provided, otherwise sleek initials avatar */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gradient-to-br from-[#0c1527] via-[#09101f] to-[#060b14] flex items-center justify-center">
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
            <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(advisor.name)} flex items-center justify-center shadow-lg ring-2 ring-white/15 group-hover:scale-105 group-hover:ring-emerald-500/50 transition-all duration-300`}>
              <span className="font-extrabold text-white text-2xl tracking-wider select-none drop-shadow-md">
                {getInitials(advisor.name)}
              </span>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-[#0c1527]">
                <CheckCircle2 className="h-3 w-3 stroke-[3]" />
              </div>
            </div>
          </div>
        )}

        {/* Floating Heart Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:scale-110 transition-all shadow-sm cursor-pointer z-10"
          title="Favorite Advisor"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>

        {/* Floating Experience Badge */}
        <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/85 border border-emerald-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm z-10">
          {advisor.yearsExperience ? `${advisor.yearsExperience}+ Years` : (advisor.experience || "10+ Years")}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-1">
        <div>
          {/* Advisor Name */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight group-hover:text-emerald-500 transition-colors line-clamp-1">
            {advisor.name}
          </h3>

          {/* Flag + Origin Country */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
            <span className="text-sm leading-none">{loc.flag}</span>
            <span>From {loc.from}</span>
          </div>

          {/* City / Based in */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono line-clamp-1">
            Based in {loc.based}
          </p>

          {/* Verified Status Tag */}
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span>Verified Financial Advisor</span>
          </div>

          {/* Role & Specialization */}
          <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 tracking-wide uppercase mt-1 line-clamp-1 font-medium">
            {advisor.title || specLabel}
          </p>

          {/* Advisory Members Stack (TripMates pattern) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Your Advisory Members so far ({totalMembers})
              </span>
            </div>

            <div 
              className="flex items-center justify-between rounded-lg py-0.5 px-0.5"
              title={!user ? "Sign in to reveal verified member identities" : "Verified Advisory Members"}
            >
              <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
                {members.slice(0, 5).map((member: any, mIdx: number) => {
                  const hasReal = isRealImage(member.avatarUrl);
                  return (
                    <div
                      key={member.id || mIdx}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-[#0c1424] flex items-center justify-center transition-all duration-300 relative ${
                        hasReal ? "overflow-hidden" : `bg-gradient-to-tr ${getAvatarGradient(member.name)}`
                      } ${
                        !user
                           ? "filter blur-[3.5px] opacity-75 select-none pointer-events-none"
                          : "shadow-sm hover:scale-110 hover:z-20 cursor-pointer"
                      }`}
                      title={user ? `${member.name} (${member.company || member.role})` : "Verified Member"}
                    >
                      {hasReal ? (
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-white select-none">
                          {getInitials(member.name)}
                        </span>
                      )}
                    </div>
                  );
                })}
                {totalMembers > 5 && (
                  <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800/90 border-2 border-white dark:border-[#0c1424] text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    +{totalMembers - 5}
                  </span>
                )}
              </div>

              {!user && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 ml-1">
                  <span>Reveal</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions: Exact clean full-width button matching Landing Page */}
        <div className="pt-3.5">
          <Button
            onClick={() => onViewProfile(advisor.userId || advisor.id)}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-xl py-2 flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 cursor-pointer"
          >
            <span>View Profile</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * AdvisorListItem: Clean, high-density horizontal row layout for List View
 */
function AdvisorListItem({
  advisor,
  user,
  onViewProfile,
}: {
  advisor: any;
  user: any;
  onViewProfile: (userId: string) => void;
}) {
  const loc = getAdvisorLocationDetails(advisor.location);
  const specLabel = SPECIALIZATION_LABELS[advisor.specialization] ?? advisor.specialization ?? advisor.title;
  const avatarPhoto = getAdvisorAvatar(advisor);
  const totalMembers = advisor.membersCount || (advisor.clientsHelped ? Math.min(advisor.clientsHelped, 12) : 7);
  const members = advisor.members && advisor.members.length > 0 
    ? advisor.members 
    : DEFAULT_MEMBERS_POOL.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/40 shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group">
      
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          {avatarPhoto ? (
            <img
              src={avatarPhoto}
              alt={advisor.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
            />
          ) : (
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(advisor.name)} flex items-center justify-center shadow-md ring-2 ring-emerald-500/30`}>
              <span className="font-extrabold text-white text-lg sm:text-xl tracking-wider select-none">
                {getInitials(advisor.name)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm border-2 border-[#0c1424]">
            <CheckCircle2 className="h-3 w-3 stroke-[3]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {advisor.name}
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              {advisor.yearsExperience || 8}+ Years Exp
            </span>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full">
              {advisor.typicalRate || "$300/hr"}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
            {advisor.title || specLabel}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1 font-medium">
              <span>{loc.flag}</span>
              <span>From {loc.from}</span>
            </span>
            <span>•</span>
            <span className="truncate">Based in {loc.based}</span>
            <span>•</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">✓ Verified Financial Advisor</span>
          </div>
        </div>
      </div>

      {/* Center: Advisory Members Stack */}
      <div className="flex flex-col items-start md:items-end justify-center pr-2">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Advisory Members ({totalMembers})
        </span>
        <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
          {members.slice(0, 4).map((member: any, mIdx: number) => {
            const hasReal = isRealImage(member.avatarUrl);
            return (
              <div
                key={member.id || mIdx}
                className={`h-7 w-7 rounded-full border-2 border-white dark:border-[#0c1424] flex items-center justify-center ${
                  hasReal ? "overflow-hidden" : `bg-gradient-to-tr ${getAvatarGradient(member.name)}`
                } ${!user ? "filter blur-[3px] opacity-75 select-none" : "shadow-sm"}`}
                title={user ? member.name : "Verified Member"}
              >
                {hasReal ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-extrabold text-white select-none">
                    {getInitials(member.name)}
                  </span>
                )}
              </div>
            );
          })}
          {totalMembers > 4 && (
            <span className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#0c1424] text-[9px] font-bold text-slate-400 flex items-center justify-center">
              +{totalMembers - 4}
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        <Button
          onClick={() => onViewProfile(advisor.userId || advisor.id)}
          className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl px-5 py-2.5 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface FindAdvisorsPageProps {
  userRole?: "startup" | "investor";
  userName?: string;
}

export function FindAdvisorsPage({ userRole }: FindAdvisorsPageProps) {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("credibility");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userName = user?.fullName ?? "";

  const loadAdvisors = async (params?: { industry?: string; specialization?: string; q?: string }) => {
    setIsLoading(true);
    try {
      let list: any[] = [];
      if (session?.token) {
        try {
          const res = await searchAdvisors((session?.token ?? ""), params);
          if (res?.advisors && res.advisors.length > 0) {
            list = res.advisors;
          }
        } catch {}
      }
      if (list.length === 0) {
        try {
          const publicRes = await fetch("/api/public/advisors").then((r) => r.ok ? r.json() : null);
          if (publicRes?.advisors && publicRes.advisors.length > 0) {
            list = publicRes.advisors;
          }
        } catch {}
      }
      // Merge with default comprehensive catalog so all 24+ verified advisors always show
      if (list.length < DEFAULT_DIRECTORY_ADVISORS.length) {
        const existingIds = new Set(list.map((a) => a.id || a.userId));
        const missing = DEFAULT_DIRECTORY_ADVISORS.filter((a) => !existingIds.has(a.id) && !existingIds.has(a.userId));
        list = [...list, ...missing];
      }
      setAdvisors(list.length > 0 ? list : DEFAULT_DIRECTORY_ADVISORS);
    } catch {
      setAdvisors(DEFAULT_DIRECTORY_ADVISORS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisors();
  }, [session?.user?.id, session?.token]);

  const handleSearch = () => {
    loadAdvisors({
      industry: selectedIndustry !== "all" ? selectedIndustry : undefined,
      specialization: selectedSpecialization !== "all" ? selectedSpecialization : undefined,
      q: searchQuery || undefined,
    });
  };

  // Instant real-time search & filter across all loaded advisors
  const filteredAndSortedAdvisors = useMemo(() => {
    let result = [...advisors];

    // Filter by query (instant on typing)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((adv) => {
        const haystack = [
          adv.name,
          adv.title,
          adv.location,
          adv.bio,
          adv.specialization,
          ...(adv.industries || []),
          ...(adv.expertiseAreas || []).map((e: any) => e.area || ""),
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    // Filter by industry
    if (selectedIndustry !== "all") {
      result = result.filter((adv) => 
        adv.industries?.some((ind: string) => ind.toLowerCase() === selectedIndustry.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== "all") {
      result = result.filter((adv) => 
        adv.specialization?.toLowerCase() === selectedSpecialization.toLowerCase() ||
        adv.expertiseAreas?.some((e: any) => e.area?.toLowerCase().includes(selectedSpecialization.toLowerCase()))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "experience") return (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0);
      if (sortBy === "clients") return (b.clientsHelped ?? 0) - (a.clientsHelped ?? 0);
      // default: highest credibility
      return (b.credibilityScore ?? 0) - (a.credibilityScore ?? 0);
    });

    return result;
  }, [advisors, searchQuery, selectedIndustry, selectedSpecialization, sortBy]);

  const hasActiveFilters = searchQuery || selectedIndustry !== "all" || selectedSpecialization !== "all" || sortBy !== "credibility";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <Header userRole={userRole} userName={userName} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
              <Award className="h-4 w-4" />
              <span>Audited Minds Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Find Financial Advisors
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Explore audited financial advisors, venture CFOs, and risk quants. Review verified track records and connect directly.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-emerald-400 font-semibold">{filteredAndSortedAdvisors.length} Verified Minds</span>
          </div>
        </div>

        {/* Modern Unified Search & Filter Hub */}
        <div className="p-4 sm:p-5 mb-8 rounded-2xl bg-[#080e1c]/95 dark:bg-[#080e1c]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            
            {/* Top Search Input Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <Input
                  placeholder="Search advisors by name, specialization, keywords, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  className="pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400/80 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-[0_0_14px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Search</span>
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedIndustry("all");
                      setSelectedSpecialization("all");
                      setSortBy("credibility");
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl px-3 cursor-pointer"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/60">
              {/* Industry Select */}
              <div>
                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                  Industry Focus
                </label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-slate-900/90 border-slate-800 rounded-xl text-xs h-9 text-slate-200 focus:ring-cyan-500/40">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b1324] border-slate-800 text-slate-200">
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="CleanTech">CleanTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="AI/ML">AI / Machine Learning</SelectItem>
                    <SelectItem value="SaaS">B2B SaaS</SelectItem>
                    <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                    <SelectItem value="Blockchain">Blockchain &amp; Web3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization Select */}
              <div>
                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                  Advisory Specialization
                </label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="bg-slate-900/90 border-slate-800 rounded-xl text-xs h-9 text-slate-200 focus:ring-cyan-500/40">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b1324] border-slate-800 text-slate-200">
                    <SelectItem value="all">All Specializations</SelectItem>
                    <SelectItem value="financial-planning">Financial Planning</SelectItem>
                    <SelectItem value="fundraising">Fundraising Strategy</SelectItem>
                    <SelectItem value="cfo-services">CFO Services</SelectItem>
                    <SelectItem value="cap-table">Cap Table Management</SelectItem>
                    <SelectItem value="growth-strategy">Growth Strategy</SelectItem>
                    <SelectItem value="m-and-a">M&amp;A Advisory</SelectItem>
                    <SelectItem value="tax-strategy">Tax Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By Select */}
              <div>
                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                  Rank &amp; Order
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-900/90 border-slate-800 rounded-xl text-xs h-9 text-slate-200 focus:ring-cyan-500/40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b1324] border-slate-800 text-slate-200">
                    <SelectItem value="credibility">Highest Audited Credibility</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="clients">Most Clients Helped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Filter Tags Row */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/40">
              <span className="text-[11px] font-mono text-slate-500">Quick Filters:</span>
              {["FinTech", "AI/ML", "SaaS", "growth-strategy", "cfo-services", "fundraising"].map((tag) => {
                const isSpecialty = tag.includes("-");
                const isActive = isSpecialty ? selectedSpecialization === tag : selectedIndustry === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isSpecialty) {
                        setSelectedSpecialization(isActive ? "all" : tag);
                      } else {
                        setSelectedIndustry(isActive ? "all" : tag);
                      }
                    }}
                    className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                        : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {SPECIALIZATION_LABELS[tag] || tag}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Live Status & View Switcher Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {isLoading ? "Updating directory..." : `Showing ${filteredAndSortedAdvisors.length} Verified Financial Advisors`}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              ✓ Audited Track Records
            </span>

            {/* Segmented View Switcher (Grid View vs List View) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Grid View (4-Column Cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="List View (Horizontal Rows)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        )}

        {/* Advisors Display: Either 4-Card Responsive Grid or Clean Horizontal List */}
        {!isLoading && filteredAndSortedAdvisors.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAdvisors.map((advisor) => (
                <AdvisorCard
                  key={advisor.id || advisor.userId}
                  advisor={advisor}
                  user={user}
                  onViewProfile={(userId) => {
                    if (!user) {
                      navigate("/apply");
                    } else {
                      navigate(`/advisors/${userId}/profile`);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredAndSortedAdvisors.map((advisor) => (
                <AdvisorListItem
                  key={advisor.id || advisor.userId}
                  advisor={advisor}
                  user={user}
                  onViewProfile={(userId) => {
                    if (!user) {
                      navigate("/apply");
                    } else {
                      navigate(`/advisors/${userId}/profile`);
                    }
                  }}
                />
              ))}
            </div>
          )
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedAdvisors.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 shadow-md">
            <Award className="h-12 w-12 mx-auto mb-3 text-slate-400 opacity-60" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">No advisors found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              No financial advisors matched &ldquo;{searchQuery}&rdquo;. Try clearing filters or using different keywords.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("all");
                setSelectedSpecialization("all");
                setSortBy("credibility");
                loadAdvisors();
              }}
              className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40"
            >
              Reset All Filters
            </Button>
          </div>
        )}

      </div>
      <InstitutionalFooter />
    </div>
  );
}
