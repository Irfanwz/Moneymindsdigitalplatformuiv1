import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Cpu, 
  Activity, 
  ArrowLeft, 
  Copy, 
  Check, 
  Key, 
  Bug, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  FileCode 
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/app/components/Header";
import { InstitutionalFooter } from "@/app/components/footer/InstitutionalFooter";

export const SecurityDisclosuresPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("truth-engine");
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    { id: "truth-engine", label: "1. Cryptographic Truth Engine & SHA-256 Logs" },
    { id: "zk-dealrooms", label: "2. Zero-Knowledge Dealroom Encryption" },
    { id: "edge-hardening", label: "3. Cloud Infrastructure & WAF Hardening" },
    { id: "identity-rbac", label: "4. Multi-Factor RBAC & Ephemeral JWTs" },
    { id: "cron-auditing", label: "5. Continuous Cron Auditing & Latency SLA" },
    { id: "vdp-policy", label: "6. Responsible Vulnerability Disclosure (VDP)" },
    { id: "bounty-matrix", label: "7. Bug Bounty Severity Matrix & Rewards" },
    { id: "incident-response", label: "8. 72-Hour Incident Response & Breach SLA" },
    { id: "pgp-key", label: "9. PGP Public Key Fingerprint & Verification" },
  ];

  const pgpPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: MoneyMinds Guard v4.8
Comment: https://moneyminds.io/security-disclosures

