import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  GraduationCap, Search, Filter, Users, DollarSign, Calendar, Clock, Video, MapPin,
  CheckCircle2, BookOpen, TrendingUp, User, Loader2, BarChart3, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { listTrainings, getMyEnrollments, enrollInTraining, unenrollFromTraining } from "@/app/lib/api";
import { CheckoutDialog } from "@/app/components/shared/CheckoutDialog";
import type { Training, TrainingEnrollment } from "@/app/types/training";

interface TrainingMarketplaceProps {
  userRole: "investor" | "startup";
}

export function TrainingMarketplace({ userRole }: TrainingMarketplaceProps) {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trainingPage, setTrainingPage] = useState(1);
  const trainingPageSize = 5;
  const [checkoutTraining, setCheckoutTraining] = useState<Training | null>(null);

  const userName = user?.fullName ?? "";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [trainingsRes, enrollmentsRes] = await Promise.all([
          listTrainings(session!.token),
          getMyEnrollments(session!.token),
        ]);
        if (active) {
          setTrainings(trainingsRes.trainings);
          setEnrollments(enrollmentsRes.enrollments);
          setEnrolledIds(new Set(enrollmentsRes.enrollments.map((e) => e.trainingId)));
        }
      } catch { /* fallback */ } finally { if (active) setIsLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const getEnrollmentProgress = (trainingId: string) => {
    return enrollments.find((e) => e.trainingId === trainingId)?.progress ?? 0;
  };

  const isEnrolled = (id: string) => enrolledIds.has(id);

  const handleEnrollment = async (training: Training) => {
    if (!session?.token) return;
    try {
      if (isEnrolled(training.id)) {
        await unenrollFromTraining(session.token, training.id);
        setEnrolledIds((prev) => { const next = new Set(prev); next.delete(training.id); return next; });
        setTrainings((prev) => prev.map((t) => t.id === training.id ? { ...t, enrolled: Math.max(0, t.enrolled - 1) } : t));
      } else if (training.type === "paid") {
        setCheckoutTraining(training);
      } else {
        await enrollInTraining(session.token, training.id);
        setEnrolledIds((prev) => new Set(prev).add(training.id));
        setTrainings((prev) => prev.map((t) => t.id === training.id ? { ...t, enrolled: t.enrolled + 1 } : t));
      }
    } catch { /* ignore */ }
  };

  const handlePaymentSuccess = () => {
    if (checkoutTraining) {
      setEnrolledIds((prev) => new Set(prev).add(checkoutTraining.id));
      setTrainings((prev) => prev.map((t) => t.id === checkoutTraining.id ? { ...t, enrolled: t.enrolled + 1 } : t));
      setCheckoutTraining(null);
    }
  };

  const audienceKey = userRole === "investor" ? "Investors" : "Startups";
  const relevantTrainings = trainings.filter((t) =>
    t.targetAudience.length === 0 || t.targetAudience.some((a) => a.toLowerCase() === audienceKey.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={userRole} userName={userName} />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-semibold">Training Marketplace</h1>
          </div>
          <p className="text-muted-foreground">Explore professional training programs from expert advisors</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Available</div><BookOpen className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">{relevantTrainings.length}</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Enrolled</div><CheckCircle2 className="h-4 w-4 text-accent" /></div><div className="text-2xl font-semibold">{enrolledIds.size}</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Free</div><GraduationCap className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">{relevantTrainings.filter((t) => t.type === "free").length}</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Paid</div><DollarSign className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">{relevantTrainings.filter((t) => t.type === "paid").length}</div></Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <Tabs defaultValue="all" onValueChange={() => setTrainingPage(1)}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="enrolled">Enrolled ({enrolledIds.size})</TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>

                {(["all", "enrolled", "free", "upcoming"] as const).map((tab) => {
                  const tabFiltered = relevantTrainings.filter((t) => {
                    if (tab === "enrolled") return isEnrolled(t.id);
                    if (tab === "free") return t.type === "free";
                    if (tab === "upcoming") return t.status === "upcoming";
                    return true;
                  });
                  const tabTotalPages = Math.ceil(tabFiltered.length / trainingPageSize);
                  const tabPage = Math.min(trainingPage, tabTotalPages || 1);
                  const tabPaginated = tabFiltered.slice((tabPage - 1) * trainingPageSize, tabPage * trainingPageSize);
                  return (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {tabPaginated
                      .map((training) => (
                        <Card key={training.id} className={`p-6 hover:shadow-lg transition-shadow ${isEnrolled(training.id) ? "border-accent/50 bg-accent/5" : ""}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold">{training.title}</h3>
                                <CredibilityBadge type="verified" label="Verified" />
                                {isEnrolled(training.id) && <Badge variant="default" className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Enrolled</Badge>}
                              </div>
                              {training.instructorName && (
                                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                  <User className="h-4 w-4" /><span className="font-medium">{training.instructorName}</span>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground mb-3">{training.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">{training.format === "online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}{training.format === "online" ? "Online" : training.location || training.format}</div>
                                {training.duration && <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{training.duration}</div>}
                                {training.schedule && <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{training.schedule}</div>}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {training.topics.slice(0, 3).map((topic) => <Badge key={topic} variant="outline">{topic}</Badge>)}
                                <Badge variant="outline" className="capitalize">{training.level}</Badge>
                              </div>
                              <div className="text-sm"><span className="font-medium">{training.enrolled}</span><span className="text-muted-foreground"> / {training.capacity} enrolled</span></div>
                            </div>
                            <div className="text-right ml-6">
                              {training.type === "paid" ? (
                                <><div className="text-sm text-muted-foreground mb-1">Price</div><div className="text-2xl font-semibold">${training.price}</div></>
                              ) : (
                                <Badge variant="outline" className="text-lg px-3 py-1">Free</Badge>
                              )}
                            </div>
                          </div>
                          {isEnrolled(training.id) && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" />Your Progress</span>
                                <span className="font-medium">{getEnrollmentProgress(training.id)}%</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${getEnrollmentProgress(training.id)}%` }} />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => navigate(`/${userRole}/trainings/${training.id}`)}>View Details</Button>
                            {isEnrolled(training.id) ? (
                              <Button variant="outline" onClick={() => handleEnrollment(training)}>Cancel Enrollment</Button>
                            ) : (
                              <Button onClick={() => handleEnrollment(training)}>
                                {training.type === "paid" ? `Enroll - $${training.price}` : "Enroll Free"}
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    {tabFiltered.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No trainings found</p>
                      </div>
                    )}
                    {tabTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm text-muted-foreground">
                          {(tabPage - 1) * trainingPageSize + 1}–{Math.min(tabPage * trainingPageSize, tabFiltered.length)} of {tabFiltered.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={tabPage <= 1} onClick={() => setTrainingPage((p) => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">{tabPage} / {tabTotalPages}</span>
                          <Button variant="outline" size="sm" disabled={tabPage >= tabTotalPages} onClick={() => setTrainingPage((p) => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  );
                })}
              </Tabs>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">My Training Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div><div className="text-sm text-muted-foreground">Enrolled</div><div className="text-2xl font-semibold mt-1">{enrolledIds.size}</div></div>
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div><div className="text-sm text-muted-foreground">Completed</div><div className="text-2xl font-semibold mt-1">{enrollments.filter((e) => e.progress === 100).length}</div></div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div><div className="text-sm text-muted-foreground">In Progress</div><div className="text-2xl font-semibold mt-1">{enrollments.filter((e) => e.progress > 0 && e.progress < 100).length}</div></div>
                  <BarChart3 className="h-8 w-8 text-amber-500" />
                </div>
                {enrollments.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Average Progress</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)}%` }} />
                      </div>
                      <span className="text-sm font-medium">{Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-accent" /><h3 className="font-semibold">Why Learn with MoneyMinds?</h3></div>
              <div className="space-y-3">
                {["Expert advisors with proven track records", "Practical, industry-focused curriculum", "Network with peers and industry leaders", "Flexible online and in-person options"].map((text) => (
                  <div key={text} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground">{text}</p></div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {checkoutTraining && (
        <CheckoutDialog
          open={!!checkoutTraining}
          onClose={() => setCheckoutTraining(null)}
          onSuccess={handlePaymentSuccess}
          itemType="training"
          itemId={checkoutTraining.id}
          itemName={checkoutTraining.title}
          amount={checkoutTraining.price}
        />
      )}
    </div>
  );
}
