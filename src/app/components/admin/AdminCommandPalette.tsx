import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  Cpu,
  Flame,
  Search,
  ArrowRight,
  Clock,
  AlertCircle,
  FileCheck,
  BarChart3,
  TrendingUp,
  Microscope,
  Sun,
  Moon,
  User,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/app/components/ui/command";
import { useTheme } from "@/app/contexts/ThemeContext";
import { request } from "@/app/lib/api";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Search users dynamically if query is 2+ characters
  useEffect(() => {
    if (!open) {
      setQuery("");
      setUserResults([]);
      return;
    }
    if (query.trim().length < 2) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingUsers(true);
      request<{ users: any[] }>(`/api/admin/console/users?q=${encodeURIComponent(query.trim())}`)
        .then((res) => {
          if (res?.users) {
            setUserResults(res.users.slice(0, 5));
          }
        })
        .catch(() => {})
        .finally(() => setIsSearchingUsers(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Admin Command Palette"
      description="Quick search and keyboard navigation across all MoneyMinds administrative workspaces."
    >
      <CommandInput
        placeholder="Type a command, section, or search users..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No matching administrative commands or records found.</CommandEmpty>

        {/* Dynamic User Search Results */}
        {userResults.length > 0 && (
          <CommandGroup heading="Matching Accounts">
            {userResults.map((u) => (
              <CommandItem
                key={u.id}
                onSelect={() => handleSelect(`/admin/users?q=${encodeURIComponent(u.fullName || u.email)}`)}
                className="flex items-center justify-between cursor-pointer py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-200 dark:border-cyan-800/60">
                    {(u.fullName || u.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                      {u.fullName || "Unnamed User"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {u.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                      u.status === "approved"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        : u.status === "pending"
                        ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {u.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Quick Workflow Filters */}
        <CommandGroup heading="Priority Workspaces">
          <CommandItem
            onSelect={() => handleSelect("/admin/users?status=pending")}
            className="cursor-pointer py-2"
          >
            <Clock className="w-4 h-4 mr-2 text-cyan-500" />
            <span>Pending User Applications</span>
            <CommandShortcut>Review 5</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/reviews")}
            className="cursor-pointer py-2"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-500" />
            <span>Applicant Vetting &amp; Background Evidence</span>
            <CommandShortcut>Review 23</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents?status=failed")}
            className="cursor-pointer py-2"
          >
            <AlertCircle className="w-4 h-4 mr-2 text-rose-500" />
            <span>Failed AI Diligence Runs</span>
            <CommandShortcut>21 Failed</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation Core Workspaces */}
        <CommandGroup heading="Platform Operations">
          <CommandItem
            onSelect={() => handleSelect("/admin/dashboard")}
            className="cursor-pointer py-2"
          >
            <LayoutDashboard className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Executive Overview</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/users")}
            className="cursor-pointer py-2"
          >
            <Users className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>User Directory &amp; Accounts</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/reviews")}
            className="cursor-pointer py-2"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Applicant Vetting &amp; Human Adjudication</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/content")}
            className="cursor-pointer py-2"
          >
            <Layers className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Content Moderation (Groups, Signals, Trainings)</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* AI & Diligence Workspaces */}
        <CommandGroup heading="AI Diligence Engines">
          <CommandItem
            onSelect={() => handleSelect("/admin/agents")}
            className="cursor-pointer py-2"
          >
            <Activity className="w-4 h-4 mr-2 text-cyan-500" />
            <span>All AI Diligence Operations</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/verification")}
            className="cursor-pointer py-2"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Background Check Agents</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/due-diligence")}
            className="cursor-pointer py-2"
          >
            <Search className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Venture Due Diligence Reports</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/documents")}
            className="cursor-pointer py-2"
          >
            <FileCheck className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Document Verification &amp; OCR</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/signals")}
            className="cursor-pointer py-2"
          >
            <BarChart3 className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Market Signal Analysis &amp; Sentiment</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/predictions")}
            className="cursor-pointer py-2"
          >
            <TrendingUp className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Prediction Accuracy &amp; Credibility Audit</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/agents/research")}
            className="cursor-pointer py-2"
          >
            <Microscope className="w-4 h-4 mr-2 text-cyan-500/80" />
            <span>Sector Research Intelligence</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Finance & Platform Governance */}
        <CommandGroup heading="Finance & Governance">
          <CommandItem
            onSelect={() => handleSelect("/admin/payments")}
            className="cursor-pointer py-2"
          >
            <CreditCard className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Transactions &amp; Escrow</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/reports")}
            className="cursor-pointer py-2"
          >
            <ChartNoAxesCombined className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Audit &amp; Compliance Reports</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/settings")}
            className="cursor-pointer py-2"
          >
            <Settings className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Platform Governance &amp; Security Controls</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/ai-config")}
            className="cursor-pointer py-2"
          >
            <Cpu className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>AI Engine Configuration &amp; Providers</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/token-report")}
            className="cursor-pointer py-2"
          >
            <Flame className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>Token Usage &amp; Cost Telemetry</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect("/admin/profile")}
            className="cursor-pointer py-2"
          >
            <User className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span>My Profile &amp; Security Credentials</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme Action */}
        <CommandGroup heading="Quick Controls">
          <CommandItem
            onSelect={() => {
              toggleTheme();
              onOpenChange(false);
            }}
            className="cursor-pointer py-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 mr-2 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 mr-2 text-blue-500" />
            )}
            <span>Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
