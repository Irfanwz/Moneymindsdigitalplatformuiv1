import { useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Search,
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Info,
  Filter,
  Bot,
  LineChart,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface AIAgent {
  id: string;
  name: string;
  industry: string;
  description: string;
  monthlyFee: number;
  features: string[];
  verified: true;
  trainedDataPoints: string;
  updateFrequency: string;
  specializations: string[];
}

export function AIAgentsPage() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [subscribedAgents, setSubscribedAgents] = useState<string[]>(["1", "3"]); // Mock subscribed agent IDs

  const agents: AIAgent[] = [
    {
      id: "1",
      name: "Crypto Market Expert",
      industry: "Cryptocurrency",
      description:
        "AI-powered analysis of cryptocurrency markets, blockchain trends, and token valuations. Real-time insights on market movements and emerging opportunities.",
      monthlyFee: 299,
      features: [
        "Real-time crypto market analysis",
        "Token valuation models",
        "Blockchain trend detection",
        "Risk assessment algorithms",
        "Portfolio optimization suggestions",
      ],
      verified: true,
      trainedDataPoints: "10M+ transactions",
      updateFrequency: "Real-time",
      specializations: ["Bitcoin", "DeFi", "NFTs", "Altcoins"],
    },
    {
      id: "2",
      name: "FinTech Intelligence",
      industry: "FinTech",
      description:
        "Comprehensive analysis of financial technology startups, regulatory trends, and payment innovation. Expert insights on digital banking and payment processors.",
      monthlyFee: 249,
      features: [
        "FinTech startup evaluation",
        "Regulatory compliance tracking",
        "Payment trends analysis",
        "Digital banking insights",
        "Market opportunity identification",
      ],
      verified: true,
      trainedDataPoints: "5M+ data points",
      updateFrequency: "Daily",
      specializations: ["Digital Banking", "Payment Systems", "RegTech", "Lending"],
    },
    {
      id: "3",
      name: "HealthTech Advisor",
      industry: "HealthTech",
      description:
        "Advanced analysis of healthcare technology, telemedicine platforms, and biotech innovations. Clinical trial data and FDA approval tracking.",
      monthlyFee: 279,
      features: [
        "Clinical trial monitoring",
        "FDA approval predictions",
        "Telemedicine market analysis",
        "Biotech investment signals",
        "Healthcare regulation updates",
      ],
      verified: true,
      trainedDataPoints: "3M+ clinical studies",
      updateFrequency: "Daily",
      specializations: ["Telemedicine", "Biotech", "MedTech", "Digital Health"],
    },
    {
      id: "4",
      name: "CleanTech Analyst",
      industry: "CleanTech",
      description:
        "Expert analysis of renewable energy, sustainability startups, and environmental technology. ESG scoring and carbon credit market insights.",
      monthlyFee: 229,
      features: [
        "Renewable energy trends",
        "ESG impact scoring",
        "Carbon market analysis",
        "Sustainability metrics",
        "Green technology opportunities",
      ],
      verified: true,
      trainedDataPoints: "2M+ sustainability reports",
      updateFrequency: "Daily",
      specializations: ["Solar", "Wind", "EV", "Carbon Credits"],
    },
    {
      id: "5",
      name: "AI/ML Investment Scout",
      industry: "AI/ML",
      description:
        "Deep learning models analyzing artificial intelligence startups, machine learning applications, and emerging AI technologies across industries.",
      monthlyFee: 349,
      features: [
        "AI startup evaluation",
        "ML model assessment",
        "Tech stack analysis",
        "Competitive landscape mapping",
        "Innovation trend forecasting",
      ],
      verified: true,
      trainedDataPoints: "8M+ AI research papers",
      updateFrequency: "Real-time",
      specializations: ["Computer Vision", "NLP", "Robotics", "AutoML"],
    },
    {
      id: "6",
      name: "SaaS Metrics Expert",
      industry: "SaaS",
      description:
        "Specialized in B2B SaaS metrics, growth patterns, and subscription business models. Unit economics and customer acquisition analysis.",
      monthlyFee: 199,
      features: [
        "SaaS metrics benchmarking",
        "Churn prediction models",
        "CAC/LTV analysis",
        "Growth trajectory forecasting",
        "Pricing strategy evaluation",
      ],
      verified: true,
      trainedDataPoints: "4M+ SaaS companies",
      updateFrequency: "Daily",
      specializations: ["B2B SaaS", "PLG", "Enterprise Software", "SMB Tools"],
    },
  ];

  const isSubscribed = (agentId: string) => subscribedAgents.includes(agentId);

  const handleSubscribe = (agent: AIAgent) => {
    if (isSubscribed(agent.id)) {
      setSubscribedAgents(subscribedAgents.filter((id) => id !== agent.id));
    } else {
      setSubscribedAgents([...subscribedAgents, agent.id]);
    }
    setSelectedAgent(null);
  };

  const totalMonthlySpend = agents
    .filter((agent) => isSubscribed(agent.id))
    .reduce((sum, agent) => sum + agent.monthlyFee, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="investor" userName="Alex Morgan" />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-semibold">AI Intelligence Agents</h1>
          </div>
          <p className="text-muted-foreground">
            Subscribe to industry-specific AI agents for expert market insights and
            investment intelligence
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Active Subscriptions</div>
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-semibold">{subscribedAgents.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Monthly Spend</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">${totalMonthlySpend}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Available Agents</div>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{agents.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Insights Generated</div>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">1,247</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Browse AI Agents</h2>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by industry or expertise..."
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="all">All Agents</TabsTrigger>
                  <TabsTrigger value="subscribed">
                    Subscribed ({subscribedAgents.length})
                  </TabsTrigger>
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {agents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`p-6 hover:shadow-lg transition-shadow ${
                        isSubscribed(agent.id)
                          ? "border-accent/50 bg-accent/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
                            <Sparkles className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{agent.name}</h3>
                              {agent.verified && (
                                <CredibilityBadge type="ai-verified" />
                              )}
                              {isSubscribed(agent.id) && (
                                <Badge
                                  variant="default"
                                  className="bg-accent text-accent-foreground"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {agent.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <Badge variant="outline">{agent.industry}</Badge>
                              {agent.specializations.slice(0, 3).map((spec) => (
                                <Badge key={spec} variant="outline">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {agent.trainedDataPoints}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {agent.updateFrequency} updates
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            /month
                          </div>
                          <div className="text-2xl font-semibold">
                            ${agent.monthlyFee}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedAgent(agent)}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-accent" />
                                {selectedAgent?.name}
                              </DialogTitle>
                              <DialogDescription>
                                {selectedAgent?.description}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              <div>
                                <h4 className="font-medium mb-3">
                                  Key Capabilities
                                </h4>
                                <div className="space-y-2">
                                  {selectedAgent?.features.map((feature, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">
                                  Specializations
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedAgent?.specializations.map((spec) => (
                                    <Badge key={spec} variant="outline">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Shield className="h-4 w-4 text-accent" />
                                    <div className="text-sm font-medium">
                                      Training Data
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedAgent?.trainedDataPoints}
                                  </div>
                                </div>

                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Zap className="h-4 w-4 text-accent" />
                                    <div className="text-sm font-medium">
                                      Update Frequency
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedAgent?.updateFrequency}
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">
                                      Monthly Subscription
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Cancel anytime
                                    </div>
                                  </div>
                                  <div className="text-2xl font-semibold">
                                    ${selectedAgent?.monthlyFee}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              {selectedAgent && (
                                <Button
                                  onClick={() => handleSubscribe(selectedAgent)}
                                  className="w-full"
                                  variant={
                                    isSubscribed(selectedAgent.id)
                                      ? "outline"
                                      : "default"
                                  }
                                >
                                  {isSubscribed(selectedAgent.id)
                                    ? "Unsubscribe"
                                    : "Subscribe Now"}
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {isSubscribed(agent.id) ? (
                          <Button
                            variant="outline"
                            onClick={() => handleSubscribe(agent)}
                          >
                            Unsubscribe
                          </Button>
                        ) : (
                          <Button onClick={() => handleSubscribe(agent)}>
                            Subscribe
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="subscribed" className="space-y-4">
                  {agents.filter((agent) => isSubscribed(agent.id)).length ===
                  0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active subscriptions</p>
                      <p className="text-sm mt-2">
                        Subscribe to AI agents to get started
                      </p>
                    </div>
                  ) : (
                    agents
                      .filter((agent) => isSubscribed(agent.id))
                      .map((agent) => (
                        <Card key={agent.id} className="p-6 border-accent/50 bg-accent/5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
                                <Sparkles className="h-6 w-6 text-accent" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{agent.name}</h3>
                                  <Badge
                                    variant="default"
                                    className="bg-accent text-accent-foreground"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {agent.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">
                                /month
                              </div>
                              <div className="text-2xl font-semibold">
                                ${agent.monthlyFee}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" className="flex-1">
                              View Insights
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSubscribe(agent)}
                            >
                              Unsubscribe
                            </Button>
                          </div>
                        </Card>
                      ))
                  )}
                </TabsContent>

                <TabsContent value="recommended" className="space-y-4">
                  {agents.slice(0, 3).map((agent) => (
                    <Card key={agent.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
                            <Sparkles className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{agent.name}</h3>
                              <Badge variant="outline" className="bg-accent/10">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Recommended
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            /month
                          </div>
                          <div className="text-2xl font-semibold">
                            ${agent.monthlyFee}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          Learn More
                        </Button>
                        <Button onClick={() => handleSubscribe(agent)}>
                          Subscribe
                        </Button>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Subscription Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Active Agents
                    </div>
                    <div className="text-2xl font-semibold mt-1">
                      {subscribedAgents.length}
                    </div>
                  </div>
                  <Bot className="h-8 w-8 text-accent" />
                </div>

                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Monthly Total
                    </div>
                    <div className="text-2xl font-semibold mt-1">
                      ${totalMonthlySpend}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Next Billing Date
                  </div>
                  <div className="text-sm font-medium">March 1, 2026</div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/investor/edit-profile")}
                >
                  Manage Subscriptions
                </Button>
              </div>
            </Card>

            {/* AI Insights Highlight */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">AI-Powered Benefits</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Real-time market intelligence
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Proprietary data analysis
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Investment signal detection
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Cancel anytime, no commitment
                  </p>
                </div>
              </div>
            </Card>

            {/* Information Notice */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">About AI Agents</h3>
                  <p className="text-sm text-muted-foreground">
                    MoneyMinds AI agents are trained on millions of data points
                    and updated continuously to provide institutional-grade
                    investment intelligence.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
