export interface Training {
  id: string;
  advisorId: string;
  title: string;
  description: string;
  type: "free" | "paid";
  price: number;
  format: "online" | "in-person" | "hybrid";
  duration: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  status: "upcoming" | "ongoing" | "completed";
  topics: string[];
  location: string;
  targetAudience: string[];
  level: "beginner" | "intermediate" | "advanced";
  instructorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  userId: string;
  progress: number;
  enrolledAt: string;
}

export interface CreateTrainingPayload {
  title: string;
  description: string;
  type: "free" | "paid";
  price: number;
  format: "online" | "in-person" | "hybrid";
  duration: string;
  schedule: string;
  capacity: number;
  status: string;
  topics: string[];
  location: string;
  targetAudience: string[];
  level: string;
}
