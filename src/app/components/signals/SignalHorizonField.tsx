import { useId, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatSignalHorizon } from "../../../../shared/signalHorizon.js";

export function SignalHorizonField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const match = /^(\d*)(hours|days|months)$/.exec(value);
  const [custom, setCustom] = useState(value.startsWith("until:") ? "date" : match && !["1hours", "4hours", "24hours", "7days", "1months"].includes(value) ? "duration" : "");
  const localDate = value.startsWith("until:") ? new Date(value.slice(6)) : null;
  const localValue = localDate && Number.isFinite(localDate.getTime()) ? new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  return <div className="space-y-2">
    <Label htmlFor={id}>Signal duration / expiry</Label>
    <select id={id} className="h-9 w-full rounded-md border bg-input-background px-3 text-sm" value={custom || value} onChange={event => {
      const next = event.target.value;
      setCustom(["duration", "date"].includes(next) ? next : "");
      onChange(next === "duration" ? "2hours" : next === "date" ? "until:" : next);
    }}>
      <option value="">Select duration</option>
      {["1hours", "4hours", "24hours", "7days", "1months"].map(v => <option key={v} value={v}>{formatSignalHorizon(v)}</option>)}
      {["short", "near", "medium", "long"].includes(value) && <option value={value}>{formatSignalHorizon(value)}</option>}
      <option value="duration">Custom duration</option><option value="date">Expiry date &amp; time</option>
    </select>
    {custom === "duration" && <div className="flex gap-2">
      <Input aria-label="Duration amount" type="number" min="1" step="1" value={match?.[1] ?? ""} onChange={e => onChange(`${e.target.value}${match?.[2] || "hours"}`)} />
      <select aria-label="Duration unit" className="rounded-md border bg-input-background px-3 text-sm" value={match?.[2] || "hours"} onChange={e => onChange(`${match?.[1] || "1"}${e.target.value}`)}>
        <option value="hours">Hours</option><option value="days">Days</option><option value="months">Months</option>
      </select>
    </div>}
    {custom === "date" && <Input aria-label="Expiry date and time" type="datetime-local" value={localValue} onChange={e => {
      const date = new Date(e.target.value);
      onChange(Number.isFinite(date.getTime()) ? `until:${date.toISOString()}` : "until:");
    }} />}
    <p className="text-xs text-muted-foreground">Minimum 1 hour. Dates use your local timezone. Duration starts when published; calendar months retain the day where possible.</p>
  </div>;
}
