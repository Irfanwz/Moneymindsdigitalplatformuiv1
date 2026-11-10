export type ProfileLinkCheck = {
  id: string;
  providedUrl: string;
  url: string | null;
  resolvedUrl?: string;
  origins: string[];
  accessStatus: string;
  checkedAt?: string;
  reason: string;
  truncated?: boolean;
  comparisonStatus: string;
  summary: string;
  comparisons: {
    fieldId: string;
    label: string;
    claimed: unknown;
    status: string;
    reasoning: string;
    quotes: string[];
  }[];
};
