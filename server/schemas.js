import { z } from "zod";

// --- Auth ---
export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("A valid email address is required."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  requestedRoles: z.array(z.enum(["startup", "investor", "advisor"])).min(1, "Select at least one role."),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email address is required."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("A valid email address is required."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters long."),
});

// --- Admin ---
export const approvalSchema = z.object({
  status: z.enum(["approved", "rejected"], { message: "Approval status must be approved or rejected." }),
  approvedRoles: z.array(z.enum(["startup", "investor", "advisor"])).optional().default([]),
  adminNotes: z.string().optional().default(""),
  rejectionReason: z.string().optional().default(""),
});

// --- Profiles ---
export const startupProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  industry: z.string().min(2, "Industry is required."),
  description: z.string().min(20, "Company description must be at least 20 characters."),
  stage: z.string().min(2, "Funding stage is required."),
  website: z.string().url().optional().or(z.literal("")),
  teamSize: z.number().int().min(1).optional(),
  fundingGoal: z.number().min(0).optional(),
  linkedinUrl: z.string().optional().default(""),
  pitchDeckUrl: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export const investorProfileSchema = z.object({
  investorType: z.string().min(2, "Investor type is required."),
  industries: z.array(z.string()).min(1, "Select at least one industry of interest."),
  investmentStages: z.array(z.string()).optional().default([]),
  minInvestment: z.number().min(0).optional(),
  maxInvestment: z.number().min(0).optional(),
  portfolio: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  avatarUrl: z.string().optional().default(""),
  bio: z.string().optional().default(""),
});

export const advisorProfileSchema = z.object({
  title: z.string().min(2, "Professional title is required."),
  specialization: z.string().min(2, "Primary specialization is required."),
  industries: z.array(z.string()).min(1, "Select at least one industry."),
  yearsExperience: z.number().int().min(0).optional(),
  linkedinUrl: z.string().optional().default(""),
  avatarUrl: z.string().optional().default(""),
  hourlyRate: z.number().min(0).optional(),
  availability: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

// --- Groups ---
export const groupSchema = z.object({
  name: z.string().min(2, "Group name is required."),
  description: z.string().optional().default(""),
  category: z.string().optional().default(""),
  isPrivate: z.boolean().optional().default(false),
  isPaid: z.boolean().optional().default(false),
  joiningFee: z.string().optional().default("0"),
  monthlyFee: z.string().optional().default("0"),
});

export const signalSchema = z.object({
  title: z.string().min(2, "Title is required."),
  content: z.string().min(1, "Content is required."),
  type: z.string().optional().default("general"),
  tags: z.array(z.string()).optional().default([]),
});

// --- Trainings ---
export const trainingSchema = z.object({
  title: z.string().min(2, "Training title is required."),
  description: z.string().optional().default(""),
  type: z.enum(["free", "paid"]).optional().default("free"),
  price: z.number().min(0).optional().default(0),
  capacity: z.number().int().min(1).optional().default(100),
  duration: z.string().optional().default(""),
  level: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  scheduledAt: z.string().optional().default(""),
});

// --- Payments ---
export const checkoutSchema = z.object({
  itemType: z.enum(["group_join", "group_monthly", "training"], { message: "Invalid payment type." }),
  itemId: z.string().min(1, "Item ID is required."),
  paymentMethod: z.string().optional().default("card"),
  stripePaymentIntentId: z.string().optional().default(""),
});

export const createIntentSchema = z.object({
  itemType: z.enum(["group_join", "group_monthly", "training"], { message: "Invalid payment type." }),
  itemId: z.string().min(1, "Item ID is required."),
});

// --- Connections ---
export const connectionRequestSchema = z.object({
  toUserId: z.string().min(1, "Target user is required."),
  message: z.string().optional().default(""),
});

export const connectionStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"], { message: "Status must be accepted or rejected." }),
});

// Helper: validates body against schema, returns 400 on failure
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Zod v4 uses .issues; v3 uses .errors — handle both
      const issues = result.error.issues ?? result.error.errors ?? [];
      const message = issues[0]?.message ?? "Validation failed.";
      return res.status(400).json({ message });
    }
    req.body = result.data;
    next();
  };
}
