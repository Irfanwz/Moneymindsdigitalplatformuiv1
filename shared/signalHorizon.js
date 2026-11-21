const HOUR = 3600000;
export const legacyHorizons = { short: 7, near: 7, medium: 30, long: 90 };

// Explicit selections are authoritative; AI text extraction cannot change them.
export function resolveSignalHorizon(value, reference = Date.now()) {
  if (!value || Object.hasOwn(legacyHorizons, value)) return null;
  const start = new Date(reference);
  let end;
  const duration = /^(\d+)(hours|days|months)$/.exec(value);
  if (duration) {
    const amount = Number(duration[1]);
    if (!Number.isSafeInteger(amount) || amount < 1) throw new Error("Choose a positive whole duration.");
    end = new Date(start);
    if (duration[2] === "months") {
      if (amount > 60) throw new Error("Choose up to 60 months.");
      const day = end.getUTCDate();
      end.setUTCDate(1);
      end.setUTCMonth(end.getUTCMonth() + amount);
      const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
      end.setUTCDate(Math.min(day, lastDay));
    } else end = new Date(start.getTime() + amount * (duration[2] === "hours" ? HOUR : 24 * HOUR));
  } else if (/^until:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    end = new Date(value.slice(6));
    const raw = value.slice(6);
    const normalized = raw.length === 20 ? raw.replace("Z", ".000Z") : raw;
    if (!Number.isFinite(end.getTime()) || end.toISOString() !== normalized) throw new Error("Choose a valid calendar date.");
  } else throw new Error("Choose hours, days, months, or a valid expiry date.");
  const milliseconds = end.getTime() - start.getTime();
  if (!Number.isFinite(milliseconds) || milliseconds < HOUR || milliseconds > 1830 * 24 * HOUR) {
    throw new Error("Signal expiry must be at least 1 hour and no more than 5 years away.");
  }
  return { checkDate: end.toISOString(), milliseconds, label: formatSignalHorizon(value) };
}

export function formatSignalHorizon(value) {
  if (!value) return "Not specified";
  if (Object.hasOwn(legacyHorizons, value)) return `${legacyHorizons[value]} days (legacy)`;
  if (value.startsWith("until:")) {
    const date = new Date(value.slice(6));
    return Number.isFinite(date.getTime()) ? `Until ${date.toLocaleString(undefined, { timeZoneName: "short" })}` : "Choose expiry date";
  }
  return value.replace(/^(\d+)(hours|days|months)$/, (_, n, unit) => `${n} ${Number(n) === 1 ? unit.slice(0, -1) : unit}`);
}
