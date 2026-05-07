import { Badge } from "@/app/components/ui/badge";
import { Award, CheckCircle2, Shield, Sparkles } from "lucide-react";

type BadgeType = "verified" | "ai-verified" | "due-diligence" | "pending";

interface CredibilityBadgeProps {
  type?: BadgeType;
  label?: string;
  score?: number;
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

function getScoreBadge(score: number, label?: string) {
  const color =
    score >= 90
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 80
        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return {
    icon: Award,
    color,
    label: label ?? `Score ${score}`,
  };
}

export function CredibilityBadge({ type, label, score }: CredibilityBadgeProps) {
  const badge = typeof score === "number"
    ? getScoreBadge(score, label)
    : badges[type ?? "verified"] ?? badges.verified;

  const Icon = badge.icon;

  return (
    <Badge
      variant="outline"
      className={`${badge.color} gap-1 font-normal`}
    >
      <Icon className="h-3 w-3" />
      {label ?? badge.label}
    </Badge>
  );
}
