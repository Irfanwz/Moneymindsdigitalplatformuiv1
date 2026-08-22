import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";

export interface FilterState {
  result: "all" | "correct" | "partial" | "incorrect" | "pending";
  timeframe: string; // "all" or a specific timeframe string
  dateFrom: string;  // ISO date string or ""
  dateTo: string;    // ISO date string or ""
}

const DEFAULT_FILTERS: FilterState = {
  result: "all",
  timeframe: "all",
  dateFrom: "",
  dateTo: "",
};

interface PredictionFiltersProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  availableTimeframes?: string[];
}

function hasActiveFilters(f: FilterState) {
  return f.result !== "all" || f.timeframe !== "all" || !!f.dateFrom || !!f.dateTo;
}

export function PredictionFilters({
  filters,
  onFiltersChange,
  availableTimeframes = [],
}: PredictionFiltersProps) {
  function update(patch: Partial<FilterState>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function reset() {
    onFiltersChange(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-wrap items-end gap-2 sm:gap-3 text-sm">
      {/* Icon label */}
      <div className="flex items-center gap-1.5 text-muted-foreground self-center">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-xs font-medium">Filter</span>
      </div>

      {/* Result filter */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Result</Label>
        <Select value={filters.result} onValueChange={(v) => update({ result: v as FilterState["result"] })}>
          <SelectTrigger className="h-8 w-28 sm:w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="correct">Correct</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="incorrect">Incorrect</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeframe filter */}
      {availableTimeframes.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Timeframe</Label>
          <Select value={filters.timeframe} onValueChange={(v) => update({ timeframe: v })}>
            <SelectTrigger className="h-8 w-full sm:w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All timeframes</SelectItem>
              {availableTimeframes.map((tf) => (
                <SelectItem key={tf} value={tf}>{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date range */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          className="h-8 w-full sm:w-36 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          className="h-8 w-full sm:w-36 text-xs"
        />
      </div>

      {/* Reset button — only shown when filters are active */}
      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground self-end"
          onClick={reset}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
