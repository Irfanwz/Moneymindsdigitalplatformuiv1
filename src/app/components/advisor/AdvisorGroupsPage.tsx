import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import {
  Users,
  Plus,
  TrendingUp,
  Lock,
  Globe,
  Settings,
  MessageSquare,
  Signal,
  DollarSign,
  CreditCard,
  Loader2,
  Trash2,
  Edit2,
  FileText,
  X,
  ArrowLeft,
  ThumbsUp,
  Lightbulb,
  TrendingDown,
  Send,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  listAdvisorGroups,
  createAdvisorGroup,
  deleteAdvisorGroup,
  updateAdvisorGroup,
  listAdvisorSignals,
  deleteAdvisorSignal,
  updateAdvisorSignal,
  listGroupMembers,
  removeGroupMember,
  listSignalComments,
  createSignalComment,
  deleteSignalComment,
  listSignalReactions,
  toggleSignalReaction,
} from "@/app/lib/api";
import type { GroupMember, SignalComment, SignalReaction } from "@/app/lib/api";
import type { AdvisorGroup, AdvisorSignal } from "@/app/types/advisor-groups";
import { PredictionBadge } from "@/app/components/signals/PredictionBadge";

const REACTION_CONFIG = [
  { key: "like", icon: ThumbsUp, label: "Like" },
  { key: "insightful", icon: Lightbulb, label: "Insightful" },
  { key: "bullish", icon: TrendingUp, label: "Bullish" },
  { key: "bearish", icon: TrendingDown, label: "Bearish" },
] as const;

