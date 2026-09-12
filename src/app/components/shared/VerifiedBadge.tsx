import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/lib/utils";

interface VerifiedBadgeProps {
  verifiedAt?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function VerifiedBadge({ verifiedAt, size = "md", className }: VerifiedBadgeProps) {
  const label = verifiedAt
    ? `Verified on ${new Date(verifiedAt).toLocaleDateString()}`
    : "Identity verified by MoneyMinds AI";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center", className)}>
            <BadgeCheck
              className={cn(sizes[size], "text-blue-500 fill-blue-50")}
              aria-label="Verified profile"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
