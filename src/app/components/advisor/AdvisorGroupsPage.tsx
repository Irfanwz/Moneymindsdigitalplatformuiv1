import { useState } from "react";
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
  MoreVertical,
  MessageSquare,
  Signal,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  signalCount: number;
  isPrivate: boolean;
  category: string;
  createdAt: string;
  isPaid?: boolean;
  joiningFee?: number;
  monthlyFee?: number;
}

export function AdvisorGroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("general");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [joiningFee, setJoiningFee] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");

  // Mock groups data
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "FinTech Investment Signals",
      description:
        "Exclusive insights and signals for FinTech investments. Weekly analysis and emerging opportunities.",
      memberCount: 245,
      signalCount: 127,
      isPrivate: false,
      category: "FinTech",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Series A Fundraising Strategy",
      description:
        "Private group for founders raising Series A. Strategic advice, pitch deck reviews, and investor introductions.",
      memberCount: 89,
      signalCount: 56,
      isPrivate: true,
      category: "Fundraising",
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "SaaS Financial Planning",
      description:
        "Financial planning strategies specifically for SaaS startups. Metrics, forecasting, and growth planning.",
      memberCount: 312,
      signalCount: 203,
      isPrivate: false,
      category: "SaaS",
      createdAt: "2023-11-10",
    },
  ]);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: newGroupName,
        description: newGroupDescription,
        memberCount: 0,
        signalCount: 0,
        isPrivate,
        category: newGroupCategory,
        createdAt: new Date().toISOString().split("T")[0],
        isPaid,
        joiningFee: isPaid ? parseFloat(joiningFee) : undefined,
        monthlyFee: isPaid ? parseFloat(monthlyFee) : undefined,
      };
      setGroups([newGroup, ...groups]);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupCategory("general");
      setIsPrivate(false);
      setIsPaid(false);
      setJoiningFee("");
      setMonthlyFee("");
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName="Dr. Sarah Chen" />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Groups</h1>
              <p className="text-muted-foreground">
                Manage your advisory groups and post investment signals
              </p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a group to share investment signals and advice with your
                    audience
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input
                      id="group-name"
                      placeholder="e.g., FinTech Investment Signals"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="group-description">Description *</Label>
                    <Textarea
                      id="group-description"
                      placeholder="Describe the purpose and focus of this group..."
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="group-category">Category</Label>
                    <Select
                      value={newGroupCategory}
                      onValueChange={setNewGroupCategory}
                    >
                      <SelectTrigger id="group-category" className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Advisory</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Fundraising">Fundraising</SelectItem>
                        <SelectItem value="Financial Planning">
                          Financial Planning
                        </SelectItem>
                        <SelectItem value="Growth Strategy">
                          Growth Strategy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {isPrivate ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                        {isPrivate ? "Private Group" : "Public Group"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isPrivate
                          ? "Only invited members can join"
                          : "Anyone can join this group"}
                      </div>
                    </div>
                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {isPaid ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        {isPaid ? "Paid Group" : "Free Group"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isPaid
                          ? "Members need to pay to join"
                          : "Anyone can join this group for free"}
                      </div>
                    </div>
                    <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                  </div>

                  {isPaid && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="joining-fee">Joining Fee</Label>
                        <Input
                          id="joining-fee"
                          placeholder="e.g., 50"
                          value={joiningFee}
                          onChange={(e) => setJoiningFee(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="monthly-fee">Monthly Fee</Label>
                        <Input
                          id="monthly-fee"
                          placeholder="e.g., 10"
                          value={monthlyFee}
                          onChange={(e) => setMonthlyFee(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>Create Group</Button>
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
            <div className="text-2xl font-semibold">
              {groups.reduce((sum, g) => sum + g.memberCount, 0)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Signals</div>
              <Signal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">
              {groups.reduce((sum, g) => sum + g.signalCount, 0)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Engagement</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-accent">+23%</div>
          </Card>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* Group Icon */}
                <div className="h-16 w-16 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-8 w-8 text-accent" />
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        {group.isPrivate ? (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            Public
                          </Badge>
                        )}
                        {group.isPaid && (
                          <Badge variant="default" className="gap-1 bg-accent">
                            <DollarSign className="h-3 w-3" />
                            Paid
                          </Badge>
                        )}
                        <Badge variant="outline">{group.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {group.description}
                      </p>
                      {group.isPaid && (
                        <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                          {group.joiningFee && group.joiningFee > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${group.joiningFee} joining fee
                            </span>
                          )}
                          {group.monthlyFee && group.monthlyFee > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${group.monthlyFee}/month
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Group Stats */}
                  <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.memberCount} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="h-4 w-4" />
                      {group.signalCount} signals
                    </span>
                    <span>Created {group.createdAt}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Link to={`/advisor/groups/${group.id}/create-signal`}>
                      <Button variant="default" size="sm">
                        <Signal className="mr-2 h-4 w-4" />
                        Post Signal
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Posts
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Members
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first group to start sharing investment signals and advice
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}