function SignalCardWithComments({
  signal,
  token,
  currentUserId,
  onEdit,
  onDelete,
}: {
  signal: AdvisorSignal;
  token: string;
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [comments, setComments] = useState<SignalComment[]>([]);
  const [reactions, setReactions] = useState<SignalReaction[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      const [commentsRes, reactionsRes] = await Promise.all([
        listSignalComments(token, signal.id),
        listSignalReactions(token, signal.id),
      ]);
      setComments(commentsRes.comments);
      setReactions(reactionsRes.reactions);
      setCommentsLoaded(true);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (token) {
      // Load reactions eagerly (counts shown), comments lazily
      listSignalReactions(token, signal.id)
        .then((res) => setReactions(res.reactions))
        .catch(() => {});
    }
  }, [token, signal.id]);

  const toggleComments = () => {
    if (!showComments && !commentsLoaded) {
      listSignalComments(token, signal.id)
        .then((res) => { setComments(res.comments); setCommentsLoaded(true); })
        .catch(() => {});
    }
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await createSignalComment(token, signal.id, newComment.trim());
      setComments((prev) => [...prev, res.comment]);
      setNewComment("");
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    try {
      await deleteSignalComment(token, signal.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // ignore
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!token) return;
    try {
      const res = await toggleSignalReaction(token, signal.id, reactionType);
      if (res.added) {
        setReactions((prev) => [...prev, { id: "", signalId: signal.id, userId: currentUserId, reaction: reactionType as SignalReaction["reaction"], createdAt: new Date().toISOString() }]);
      } else {
        setReactions((prev) => prev.filter((r) => !(r.userId === currentUserId && r.reaction === reactionType)));
      }
    } catch {
      // ignore
    }
  };

  const reactionCounts = REACTION_CONFIG.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.reaction === r.key).length,
    active: reactions.some((rx) => rx.reaction === r.key && rx.userId === currentUserId),
  }));

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{signal.title}</h3>
            <Badge variant={signal.postType === "signal" ? "default" : "outline"}>
              {signal.postType === "signal" ? "Signal" : "Post"}
            </Badge>
            {signal.signalType && (
              <Badge variant="outline" className={
                signal.signalType === "buy" ? "border-green-500 text-green-600" :
                signal.signalType === "sell" ? "border-red-500 text-red-600" :
                signal.signalType === "hold" ? "border-yellow-500 text-yellow-600" :
                "border-blue-500 text-blue-600"
              }>
                {signal.signalType.toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{signal.content}</p>

          {signal.attachments && signal.attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Attachments ({signal.attachments.length})</p>
              <div className="space-y-1">
                {signal.attachments.map((att) => (
                  <a
                    key={att.filename}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-accent hover:underline p-2 bg-muted/50 rounded"
                  >
                    {att.type === "image" ? (
                      <span>🖼️</span>
                    ) : (
                      <span>📎</span>
                    )}
                    {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{new Date(signal.createdAt).toLocaleString()}</span>
            {signal.targetPrice && <span>Target: ${signal.targetPrice}</span>}
            {signal.timeHorizon && <span>Horizon: {signal.timeHorizon}</span>}
            {signal.confidenceLevel && <span>Confidence: {signal.confidenceLevel}</span>}
          </div>
          {signal.tags?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {signal.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          {/* Prediction accuracy badge */}
          <div className="mt-2">
            <PredictionBadge signal={signal} compact />
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Reactions Bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {reactionCounts.map((r) => {
          const Icon = r.icon;
          return (
            <Button
              key={r.key}
              variant={r.active ? "default" : "outline"}
              size="sm"
              className={`gap-1.5 text-xs ${r.active ? "" : ""}`}
              onClick={() => handleReaction(r.key)}
            >
              <Icon className="h-3.5 w-3.5" />
              {r.label}
              {r.count > 0 && <span className="ml-0.5 font-semibold">{r.count}</span>}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto gap-1.5 text-xs"
          onClick={toggleComments}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Comments{commentsLoaded ? ` (${comments.length})` : ""}
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-border space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 group">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                </div>
                {(comment.userId === currentUserId || signal.advisorId === currentUserId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No comments yet. Be the first to comment.</p>
          )}

          {/* Add Comment */}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={posting || !newComment.trim()}
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

const CATEGORIES = [
  { value: "general", label: "General Advisory" },
  { value: "FinTech", label: "FinTech" },
  { value: "HealthTech", label: "HealthTech" },
  { value: "SaaS", label: "SaaS" },
  { value: "Fundraising", label: "Fundraising" },
  { value: "Financial Planning", label: "Financial Planning" },
  { value: "Growth Strategy", label: "Growth Strategy" },
];

export function AdvisorGroupsPage() {
  const { session, user } = useAuth();
  const [groups, setGroups] = useState<AdvisorGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingGroup, setEditingGroup] = useState<AdvisorGroup | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Signal feed state
  const [viewingGroup, setViewingGroup] = useState<AdvisorGroup | null>(null);
  const [groupSignals, setGroupSignals] = useState<AdvisorSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);

  // Edit signal state
  const [editingSignal, setEditingSignal] = useState<AdvisorSignal | null>(null);
  const [isEditSignalOpen, setIsEditSignalOpen] = useState(false);
  const [isSavingSignal, setIsSavingSignal] = useState(false);
  const [editSignalTitle, setEditSignalTitle] = useState("");
  const [editSignalContent, setEditSignalContent] = useState("");
  const [editSignalType, setEditSignalType] = useState("");
  const [editSignalTargetPrice, setEditSignalTargetPrice] = useState("");
  const [editSignalTimeHorizon, setEditSignalTimeHorizon] = useState("");
  const [editSignalConfidence, setEditSignalConfidence] = useState("");
  const [editSignalTags, setEditSignalTags] = useState<string[]>([]);
  const [editSignalCurrentTag, setEditSignalCurrentTag] = useState("");

  // Member management state
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // Create form state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("general");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [joiningFee, setJoiningFee] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editJoiningFee, setEditJoiningFee] = useState("");
  const [editMonthlyFee, setEditMonthlyFee] = useState("");

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const response = await listAdvisorGroups(session!.token);
        if (active) setGroups(response.groups);
      } catch {
        // empty
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const resetForm = () => {
    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupCategory("general");
    setIsPrivate(false);
    setIsPaid(false);
    setJoiningFee("");
    setMonthlyFee("");
    setError(null);
  };

  const handleCreateGroup = async () => {
    if (!session?.token || !newGroupName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const response = await createAdvisorGroup(session.token, {
        name: newGroupName,
        description: newGroupDescription,
        category: newGroupCategory,
        isPrivate,
        isPaid,
        joiningFee: isPaid ? joiningFee : "",
        monthlyFee: isPaid ? monthlyFee : "",
      });
      setGroups((prev) => [response.group, ...prev]);
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create group.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!session?.token || !confirm("Are you sure you want to delete this group?")) return;
    try {
      await deleteAdvisorGroup(session.token, groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch {
      // ignore
    }
  };

  const openEditDialog = (group: AdvisorGroup) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditDescription(group.description);
    setEditCategory(group.category);
    setEditIsPrivate(group.isPrivate);
    setEditIsPaid(group.isPaid);
    setEditJoiningFee(group.joiningFee || "");
    setEditMonthlyFee(group.monthlyFee || "");
    setError(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!session?.token || !editingGroup || !editName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await updateAdvisorGroup(session.token, editingGroup.id, {
        name: editName,
        description: editDescription,
        category: editCategory,
        isPrivate: editIsPrivate,
        isPaid: editIsPaid,
        joiningFee: editIsPaid ? editJoiningFee : "",
        monthlyFee: editIsPaid ? editMonthlyFee : "",
      });
      setGroups((prev) => prev.map((g) => g.id === editingGroup.id ? response.group : g));
      setIsEditDialogOpen(false);
      setEditingGroup(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update group.");
    } finally {
      setIsSaving(false);
    }
  };

  const openSignalFeed = async (group: AdvisorGroup) => {
    if (!session?.token) return;
    setViewingGroup(group);
    setSignalsLoading(true);
    try {
      const response = await listAdvisorSignals(session.token, group.id);
      setGroupSignals(response.signals);
    } catch {
      setGroupSignals([]);
    } finally {
      setSignalsLoading(false);
    }
  };

  const handleDeleteSignal = async (signalId: string) => {
    if (!session?.token || !viewingGroup || !confirm("Delete this signal?")) return;
    try {
      await deleteAdvisorSignal(session.token, viewingGroup.id, signalId);
      setGroupSignals((prev) => prev.filter((s) => s.id !== signalId));
    } catch {
      // ignore
    }
  };

  const openEditSignal = (signal: AdvisorSignal) => {
    setEditingSignal(signal);
    setEditSignalTitle(signal.title);
    setEditSignalContent(signal.content);
    setEditSignalType(signal.signalType || "");
    setEditSignalTargetPrice(signal.targetPrice || "");
    setEditSignalTimeHorizon(signal.timeHorizon || "");
    setEditSignalConfidence(signal.confidenceLevel || "");
    setEditSignalTags(signal.tags ? [...signal.tags] : []);
    setEditSignalCurrentTag("");
    setError(null);
    setIsEditSignalOpen(true);
  };

  const handleUpdateSignal = async () => {
    if (!session?.token || !editingSignal || !viewingGroup) return;
    setIsSavingSignal(true);
    setError(null);
    try {
      const res = await updateAdvisorSignal(session.token, viewingGroup.id, editingSignal.id, {
        postType: editingSignal.postType,
        title: editSignalTitle,
        content: editSignalContent,
        signalType: editSignalType,
        targetPrice: editSignalTargetPrice,
        timeHorizon: editSignalTimeHorizon,
        confidenceLevel: editSignalConfidence,
        tags: editSignalTags,
        notifyMembers: false,
      });
      setGroupSignals((prev) => prev.map((s) => s.id === editingSignal.id ? res.signal : s));
      setIsEditSignalOpen(false);
      setEditingSignal(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update signal.");
    } finally {
      setIsSavingSignal(false);
    }
  };

  const closeSignalFeed = () => {
    setViewingGroup(null);
    setGroupSignals([]);
    setShowMembers(false);
    setGroupMembers([]);
  };

  const loadMembers = async (groupId: string) => {
    if (!session?.token) return;
    setMembersLoading(true);
    try {
      const res = await listGroupMembers(session.token, groupId);
      setGroupMembers(res.members);
    } catch {
      setGroupMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!session?.token || !viewingGroup || !confirm(`Remove ${userName} from this group?`)) return;
    try {
      await removeGroupMember(session.token, viewingGroup.id, userId);
      setGroupMembers((prev) => prev.filter((m) => m.userId !== userId));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === viewingGroup.id ? { ...g, memberCount: Math.max(0, g.memberCount - 1) } : g
        )
      );
      setViewingGroup((prev) =>
        prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : prev
      );
    } catch {
      // ignore
    }
  };

  const toggleMembersView = () => {
    if (!showMembers && viewingGroup) {
      loadMembers(viewingGroup.id);
    }
    setShowMembers((prev) => !prev);
  };

  // If viewing a group's signal feed, show that view
  if (viewingGroup) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="advisor" userName={userName} />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={closeSignalFeed} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold mb-2">{viewingGroup.name}</h1>
                <p className="text-muted-foreground">{viewingGroup.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">{viewingGroup.category}</Badge>
                  <span className="text-sm text-muted-foreground">{viewingGroup.memberCount} members</span>
                  {viewingGroup.isPaid && (
                    <Badge variant="default" className="bg-accent">
                      <DollarSign className="h-3 w-3 mr-1" />Paid
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/advisor/groups/${viewingGroup.id}/create-signal`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </Link>
                <Link to={`/advisor/groups/${viewingGroup.id}/predictions`}>
                  <Button variant="outline">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Predictions
                  </Button>
                </Link>
                <Button variant={showMembers ? "default" : "outline"} onClick={toggleMembersView}>
                  <Users className="mr-2 h-4 w-4" />
                  Members
                </Button>
                <Button variant="outline" onClick={() => openEditDialog(viewingGroup)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Group
                </Button>
              </div>
            </div>
          </div>

          {/* Members Panel */}
          {showMembers && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members ({groupMembers.length})
                </h2>
              </div>
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : groupMembers.length > 0 ? (
                <div className="space-y-3">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.userName}</span>
                            <Badge
                              variant={member.role === "admin" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {member.role}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.email} &middot; Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {member.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId, member.userName)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No members yet</p>
                  <p className="text-sm mt-1">Members will appear here when they join this group</p>
                </div>
              )}
            </Card>
          )}

          {/* Signals Feed */}
          {signalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : groupSignals.length > 0 ? (
            <div className="space-y-4">
              {groupSignals
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((signal) => (
                <SignalCardWithComments
                  key={signal.id}
                  signal={signal}
                  token={session?.token || ""}
                  currentUserId={user?.id || ""}
                  onEdit={() => openEditSignal(signal)}
                  onDelete={() => handleDeleteSignal(signal.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No posts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first signal or post for this group</p>
              <Link to={`/advisor/groups/${viewingGroup.id}/create-signal`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Edit Group Dialog (shared) */}
        {renderEditDialog()}

        {/* Edit Signal Dialog */}
        <Dialog open={isEditSignalOpen} onOpenChange={(open) => { setIsEditSignalOpen(open); if (!open) { setEditingSignal(null); setError(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {editingSignal?.postType === "signal" ? "Signal" : "Post"}</DialogTitle>
              <DialogDescription>Update the content of your {editingSignal?.postType === "signal" ? "investment signal" : "post"}</DialogDescription>
            </DialogHeader>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">{error}</div>
            )}
            <div className="space-y-4 py-4">
              <div>
                <Label>Title *</Label>
                <Input value={editSignalTitle} onChange={(e) => setEditSignalTitle(e.target.value)} placeholder="Signal title" className="mt-2" />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea value={editSignalContent} onChange={(e) => setEditSignalContent(e.target.value)} placeholder="Analysis and reasoning..." rows={6} className="mt-2" />
              </div>
              {editingSignal?.postType === "signal" && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Signal Type</Label>
                      <Select value={editSignalType} onValueChange={setEditSignalType}>
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                          <SelectItem value="hold">Hold</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target Price</Label>
                      <Input value={editSignalTargetPrice} onChange={(e) => setEditSignalTargetPrice(e.target.value)} placeholder="e.g., $50M" className="mt-2" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Time Horizon</Label>
                      <Select value={editSignalTimeHorizon} onValueChange={setEditSignalTimeHorizon}>
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short-term (0-3 months)</SelectItem>
                          <SelectItem value="medium">Medium-term (3-12 months)</SelectItem>
                          <SelectItem value="long">Long-term (1+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Confidence Level</Label>
                      <Select value={editSignalConfidence} onValueChange={setEditSignalConfidence}>
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select confidence" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={editSignalCurrentTag} onChange={(e) => setEditSignalCurrentTag(e.target.value)} placeholder="Add tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (editSignalCurrentTag.trim() && !editSignalTags.includes(editSignalCurrentTag.trim())) { setEditSignalTags([...editSignalTags, editSignalCurrentTag.trim()]); setEditSignalCurrentTag(""); } } }} />
                  <Button type="button" onClick={() => { if (editSignalCurrentTag.trim() && !editSignalTags.includes(editSignalCurrentTag.trim())) { setEditSignalTags([...editSignalTags, editSignalCurrentTag.trim()]); setEditSignalCurrentTag(""); } }}>Add</Button>
                </div>
                {editSignalTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editSignalTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1 cursor-pointer" onClick={() => setEditSignalTags(editSignalTags.filter((t) => t !== tag))}>{tag}<X className="h-3 w-3" /></Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditSignalOpen(false); setEditingSignal(null); }} disabled={isSavingSignal}>Cancel</Button>
              <Button onClick={handleUpdateSignal} disabled={isSavingSignal}>
                {isSavingSignal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  function renderGroupForm(
    mode: "create" | "edit",
    nameVal: string, setNameVal: (v: string) => void,
    descVal: string, setDescVal: (v: string) => void,
    catVal: string, setCatVal: (v: string) => void,
    privVal: boolean, setPrivVal: (v: boolean) => void,
    paidVal: boolean, setPaidVal: (v: boolean) => void,
    jFeeVal: string, setJFeeVal: (v: string) => void,
    mFeeVal: string, setMFeeVal: (v: string) => void,
  ) {
    return (
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor={`${mode}-name`}>Group Name *</Label>
          <Input id={`${mode}-name`} placeholder="e.g., FinTech Investment Signals" value={nameVal} onChange={(e) => setNameVal(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor={`${mode}-description`}>Description</Label>
          <Textarea id={`${mode}-description`} placeholder="Describe the purpose and focus of this group..." value={descVal} onChange={(e) => setDescVal(e.target.value)} rows={3} className="mt-2" />
        </div>
        <div>
          <Label htmlFor={`${mode}-category`}>Category</Label>
          <Select value={catVal} onValueChange={setCatVal}>
            <SelectTrigger id={`${mode}-category`} className="mt-2"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <div className="font-medium flex items-center gap-2">
              {privVal ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {privVal ? "Private Group" : "Public Group"}
            </div>
            <div className="text-sm text-muted-foreground">{privVal ? "Only invited members can join" : "Anyone can join this group"}</div>
          </div>
          <Switch checked={privVal} onCheckedChange={setPrivVal} />
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <div className="font-medium flex items-center gap-2">
              {paidVal ? <CreditCard className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
              {paidVal ? "Paid Group" : "Free Group"}
            </div>
            <div className="text-sm text-muted-foreground">{paidVal ? "Members need to pay to join" : "Anyone can join for free"}</div>
          </div>
          <Switch checked={paidVal} onCheckedChange={setPaidVal} />
        </div>
        {paidVal && (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${mode}-joining-fee`}>Joining Fee</Label>
              <Input id={`${mode}-joining-fee`} placeholder="e.g., 50" value={jFeeVal} onChange={(e) => setJFeeVal(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor={`${mode}-monthly-fee`}>Monthly Fee</Label>
              <Input id={`${mode}-monthly-fee`} placeholder="e.g., 10" value={mFeeVal} onChange={(e) => setMFeeVal(e.target.value)} className="mt-2" />
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderEditDialog() {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingGroup(null); setError(null); } }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update your group settings</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">{error}</div>
          )}
          {renderGroupForm("edit", editName, setEditName, editDescription, setEditDescription, editCategory, setEditCategory, editIsPrivate, setEditIsPrivate, editIsPaid, setEditIsPaid, editJoiningFee, setEditJoiningFee, editMonthlyFee, setEditMonthlyFee)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleUpdateGroup} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Groups</h1>
              <p className="text-muted-foreground">Manage your advisory groups and post investment signals</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>Create a group to share investment signals and advice with your audience</DialogDescription>
                </DialogHeader>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">{error}</div>
                )}
                {renderGroupForm("create", newGroupName, setNewGroupName, newGroupDescription, setNewGroupDescription, newGroupCategory, setNewGroupCategory, isPrivate, setIsPrivate, isPaid, setIsPaid, joiningFee, setJoiningFee, monthlyFee, setMonthlyFee)}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>Cancel</Button>
                  <Button onClick={handleCreateGroup} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Group
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
              <div className="text-sm text-muted-foreground">Total Groups</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{groups.length}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Members</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{groups.reduce((sum, g) => sum + g.memberCount, 0)}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Signals</div>
              <Signal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{groups.reduce((sum, g) => sum + g.signalCount, 0)}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Paid Groups</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{groups.filter((g) => g.isPaid).length}</div>
          </Card>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Groups List */}
        {!isLoading && (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          {group.isPrivate ? (
                            <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Private</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" />Public</Badge>
                          )}
                          {group.isPaid && (
                            <Badge variant="default" className="gap-1 bg-accent"><DollarSign className="h-3 w-3" />Paid</Badge>
                          )}
                          <Badge variant="outline">{group.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                        {group.isPaid && (
                          <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                            {group.joiningFee && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${group.joiningFee} joining fee</span>}
                            {group.monthlyFee && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${group.monthlyFee}/month</span>}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{group.memberCount} members</span>
                      <span className="flex items-center gap-1"><Signal className="h-4 w-4" />{group.signalCount} signals</span>
                      <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                      <Link to={`/advisor/groups/${group.id}/create-signal`}>
                        <Button variant="default" size="sm"><Signal className="mr-2 h-4 w-4" />Post Signal</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => openSignalFeed(group)}>
                        <MessageSquare className="mr-2 h-4 w-4" />View Posts
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setViewingGroup(group); setShowMembers(true); loadMembers(group.id); openSignalFeed(group); }}>
                        <Users className="mr-2 h-4 w-4" />Members
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                        <Edit2 className="mr-2 h-4 w-4" />Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                        <Settings className="mr-2 h-4 w-4" />Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && groups.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first group to start sharing investment signals and advice</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {renderEditDialog()}
    </div>
  );
}
