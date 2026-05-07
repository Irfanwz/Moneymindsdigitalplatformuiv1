import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import {
  Signal,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Image as ImageIcon,
  Paperclip,
  Send,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { listAdvisorGroups, createAdvisorSignal } from "@/app/lib/api";
import type { AdvisorGroup } from "@/app/types/advisor-groups";

export function CreatePostSignalPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { session, user } = useAuth();
  const [postType, setPostType] = useState<"post" | "signal">("signal");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Groups loaded from API
  const [groups, setGroups] = useState<AdvisorGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupId ?? "");
  const [signalType, setSignalType] = useState<"buy" | "sell" | "hold" | "alert">("buy");
  const [targetPrice, setTargetPrice] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [notifyMembers, setNotifyMembers] = useState(true);

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const response = await listAdvisorGroups(session!.token);
        if (active) {
          setGroups(response.groups);
          if (groupId && response.groups.some((g) => g.id === groupId)) {
            setSelectedGroup(groupId);
          }
        }
      } catch {
        // empty
      } finally {
        if (active) setGroupsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token, groupId]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!session?.token || !selectedGroup) return;
    setIsPublishing(true);
    setError(null);
    try {
      await createAdvisorSignal(session.token, selectedGroup, {
        postType,
        title,
        content,
        signalType: postType === "signal" ? signalType : "",
        targetPrice: postType === "signal" ? targetPrice : "",
        timeHorizon: postType === "signal" ? timeHorizon : "",
        confidenceLevel: postType === "signal" ? confidenceLevel : "",
        tags,
        notifyMembers,
      });
      navigate("/advisor/groups");
    } catch (err: any) {
      setError(err?.message ?? "Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case "buy": return "bg-green-100 text-green-700 border-green-200";
      case "sell": return "bg-red-100 text-red-700 border-red-200";
      case "hold": return "bg-blue-100 text-blue-700 border-blue-200";
      case "alert": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Create New Content</h1>
          <p className="text-muted-foreground">Share investment signals and insights with your groups</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">{error}</div>
        )}

        <Tabs value={postType} onValueChange={(value) => setPostType(value as "post" | "signal")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signal" className="gap-2"><Signal className="h-4 w-4" />Investment Signal</TabsTrigger>
            <TabsTrigger value="post" className="gap-2"><MessageSquare className="h-4 w-4" />General Post</TabsTrigger>
          </TabsList>

          {/* Investment Signal Form */}
          <TabsContent value="signal" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Signal className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Investment Signal Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Signal Type *</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {([
                      { value: "buy", label: "Buy", icon: TrendingUp },
                      { value: "sell", label: "Sell", icon: TrendingDown },
                      { value: "hold", label: "Hold", icon: Minus },
                      { value: "alert", label: "Alert", icon: AlertCircle },
                    ] as const).map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSignalType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                            signalType === type.value ? getSignalColor(type.value) + " border-current" : "border-border hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="font-medium text-sm">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="signal-title">Signal Title *</Label>
                  <Input id="signal-title" placeholder="e.g., Strong Buy Signal: FinTech Sector Growth" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="group">Post to Group *</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger id="group" className="mt-2"><SelectValue placeholder={groupsLoading ? "Loading groups..." : "Select a group"} /></SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.name} ({group.memberCount} members)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="signal-content">Analysis & Reasoning *</Label>
                  <Textarea id="signal-content" placeholder="Provide detailed analysis, data points, and reasoning behind this signal..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-2" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="target-price">Target Price/Valuation</Label>
                    <Input id="target-price" placeholder="e.g., $50M - $75M" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="time-horizon">Time Horizon</Label>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                      <SelectTrigger id="time-horizon" className="mt-2"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short-term (0-3 months)</SelectItem>
                        <SelectItem value="medium">Medium-term (3-12 months)</SelectItem>
                        <SelectItem value="long">Long-term (1+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence Level</Label>
                    <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
                      <SelectTrigger id="confidence" className="mt-2"><SelectValue placeholder="Select confidence" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Confidence</SelectItem>
                        <SelectItem value="medium">Medium Confidence</SelectItem>
                        <SelectItem value="high">High Confidence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input id="tags" placeholder="Add tags (e.g., FinTech, Series-A)" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} />
                    <Button type="button" onClick={handleAddTag}>Add</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>{tag}<X className="h-3 w-3" /></Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Attachments</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <Button variant="outline" className="justify-start"><ImageIcon className="mr-2 h-4 w-4" />Add Images</Button>
                    <Button variant="outline" className="justify-start"><Paperclip className="mr-2 h-4 w-4" />Attach Files</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* General Post Form */}
          <TabsContent value="post" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Post Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="post-title">Post Title *</Label>
                  <Input id="post-title" placeholder="e.g., Key Takeaways from Q4 Market Analysis" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="post-group">Post to Group *</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger id="post-group" className="mt-2"><SelectValue placeholder={groupsLoading ? "Loading groups..." : "Select a group"} /></SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.name} ({group.memberCount} members)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="post-content">Content *</Label>
                  <Textarea id="post-content" placeholder="Share your insights, advice, or updates..." value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="post-tags">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input id="post-tags" placeholder="Add tags" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} />
                    <Button type="button" onClick={handleAddTag}>Add</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>{tag}<X className="h-3 w-3" /></Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Attachments</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <Button variant="outline" className="justify-start"><ImageIcon className="mr-2 h-4 w-4" />Add Images</Button>
                    <Button variant="outline" className="justify-start"><Paperclip className="mr-2 h-4 w-4" />Attach Files</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Publishing Options */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Publishing Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Notify Group Members</div>
                <div className="text-sm text-muted-foreground">Send notification to all group members</div>
              </div>
              <Switch checked={notifyMembers} onCheckedChange={setNotifyMembers} />
            </div>
            {postType === "signal" && (
              <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="font-medium text-accent mb-1">Investment Signal Disclaimer</div>
                    <p className="text-sm text-muted-foreground">By publishing this signal, you confirm that this is educational content and not financial advice.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/advisor/groups")} disabled={isPublishing}>
            <X className="mr-2 h-4 w-4" />Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline"><Eye className="mr-2 h-4 w-4" />Preview</Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isPublishing ? "Publishing..." : `Publish ${postType === "signal" ? "Signal" : "Post"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
