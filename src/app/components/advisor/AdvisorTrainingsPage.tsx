import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/app/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  GraduationCap, PlusCircle, Users, DollarSign, Calendar, Clock, Edit, Trash2,
  TrendingUp, Eye, Video, MapPin, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { listTrainings, createTraining, deleteTraining, updateTraining, getTrainingEnrollments } from "@/app/lib/api";
import type { Training, TrainingEnrollment } from "@/app/types/training";

export function AdvisorTrainingsPage() {
  const { session, user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View dialog
  const [viewTraining, setViewTraining] = useState<Training | null>(null);

  // Edit dialog
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Attendees dialog
  const [attendeesTraining, setAttendeesTraining] = useState<Training | null>(null);
  const [attendees, setAttendees] = useState<TrainingEnrollment[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  // Form state (shared for create and edit)
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"free" | "paid">("paid");
  const [formPrice, setFormPrice] = useState("");
  const [formFormat, setFormFormat] = useState("online");
  const [formDuration, setFormDuration] = useState("");
  const [formSchedule, setFormSchedule] = useState("");
  const [formCapacity, setFormCapacity] = useState("50");
  const [formLocation, setFormLocation] = useState("");
  const [formTopics, setFormTopics] = useState("");
  const [formLevel, setFormLevel] = useState("beginner");
  const [formAudienceInvestors, setFormAudienceInvestors] = useState(true);
  const [formAudienceStartups, setFormAudienceStartups] = useState(true);

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const res = await listTrainings(session!.token);
        if (active) setTrainings(res.trainings.filter((t) => t.advisorId === user?.id));
      } catch { /* fallback */ } finally { if (active) setIsLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [session?.token, user?.id]);

  const resetForm = () => {
    setFormTitle(""); setFormDescription(""); setFormType("paid"); setFormPrice(""); setFormFormat("online");
    setFormDuration(""); setFormSchedule(""); setFormCapacity("50"); setFormLocation(""); setFormTopics("");
    setFormLevel("beginner"); setFormAudienceInvestors(true); setFormAudienceStartups(true); setError(null);
  };

  const handleCreate = async () => {
    if (!session?.token) return;
    setIsCreating(true); setError(null);
    try {
      const audience: string[] = [];
      if (formAudienceInvestors) audience.push("Investors");
      if (formAudienceStartups) audience.push("Startups");
      const res = await createTraining(session.token, {
        title: formTitle, description: formDescription, type: formType,
        price: formType === "paid" ? parseInt(formPrice) || 0 : 0,
        format: formFormat as any, duration: formDuration, schedule: formSchedule,
        capacity: parseInt(formCapacity) || 50, status: "upcoming",
        topics: formTopics.split(",").map((t) => t.trim()).filter(Boolean),
        location: formLocation, targetAudience: audience, level: formLevel,
      });
      setTrainings((prev) => [res.training, ...prev]);
      resetForm(); setIsCreateDialogOpen(false);
    } catch (err: any) { setError(err?.message ?? "Failed to create."); } finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!session?.token) return;
    try { await deleteTraining(session.token, id); setTrainings((prev) => prev.filter((t) => t.id !== id)); } catch { /* */ }
  };

  const openEdit = (training: Training) => {
    setFormTitle(training.title);
    setFormDescription(training.description);
    setFormType(training.type as "free" | "paid");
    setFormPrice(String(training.price || ""));
    setFormFormat(training.format);
    setFormDuration(training.duration || "");
    setFormSchedule(training.schedule || "");
    setFormCapacity(String(training.capacity));
    setFormLocation(training.location || "");
    setFormTopics(training.topics.join(", "));
    setFormLevel(training.level || "beginner");
    setFormAudienceInvestors(training.targetAudience.includes("Investors"));
    setFormAudienceStartups(training.targetAudience.includes("Startups"));
    setEditError(null);
    setEditTraining(training);
  };

  const handleEdit = async () => {
    if (!session?.token || !editTraining) return;
    setIsEditing(true); setEditError(null);
    try {
      const audience: string[] = [];
      if (formAudienceInvestors) audience.push("Investors");
      if (formAudienceStartups) audience.push("Startups");
      const res = await updateTraining(session.token, editTraining.id, {
        title: formTitle, description: formDescription, type: formType,
        price: formType === "paid" ? parseInt(formPrice) || 0 : 0,
        format: formFormat as any, duration: formDuration, schedule: formSchedule,
        capacity: parseInt(formCapacity) || 50, status: editTraining.status,
        topics: formTopics.split(",").map((t) => t.trim()).filter(Boolean),
        location: formLocation, targetAudience: audience, level: formLevel,
      });
      setTrainings((prev) => prev.map((t) => t.id === editTraining.id ? res.training : t));
      setEditTraining(null); resetForm();
    } catch (err: any) { setEditError(err?.message ?? "Failed to update."); } finally { setIsEditing(false); }
  };

  const openAttendees = async (training: Training) => {
    if (!session?.token) return;
    setAttendeesTraining(training);
    setIsLoadingAttendees(true);
    try {
      const res = await getTrainingEnrollments(session.token, training.id);
      setAttendees(res.enrollments);
    } catch { setAttendees([]); } finally { setIsLoadingAttendees(false); }
  };

  const totalRevenue = trainings.filter((t) => t.type === "paid").reduce((s, t) => s + (t.price || 0) * t.enrolled, 0);
  const totalEnrolled = trainings.reduce((s, t) => s + t.enrolled, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Header userRole="advisor" userName={userName} />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2"><GraduationCap className="h-8 w-8 text-accent" /><h1 className="text-3xl font-semibold">Training Programs</h1></div>
              <p className="text-muted-foreground">Create and manage training programs for investors and startups</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(o) => { setIsCreateDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Create Training</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create New Training Program</DialogTitle><DialogDescription>Set up a new training program</DialogDescription></DialogHeader>
                {error && <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">{error}</div>}
                <div className="space-y-6 py-4">
                  <div><Label>Title *</Label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Financial Modeling for Startups" className="mt-2" /></div>
                  <div><Label>Description *</Label><Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="What participants will learn..." rows={4} className="mt-2" /></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Type *</Label><Select value={formType} onValueChange={(v) => setFormType(v as any)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
                    {formType === "paid" && <div><Label>Price (USD)</Label><div className="relative mt-2"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number" placeholder="499" className="pl-10" /></div></div>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Format *</Label><Select value={formFormat} onValueChange={setFormFormat}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="in-person">In-Person</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select></div>
                    <div><Label>Duration *</Label><Input value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="e.g., 4 weeks" className="mt-2" /></div>
                  </div>
                  <div><Label>Schedule *</Label><Input value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} placeholder="e.g., Every Tuesday, 6-8 PM EST" className="mt-2" /></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Location</Label><Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="City, State" className="mt-2" /></div>
                    <div><Label>Capacity *</Label><Input value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} type="number" placeholder="50" className="mt-2" /></div>
                  </div>
                  <div><Label>Level</Label><Select value={formLevel} onValueChange={setFormLevel}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                  <div><Label>Target Audience *</Label><div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" checked={formAudienceInvestors} onChange={(e) => setFormAudienceInvestors(e.target.checked)} /><span className="text-sm">Investors</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" checked={formAudienceStartups} onChange={(e) => setFormAudienceStartups(e.target.checked)} /><span className="text-sm">Startups</span></label>
                  </div></div>
                  <div><Label>Topics (comma-separated)</Label><Input value={formTopics} onChange={(e) => setFormTopics(e.target.value)} placeholder="Financial Modeling, Revenue Forecasting" className="mt-2" /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating}>{isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Training</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Total Trainings</div><GraduationCap className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">{trainings.length}</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Total Enrolled</div><Users className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">{totalEnrolled}</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Revenue</div><DollarSign className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-semibold">${(totalRevenue / 1000).toFixed(1)}k</div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><div className="text-sm text-muted-foreground">Active</div><TrendingUp className="h-4 w-4 text-accent" /></div><div className="text-2xl font-semibold">{trainings.filter((t) => t.status !== "completed").length}</div></Card>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All ({trainings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({trainings.filter((t) => t.status === "upcoming").length})</TabsTrigger>
              <TabsTrigger value="ongoing">Ongoing ({trainings.filter((t) => t.status === "ongoing").length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({trainings.filter((t) => t.status === "completed").length})</TabsTrigger>
            </TabsList>

            {(["all", "upcoming", "ongoing", "completed"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {trainings.filter((t) => tab === "all" || t.status === tab).map((training) => (
                  <Card key={training.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{training.title}</h3>
                          <CredibilityBadge type="verified" label="Verified" />
                          <Badge variant={training.status === "ongoing" ? "default" : "outline"} className={training.status === "ongoing" ? "bg-accent text-accent-foreground" : ""}>
                            {training.status === "ongoing" ? "Live" : training.status === "upcoming" ? "Upcoming" : "Completed"}
                          </Badge>
                          {training.type === "paid" ? <Badge variant="outline" className="bg-green-50"><DollarSign className="mr-1 h-3 w-3" />${training.price}</Badge> : <Badge variant="outline">Free</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{training.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">{training.format === "online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}{training.format === "online" ? "Online" : training.location || training.format}</div>
                          {training.duration && <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{training.duration}</div>}
                          {training.schedule && <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{training.schedule}</div>}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">{training.topics.map((topic) => <Badge key={topic} variant="outline">{topic}</Badge>)}</div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm"><span className="font-medium">{training.enrolled}</span><span className="text-muted-foreground"> / {training.capacity} enrolled</span></div>
                          <div className="text-sm text-muted-foreground">Audience: {training.targetAudience.join(", ") || "Everyone"}</div>
                        </div>
                      </div>
                      {training.type === "paid" && (
                        <div className="text-right ml-6"><div className="text-sm text-muted-foreground mb-1">Revenue</div><div className="text-xl font-semibold">${((training.price || 0) * training.enrolled).toLocaleString()}</div></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => setViewTraining(training)}><Eye className="mr-2 h-4 w-4" />View</Button>
                      <Button variant="outline" size="sm" onClick={() => openAttendees(training)}><Users className="mr-2 h-4 w-4" />Attendees</Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(training)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(training.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
                {trainings.filter((t) => tab === "all" || t.status === tab).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground"><GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No {tab === "all" ? "" : tab} trainings</p></div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>

      {/* View Training Dialog */}
      <Dialog open={!!viewTraining} onOpenChange={(o) => { if (!o) setViewTraining(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewTraining && (
            <>
              <DialogHeader>
                <DialogTitle>{viewTraining.title}</DialogTitle>
                <DialogDescription>Training program details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label className="text-muted-foreground">Description</Label><p className="mt-1">{viewTraining.description}</p></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Type</Label><p className="mt-1 capitalize">{viewTraining.type}{viewTraining.type === "paid" && ` — $${viewTraining.price}`}</p></div>
                  <div><Label className="text-muted-foreground">Status</Label><p className="mt-1 capitalize">{viewTraining.status}</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Format</Label><p className="mt-1 capitalize">{viewTraining.format}</p></div>
                  <div><Label className="text-muted-foreground">Duration</Label><p className="mt-1">{viewTraining.duration || "N/A"}</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Schedule</Label><p className="mt-1">{viewTraining.schedule || "N/A"}</p></div>
                  <div><Label className="text-muted-foreground">Location</Label><p className="mt-1">{viewTraining.location || "N/A"}</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Capacity</Label><p className="mt-1">{viewTraining.enrolled} / {viewTraining.capacity} enrolled</p></div>
                  <div><Label className="text-muted-foreground">Level</Label><p className="mt-1 capitalize">{viewTraining.level || "N/A"}</p></div>
                </div>
                <div><Label className="text-muted-foreground">Topics</Label><div className="flex flex-wrap gap-2 mt-1">{viewTraining.topics.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div></div>
                <div><Label className="text-muted-foreground">Target Audience</Label><p className="mt-1">{viewTraining.targetAudience.join(", ") || "Everyone"}</p></div>
                {viewTraining.type === "paid" && (
                  <div><Label className="text-muted-foreground">Revenue</Label><p className="mt-1 text-lg font-semibold">${((viewTraining.price || 0) * viewTraining.enrolled).toLocaleString()}</p></div>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setViewTraining(null)}>Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Training Dialog */}
      <Dialog open={!!editTraining} onOpenChange={(o) => { if (!o) { setEditTraining(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Training Program</DialogTitle><DialogDescription>Update training details</DialogDescription></DialogHeader>
          {editError && <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">{editError}</div>}
          <div className="space-y-6 py-4">
            <div><Label>Title *</Label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Financial Modeling for Startups" className="mt-2" /></div>
            <div><Label>Description *</Label><Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="What participants will learn..." rows={4} className="mt-2" /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Type *</Label><Select value={formType} onValueChange={(v) => setFormType(v as any)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
              {formType === "paid" && <div><Label>Price (USD)</Label><div className="relative mt-2"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number" placeholder="499" className="pl-10" /></div></div>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Format *</Label><Select value={formFormat} onValueChange={setFormFormat}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="in-person">In-Person</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select></div>
              <div><Label>Duration *</Label><Input value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="e.g., 4 weeks" className="mt-2" /></div>
            </div>
            <div><Label>Schedule *</Label><Input value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} placeholder="e.g., Every Tuesday, 6-8 PM EST" className="mt-2" /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Location</Label><Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="City, State" className="mt-2" /></div>
              <div><Label>Capacity *</Label><Input value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} type="number" placeholder="50" className="mt-2" /></div>
            </div>
            <div><Label>Level</Label><Select value={formLevel} onValueChange={setFormLevel}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
            <div><Label>Target Audience *</Label><div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" checked={formAudienceInvestors} onChange={(e) => setFormAudienceInvestors(e.target.checked)} /><span className="text-sm">Investors</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" checked={formAudienceStartups} onChange={(e) => setFormAudienceStartups(e.target.checked)} /><span className="text-sm">Startups</span></label>
            </div></div>
            <div><Label>Topics (comma-separated)</Label><Input value={formTopics} onChange={(e) => setFormTopics(e.target.value)} placeholder="Financial Modeling, Revenue Forecasting" className="mt-2" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTraining(null); resetForm(); }} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isEditing}>{isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={!!attendeesTraining} onOpenChange={(o) => { if (!o) { setAttendeesTraining(null); setAttendees([]); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {attendeesTraining && (
            <>
              <DialogHeader>
                <DialogTitle>Attendees — {attendeesTraining.title}</DialogTitle>
                <DialogDescription>{attendeesTraining.enrolled} / {attendeesTraining.capacity} enrolled</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isLoadingAttendees ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : attendees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-50" /><p>No attendees yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {attendees.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">User {a.userId.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">Enrolled {new Date(a.enrolledAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{a.progress}%</div>
                          <div className="w-20 h-2 bg-muted rounded-full mt-1"><div className="h-full bg-accent rounded-full" style={{ width: `${a.progress}%` }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setAttendeesTraining(null); setAttendees([]); }}>Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
