import { Badge } from "@/app/components/ui/badge";
import { Award, CheckCircle2, Shield, Sparkles } from "lucide-react";

type BadgeType = "verified" | "ai-verified" | "due-diligence" | "pending";

interface CredibilityBadgeProps {
  type?: BadgeType;
  label?: string;
  score?: number | null;
  tier?: string | null;
}

const badges: Record<BadgeType, { icon: typeof CheckCircle2; color: string; label: string }> = {
  verified: {
    icon: CheckCircle2,
    color: "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    label: "Verified",
  },
  "ai-verified": {
    icon: Sparkles,
    color: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    label: "AI Verified",
  },
  "due-diligence": {
    icon: Shield,
    color: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    label: "Due Diligence Complete",
  },
  pending: {
    icon: CheckCircle2,
    color: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    label: "Pending",
  },
};

const TIER_BADGE_COLORS: Record<string, string> = {
  elite: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  expert: "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  reliable: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  developing: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  inconsistent: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  poor: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

const TIER_LABELS: Record<string, string> = {
  elite: "Elite Advisor",
  expert: "Expert",
  reliable: "Reliable",
  developing: "Developing",
  inconsistent: "Inconsistent",
  poor: "Poor",
};

export function CredibilityBadge({ type, label, score, tier }: CredibilityBadgeProps) {
  // If a real credibility score + tier is provided, use tier-based styling
  if (typeof score === "number" && score !== null && tier) {
    const color = TIER_BADGE_COLORS[tier] ?? TIER_BADGE_COLORS.developing;
    const tierLabel = TIER_LABELS[tier] ?? tier;
    return (
      <Badge variant="outline" className={`${color} gap-1 font-normal`}>
        <Award className="h-3 w-3" />
        {label ?? `${tierLabel} · ${score}`}
      </Badge>
    );
  }

  // Score without tier (fallback — color by score value)
  if (typeof score === "number" && score !== null) {
    const color =
      score >= 90
        ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        : score >= 75
          ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
          : score >= 60
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            : score >= 40
              ? "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
              : "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";

    return (
      <Badge variant="outline" className={`${color} gap-1 font-normal`}>
        <Award className="h-3 w-3" />
        {label ?? `Score ${score}`}
      </Badge>
    );
  }

  // Fallback to type-based badge
  const badge = badges[type ?? "pending"] ?? badges.pending;
  const Icon = badge.icon;

  return (
    <Badge variant="outline" className={`${badge.color} gap-1 font-normal`}>
      <Icon className="h-3 w-3" />
      {label ?? badge.label}
    </Badge>
  );
}
