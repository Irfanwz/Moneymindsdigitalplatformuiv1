import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Header } from "@/app/components/Header";
import { Building2, TrendingUp, Users, Shield, Sparkles, BarChart3, ArrowUpRight, ArrowDownRight, Activity, Bitcoin, DollarSign, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Mock market data generators
const generateCryptoData = () => {
  const basePrice = 45000;
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    btc: basePrice + Math.random() * 2000 - 1000,
    eth: 2800 + Math.random() * 200 - 100,
    sol: 98 + Math.random() * 10 - 5,
  }));
};

const generateStockData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    sp500: 4500 + Math.random() * 200 - 100,
    nasdaq: 14000 + Math.random() * 400 - 200,
    dow: 35000 + Math.random() * 500 - 250,
  }));
};

const cryptoNews = [
  { title: "Bitcoin ETF Inflows Reach Record Highs", change: "+12.4%", trend: "up", time: "2h ago" },
  { title: "Ethereum Layer-2 TVL Surpasses $40B", change: "+8.7%", trend: "up", time: "4h ago" },
  { title: "DeFi Protocol Launches AI Trading Agents", change: "+15.2%", trend: "up", time: "6h ago" },
  { title: "Solana Network Processes 3,000 TPS Milestone", change: "+5.8%", trend: "up", time: "8h ago" },
];

const stockNews = [
  { title: "Tech Sector Leads Market Rally", ticker: "NASDAQ", change: "+2.3%", trend: "up" },
  { title: "Financial Services AI Adoption Accelerates", ticker: "XLF", change: "+1.8%", trend: "up" },
  { title: "FinTech IPOs Show Strong Performance", ticker: "IPOX", change: "+4.2%", trend: "up" },
  { title: "Global Markets React to Fed Policy", ticker: "SPY", change: "-0.5%", trend: "down" },
];

const marketStats = [
  { label: "Bitcoin", value: "$45,234", change: "+5.2%", icon: Bitcoin, color: "text-orange-500" },
  { label: "S&P 500", value: "4,521", change: "+1.8%", icon: TrendingUp, color: "text-blue-500" },
  { label: "24h Volume", value: "$124B", change: "+12.4%", icon: Activity, color: "text-purple-500" },
  { label: "DeFi TVL", value: "$85.4B", change: "+3.6%", icon: DollarSign, color: "text-emerald-500" },
];

export function LandingPage() {
  const [cryptoData] = useState(generateCryptoData());
  const [stockData] = useState(generateStockData());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />

      {/* Hero Section with Neon Accents */}
      <section className="relative container mx-auto px-6 py-24 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 mb-6"
          >
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">AI-First Financial Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MoneyMinds
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">Financial Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            Connect Startups, Investors, and Advisors with AI-enhanced due diligence and real-time market intelligence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/50">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Live Market Stats */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {marketStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium">{stat.change}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</p>
                <p className="text-slate-900 dark:text-white text-2xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Market Intelligence Dashboard */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12"
          >
            Live Market Intelligence
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Crypto Market */}
            <Card className="p-6 bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Bitcoin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Crypto Market</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">24h Performance</p>
                  </div>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4" />
                  +8.4%
                </span>
              </div>

              <div className="w-full mb-6" style={{ height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cryptoData}>
                    <defs>
                      <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Area type="monotone" dataKey="btc" stroke="#06b6d4" fill="url(#cryptoGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Latest Crypto News</h4>
                {cryptoNews.slice(0, 3).map((news) => (
                  <div key={news.title} className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white mb-1">{news.title}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-500">{news.time}</span>
                    </div>
                    <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium flex items-center gap-1 ml-4">
                      <ArrowUpRight className="h-3 w-3" />
                      {news.change}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stock Market */}
            <Card className="p-6 bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stock Market</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">30 Day Trends</p>
                  </div>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4" />
                  +2.3%
                </span>
              </div>

              <div className="w-full mb-6" style={{ height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Line type="monotone" dataKey="sp500" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="nasdaq" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Market Movers</h4>
                {stockNews.map((news) => (
                  <div key={news.title} className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white mb-1">{news.title}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-500">{news.ticker}</span>
                    </div>
                    <span className={`text-sm font-medium flex items-center gap-1 ml-4 ${
                      news.trend === 'up' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}>
                      {news.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {news.change}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Cards Section with Neon Borders */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
          Choose Your Path
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-white dark:bg-slate-900/70 border-blue-500/30 dark:border-blue-500/30 backdrop-blur-sm hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">For Startups</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Build credibility, get verified, and connect with investors and advisors who can help you grow.
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  AI Due Diligence
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  Credibility Scoring
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  Advisor Discovery
                </li>
              </ul>
              <Link to="/login?role=startup">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0">
                  Join as Startup
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-8 bg-white dark:bg-slate-900/70 border-purple-500/30 dark:border-purple-500/30 backdrop-blur-sm hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">For Investors</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Discover verified startups, access AI-powered insights, and make informed investment decisions.
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  Verified Startups
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  AI Insights
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  Private Discovery
                </li>
              </ul>
              <Link to="/login?role=investor">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">
                  Join as Investor
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-8 bg-white dark:bg-slate-900/70 border-emerald-500/30 dark:border-emerald-500/30 backdrop-blur-sm hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">For Advisors</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Share your expertise, build your reputation, and connect with startups seeking guidance.
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  Expert Profile
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  Credibility Score
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  Visibility Boost
                </li>
              </ul>
              <Link to="/login?role=advisor">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0">
                  Join as Advisor
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Trust Through Technology
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-12">
            Our AI-powered platform ensures credibility and transparency at every step
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Due Diligence</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automated credibility checks with human oversight
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect with the right people at the right time
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Actionable Insights</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Data-driven recommendations for better decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
                <span className="font-bold text-white text-sm">MM</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">MoneyMinds</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 MoneyMinds. Building trust in financial relationships.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
