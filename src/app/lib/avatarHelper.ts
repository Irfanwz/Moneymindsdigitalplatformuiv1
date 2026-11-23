/**
 * Avatar helper for real profile photos and professional initials avatars.
 * If the user uploaded/provided a real image URL, that exact image is used.
 * If no real photo is provided, it generates sleek initials avatars instead of dummy stock photos.
 */

export function isRealImage(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  // If it's an Unsplash random stock photo or placeholder, it is not a real user image
  if (
    trimmed.includes("images.unsplash.com") ||
    trimmed.includes("dummy") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("via.placeholder")
  ) {
    return false;
  }
  return true;
}

export function getInitials(name?: string): string {
  if (!name) return "MM";
  const clean = name.replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-700",
  "from-cyan-500 to-blue-700",
  "from-indigo-500 to-purple-700",
  "from-violet-500 to-fuchsia-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-pink-700",
  "from-teal-500 to-emerald-700",
];

export function getAvatarGradient(name?: string): string {
  if (!name) return AVATAR_GRADIENTS[0];
  const hash = Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function getAdvisorAvatar(advisor: {
  name?: string;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  avatar?: string | null;
}): string | null {
  // If an actual real photo was provided or uploaded, use it:
  if (isRealImage(advisor.avatarUrl)) return advisor.avatarUrl!.trim();
  if (isRealImage(advisor.photoUrl)) return advisor.photoUrl!.trim();
  if (isRealImage(advisor.avatar)) return advisor.avatar!.trim();

  // Otherwise return null so the component renders a clean, genuine avatar badge
  return null;
}

export function getAdvisorLocationDetails(location?: string) {
  if (!location) return { flag: "🌐", from: "Global", based: "Worldwide" };
  const lower = location.toLowerCase();
  if (lower.includes("uk") || lower.includes("london") || lower.includes("britain") || lower.includes("england")) {
    return { flag: "🇬🇧", from: "United Kingdom", based: location };
  }
  if (lower.includes("usa") || lower.includes("us") || lower.includes("new york") || lower.includes("san francisco") || lower.includes("austin") || lower.includes("united states")) {
    return { flag: "🇺🇸", from: "United States", based: location };
  }
  if (lower.includes("uae") || lower.includes("dubai") || lower.includes("emirates")) {
    return { flag: "🇦🇪", from: "United Arab Emirates", based: location };
  }
  if (lower.includes("germany") || lower.includes("munich") || lower.includes("berlin") || lower.includes("frankfurt")) {
    return { flag: "🇩🇪", from: "Germany", based: location };
  }
  if (lower.includes("argentina") || lower.includes("buenos aires")) {
    return { flag: "🇦🇷", from: "Argentina", based: location };
  }
  if (lower.includes("nigeria") || lower.includes("lagos")) {
    return { flag: "🇳🇬", from: "Nigeria", based: location };
  }
  if (lower.includes("singapore")) {
    return { flag: "🇸🇬", from: "Singapore", based: location };
  }
  if (lower.includes("sweden") || lower.includes("stockholm")) {
    return { flag: "🇸🇪", from: "Sweden", based: location };
  }
  if (lower.includes("japan") || lower.includes("tokyo")) {
    return { flag: "🇯🇵", from: "Japan", based: location };
  }
  if (lower.includes("france") || lower.includes("paris")) {
    return { flag: "🇫🇷", from: "France", based: location };
  }
  if (lower.includes("ireland") || lower.includes("dublin")) {
    return { flag: "🇮🇪", from: "Ireland", based: location };
  }
  if (lower.includes("saudi") || lower.includes("riyadh")) {
    return { flag: "🇸🇦", from: "Saudi Arabia", based: location };
  }
  if (lower.includes("canada") || lower.includes("toronto") || lower.includes("vancouver") || lower.includes("montreal")) {
    return { flag: "🇨🇦", from: "Canada", based: location };
  }
  if (lower.includes("hong kong")) {
    return { flag: "🇭🇰", from: "Hong Kong", based: location };
  }
  if (lower.includes("italy") || lower.includes("milan") || lower.includes("rome")) {
    return { flag: "🇮🇹", from: "Italy", based: location };
  }
  if (lower.includes("egypt") || lower.includes("cairo")) {
    return { flag: "🇪🇬", from: "Egypt", based: location };
  }
  if (lower.includes("netherlands") || lower.includes("amsterdam")) {
    return { flag: "🇳🇱", from: "Netherlands", based: location };
  }
  if (lower.includes("india") || lower.includes("bengaluru") || lower.includes("mumbai") || lower.includes("delhi")) {
    return { flag: "🇮🇳", from: "India", based: location };
  }
  if (lower.includes("switzerland") || lower.includes("zurich") || lower.includes("geneva")) {
    return { flag: "🇨🇭", from: "Switzerland", based: location };
  }
  if (lower.includes("australia") || lower.includes("sydney") || lower.includes("melbourne")) {
    return { flag: "🇦🇺", from: "Australia", based: location };
  }
  if (lower.includes("spain") || lower.includes("madrid") || lower.includes("barcelona")) {
    return { flag: "🇪🇸", from: "Spain", based: location };
  }
  if (lower.includes("brazil") || lower.includes("são paulo") || lower.includes("sao paulo")) {
    return { flag: "🇧🇷", from: "Brazil", based: location };
  }
  if (lower.includes("kenya") || lower.includes("nairobi")) {
    return { flag: "🇰🇪", from: "Kenya", based: location };
  }
  if (lower.includes("south africa") || lower.includes("johannesburg") || lower.includes("cape town")) {
    return { flag: "🇿🇦", from: "South Africa", based: location };
  }
  if (lower.includes("tunisia")) {
    return { flag: "🇹🇳", from: "Tunisia", based: location };
  }
  const parts = location.split(",");
  const country = parts[parts.length - 1]?.trim() || location;
  return { flag: "🌐", from: country, based: location };
}
