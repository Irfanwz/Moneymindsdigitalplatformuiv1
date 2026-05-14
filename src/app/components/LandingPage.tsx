import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Header } from "@/app/components/Header";
import { Building2, TrendingUp, Users, Shield, Sparkles, BarChart3, ArrowUpRight, ArrowDownRight, Activity, Bitcoin, DollarSign, Zap, Loader2 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

// Fallback data in case API fails
const fallbackStats = [
  { label: "Bitcoin", value: "$—", change: "—" },
  { label: "Ethereum", value: "$—", change: "—" },
  { label: "24h Volume", value: "$—", change: "—" },
  { label: "Solana", value: "$—", change: "—" },
];

const statIcons = [Bitcoin, TrendingUp, Activity, DollarSign];
const statColors = ["text-orange-500", "text-blue-500", "text-purple-500", "text-emerald-500"];

interface MarketStat {
  label: string;
  value: string;
  change: string;
}

interface ChartPoint {
  time: string;
  btc: number;
}

interface MarketData {
  stats: MarketStat[];
  cryptoChart: ChartPoint[];
  prices: {
    btc: number;
    eth: number;
    sol: number;
    btcChange: number;
    ethChange: number;
    solChange: number;
    btcMarketCap: number;
  };
}

interface PlatformStats {
  totalUsers: number;
  startups: number;
  investors: number;
  advisors: number;
}

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRoleAction = (role: "startup" | "investor" | "advisor") => {
    if (!user) {
      navigate("/apply");
      return;
    }
    // User is logged in — go to dashboard if they have the role, otherwise choose-role
    if (user.approvedRoles?.includes(role)) {
      navigate(`/${role}/dashboard`);
    } else {
      navigate("/choose-role");
    }
  };

  useEffect(() => {
    setMounted(true);

    async function fetchData() {
      try {
        const [marketRes, statsRes] = await Promise.all([
          fetch("/api/public/market").then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch("/api/public/stats").then((r) => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (marketRes) setMarketData(marketRes);
        if (statsRes) setPlatformStats(statsRes);
      } catch {
        // Use fallbacks
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayStats = marketData?.stats ?? fallbackStats;
  const cryptoChart = marketData?.cryptoChart ?? [];
  const prices = marketData?.prices;

  // Compute overall crypto performance from BTC 24h change
  const cryptoPerformance = prices ? `${prices.btcChange >= 0 ? "+" : ""}${prices.btcChange.toFixed(1)}%` : "—";
  const cryptoUp = (prices?.btcChange ?? 0) >= 0;

  // Build crypto news from real price data
  const cryptoNews = prices
    ? [
        {
          title: `Bitcoin at $${prices.btc.toLocaleString()}`,
          change: `${prices.btcChange >= 0 ? "+" : ""}${prices.btcChange.toFixed(1)}%`,
          trend: prices.btcChange >= 0 ? "up" : "down",
          time: "Live",
        },
        {
          title: `Ethereum at $${prices.eth.toLocaleString()}`,
          change: `${prices.ethChange >= 0 ? "+" : ""}${prices.ethChange.toFixed(1)}%`,
          trend: prices.ethChange >= 0 ? "up" : "down",
          time: "Live",
        },
        {
          title: `Solana at $${prices.sol.toLocaleString()}`,
          change: `${prices.solChange >= 0 ? "+" : ""}${prices.solChange.toFixed(1)}%`,
          trend: prices.solChange >= 0 ? "up" : "down",
          time: "Live",
        },
        {
          title: `BTC Market Cap: $${(prices.btcMarketCap / 1e12).toFixed(2)}T`,
          change: `${prices.btcChange >= 0 ? "+" : ""}${prices.btcChange.toFixed(1)}%`,
          trend: prices.btcChange >= 0 ? "up" : "down",
          time: "Live",
        },
      ]
    : [];

  // Platform stats for the second card
  const platformStatsDisplay = [
    { label: "Verified Users", value: platformStats?.totalUsers ?? 0 },
    { label: "Startups", value: platformStats?.startups ?? 0 },
    { label: "Investors", value: platformStats?.investors ?? 0 },
    { label: "Advisors", value: platformStats?.advisors ?? 0 },
  ];

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
            {user ? (
              <Link to="/choose-role">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/50">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/apply">
                  <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/50">
                    Create Profile
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Live Market Stats */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {displayStats.map((stat, index) => {
            const Icon = statIcons[index] ?? Activity;
            const color = statColors[index] ?? "text-slate-500";
            const isPositive = stat.change.startsWith("+");
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <span className={`text-sm font-medium ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </p>
                </Card>
              </motion.div>
            );
          })}
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
                {!loading && (
                  <span className={`text-sm font-medium flex items-center gap-1 ${cryptoUp ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {cryptoUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {cryptoPerformance}
                  </span>
                )}
              </div>

              <div className="w-full mb-6" style={{ height: '256px' }}>
                {cryptoChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cryptoChart}>
                      <defs>
                        <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#cbd5e1' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "BTC"]}
                      />
                      <Area type="monotone" dataKey="btc" stroke="#06b6d4" fill="url(#cryptoGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Chart data unavailable"}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Live Prices</h4>
                {cryptoNews.length > 0 ? (
                  cryptoNews.map((news) => (
                    <div key={news.title} className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 dark:text-white mb-1">{news.title}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-500">{news.time}</span>
                      </div>
                      <span className={`text-sm font-medium flex items-center gap-1 ml-4 ${
                        news.trend === "up" ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                      }`}>
                        {news.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {news.change}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 text-center py-4">
                    {loading ? "Loading prices..." : "Price data unavailable"}
                  </div>
                )}
              </div>
            </Card>

            {/* Platform Activity */}
            <Card className="p-6 bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Platform Activity</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Community Overview</p>
                  </div>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4" />
                  Growing
                </span>
              </div>

              {/* Platform Stats Visual */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {platformStatsDisplay.map((item) => (
                  <div key={item.label} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {loading ? "..." : item.value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Role Distribution Bar */}
              {platformStats && platformStats.totalUsers > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Community Distribution</h4>
                  <div className="flex rounded-full overflow-hidden h-4 bg-slate-200 dark:bg-slate-800">
                    {platformStats.startups > 0 && (
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                        style={{ width: `${(platformStats.startups / platformStats.totalUsers) * 100}%` }}
                        title={`Startups: ${platformStats.startups}`}
                      />
                    )}
                    {platformStats.investors > 0 && (
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${(platformStats.investors / platformStats.totalUsers) * 100}%` }}
                        title={`Investors: ${platformStats.investors}`}
                      />
                    )}
                    {platformStats.advisors > 0 && (
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{ width: `${(platformStats.advisors / platformStats.totalUsers) * 100}%` }}
                        title={`Advisors: ${platformStats.advisors}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Startups
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Investors
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Advisors
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Why MoneyMinds</h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-cyan-500" />
                    <p className="text-sm text-slate-900 dark:text-white">AI-Verified Profiles</p>
                  </div>
                  <span className="text-emerald-500 text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <p className="text-sm text-slate-900 dark:text-white">Smart Matching Engine</p>
                  </div>
                  <span className="text-emerald-500 text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    <p className="text-sm text-slate-900 dark:text-white">Real-Time Market Data</p>
                  </div>
                  <span className="text-emerald-500 text-xs font-medium">Live</span>
                </div>
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
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0" onClick={() => handleRoleAction("startup")}>
                {user ? "Go to Startup Dashboard" : "Apply as Startup"}
              </Button>
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
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0" onClick={() => handleRoleAction("investor")}>
                {user ? "Go to Investor Dashboard" : "Apply as Investor"}
              </Button>
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
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0" onClick={() => handleRoleAction("advisor")}>
                {user ? "Go to Advisor Dashboard" : "Apply as Advisor"}
              </Button>
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