mQGNBGdz9FwBDADe9V1XlQwH2kZt8F7xK9sP1mM0nB7yZ5rL3vC8wJ2qO4pT
6yA1mE0dC9xV8zL3kQ7wJ4rP1nT6yA9mE2dC5xV8zL1kQ0wJ3rP7nT4yA2m
E5dC8xV1zL9kQ3wJ6rP0nT2yA7mE4dC1xV6zL8kQ2wJ5rP9nT1yA6mE3dC0
xV5zL7kQ1wJ4rP8nT0yA5mE2dC9xV4zL6kQ0wJ3rP7nT9yA4mE1dC8xV3zL
=MM26
-----END PGP PUBLIC KEY BLOCK-----`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pgpPublicKey);
    setCopiedKey(true);
    toast.success("Security PGP Public Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2500);
  };

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
          <span className="text-slate-700 dark:text-slate-300">Security Architecture</span>
          <span>/</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Security Disclosures</span>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl p-8 sm:p-12 mb-10 shadow-xl shadow-cyan-950/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              SECURITY POSTURE // VULNERABILITY DISCLOSURE PROGRAM
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              MoneyMinds Security Architecture &amp; Vulnerability Disclosures
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Technical specifications of the MoneyMinds Cryptographic Truth Engine, continuous cron audit verifiers, penetration certifications, and responsible vulnerability disclosure safe harbor guidelines.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>System Status: <span className="font-semibold text-emerald-500 flex-inline items-center gap-1">● 99.99% UPTIME SLA</span></div>
              <span>•</span>
              <div>Audit Latency: <span className="font-semibold text-cyan-600 dark:text-cyan-400">&lt; 18ms distributed</span></div>
              <span>•</span>
              <div>Security Desk: <span className="font-semibold text-slate-800 dark:text-slate-200">security@moneyminds.io</span></div>
            </div>
          </div>
        </div>

        {/* 4 Security Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">SHA-256 Hash Provenance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every advisor prediction and score calculation creates a cryptographically immutable Merkle block hash.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Zero-Knowledge Payloads</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dealroom files and investor viewing logs utilize client-side payload salting and ephemeral session keys.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Continuous Cron Watchdog</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Distributed heartbeat daemons verify score integrity and cross-audit prediction states every 60 seconds.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center mb-3">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Safe Harbor VDP</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Formal legal safe harbor protection and bounties up to $15,000 for good-faith security researchers.
            </p>
          </div>
        </div>

        {/* Content Layout: Sticky Table of Contents + Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-400 mb-4 tracking-wider">
                <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                Security Standards
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === sec.id
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Contact PGP Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#070e1c] text-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  PGP KEY FINGERPRINT
                </span>
                <button
                  onClick={handleCopyKey}
                  className="hover:text-white p-1 rounded transition-colors"
                  title="Copy PGP Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded bg-black/60 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                4B82 EF01 9A33 71D2 489C 81F2 00EE 771B 5D6E C404
              </div>
              <p className="text-[11px] text-slate-400">
                Encrypt all vulnerability reports to <code>security@moneyminds.io</code> using this key.
              </p>
            </div>
          </div>

          {/* Right Sections */}
          <div className="lg:col-span-8 space-y-10">

            {/* Section 1 */}
            <section id="truth-engine" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">01.</span>
                Cryptographic Truth Engine &amp; SHA-256 Logs
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds enforces mathematical verification over subjective marketing. When an advisor registers a market prediction, seed round forecast, or client metric validation, the event payload is structured into a canonical JSON serialization, salted with an institutional monotonic counter, and hashed using <strong>SHA-256</strong>:
                </p>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
                  <div className="text-slate-500">// Canonical Provenance Seed Structure</div>
                  <div>HASH = SHA256(TIMESTAMP_UTC + ADVISOR_PUBKEY + PREDICTION_PAYLOAD + NONCE)</div>
                  <div className="text-emerald-400">BLOCK_SAMPLE = &quot;0x4f92bc81e3d001a89c2...&quot; (Immutable Audit Root)</div>
                </div>
                <p>
                  This cryptographic chain prevents retroactive revision, post-hoc signal deletion, or administrative bias.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="zk-dealrooms" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">02.</span>
                Zero-Knowledge Dealroom Encryption
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Proprietary startup pitch documents, Cap Table capitalization models, and investor syndicate commitments reside in isolated encrypted containers. Files are transformed using client-side AES-256-GCM encryption before dispatch to multi-region object storage.
                </p>
                <p>
                  Access keys are negotiated between authorized counterparties through ephemeral Diffie-Hellman key exchanges, guaranteeing that even database administrators cannot inspect non-public cap table ownership without authorization.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="edge-hardening" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">03.</span>
                Cloud Infrastructure &amp; WAF Edge Hardening
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  All edge incoming traffic traverses Cloudflare Enterprise Web Application Firewalls (WAF) featuring real-time Layer 7 DDoS mitigation, managed rate-limiting, and machine learning bot challenge filters.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li>Automated IP reputation scoring and SQL injection / XSS pattern sanitization.</li>
                  <li>Multi-region AWS Kubernetes clusters with zero public database endpoints.</li>
                  <li>Continuous automated vulnerability scanning across container registries.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="identity-rbac" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">04.</span>
                Multi-Factor RBAC &amp; Ephemeral JWTs
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Authentication is fortified through JSON Web Tokens (JWT) signed with rotating RS256 asymmetric keys. Sessions are tightly scoped:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Session Lifetimes:</span>
                    Access tokens expire in 15 minutes; refresh tokens require cryptographic device fingerprinting.
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Hardware Token FIDO2:</span>
                    WebAuthn biometric passkeys and YubiKey support for institutional administrative consoles.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="cron-auditing" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">05.</span>
                Continuous Cron Auditing &amp; Latency Observability
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  The platform runs automated cron verification services across distributed server instances. Every 60 seconds, audit cron daemons cross-validate published advisor accuracy curves against resolved market benchmarks, ensuring verified latency stays below <strong>20 milliseconds</strong> globally.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="vdp-policy" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">06.</span>
                Responsible Vulnerability Disclosure (VDP Safe Harbor)
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  MoneyMinds welcomes security research from the global infosec community. Under our <strong>Legal Safe Harbor</strong>, MoneyMinds will not initiate legal action against researchers who comply with the following standards:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>Never access or modify private venture cap table data belonging to other accounts.</li>
                  <li>Do not execute Denial of Service (DoS) or destructive resource exhaustion attacks.</li>
                  <li>Give our security team ninety (90) days to remediate the vulnerability before public disclosure.</li>
                  <li>Submit all findings directly to <code>security@moneyminds.io</code> using our PGP public key.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="bounty-matrix" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">07.</span>
                Bug Bounty Severity Matrix &amp; Rewards
              </h2>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <th className="p-3">Severity Level</th>
                      <th className="p-3">Example Vulnerabilities</th>
                      <th className="p-3 text-right">Bounty Range (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="p-3 font-bold text-red-500">CRITICAL</td>
                      <td className="p-3">Remote Code Execution (RCE), SQLi bypassing dealroom encryption, cap table exfiltration.</td>
                      <td className="p-3 text-right font-bold text-emerald-500">$5,000 – $15,000</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-500">HIGH</td>
                      <td className="p-3">Stored XSS impacting session tokens, SSRF reaching internal Kubernetes microservices.</td>
                      <td className="p-3 text-right font-bold text-emerald-500">$2,000 – $5,000</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-blue-500">MEDIUM</td>
                      <td className="p-3">Cross-Site Request Forgery (CSRF) on state-changing actions, rate limit bypass.</td>
                      <td className="p-3 text-right font-bold text-emerald-500">$500 – $2,000</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">LOW</td>
                      <td className="p-3">Security header misconfigurations, verbose error stack traces without sensitive leaks.</td>
                      <td className="p-3 text-right font-bold text-slate-400">Hall of Fame</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 8 */}
            <section id="incident-response" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">08.</span>
                72-Hour Incident Response &amp; Breach SLA
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  In the event of a verified security incident affecting non-public cap table data or syndicate dealrooms, MoneyMinds commits to notifying affected account owners within <strong>72 hours of verification</strong> in accordance with GDPR Article 33 and SEC cybersecurity disclosure regulations.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="pgp-key" className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-base">09.</span>
                PGP Public Key Block &amp; Verification
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Please encrypt all vulnerability submissions. Use the copy button below to load our public key into your PGP keychain:
                </p>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {pgpPublicKey}
                  </pre>
                  <button
                    onClick={handleCopyKey}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey ? "Copied" : "Copy Key"}
                  </button>
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
