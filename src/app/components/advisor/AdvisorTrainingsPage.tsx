import { useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  GraduationCap,
  PlusCircle,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Edit,
  Trash2,
  TrendingUp,
  Eye,
  Video,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Training {
  id: string;
  title: string;
  description: string;
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
  attendeeTypes: ("investors" | "startups")[];
}

export function AdvisorTrainingsPage() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: "1",
      title: "Financial Modeling for Startups",
      description:
        "Learn to build comprehensive financial models, forecast revenue, and present to investors with confidence.",
      type: "paid",
      price: 499,
      format: "online",
      duration: "4 weeks",
      schedule: "Every Tuesday, 6-8 PM EST",
      capacity: 50,
      enrolled: 42,
      status: "ongoing",
      topics: ["Financial Modeling", "Revenue Forecasting", "Investor Pitch"],
      attendeeTypes: ["startups"],
    },
    {
      id: "2",
      title: "Due Diligence Fundamentals",
      description:
        "Master the art of startup due diligence, learn key evaluation frameworks, and identify red flags.",
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
      attendeeTypes: ["investors"],
    },
    {
      id: "3",
      title: "Introduction to Venture Capital",
      description:
        "Free introductory workshop covering VC basics, investment thesis, and portfolio strategies.",
      type: "free",
      format: "online",
      duration: "2 hours",
      schedule: "March 25, 2026 at 5 PM EST",
      capacity: 200,
      enrolled: 187,
      status: "upcoming",
      topics: ["Venture Capital", "Investment Strategy", "Portfolio Management"],
      attendeeTypes: ["investors", "startups"],
    },
    {
      id: "4",
      title: "Scaling Your Startup: From Seed to Series A",
      description:
        "Comprehensive program on growth strategies, team building, and preparing for institutional funding.",
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
      attendeeTypes: ["startups"],
    },
  ]);

  const totalRevenue = trainings
    .filter((t) => t.type === "paid")
    .reduce((sum, t) => sum + (t.price || 0) * t.enrolled, 0);

  const totalEnrolled = trainings.reduce((sum, t) => sum + t.enrolled, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName="Dr. Sarah Chen" />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8 text-accent" />
                <h1 className="text-3xl font-semibold">Training Programs</h1>
              </div>
              <p className="text-muted-foreground">
                Create and manage training programs for investors and startups
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Training
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Training Program</DialogTitle>
                  <DialogDescription>
                    Set up a new training program for investors and/or startups
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div>
                    <Label htmlFor="training-title">Training Title *</Label>
                    <Input
                      id="training-title"
                      placeholder="e.g., Financial Modeling for Startups"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="training-description">Description *</Label>
                    <Textarea
                      id="training-description"
                      placeholder="Describe what participants will learn..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="training-type">Training Type *</Label>
                      <Select defaultValue="paid">
                        <SelectTrigger id="training-type" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="training-price">Price (USD)</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="training-price"
                          type="number"
                          placeholder="499"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="training-format">Format *</Label>
                      <Select defaultValue="online">
                        <SelectTrigger id="training-format" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="in-person">In-Person</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="training-duration">Duration *</Label>
                      <Input
                        id="training-duration"
                        placeholder="e.g., 4 weeks, 2 hours"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="training-schedule">Schedule *</Label>
                    <Input
                      id="training-schedule"
                      placeholder="e.g., Every Tuesday, 6-8 PM EST"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="training-location">
                      Location (for in-person/hybrid)
                    </Label>
                    <Input
                      id="training-location"
                      placeholder="City, State or Address"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="training-capacity">Capacity *</Label>
                    <Input
                      id="training-capacity"
                      type="number"
                      placeholder="50"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Target Audience *</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Investors</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Startups</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="training-topics">Topics (comma-separated)</Label>
                    <Input
                      id="training-topics"
                      placeholder="e.g., Financial Modeling, Revenue Forecasting"
                      className="mt-2"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Create Training
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Trainings</div>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{trainings.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Enrolled</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{totalEnrolled}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Training Revenue</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">
              ${(totalRevenue / 1000).toFixed(1)}k
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Active Programs</div>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-semibold">
              {trainings.filter((t) => t.status !== "completed").length}
            </div>
          </Card>
        </div>

        {/* Training List */}
        <Card className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All ({trainings.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming (
                {trainings.filter((t) => t.status === "upcoming").length})
              </TabsTrigger>
              <TabsTrigger value="ongoing">
                Ongoing ({trainings.filter((t) => t.status === "ongoing").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed (
                {trainings.filter((t) => t.status === "completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {trainings.map((training) => (
                <Card
                  key={training.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{training.title}</h3>
                        <CredibilityBadge type="verified" label="Verified" />
                        <Badge
                          variant={
                            training.status === "ongoing"
                              ? "default"
                              : training.status === "upcoming"
                              ? "outline"
                              : "secondary"
                          }
                          className={
                            training.status === "ongoing"
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }
                        >
                          {training.status === "ongoing"
                            ? "Live"
                            : training.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                        </Badge>
                        {training.type === "paid" ? (
                          <Badge variant="outline" className="bg-green-50">
                            <DollarSign className="mr-1 h-3 w-3" />
                            ${training.price}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
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
                        {training.topics.map((topic) => (
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">{training.enrolled}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {training.capacity} enrolled
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Open to:{" "}
                          {training.attendeeTypes
                            .map((t) =>
                              t === "investors" ? "Investors" : "Startups"
                            )
                            .join(", ")}
                        </div>
                      </div>
                    </div>

                    {training.type === "paid" && (
                      <div className="text-right ml-6">
                        <div className="text-sm text-muted-foreground mb-1">
                          Revenue
                        </div>
                        <div className="text-xl font-semibold">
                          ${((training.price || 0) * training.enrolled).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Attendees
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {trainings.filter((t) => t.status === "upcoming").length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming trainings</p>
                </div>
              ) : (
                trainings
                  .filter((t) => t.status === "upcoming")
                  .map((training) => (
                    <Card key={training.id} className="p-6">
                      {/* Same content as above */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {training.title}
                            </h3>
                            <Badge variant="outline">Upcoming</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {training.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="space-y-4">
              {trainings.filter((t) => t.status === "ongoing").length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ongoing trainings</p>
                </div>
              ) : (
                trainings
                  .filter((t) => t.status === "ongoing")
                  .map((training) => (
                    <Card key={training.id} className="p-6">
                      {/* Same content */}
                      <h3 className="font-semibold">{training.title}</h3>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed trainings yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
