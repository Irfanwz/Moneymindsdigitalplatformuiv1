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
    color: "bg-green-50 text-green-700 border-green-200",
    label: "Verified",
  },
  "ai-verified": {
    icon: Sparkles,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    label: "AI Verified",
  },
  "due-diligence": {
    icon: Shield,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Due Diligence Complete",
  },
  pending: {
    icon: CheckCircle2,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending",
  },
};

const TIER_BADGE_COLORS: Record<string, string> = {
  elite: "bg-purple-50 text-purple-700 border-purple-200",
  expert: "bg-green-50 text-green-700 border-green-200",
  reliable: "bg-blue-50 text-blue-700 border-blue-200",
  developing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  inconsistent: "bg-orange-50 text-orange-700 border-orange-200",
  poor: "bg-red-50 text-red-700 border-red-200",
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
        ? "bg-purple-50 text-purple-700 border-purple-200"
        : score >= 75
          ? "bg-green-50 text-green-700 border-green-200"
          : score >= 60
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : score >= 40
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-orange-50 text-orange-700 border-orange-200";

    return (
      <Badge variant="outline" className={`${color} gap-1 font-normal`}>
        <Award className="h-3 w-3" />
        {label ?? `Score ${score}`}
      </Badge>
    );
  }

  // Fallback to type-based badge
  const badge = badges[type ?? "verified"] ?? badges.verified;
  const Icon = badge.icon;

  return (
    <Badge variant="outline" className={`${badge.color} gap-1 font-normal`}>
      <Icon className="h-3 w-3" />
      {label ?? badge.label}
    </Badge>
  );
}
