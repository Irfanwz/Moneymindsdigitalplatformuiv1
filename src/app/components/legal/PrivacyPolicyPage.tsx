import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Terminal, 
  ExternalLink, 
  Globe, 
  Scale, 
  AlertCircle 
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { InstitutionalFooter } from "@/app/components/footer/InstitutionalFooter";

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    { id: "overview", label: "1. Institutional Scope & Overview" },
    { id: "zero-knowledge", label: "2. Zero-Knowledge Dealrooms & LP Anonymity" },
    { id: "audited-ledger", label: "3. Machine-Audited Prediction Logs & 0% Deletion" },
    { id: "information-collected", label: "4. Information Ingestion & Telemetry" },
    { id: "cryptographic-security", label: "5. Cryptographic Storage & Multi-Tenancy" },
    { id: "payments-escrow", label: "6. Stripe Connect Escrow & KYC" },
    { id: "cross-border", label: "7. Cross-Border Governance (GDPR / MiCA / DIFC)" },
    { id: "data-rights", label: "8. User Rights vs. Non-Repudiable Logs" },
    { id: "retention", label: "9. Data Retention & Zero-Trace Purges" },
    { id: "contact-dpo", label: "10. Compliance Officer & Legal Contacts" },
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
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Privacy Policy</span>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl p-8 sm:p-12 mb-10 shadow-xl shadow-cyan-950/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              GOVERNANCE & TRUST PROTOCOL // ISO 27001 & SOC-2
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              MoneyMinds Institutional Privacy &amp; Cryptographic Ledger Policy
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              How MoneyMinds protects confidential venture cap tables, guarantees zero-knowledge dealroom anonymity for institutional LPs, and mathematically anchors machine-audited advisor prediction track records.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>Effective Date: <span className="font-semibold text-slate-800 dark:text-slate-200">November 23, 2026</span></div>
              <span>•</span>
              <div>Policy Version: <span className="font-semibold text-cyan-600 dark:text-cyan-400">v4.8 (Institutional Enterprise)</span></div>
              <span>•</span>
              <div>Ledger Audit Standard: <span className="font-semibold text-emerald-600 dark:text-emerald-400">SHA-256 Provenance</span></div>
            </div>
          </div>
        </div>

        {/* 4 Trust Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center mb-3">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Zero-Knowledge Dealrooms</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Family offices and angel syndicates browse fully pseudonymized until explicit mutual NDAs are executed.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">0% Deleted Record Standard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Once an advisor prediction is machine-audited and timestamped, it cannot be selectively deleted or altered.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Hardware-Level AES-256</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All proprietary startup pitch decks and Cap Table models are encrypted with client-derived ephemeral keys.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Global Regulatory Shield</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strict multi-jurisdiction compliance across GDPR, California CPRA, DIFC FinTech Hive, and European MiCA.
            </p>
          </div>
        </div>

        {/* Content Layout: Sticky Table of Contents + Policy Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Table of Contents */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-400 mb-4 tracking-wider">
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                Table of Contents
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === sec.id
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Compliance Badge Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-[#0c1527] text-white shadow-md">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                AUDITED COMPLIANCE ACTIVE
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                MoneyMinds Digital Platform, Inc. undergoes continuous automated penetration testing and annual SOC-2 Type II audit examinations.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>DPO: legal@moneyminds.io</span>
                <span className="text-cyan-400 font-semibold">Verified</span>
              </div>
            </div>
          </div>

          {/* Right Policy Sections */}
          <div className="lg:col-span-8 space-y-10">

            {/* Section 1 */}
            <section id="overview" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">01.</span>
                Institutional Scope &amp; Overview
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds Digital Platform, Inc. (&quot;MoneyMinds&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates a specialized institutional financial intelligence platform, audited advisory directory, and venture dealroom network. We connect verified early-stage startups, fractional CFOs, growth strategists, and accredited venture capital syndicates.
                </p>
                <p>
                  This Privacy Policy delineates the cryptographic policies, machine-auditing invariants, and data security governance applied across all platforms, subdomains, REST/WebSocket APIs, and private dealroom vaults under <code>moneyminds.io</code>. By accessing the platform, creating an advisor credential, or entering a syndicate data room, you agree to the data practices articulated herein.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="zero-knowledge" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">02.</span>
                Zero-Knowledge Dealrooms &amp; Institutional LP Anonymity
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  We recognize that premier venture capital firms, family office principals, and accredited angel syndicate leads require absolute operational privacy to prevent market signaling and unsolicited inbound dealflow spam.
                </p>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">THE PRIVATE INVESTOR SHIELD:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Investor profiles are never searchable or listed on the public web directory.</li>
                    <li>Syndicate viewing logs inside dealrooms are masked using ephemeral session hashes.</li>
                    <li>Startup founders only receive investor identity verification after the investor explicitly initiates an introduction or signs a mutual non-disclosure agreement.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="audited-ledger" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">03.</span>
                Machine-Audited Prediction Logs &amp; 0% Deletion Policy
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  A core pillar of MoneyMinds is our <strong>Truth Engine</strong>. Unlike conventional advisory networks where track records can be fabricated or unfavorable predictions erased, MoneyMinds enforces a non-negotiable <strong>0% Deleted Record Policy</strong> on all published market signals and financial forecasts.
                </p>
                <p>
                  When a verified advisor registers a market prediction, valuation milestone, or round forecasting model, the signal is:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <li>Cryptographically signed with the advisor&apos;s credential signature.</li>
                  <li>Timestamped against our distributed UTC cron cluster with millisecond precision.</li>
                  <li>Committed to an immutable append-only event ledger secured with SHA-256 block hashes.</li>
                </ol>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Audit Notice:</strong> Advisors cannot request deletion, retroactive modification, or score erasure of published predictions. This standard is mandatory to maintain mathematical credibility for syndicate due diligence.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="information-collected" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">04.</span>
                Information Ingestion &amp; Telemetry
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>To deliver automated verification and syndicate dealflow, we ingest the following categories of data:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Entity &amp; Founder Data:</span>
                    Corporate registration, cap table share distributions, runway burn rate, and verified corporate email domains.
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Advisor Telemetry:</span>
                    LinkedIn professional history, SEC CRD / FINRA registration numbers (where applicable), forecasting submissions, and client session logs.
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Accredited Syndicate Data:</span>
                    Accredited investor representations (Rule 506(c) verification), investment thesis parameters, and check size ticket criteria.
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Financial &amp; Settlement Data:</span>
                    Stripe Connect Account IDs, payout routing tokens, and transaction timestamps. (Raw credit card numbers are never stored on MoneyMinds servers).
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="cryptographic-security" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">05.</span>
                Cryptographic Storage &amp; Multi-Tenant Isolation
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds utilizes a multi-tenant cloud architecture engineered to institutional banking standards. All database volumes and object stores are encrypted at rest using FIPS 140-2 validated AES-256 hardware security modules.
                </p>
                <p>
                  In-transit communication is strictly enforced via TLS 1.3 with Perfect Forward Secrecy (PFS), HTTP Strict Transport Security (HSTS), and preloaded DNS certificate pinning.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="payments-escrow" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">06.</span>
                Stripe Connect Direct Payouts &amp; KYC
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  All monetization, retainer distributions, and advisory booking payments are facilitated through <strong>Stripe Connect</strong>. Identity verification, Anti-Money Laundering (AML) sanctions screening, and FinCEN compliance are processed via Stripe&apos;s PCI-DSS Level 1 certified infrastructure.
                </p>
                <p>
                  MoneyMinds does not retain bank routing numbers, full SSNs, or debit/credit card CVV codes on our application servers.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="cross-border" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">07.</span>
                Cross-Border Governance (GDPR / MiCA / DIFC / CCPA)
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Because MoneyMinds connects global hubs spanning London, New York, Dubai (DIFC), and Singapore, we maintain automated data processing agreements conforming to European GDPR Article 28, California Consumer Privacy Act (CCPA/CPRA), and the Dubai International Financial Centre Data Protection Law.
                </p>
                <p>
                  European and UK resident data transfers are executed under European Commission Standard Contractual Clauses (SCCs).
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="data-rights" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">08.</span>
                User Rights vs. Non-Repudiable Audit Logs
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Under applicable global privacy statutes, you maintain the right to inspect, export, or request the deletion of your personal contact data, login tokens, and billing profiles.
                </p>
                <p>
                  However, in compliance with financial ledger auditing standards and market manipulation prevention regulations, <strong>mathematically published prediction logs and verified timestamp seeds</strong> cannot be altered or purged, as they constitute irrevocable mathematical benchmark data.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="retention" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">09.</span>
                Data Retention &amp; Zero-Trace Purges
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Upon account deactivation or startup pitch room closure, proprietary pitch slides, non-public cap table drafts, and direct message transcripts are cryptographically shredded within 30 days of closure using NIST SP 800-88 sanitization protocols.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="contact-dpo" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-500 font-mono text-base">10.</span>
                Data Protection Officer &amp; Regulatory Inquiries
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  For formal Data Subject Access Requests (DSAR), legal subpoenas, or institutional Data Protection Agreements (DPA), please contact our legal governance desk:
                </p>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                  <div><strong>Legal Entity:</strong> MoneyMinds Digital Platform, Inc.</div>
                  <div><strong>Office of the DPO:</strong> compliance@moneyminds.io</div>
                  <div><strong>Institutional Hub:</strong> 100 Wall Street, 24th Floor, New York, NY 10005</div>
                  <div><strong>PGP Public Key:</strong> Available via Security Disclosures</div>
                </div>
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
