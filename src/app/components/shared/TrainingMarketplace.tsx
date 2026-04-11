import { useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  GraduationCap,
  Search,
  Filter,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  User,
} from "lucide-react";

interface Training {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorTitle: string;
  type: "free" | "paid";
  price?: number;
  format: "online" | "in-person" | "hybrid";
  duration: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  status: "upcoming" | "ongoing" | "completed";
  topics: string[];
  location?: string;
  targetAudience: string[];
  level: "beginner" | "intermediate" | "advanced";
}

interface TrainingMarketplaceProps {
  userRole: "investor" | "startup";
}

export function TrainingMarketplace({ userRole }: TrainingMarketplaceProps) {
  const [enrolledTrainings, setEnrolledTrainings] = useState<string[]>(["1", "3"]);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  const trainings: Training[] = [
    {
      id: "1",
      title: "Financial Modeling for Startups",
      description:
        "Learn to build comprehensive financial models, forecast revenue, and present to investors with confidence.",
      instructor: "Dr. Sarah Chen",
      instructorTitle: "Financial Advisor, 15+ years experience",
      type: "paid",
      price: 499,
      format: "online",
      duration: "4 weeks",
      schedule: "Every Tuesday, 6-8 PM EST",
      capacity: 50,
      enrolled: 42,
      status: "ongoing",
      topics: ["Financial Modeling", "Revenue Forecasting", "Investor Pitch"],
      targetAudience: ["Startups"],
      level: "intermediate",
    },
    {
      id: "2",
      title: "Due Diligence Fundamentals",
      description:
        "Master the art of startup due diligence, learn key evaluation frameworks, and identify red flags.",
      instructor: "Dr. Sarah Chen",
      instructorTitle: "Financial Advisor, 15+ years experience",
      type: "paid",
      price: 799,
      format: "hybrid",
      duration: "6 weeks",
      schedule: "Wednesdays & Fridays, 7-9 PM EST",
      capacity: 30,
      enrolled: 28,
      status: "ongoing",
      topics: ["Due Diligence", "Risk Assessment", "Valuation"],
      location: "New York, NY",
      targetAudience: ["Investors"],
      level: "intermediate",
    },
    {
      id: "3",
      title: "Introduction to Venture Capital",
      description:
        "Free introductory workshop covering VC basics, investment thesis, and portfolio strategies.",
      instructor: "Dr. Sarah Chen",
      instructorTitle: "Financial Advisor, 15+ years experience",
      type: "free",
      format: "online",
      duration: "2 hours",
      schedule: "March 25, 2026 at 5 PM EST",
      capacity: 200,
      enrolled: 187,
      status: "upcoming",
      topics: ["Venture Capital", "Investment Strategy", "Portfolio Management"],
      targetAudience: ["Investors", "Startups"],
      level: "beginner",
    },
    {
      id: "4",
      title: "Scaling Your Startup: From Seed to Series A",
      description:
        "Comprehensive program on growth strategies, team building, and preparing for institutional funding.",
      instructor: "Michael Torres",
      instructorTitle: "Growth Advisor, Ex-VP at TechCorp",
      type: "paid",
      price: 1299,
      format: "in-person",
      duration: "8 weeks",
      schedule: "Saturdays, 10 AM - 2 PM EST",
      capacity: 25,
      enrolled: 19,
      status: "upcoming",
      topics: ["Growth Strategy", "Fundraising", "Team Building", "Operations"],
      location: "San Francisco, CA",
      targetAudience: ["Startups"],
      level: "advanced",
    },
    {
      id: "5",
      title: "Portfolio Construction for Angel Investors",
      description:
        "Learn how to build a diversified angel investment portfolio and manage risk effectively.",
      instructor: "Jennifer Park",
      instructorTitle: "Investment Advisor, 20+ portfolio companies",
      type: "paid",
      price: 599,
      format: "online",
      duration: "3 weeks",
      schedule: "Thursdays, 7-9 PM EST",
      capacity: 40,
      enrolled: 12,
      status: "upcoming",
      topics: ["Portfolio Management", "Risk Management", "Asset Allocation"],
      targetAudience: ["Investors"],
      level: "intermediate",
    },
    {
      id: "6",
      title: "Understanding Cap Tables and Equity",
      description:
        "Free workshop on cap table basics, equity splits, and founder dilution essentials.",
      instructor: "David Kumar",
      instructorTitle: "Legal & Financial Advisor",
      type: "free",
      format: "online",
      duration: "90 minutes",
      schedule: "March 20, 2026 at 6 PM EST",
      capacity: 150,
      enrolled: 98,
      status: "upcoming",
      topics: ["Cap Tables", "Equity", "Dilution", "Legal Basics"],
      targetAudience: ["Startups"],
      level: "beginner",
    },
  ];

  const isEnrolled = (trainingId: string) => enrolledTrainings.includes(trainingId);

  const handleEnrollment = (training: Training) => {
    if (isEnrolled(training.id)) {
      setEnrolledTrainings(enrolledTrainings.filter((id) => id !== training.id));
    } else {
      setEnrolledTrainings([...enrolledTrainings, training.id]);
    }
    setSelectedTraining(null);
  };

  const userName = userRole === "investor" ? "Alex Morgan" : "TechVenture Inc";
  
  const relevantTrainings = trainings.filter((t) =>
    t.targetAudience.some((audience) =>
      userRole === "investor"
        ? audience === "Investors"
        : audience === "Startups"
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-semibold">Training Marketplace</h1>
          </div>
          <p className="text-muted-foreground">
            Explore professional training programs from expert advisors
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Available Trainings</div>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{relevantTrainings.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Enrolled</div>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-semibold">{enrolledTrainings.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Free Workshops</div>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">
              {relevantTrainings.filter((t) => t.type === "free").length}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Hours Learning</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">24</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Browse Trainings</h2>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by topic or keyword..."
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="enrolled">
                    Enrolled ({enrolledTrainings.length})
                  </TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {relevantTrainings.map((training) => (
                    <Card
                      key={training.id}
                      className={`p-6 hover:shadow-lg transition-shadow ${
                        isEnrolled(training.id)
                          ? "border-accent/50 bg-accent/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{training.title}</h3>
                            <CredibilityBadge type="verified" label="Verified" />
                            {isEnrolled(training.id) && (
                              <Badge
                                variant="default"
                                className="bg-accent text-accent-foreground"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Enrolled
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{training.instructor}</span>
                            <span>•</span>
                            <span>{training.instructorTitle}</span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {training.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              {training.format === "online" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              {training.format === "online"
                                ? "Online"
                                : training.format === "in-person"
                                ? training.location
                                : `Hybrid - ${training.location}`}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {training.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {training.schedule}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {training.topics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="outline">
                                {topic}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="capitalize">
                              {training.level}
                            </Badge>
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">{training.enrolled}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {training.capacity} enrolled
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          {training.type === "paid" ? (
                            <>
                              <div className="text-sm text-muted-foreground mb-1">
                                Price
                              </div>
                              <div className="text-2xl font-semibold">
                                ${training.price}
                              </div>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedTraining(training)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-accent" />
                                {selectedTraining?.title}
                              </DialogTitle>
                              <DialogDescription>
                                {selectedTraining?.description}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              <div>
                                <h4 className="font-medium mb-2">Instructor</h4>
                                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {selectedTraining?.instructor}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedTraining?.instructorTitle}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Topics Covered</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTraining?.topics.map((topic) => (
                                    <Badge key={topic} variant="outline">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-accent" />
                                    <div className="text-sm font-medium">Duration</div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedTraining?.duration}
                                  </div>
                                </div>

                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-accent" />
                                    <div className="text-sm font-medium">Schedule</div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedTraining?.schedule}
                                  </div>
                                </div>

                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    {selectedTraining?.format === "online" ? (
                                      <Video className="h-4 w-4 text-accent" />
                                    ) : (
                                      <MapPin className="h-4 w-4 text-accent" />
                                    )}
                                    <div className="text-sm font-medium">Format</div>
                                  </div>
                                  <div className="text-sm text-muted-foreground capitalize">
                                    {selectedTraining?.format}
                                    {selectedTraining?.location &&
                                      ` - ${selectedTraining.location}`}
                                  </div>
                                </div>

                                <div className="p-4 border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-accent" />
                                    <div className="text-sm font-medium">Capacity</div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedTraining?.enrolled} /{" "}
                                    {selectedTraining?.capacity}
                                  </div>
                                </div>
                              </div>

                              {selectedTraining?.type === "paid" && (
                                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Training Fee</div>
                                      <div className="text-sm text-muted-foreground">
                                        One-time payment
                                      </div>
                                    </div>
                                    <div className="text-2xl font-semibold">
                                      ${selectedTraining?.price}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              {selectedTraining && (
                                <Button
                                  onClick={() => handleEnrollment(selectedTraining)}
                                  className="w-full"
                                  variant={
                                    isEnrolled(selectedTraining.id)
                                      ? "outline"
                                      : "default"
                                  }
                                >
                                  {isEnrolled(selectedTraining.id)
                                    ? "Cancel Enrollment"
                                    : training.type === "paid"
                                    ? `Enroll Now - $${selectedTraining.price}`
                                    : "Enroll Now - Free"}
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {isEnrolled(training.id) ? (
                          <Button
                            variant="outline"
                            onClick={() => handleEnrollment(training)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button onClick={() => handleEnrollment(training)}>
                            {training.type === "paid" ? `Enroll - $${training.price}` : "Enroll Free"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="enrolled" className="space-y-4">
                  {relevantTrainings.filter((t) => isEnrolled(t.id)).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No enrolled trainings yet</p>
                      <p className="text-sm mt-2">
                        Browse available trainings to get started
                      </p>
                    </div>
                  ) : (
                    relevantTrainings
                      .filter((t) => isEnrolled(t.id))
                      .map((training) => (
                        <Card key={training.id} className="p-6 border-accent/50 bg-accent/5">
                          <h3 className="font-semibold mb-2">{training.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {training.description}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Course Materials
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEnrollment(training)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      ))
                  )}
                </TabsContent>

                <TabsContent value="free" className="space-y-4">
                  {relevantTrainings
                    .filter((t) => t.type === "free")
                    .map((training) => (
                      <Card key={training.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {training.title}
                              </h3>
                              <Badge variant="outline">Free</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {training.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {relevantTrainings
                    .filter((t) => t.status === "upcoming")
                    .map((training) => (
                      <Card key={training.id} className="p-6">
                        <h3 className="font-semibold mb-2">{training.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {training.schedule}
                        </div>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrolled Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">My Training Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Enrolled Trainings
                    </div>
                    <div className="text-2xl font-semibold mt-1">
                      {enrolledTrainings.length}
                    </div>
                  </div>
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>

                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Hours Completed
                    </div>
                    <div className="text-2xl font-semibold mt-1">24</div>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Next Session
                  </div>
                  <div className="text-sm font-medium">
                    Financial Modeling for Startups
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tuesday, Feb 18 at 6 PM EST
                  </div>
                </div>
              </div>
            </Card>

            {/* Why Learn */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Why Learn with MoneyMinds?</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Expert advisors with proven track records
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Practical, industry-focused curriculum
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Network with peers and industry leaders
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Flexible online and in-person options
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommended */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recommended for You</h3>
              <div className="space-y-3">
                {relevantTrainings.slice(0, 2).map((training) => (
                  <div
                    key={training.id}
                    className="p-3 border border-border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">
                      {training.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {training.instructor}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {training.level}
                      </Badge>
                      {training.type === "paid" ? (
                        <span className="text-sm font-medium">
                          ${training.price}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
