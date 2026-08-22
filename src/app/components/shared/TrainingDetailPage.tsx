import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  GraduationCap, Users, DollarSign, Calendar, Clock, Video, MapPin,
  CheckCircle2, BookOpen, User, Loader2, ArrowLeft, Play, BarChart3,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getTraining, getMyEnrollments, enrollInTraining, unenrollFromTraining,
  updateTrainingProgress,
} from "@/app/lib/api";
import type { Training, TrainingEnrollment } from "@/app/types/training";

interface TrainingDetailPageProps {
  userRole: "investor" | "startup" | "advisor";
}

export function TrainingDetailPage({ userRole }: TrainingDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [training, setTraining] = useState<Training | null>(null);
  const [enrollment, setEnrollment] = useState<TrainingEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  const userName = user?.fullName ?? "";

  useEffect(() => {
    if (!session?.token || !id) return;
    let active = true;
    async function load() {
      try {
        const [trainingRes, enrollmentsRes] = await Promise.all([
          getTraining(session!.token, id!),
          getMyEnrollments(session!.token),
        ]);
        if (active) {
          setTraining(trainingRes.training);
          const myEnrollment = enrollmentsRes.enrollments.find((e) => e.trainingId === id);
          setEnrollment(myEnrollment ?? null);
        }
      } catch {
        // fallback
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token, id]);

  const isEnrolled = !!enrollment;

  const handleEnrollment = async () => {
    if (!session?.token || !training) return;
    setIsEnrolling(true);
    try {
      if (isEnrolled) {
        await unenrollFromTraining(session.token, training.id);
        setEnrollment(null);
        setTraining((prev) => prev ? { ...prev, enrolled: Math.max(0, prev.enrolled - 1) } : prev);
      } else {
        await enrollInTraining(session.token, training.id);
        const enrollmentsRes = await getMyEnrollments(session.token);
        const myEnrollment = enrollmentsRes.enrollments.find((e) => e.trainingId === training.id);
        setEnrollment(myEnrollment ?? null);
        setTraining((prev) => prev ? { ...prev, enrolled: prev.enrolled + 1 } : prev);
      }
    } catch {
      // ignore
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    if (!session?.token || !training) return;
    setIsUpdatingProgress(true);
    setProgressError(null);
    try {
      const res = await updateTrainingProgress(session.token, training.id, newProgress);
      setEnrollment(res.enrollment);
    } catch (err) {
      setProgressError(err instanceof Error ? err.message : "Could not update progress. Please try again.");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const progressMilestones = [0, 10, 25, 50, 75, 90, 100];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={userRole} userName={userName} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={userRole} userName={userName} />
        <div className="container mx-auto px-6 py-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Training not found</h2>
          <p className="text-muted-foreground mb-4">This training may have been removed.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />Go Back
          </Button>
        </div>
      </div>
    );
  }

  const progress = enrollment?.progress ?? 0;
  const capacityPercent = training.capacity > 0 ? Math.round((training.enrolled / training.capacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Trainings
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant={training.status === "ongoing" ? "default" : "outline"}
                  className={training.status === "ongoing" ? "bg-accent text-accent-foreground" : ""}>
                  {training.status === "ongoing" ? "Live" : training.status === "upcoming" ? "Upcoming" : "Completed"}
                </Badge>
                <Badge variant="outline" className="capitalize">{training.level}</Badge>
                <Badge variant="outline" className="capitalize">{training.format}</Badge>
                {training.type === "paid" ? (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
                    <DollarSign className="mr-1 h-3 w-3" />${training.price}
                  </Badge>
                ) : (
                  <Badge variant="outline">Free</Badge>
                )}
                <CredibilityBadge type="verified" label="Verified" />
              </div>

              <h1 className="text-3xl font-semibold mb-3">{training.title}</h1>

              {training.instructorName && (
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Instructor: <span className="font-medium text-foreground">{training.instructorName}</span></span>
                </div>
              )}

              <p className="text-muted-foreground mb-6 leading-relaxed">{training.description}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {training.format === "online" ? <Video className="h-5 w-5 text-accent" /> : <MapPin className="h-5 w-5 text-accent" />}
                  <div>
                    <div className="text-xs text-muted-foreground">Format</div>
                    <div className="text-sm font-medium capitalize">{training.format === "online" ? "Online" : training.location || training.format}</div>
                  </div>
                </div>
                {training.duration && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="text-sm font-medium">{training.duration}</div>
                    </div>
                  </div>
                )}
                {training.schedule && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">Schedule</div>
                      <div className="text-sm font-medium">{training.schedule}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-xs text-muted-foreground">Capacity</div>
                    <div className="text-sm font-medium">{training.enrolled} / {training.capacity} enrolled</div>
                  </div>
                </div>
              </div>

              {training.topics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {training.topics.map((topic) => (
                      <Badge key={topic} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {training.targetAudience.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {training.targetAudience.map((audience) => (
                      <Badge key={audience} variant="outline" className="bg-accent/5">{audience}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Progress Tracking Section - Only for enrolled users */}
            {isEnrolled && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold">Your Progress</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Completion</span>
                    <span className="text-2xl font-bold text-accent">{progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {progress === 100 ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-700 dark:text-green-400">Training Completed!</div>
                      <div className="text-sm text-green-600 dark:text-green-500">Congratulations on completing this training program.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-3">Update Your Progress</h4>
                      <div className="flex flex-wrap gap-2">
                        {progressMilestones.map((milestone) => (
                          <Button
                            key={milestone}
                            variant={progress >= milestone ? "default" : "outline"}
                            size="sm"
                            disabled={isUpdatingProgress || milestone <= progress}
                            className={progress >= milestone ? "bg-accent text-accent-foreground" : ""}
                            onClick={() => handleProgressUpdate(milestone)}
                          >
                            {`${milestone}%`}
                          </Button>
                        ))}
                      </div>
                      {progressError && (
                        <p className="text-sm text-destructive mt-2">{progressError}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>Click a milestone to update your progress. You can only move forward.</span>
                    </div>
                  </>
                )}

                <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                  Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center mb-6">
                {training.type === "paid" ? (
                  <>
                    <div className="text-3xl font-bold mb-1">${training.price}</div>
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-accent mb-1">Free</div>
                    <div className="text-sm text-muted-foreground">No cost to enroll</div>
                  </>
                )}
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">You are enrolled</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleEnrollment} disabled={isEnrolling}>
                    {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cancel Enrollment
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleEnrollment} disabled={isEnrolling || training.enrolled >= training.capacity}>
                  {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {training.enrolled >= training.capacity
                    ? "Training Full"
                    : training.type === "paid"
                      ? `Enroll - $${training.price}`
                      : "Enroll Free"}
                </Button>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Training Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium capitalize">{training.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium capitalize">{training.format}</span>
                </div>
                {training.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{training.duration}</span>
                  </div>
                )}
                {training.schedule && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-medium">{training.schedule}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spots Available</span>
                  <span className="font-medium">{Math.max(0, training.capacity - training.enrolled)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{training.status}</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>{training.enrolled} enrolled</span>
                  <span>{capacityPercent}% full</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${capacityPercent >= 90 ? "bg-red-500" : capacityPercent >= 70 ? "bg-amber-500" : "bg-accent"}`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            </Card>

            {training.instructorName && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {training.instructorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{training.instructorName}</div>
                    <div className="text-sm text-muted-foreground">Verified Advisor</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
