import { Badge } from "@/app/components/ui/badge";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";

type BadgeType = "verified" | "ai-verified" | "due-diligence" | "pending";

interface CredibilityBadgeProps {
  type: BadgeType;
  label?: string;
}

export function CredibilityBadge({ type, label }: CredibilityBadgeProps) {
  const badges = {
    verified: {
      icon: CheckCircle2,
      color: "bg-green-50 text-green-700 border-green-200",
      label: label || "Verified",
    },
    "ai-verified": {
      icon: Sparkles,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      label: label || "AI Verified",
    },
    "due-diligence": {
      icon: Shield,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      label: label || "Due Diligence Complete",
    },
    pending: {
      icon: CheckCircle2,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      label: label || "Pending",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <Badge
      variant="outline"
      className={`${badge.color} gap-1 font-normal`}
    >
      <Icon className="h-3 w-3" />
      {badge.label}
    </Badge>
  );
}
