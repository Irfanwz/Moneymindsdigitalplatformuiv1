import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Coins, 
  Briefcase, 
  Lock, 
  HelpCircle 
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { InstitutionalFooter } from "@/app/components/footer/InstitutionalFooter";

export const TermsOfAdvisoryPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("classification");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    { id: "classification", label: "1. Advisory Classification & Regulatory Status" },
    { id: "truth-engine", label: "2. Truth Engine & Prediction Scoring Covenants" },
    { id: "fast-framework", label: "3. FAST Agreement & Startup Advisory Equity" },
    { id: "fractional-retainers", label: "4. Fractional CFO Retainers & Milestones" },
    { id: "non-circumvention", label: "5. Dealroom Non-Circumvention (24-Month Rule)" },
    { id: "confidentiality", label: "6. Cap Table Confidentiality & Trade Secrets" },
    { id: "fees-escrow", label: "7. Platform Fees, Stripe Escrow & Payouts" },
    { id: "ip-ownership", label: "8. Intellectual Property & Work Products" },
    { id: "venture-disclaimer", label: "9. Early-Stage High-Risk Investment Disclaimers" },
    { id: "arbitration", label: "10. JAMS Institutional Arbitration & Governing Law" },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 transition-colors selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Container */}
      <main className="pt-6 sm:pt-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-cyan-500 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Legal Governance</span>
          <span>/</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Terms of Advisory</span>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl p-8 sm:p-12 mb-10 shadow-xl shadow-cyan-950/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 mb-5">
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              FIDUCIARY COVENANTS // SYNDICATE GOVERNANCE FRAMEWORK
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              MoneyMinds Terms of Advisory &amp; Venture Syndicate Protocol
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Binding institutional contractual rules governing machine-audited advisor rankings, Founder Advisor Standard Template (FAST) equity agreements, fractional CFO retainers, and private syndicate dealroom non-circumvention.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>Effective Date: <span className="font-semibold text-slate-800 dark:text-slate-200">November 23, 2026</span></div>
              <span>•</span>
              <div>Protocol Standard: <span className="font-semibold text-blue-600 dark:text-blue-400">v5.1 (Syndicate Master)</span></div>
              <span>•</span>
              <div>Enforcement Jurisdiction: <span className="font-semibold text-slate-700 dark:text-slate-300">State of Delaware / London High Court</span></div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Mathematical Auditing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Advisor rankings are mathematically derived through predictive accuracy logs and peer review verification.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Standardized FAST Contracts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Standard 0.25% - 1.0% equity advisory grants executed with built-in 3-month cliff and performance vesting.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">24-Month Non-Circumvention</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strict covenants prohibit parties from executing off-platform agreements to bypass platform matching fees.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Escrowed Retainers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fractional CFO and strategic retainers are secured via Stripe Connect milestone release escrow mechanisms.
            </p>
          </div>
        </div>

        {/* Layout Grid: Sticky TOC + Terms Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Table of Contents */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-400 mb-4 tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Covenant Sections
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === sec.id
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-l-2 border-blue-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Arbitration Summary Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0b1324] text-slate-700 dark:text-slate-300 shadow-sm text-xs space-y-2">
              <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-500" />
                LEGAL JURISDICTION NOTE
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                All claims or disputes relating to advisory commissions, fractional CFO retainers, or syndicate deals are subject to binding expedited arbitration under JAMS Comprehensive Rules.
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Section 1 */}
            <section id="classification" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">01.</span>
                Advisory Classification &amp; Regulatory Status
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds Digital Platform, Inc. operates solely as a technological and mathematical diligence platform. <strong>MoneyMinds is not a registered broker-dealer, investment adviser, commodity trading advisor, or investment company</strong> under the United States Securities Exchange Act of 1934, the Investment Advisers Act of 1940, or equivalent global financial statutes.
                </p>
                <p>
                  Platform metrics, credibility scores, and algorithm-generated signals do not constitute an offer to buy or sell securities, nor an endorsement of any particular startup investment round.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="truth-engine" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">02.</span>
                Truth Engine &amp; Prediction Scoring Covenants
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Advisors granted access to publish signals, valuation horizons, and prediction logs agree to strict mathematical standards:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li><strong>Anti-Front-Running:</strong> Advisors may not publish prediction forecasts regarding startups or securities while actively trading in possession of non-public material information.</li>
                  <li><strong>Immutable Audit Trail:</strong> Every prediction is mathematically anchored into the SHA-256 ledger. Any attempt to exploit or manipulate scoring algorithms results in immediate, permanent badge revocation.</li>
                  <li><strong>Score Decay Mechanism:</strong> Credibility scores naturally decay over time unless sustained through audited client outcomes or continuous accurate prediction verification.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="fast-framework" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">03.</span>
                FAST Agreement &amp; Startup Advisory Equity
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Startup founders and advisors executing equity advisory engagements agree to adopt the <strong>Founder Advisor Standard Template (FAST)</strong> framework developed in conjunction with venture capital standards.
                </p>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">STANDARD FAST EQUITY TIERS:</div>
                  <div>• <strong>Level 1 (Strategic Introductions):</strong> 0.25% common stock option pool with 24-month vesting.</div>
                  <div>• <strong>Level 2 (Active Operational Mentorship):</strong> 0.50% equity, monthly strategic reviews, 3-month initial cliff.</div>
                  <div>• <strong>Level 3 (Fractional CxO / Board Observer):</strong> 1.00% equity, weekly operating syncs, board representation.</div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="fractional-retainers" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">04.</span>
                Fractional CFO Retainers &amp; Milestone Billing
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  For cash-based advisory engagements (including fractional CFO services, audited model construction, and cap table hygiene), all invoices and retainer agreements must be billed through <strong>MoneyMinds Invoicing</strong> via Stripe Connect.
                </p>
                <p>
                  Funds are held in client escrow until deliverable milestone confirmation is logged by both startup leadership and the designated advisor.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="non-circumvention" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">05.</span>
                Dealroom Non-Circumvention (24-Month Binding Rule)
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                  <strong>CRITICAL NON-CIRCUMVENTION COVENANT:</strong> Each user (Startup, Advisor, or Syndicate LP) expressly agrees that for a period of twenty-four (24) months following the initial connection made inside MoneyMinds Dealrooms, neither party shall circumvent or bypass the platform to execute private advisory retainers, equity compensation, or syndicate transaction fees.
                </div>
                <p>
                  Any intentional off-platform circumvention triggers liquidated damages equivalent to 200% of the standard platform commission, plus reasonable legal and collection fees.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="confidentiality" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">06.</span>
                Cap Table Confidentiality &amp; Trade Secrets
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Startups upload proprietary financial metrics, cap table summaries, and investor pitch materials into private dealrooms under automatic mutual confidentiality. Advisors and investors accessing these dealrooms agree not to disclose, replicate, reverse-engineer, or distribute any confidential materials to external third parties.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="fees-escrow" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">07.</span>
                Platform Fees, Stripe Escrow &amp; Payouts
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds assesses a standard platform facilitation fee on completed fractional advisory sessions and training marketplace courses:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="text-cyan-500 font-bold block mb-1">Advisory Booking Fee:</span>
                    5% platform fee deducted from gross booking payouts.
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="text-emerald-500 font-bold block mb-1">Syndicate Dealroom Access:</span>
                    Free for accredited LPs; enterprise licensing for family offices.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="ip-ownership" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">08.</span>
                Intellectual Property &amp; Work Products
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Unless otherwise specified in an executed FAST agreement, all financial models, forecast decks, and strategic blueprints prepared specifically for a startup client by an advisor constitute &quot;Work Made for Hire&quot; and belong solely to the paying startup.
                </p>
                <p>
                  MoneyMinds retains all rights, title, and interest in its proprietary truth algorithms, machine-auditing scoring indices, and platform software code.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="venture-disclaimer" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">09.</span>
                Early-Stage High-Risk Investment Disclaimers
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  VENTURE CAPITAL INVESTING CARRIES SUBSTANTIAL RISK OF TOTAL CAPITAL LOSS. Startups listed on MoneyMinds are early-stage or growth-stage entities with illiquid securities. No prediction, score, or advisor endorsement should be interpreted as a guarantee of positive financial return or round completion.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="arbitration" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-base">10.</span>
                JAMS Institutional Arbitration &amp; Governing Law
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  These Terms are governed by the laws of the State of Delaware, without regard to conflicts of law principles. Any dispute or claim arising from advisory relationships or platform access shall be resolved through binding, confidential arbitration administered by <strong>JAMS</strong> in New York, NY, before a single commercial arbitrator.
                </p>
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
};
