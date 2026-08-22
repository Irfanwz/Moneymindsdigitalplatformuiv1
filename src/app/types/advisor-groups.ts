export interface AdvisorGroup {
  id: string;
  advisorId: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  isPaid: boolean;
  joiningFee: string;
  monthlyFee: string;
  memberCount: number;
  signalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdvisorGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface Attachment {
  url: string;
  filename: string;
  type: "image" | "file";
}

export type PredictionDirection = "up" | "down" | "neutral";
export type PredictionResult = "correct" | "partial" | "incorrect";
export type PredictionStatus = "no_prediction" | "pending" | "overdue" | "checked";

export interface AdvisorSignal {
  id: string;
  groupId: string;
  advisorId: string;
  postType: "signal" | "post";
  title: string;
  content: string;
  signalType: string;
  targetPrice: string;
  timeHorizon: string;
  confidenceLevel: string;
  tags: string[];
  attachments?: Attachment[];
  notifyMembers: boolean;
  // AI Sentiment fields
  sentiment?: "bullish" | "bearish" | "neutral" | null;
  sentimentConfidence?: number | null;
  sentimentReasoning?: string | null;
  riskLevel?: "low" | "medium" | "high" | null;
  actionability?: "high" | "medium" | "low" | null;
  keyPoints?: string[] | null;
  // Prediction Accuracy fields
  predictionDirection?: PredictionDirection | null;
  predictionTargetPrice?: number | null;
  predictionTimeframe?: string | null;
  predictionTimeframeDays?: number | null;
  predictionCheckDate?: string | null;
  baselinePrice?: number | null;
  actualPrice?: number | null;
  predictionAccuracy?: number | null;
  predictionResult?: PredictionResult | null;
  predictionCheckedAt?: string | null;
  predictionExplanation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignalPrediction {
  signalId: string;
  direction: PredictionDirection | null;
  targetPrice: number | null;
  timeframe: string | null;
  timeframeDays: number | null;
  checkDate: string | null;
  baselinePrice: number | null;
  baselineFetchedAt: string | null;
  actualPrice: number | null;
  accuracy: number | null;
  result: PredictionResult | null;
  checkedAt: string | null;
  explanation: string | null;
  status: PredictionStatus;
}

export interface AdvisorAccuracyStats {
  advisorId: string;
  totalPredictions: number;
  correct: number;
  partial: number;
  incorrect: number;
  overallAccuracy: number | null;
  byTimeframe: Record<string, {
    correct: number;
    partial: number;
    incorrect: number;
    total: number;
    accuracy: number;
  }>;
  currentStreak: number;
}

export interface GroupPredictionSummary {
  signalId: string;
  title: string;
  direction: PredictionDirection | null;
  targetPrice: number | null;
  timeframe: string | null;
  checkDate: string | null;
  baselinePrice: number | null;
  actualPrice: number | null;
  accuracy: number | null;
  result: PredictionResult | null;
  explanation: string | null;
  status: PredictionStatus;
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  isPaid: boolean;
  joiningFee: string;
  monthlyFee: string;
}

export interface CreateSignalPayload {
  postType: "signal" | "post";
  title: string;
  content: string;
  signalType: string;
  targetPrice: string;
  timeHorizon: string;
  confidenceLevel: string;
  tags: string[];
  attachments?: Attachment[];
  notifyMembers: boolean;
}
