import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Users,
  Search,
  Globe,
  Lock,
  DollarSign,
  Signal,
  Loader2,
  LogIn,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { browseGroups, joinAdvisorGroup, leaveAdvisorGroup } from "@/app/lib/api";
import { CheckoutDialog } from "@/app/components/shared/CheckoutDialog";
import type { BrowseGroup } from "@/app/lib/api";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General Advisory" },
  { value: "FinTech", label: "FinTech" },
  { value: "HealthTech", label: "HealthTech" },
  { value: "SaaS", label: "SaaS" },
  { value: "Fundraising", label: "Fundraising" },
  { value: "Financial Planning", label: "Financial Planning" },
  { value: "Growth Strategy", label: "Growth Strategy" },
];

export function BrowseGroupsPage({ userRole }: { userRole: "startup" | "investor" }) {
  const { session, user } = useAuth();
  const [groups, setGroups] = useState<BrowseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState<"all" | "free" | "paid">("all");
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [checkoutGroup, setCheckoutGroup] = useState<BrowseGroup | null>(null);

  const userName = user?.fullName ?? "User";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const res = await browseGroups(session!.token);
        if (active) setGroups(res.groups);
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : "Could not load groups. Please try again.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const handleJoin = async (groupId: string) => {
    if (!session?.token) return;
    const group = groups.find((g) => g.id === groupId);
    if (group?.isPaid && parseFloat(group.joiningFee || "0") > 0) {
      setCheckoutGroup(group);
      return;
    }
    setJoiningGroupId(groupId);
    try {
      await joinAdvisorGroup(session.token, groupId);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g
        )
      );
    } catch {
      // ignore
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleGroupPaymentSuccess = () => {
    if (checkoutGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === checkoutGroup.id ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g
        )
      );
      setCheckoutGroup(null);
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!session?.token || !confirm("Leave this group?")) return;
    setJoiningGroupId(groupId);
    try {
      await leaveAdvisorGroup(session.token, groupId);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, isJoined: false, memberCount: Math.max(0, g.memberCount - 1) }
            : g
        )
      );
    } catch {
      // ignore
    } finally {
      setJoiningGroupId(null);
    }
  };

  const filtered = groups.filter((g) => {
    if (categoryFilter !== "all" && g.category !== categoryFilter) return false;
    if (paidFilter === "free" && g.isPaid) return false;
    if (paidFilter === "paid" && !g.isPaid) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.advisorName.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter, paidFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedGroups = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const joinedCount = groups.filter((g) => g.isJoined).length;
  const freeCount = groups.filter((g) => !g.isPaid).length;
  const paidCount = groups.filter((g) => g.isPaid).length;

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Browse Advisory Groups</h1>
          <p className="text-muted-foreground">
            Discover and join advisory groups for investment signals and expert insights
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Available Groups</div>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{groups.length}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Joined</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{joinedCount}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Free Groups</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{freeCount}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Paid Groups</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{paidCount}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups by name, advisor, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paidFilter} onValueChange={(v) => setPaidFilter(v as "all" | "free" | "paid")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Groups Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGroups.map((group) => (
              <Card
                key={group.id}
                className="p-6 hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex gap-1">
                    {group.isPaid ? (
                      <Badge variant="default" className="gap-1 bg-accent">
                        <DollarSign className="h-3 w-3" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-500/30">
                        Free
                      </Badge>
                    )}
                    {group.isJoined && (
                      <Badge variant="default" className="gap-1 bg-emerald-600">
                        Joined
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                  {group.description || "No description provided."}
                </p>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline">{group.category}</Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <UserCircle className="h-4 w-4" />
                  <span>by {group.advisorName}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Signal className="h-4 w-4" />
                    {group.signalCount} signals
                  </span>
                </div>

                {group.isPaid && (
                  <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                    {group.joiningFee && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${group.joiningFee} to join
                      </span>
                    )}
                    {group.monthlyFee && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${group.monthlyFee}/month
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t">
                  {group.isJoined ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleLeave(group.id)}
                      disabled={joiningGroupId === group.id}
                    >
                      {joiningGroupId === group.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      Leave Group
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleJoin(group.id)}
                      disabled={joiningGroupId === group.id}
                    >
                      {joiningGroupId === group.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      Join Group
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} groups
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <Button key={pageNum} variant={pageNum === currentPage ? "default" : "outline"} size="sm" className="w-9" onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && loadError && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <h3 className="font-semibold mb-2">Could not load groups</h3>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            <Button variant="outline" onClick={() => { setLoadError(null); setIsLoading(true); browseGroups(session!.token).then(res => setGroups(res.groups)).catch(() => setLoadError("Still unable to load groups.")).finally(() => setIsLoading(false)); }}>
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !loadError && filtered.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No groups found</h3>
            <p className="text-sm text-muted-foreground">
              {groups.length === 0
                ? "No public advisory groups are available yet."
                : "Try adjusting your search or filters."}
            </p>
          </Card>
        )}
      </div>

      {checkoutGroup && (
        <CheckoutDialog
          open={!!checkoutGroup}
          onClose={() => setCheckoutGroup(null)}
          onSuccess={handleGroupPaymentSuccess}
          itemType="group_join"
          itemId={checkoutGroup.id}
          itemName={checkoutGroup.name}
          amount={parseFloat(checkoutGroup.joiningFee || "0")}
        />
      )}
    </div>
  );
}
