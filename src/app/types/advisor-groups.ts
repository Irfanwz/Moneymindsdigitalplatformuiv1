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
  createdAt: string;
  updatedAt: string;
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
