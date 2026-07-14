import { createClient } from "@supabase/supabase-js";

const USERS_TABLE = "platform_users";
const STARTUP_PROFILES_TABLE = "startup_profiles";
const INVESTOR_PROFILES_TABLE = "investor_profiles";
const ADVISOR_PROFILES_TABLE = "advisor_profiles";
const ADVISOR_GROUPS_TABLE = "advisor_groups";
const ADVISOR_GROUP_MEMBERS_TABLE = "advisor_group_members";
const ADVISOR_SIGNALS_TABLE = "advisor_signals";
const PASSWORD_RESET_TOKENS_TABLE = "password_reset_tokens";
const SIGNAL_COMMENTS_TABLE = "signal_comments";
const SIGNAL_REACTIONS_TABLE = "signal_reactions";
const TRAININGS_TABLE = "trainings";
const TRAINING_ENROLLMENTS_TABLE = "training_enrollments";
const NOTIFICATIONS_TABLE = "notifications";
const CONNECTIONS_TABLE = "connections";
const PAYMENTS_TABLE = "payments";
const AI_VERIFICATIONS_TABLE = "ai_verifications";

function mapRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone ?? "",
    location: row.location ?? "",
    bio: row.bio ?? "",
    status: row.status,
    requestedRoles: row.requested_roles ?? [],
    approvedRoles: row.approved_roles ?? [],
    isAdmin: row.is_admin ?? false,
    adminNotes: row.admin_notes ?? null,
    rejectionReason: row.rejection_reason ?? null,
    approvedAt: row.approved_at ?? null,
    approvedBy: row.approved_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInsert(user) {
  return {
    full_name: user.fullName,
    email: user.email.toLowerCase(),
    password_hash: user.passwordHash,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    status: user.status,
    requested_roles: user.requestedRoles,
    approved_roles: user.approvedRoles,
    is_admin: user.isAdmin,
    admin_notes: user.adminNotes ?? null,
    rejection_reason: user.rejectionReason ?? null,
    approved_at: user.approvedAt ?? null,
    approved_by: user.approvedBy ?? null,
  };
}

function mapStartupProfileRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    tagline: row.tagline ?? "",
    industry: row.industry,
    foundedYear: row.founded_year ?? null,
    location: row.location ?? "",
    description: row.description ?? "",
    website: row.website ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    contactEmail: row.contact_email ?? "",
    stage: row.stage ?? "",
    totalRaised: row.total_raised ?? "",
    fundingGoal: row.funding_goal ?? "",
    valuation: row.valuation ?? "",
    pitch: row.pitch ?? "",
    categories: row.categories ?? [],
    teamMembers: row.team_members ?? [],
    isPublic: row.is_public ?? true,
    showContactInfo: row.show_contact_info ?? true,
    allowAdvisorInvitations: row.allow_advisor_invitations ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStartupProfileInsert(userId, profile) {
  return {
    user_id: userId,
    company_name: profile.companyName,
    tagline: profile.tagline,
    industry: profile.industry,
    founded_year: profile.foundedYear,
    location: profile.location,
    description: profile.description,
    website: profile.website,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    contact_email: profile.contactEmail,
    stage: profile.stage,
    total_raised: profile.totalRaised,
    funding_goal: profile.fundingGoal,
    valuation: profile.valuation,
    pitch: profile.pitch,
    categories: profile.categories,
    team_members: profile.teamMembers,
    is_public: profile.isPublic,
    show_contact_info: profile.showContactInfo,
    allow_advisor_invitations: profile.allowAdvisorInvitations,
  };
}

function mapInvestorProfileRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    investorType: row.investor_type ?? "",
    preferredStage: row.preferred_stage ?? "",
    minInvestment: row.min_investment ?? "",
    maxInvestment: row.max_investment ?? "",
    portfolioSize: row.portfolio_size ?? "",
    investmentThesis: row.investment_thesis ?? "",
    industries: row.industries ?? [],
    otherInterests: row.other_interests ?? "",
    geographicFocus: row.geographic_focus ?? "",
    firmName: row.firm_name ?? "",
    title: row.title ?? "",
    website: row.website ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    contactEmail: row.contact_email ?? "",
    bio: row.bio ?? "",
    isPrivate: row.is_private ?? true,
    anonymousBrowsing: row.anonymous_browsing ?? false,
    showInvestmentPreferences: row.show_investment_preferences ?? true,
    allowConnectionRequests: row.allow_connection_requests ?? true,
    showContactInfo: row.show_contact_info ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvestorProfileInsert(userId, profile) {
  return {
    user_id: userId,
    investor_type: profile.investorType,
    preferred_stage: profile.preferredStage,
    min_investment: profile.minInvestment,
    max_investment: profile.maxInvestment,
    portfolio_size: profile.portfolioSize,
    investment_thesis: profile.investmentThesis,
    industries: profile.industries,
    other_interests: profile.otherInterests,
    geographic_focus: profile.geographicFocus,
    firm_name: profile.firmName,
    title: profile.title,
    website: profile.website,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    contact_email: profile.contactEmail,
    bio: profile.bio,
    is_private: profile.isPrivate,
    anonymous_browsing: profile.anonymousBrowsing,
    show_investment_preferences: profile.showInvestmentPreferences,
    allow_connection_requests: profile.allowConnectionRequests,
    show_contact_info: profile.showContactInfo,
  };
}

function mapAdvisorProfileRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "",
    bio: row.bio ?? "",
    website: row.website ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    contactEmail: row.contact_email ?? "",
    yearsExperience: row.years_experience ?? null,
    clientsHelped: row.clients_helped ?? null,
    specialization: row.specialization ?? "",
    previousRoles: row.previous_roles ?? "",
    expertiseAreas: row.expertise_areas ?? [],
    certifications: row.certifications ?? [],
    industries: row.industries ?? [],
    preferredStage: row.preferred_stage ?? "",
    engagementType: row.engagement_type ?? "",
    availability: row.availability ?? "",
    typicalRate: row.typical_rate ?? "",
    servicesOffered: row.services_offered ?? "",
    defaultGroupType: row.default_group_type ?? "free",
    defaultJoiningFee: row.default_joining_fee ?? "",
    defaultMonthlyFee: row.default_monthly_fee ?? "",
    autoApproveMembers: row.auto_approve_members ?? true,
    allowGroupDiscovery: row.allow_group_discovery ?? true,
    enablePaymentProcessing: row.enable_payment_processing ?? false,
    paymentEmail: row.payment_email ?? "",
    taxId: row.tax_id ?? "",
    isPublic: row.is_public ?? true,
    showContactInfo: row.show_contact_info ?? true,
    allowConnectionRequests: row.allow_connection_requests ?? true,
    showTestimonials: row.show_testimonials ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdvisorProfileInsert(userId, profile) {
  return {
    user_id: userId,
    title: profile.title,
    bio: profile.bio,
    website: profile.website,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    contact_email: profile.contactEmail,
    years_experience: profile.yearsExperience,
    clients_helped: profile.clientsHelped,
    specialization: profile.specialization,
    previous_roles: profile.previousRoles,
    expertise_areas: profile.expertiseAreas,
    certifications: profile.certifications,
    industries: profile.industries,
    preferred_stage: profile.preferredStage,
    engagement_type: profile.engagementType,
    availability: profile.availability,
    typical_rate: profile.typicalRate,
    services_offered: profile.servicesOffered,
    default_group_type: profile.defaultGroupType,
    default_joining_fee: profile.defaultJoiningFee,
    default_monthly_fee: profile.defaultMonthlyFee,
    auto_approve_members: profile.autoApproveMembers,
    allow_group_discovery: profile.allowGroupDiscovery,
    enable_payment_processing: profile.enablePaymentProcessing,
    payment_email: profile.paymentEmail,
    tax_id: profile.taxId,
    is_public: profile.isPublic,
    show_contact_info: profile.showContactInfo,
    allow_connection_requests: profile.allowConnectionRequests,
    show_testimonials: profile.showTestimonials,
  };
}

function mapGroupRow(row) {
  return {
    id: row.id,
    advisorId: row.advisor_id,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "general",
    isPrivate: row.is_private ?? false,
    isPaid: row.is_paid ?? false,
    joiningFee: row.joining_fee ?? "",
    monthlyFee: row.monthly_fee ?? "",
    memberCount: row.member_count ?? 0,
    signalCount: row.signal_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGroupInsert(advisorId, input) {
  return {
    advisor_id: advisorId,
    name: input.name,
    description: input.description,
    category: input.category,
    is_private: input.isPrivate,
    is_paid: input.isPaid,
    joining_fee: input.joiningFee,
    monthly_fee: input.monthlyFee,
  };
}

function mapSignalRow(row) {
  return {
    id: row.id,
    groupId: row.group_id,
    advisorId: row.advisor_id,
    postType: row.post_type,
    title: row.title,
    content: row.content ?? "",
    signalType: row.signal_type ?? "",
    targetPrice: row.target_price ?? "",
    timeHorizon: row.time_horizon ?? "",
    confidenceLevel: row.confidence_level ?? "medium",
    tags: row.tags ?? [],
    notifyMembers: row.notify_members ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSignalInsert(groupId, advisorId, input) {
  return {
    group_id: groupId,
    advisor_id: advisorId,
    post_type: input.postType,
    title: input.title,
    content: input.content,
    signal_type: input.signalType,
    target_price: input.targetPrice,
    time_horizon: input.timeHorizon,
    confidence_level: input.confidenceLevel,
    tags: input.tags,
    notify_members: input.notifyMembers,
  };
}

function mapTrainingRow(row, instructorName) {
  return {
    id: row.id, advisorId: row.advisor_id, title: row.title, description: row.description ?? "",
    type: row.type ?? "free", price: row.price ?? 0, format: row.format ?? "online",
    duration: row.duration ?? "", schedule: row.schedule ?? "", capacity: row.capacity ?? 50,
    enrolled: row.enrolled ?? 0, status: row.status ?? "upcoming", topics: row.topics ?? [],
    location: row.location ?? "", targetAudience: row.target_audience ?? [],
    level: row.level ?? "beginner", instructorName: instructorName ?? "",
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapTrainingInsert(advisorId, input) {
  return {
    advisor_id: advisorId, title: input.title, description: input.description,
    type: input.type, price: input.price, format: input.format, duration: input.duration,
    schedule: input.schedule, capacity: input.capacity, status: input.status,
    topics: input.topics, location: input.location, target_audience: input.targetAudience,
    level: input.level,
  };
}

function mapVerificationRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    recommendation: row.recommendation ?? null,
    confidence: row.confidence ?? null,
    credibilityScore: row.credibility_score ?? null,
    summary: row.summary ?? null,
    findings: row.findings ?? null,
    reportMarkdown: row.report_markdown ?? null,
    sources: row.sources ?? [],
    redFlags: row.red_flags ?? [],
    searchQueriesRun: row.search_queries_run ?? 0,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? null,
  };
}

function toStoreError(error) {
  if (!error) {
    return null;
  }

  if (error.code === "23505") {
    const duplicateError = new Error("An account with this email already exists.");
    duplicateError.code = "DUPLICATE_EMAIL";
    return duplicateError;
  }

  return error;
}

export function createSupabaseStore({ supabaseUrl, supabaseServiceRoleKey }) {
  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    mode: "supabase",

    async health() {
      const { count, error } = await client
        .from(USERS_TABLE)
        .select("*", { count: "exact", head: true });

      if (error) {
        throw toStoreError(error);
      }

      return {
        mode: "supabase",
        userCount: count ?? 0,
      };
    },

    async ensureAdminAccount({ fullName, email, passwordHash }) {
      const timestamp = new Date().toISOString();
      const payload = mapInsert({
        fullName,
        email,
        passwordHash,
        phone: "",
        location: "",
        bio: "Platform administrator",
        status: "approved",
        requestedRoles: [],
        approvedRoles: [],
        isAdmin: true,
        adminNotes: "Bootstrap admin account",
        rejectionReason: null,
        approvedAt: timestamp,
        approvedBy: null,
      });

      const { data, error } = await client
        .from(USERS_TABLE)
        .upsert(payload, { onConflict: "email" })
        .select("*")
        .single();

      if (error) {
        throw toStoreError(error);
      }

      return mapRow(data);
    },

    async createUserProfile(profile) {
      const { data, error } = await client
        .from(USERS_TABLE)
        .insert(mapInsert({
          ...profile,
          status: "pending",
          approvedRoles: [],
          isAdmin: false,
          adminNotes: null,
          rejectionReason: null,
          approvedAt: null,
          approvedBy: null,
        }))
        .select("*")
        .single();

      if (error) {
        throw toStoreError(error);
      }

      return mapRow(data);
    },

    async findUserByEmail(email) {
      const { data, error } = await client
        .from(USERS_TABLE)
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapRow(data) : null;
    },

    async findUserById(userId) {
      const { data, error } = await client
        .from(USERS_TABLE)
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapRow(data) : null;
    },

    async listUsers({ status, includeAdmins = false } = {}) {
      let query = client.from(USERS_TABLE).select("*").order("created_at", { ascending: false });

      if (!includeAdmins) {
        query = query.eq("is_admin", false);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        throw toStoreError(error);
      }

      return (data ?? []).map(mapRow);
    },

    async updateApproval(userId, approval) {
      const timestamp = new Date().toISOString();
      const payload = {
        status: approval.status,
        approved_roles: approval.status === "approved" ? approval.approvedRoles : [],
        admin_notes: approval.adminNotes ?? null,
        rejection_reason: approval.status === "rejected" ? approval.rejectionReason ?? null : null,
        approved_at: approval.status === "approved" ? timestamp : null,
        approved_by: approval.approvedBy ?? null,
        updated_at: timestamp,
      };

      const { data, error } = await client
        .from(USERS_TABLE)
        .update(payload)
        .eq("id", userId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapRow(data) : null;
    },

    // --- Password Reset ---

    async createPasswordResetToken(userId, token, expiresAt) {
      const { data, error } = await client
        .from(PASSWORD_RESET_TOKENS_TABLE)
        .insert({ user_id: userId, token, expires_at: expiresAt })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return { id: data.id, userId: data.user_id, token: data.token, expiresAt: data.expires_at, used: data.used, createdAt: data.created_at };
    },

    async findPasswordResetToken(token) {
      const { data, error } = await client
        .from(PASSWORD_RESET_TOKENS_TABLE)
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, userId: data.user_id, token: data.token, expiresAt: data.expires_at, used: data.used, createdAt: data.created_at };
    },

    async markPasswordResetTokenUsed(token) {
      const { error } = await client
        .from(PASSWORD_RESET_TOKENS_TABLE)
        .update({ used: true })
        .eq("token", token);
      if (error) throw toStoreError(error);
      return true;
    },

    async updateUserPassword(userId, passwordHash) {
      const { data, error } = await client
        .from(USERS_TABLE)
        .update({ password_hash: passwordHash })
        .eq("id", userId)
        .select("*")
        .maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapRow(data) : null;
    },

    async findStartupProfileByUserId(userId) {
      const { data, error } = await client
        .from(STARTUP_PROFILES_TABLE)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapStartupProfileRow(data) : null;
    },

    async upsertStartupProfile(userId, profileInput) {
      const { data, error } = await client
        .from(STARTUP_PROFILES_TABLE)
        .upsert(mapStartupProfileInsert(userId, profileInput), { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) {
        throw toStoreError(error);
      }

      return mapStartupProfileRow(data);
    },

    async findInvestorProfileByUserId(userId) {
      const { data, error } = await client
        .from(INVESTOR_PROFILES_TABLE)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapInvestorProfileRow(data) : null;
    },

    async upsertInvestorProfile(userId, profileInput) {
      const { data, error } = await client
        .from(INVESTOR_PROFILES_TABLE)
        .upsert(mapInvestorProfileInsert(userId, profileInput), { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) {
        throw toStoreError(error);
      }

      return mapInvestorProfileRow(data);
    },

    async findAdvisorProfileByUserId(userId) {
      const { data, error } = await client
        .from(ADVISOR_PROFILES_TABLE)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw toStoreError(error);
      }

      return data ? mapAdvisorProfileRow(data) : null;
    },

    async upsertAdvisorProfile(userId, profileInput) {
      const { data, error } = await client
        .from(ADVISOR_PROFILES_TABLE)
        .upsert(mapAdvisorProfileInsert(userId, profileInput), { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) {
        throw toStoreError(error);
      }

      return mapAdvisorProfileRow(data);
    },

    // --- Search ---

    async searchStartups({ industry, stage, query } = {}) {
      let q = client
        .from(STARTUP_PROFILES_TABLE)
        .select("id, user_id, company_name, tagline, industry, stage, total_raised, description, categories, location")
        .eq("is_public", true);

      if (industry) {
        q = q.or(`industry.ilike.%${industry}%,categories.cs.{${industry}}`);
      }
      if (stage) {
        q = q.ilike("stage", `%${stage}%`);
      }
      if (query) {
        q = q.or(`company_name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%,industry.ilike.%${query}%`);
      }

      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw toStoreError(error);

      return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        companyName: row.company_name,
        tagline: row.tagline ?? "",
        industry: row.industry,
        stage: row.stage,
        totalRaised: row.total_raised ?? "",
        description: row.description ?? "",
        categories: row.categories ?? [],
        location: row.location ?? "",
      }));
    },

    async searchAdvisors({ industry, specialization, query } = {}) {
      let q = client
        .from(ADVISOR_PROFILES_TABLE)
        .select("id, user_id, title, bio, years_experience, clients_helped, specialization, typical_rate, availability, industries, expertise_areas")
        .eq("is_public", true);

      if (industry) {
        q = q.contains("industries", [industry]);
      }
      if (specialization) {
        q = q.ilike("specialization", `%${specialization}%`);
      }
      if (query) {
        q = q.or(`title.ilike.%${query}%,bio.ilike.%${query}%,specialization.ilike.%${query}%`);
      }

      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw toStoreError(error);

      // Need user names — fetch them
      const userIds = (data ?? []).map((r) => r.user_id);
      const { data: usersData } = userIds.length > 0
        ? await client.from(USERS_TABLE).select("id, full_name, location").in("id", userIds)
        : { data: [] };
      const usersMap = Object.fromEntries((usersData ?? []).map((u) => [u.id, u]));

      return (data ?? []).map((row) => {
        const u = usersMap[row.user_id] ?? {};
        return {
          id: row.id,
          userId: row.user_id,
          name: u.full_name ?? "",
          title: row.title ?? "",
          location: u.location ?? "",
          bio: row.bio ?? "",
          yearsExperience: row.years_experience ?? null,
          clientsHelped: row.clients_helped ?? null,
          specialization: row.specialization ?? "",
          typicalRate: row.typical_rate ?? "",
          availability: row.availability ?? "",
          industries: row.industries ?? [],
          expertiseAreas: row.expertise_areas ?? [],
        };
      });
    },

    // --- Advisor Groups ---

    async createGroup(advisorId, groupInput) {
      const { data, error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .insert(mapGroupInsert(advisorId, groupInput))
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return mapGroupRow(data);
    },

    async listGroupsByAdvisor(advisorId) {
      const { data, error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .select("*")
        .eq("advisor_id", advisorId)
        .order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map(mapGroupRow);
    },

    async listPublicGroups() {
      const { data, error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map(mapGroupRow);
    },

    async listUserMemberships(userId) {
      const { data, error } = await client
        .from(ADVISOR_GROUP_MEMBERS_TABLE)
        .select("*")
        .eq("user_id", userId);
      if (error) throw toStoreError(error);
      return (data || []).map((row) => ({
        id: row.id,
        groupId: row.group_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
      }));
    },

    async findGroupById(groupId) {
      const { data, error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .select("*")
        .eq("id", groupId)
        .maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapGroupRow(data) : null;
    },

    async updateGroup(groupId, groupInput) {
      const payload = {
        name: groupInput.name,
        description: groupInput.description,
        category: groupInput.category,
        is_private: groupInput.isPrivate,
        is_paid: groupInput.isPaid,
        joining_fee: groupInput.joiningFee,
        monthly_fee: groupInput.monthlyFee,
      };
      const { data, error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .update(payload)
        .eq("id", groupId)
        .select("*")
        .maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapGroupRow(data) : null;
    },

    async deleteGroup(groupId) {
      const { error } = await client
        .from(ADVISOR_GROUPS_TABLE)
        .delete()
        .eq("id", groupId);
      if (error) throw toStoreError(error);
      return true;
    },

    async joinGroup(groupId, userId) {
      const { data, error } = await client
        .from(ADVISOR_GROUP_MEMBERS_TABLE)
        .upsert({ group_id: groupId, user_id: userId, role: "member" }, { onConflict: "group_id,user_id" })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      // Increment member_count
      try {
        await client.rpc("increment_group_member_count", { gid: groupId });
      } catch (_) {
        // If RPC doesn't exist, update manually
        await client.from(ADVISOR_GROUPS_TABLE)
          .update({ member_count: client.raw("member_count + 1") })
          .eq("id", groupId);
      }
      return { id: data.id, groupId: data.group_id, userId: data.user_id, role: data.role, joinedAt: data.joined_at };
    },

    async leaveGroup(groupId, userId) {
      const { error } = await client
        .from(ADVISOR_GROUP_MEMBERS_TABLE)
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw toStoreError(error);
      return true;
    },

    async listGroupMembers(groupId) {
      const { data, error } = await client
        .from(ADVISOR_GROUP_MEMBERS_TABLE)
        .select("*")
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true });
      if (error) throw toStoreError(error);
      return (data || []).map((row) => ({
        id: row.id,
        groupId: row.group_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
      }));
    },

    async removeGroupMember(groupId, userId) {
      const { error } = await client
        .from(ADVISOR_GROUP_MEMBERS_TABLE)
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw toStoreError(error);
      return true;
    },

    // --- Advisor Signals ---

    async createSignal(groupId, advisorId, signalInput) {
      const { data, error } = await client
        .from(ADVISOR_SIGNALS_TABLE)
        .insert(mapSignalInsert(groupId, advisorId, signalInput))
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      // Increment signal_count
      try {
        await client.from(ADVISOR_GROUPS_TABLE)
          .update({ signal_count: (await this.findGroupById(groupId))?.signalCount + 1 || 1 })
          .eq("id", groupId);
      } catch (_) {}
      return mapSignalRow(data);
    },

    async listSignalsByGroup(groupId) {
      const { data, error } = await client
        .from(ADVISOR_SIGNALS_TABLE)
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map(mapSignalRow);
    },

    async deleteSignal(signalId) {
      const signal = await this.findSignalById(signalId);
      const { error } = await client
        .from(ADVISOR_SIGNALS_TABLE)
        .delete()
        .eq("id", signalId);
      if (error) throw toStoreError(error);
      if (signal) {
        const group = await this.findGroupById(signal.groupId);
        if (group && group.signalCount > 0) {
          try {
            await client.from(ADVISOR_GROUPS_TABLE)
              .update({ signal_count: group.signalCount - 1 })
              .eq("id", signal.groupId);
          } catch (_) {}
        }
      }
      return true;
    },

    async findSignalById(signalId) {
      const { data, error } = await client
        .from(ADVISOR_SIGNALS_TABLE)
        .select("*")
        .eq("id", signalId)
        .maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapSignalRow(data) : null;
    },

    // --- Signal Comments & Reactions ---

    async createComment(signalId, userId, content) {
      const { data, error } = await client
        .from(SIGNAL_COMMENTS_TABLE)
        .insert({ signal_id: signalId, user_id: userId, content })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return { id: data.id, signalId: data.signal_id, userId: data.user_id, content: data.content, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async listCommentsBySignal(signalId) {
      const { data, error } = await client
        .from(SIGNAL_COMMENTS_TABLE)
        .select("*")
        .eq("signal_id", signalId)
        .order("created_at", { ascending: true });
      if (error) throw toStoreError(error);
      return (data || []).map((row) => ({
        id: row.id, signalId: row.signal_id, userId: row.user_id, content: row.content, createdAt: row.created_at, updatedAt: row.updated_at,
      }));
    },

    async deleteComment(commentId) {
      const { error } = await client.from(SIGNAL_COMMENTS_TABLE).delete().eq("id", commentId);
      if (error) throw toStoreError(error);
      return true;
    },

    async findCommentById(commentId) {
      const { data, error } = await client.from(SIGNAL_COMMENTS_TABLE).select("*").eq("id", commentId).maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, signalId: data.signal_id, userId: data.user_id, content: data.content, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async toggleReaction(signalId, userId, reaction) {
      // Check if exists
      const { data: existing } = await client
        .from(SIGNAL_REACTIONS_TABLE)
        .select("id")
        .eq("signal_id", signalId)
        .eq("user_id", userId)
        .eq("reaction", reaction)
        .maybeSingle();
      if (existing) {
        await client.from(SIGNAL_REACTIONS_TABLE).delete().eq("id", existing.id);
        return { added: false };
      }
      await client.from(SIGNAL_REACTIONS_TABLE).insert({ signal_id: signalId, user_id: userId, reaction });
      return { added: true };
    },

    async listReactionsBySignal(signalId) {
      const { data, error } = await client
        .from(SIGNAL_REACTIONS_TABLE)
        .select("*")
        .eq("signal_id", signalId);
      if (error) throw toStoreError(error);
      return (data || []).map((row) => ({
        id: row.id, signalId: row.signal_id, userId: row.user_id, reaction: row.reaction, createdAt: row.created_at,
      }));
    },

    // --- Trainings ---

    async createTraining(advisorId, input) {
      const { data, error } = await client.from(TRAININGS_TABLE).insert(mapTrainingInsert(advisorId, input)).select("*").single();
      if (error) throw toStoreError(error);
      return mapTrainingRow(data, "");
    },

    async listTrainings() {
      const { data, error } = await client.from(TRAININGS_TABLE).select("*").order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      const userIds = [...new Set((data ?? []).map((r) => r.advisor_id))];
      const { data: usersData } = userIds.length > 0 ? await client.from(USERS_TABLE).select("id, full_name").in("id", userIds) : { data: [] };
      const usersMap = Object.fromEntries((usersData ?? []).map((u) => [u.id, u.full_name]));
      return (data ?? []).map((row) => mapTrainingRow(row, usersMap[row.advisor_id] ?? ""));
    },

    async listTrainingsByAdvisor(advisorId) {
      const { data, error } = await client.from(TRAININGS_TABLE).select("*").eq("advisor_id", advisorId).order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map((row) => mapTrainingRow(row, ""));
    },

    async findTrainingById(trainingId) {
      const { data, error } = await client.from(TRAININGS_TABLE).select("*").eq("id", trainingId).maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      const { data: u } = await client.from(USERS_TABLE).select("full_name").eq("id", data.advisor_id).maybeSingle();
      return mapTrainingRow(data, u?.full_name ?? "");
    },

    async updateTraining(trainingId, input) {
      const payload = { title: input.title, description: input.description, type: input.type, price: input.price, format: input.format, duration: input.duration, schedule: input.schedule, capacity: input.capacity, status: input.status, topics: input.topics, location: input.location, target_audience: input.targetAudience, level: input.level };
      const { data, error } = await client.from(TRAININGS_TABLE).update(payload).eq("id", trainingId).select("*").maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapTrainingRow(data, "") : null;
    },

    async deleteTraining(trainingId) {
      const { error } = await client.from(TRAININGS_TABLE).delete().eq("id", trainingId);
      if (error) throw toStoreError(error);
      return true;
    },

    async enrollInTraining(trainingId, userId) {
      const { data, error } = await client.from(TRAINING_ENROLLMENTS_TABLE).upsert({ training_id: trainingId, user_id: userId, progress: 0 }, { onConflict: "training_id,user_id" }).select("*").single();
      if (error) throw toStoreError(error);
      return { id: data.id, trainingId: data.training_id, userId: data.user_id, progress: data.progress, enrolledAt: data.enrolled_at };
    },

    async unenrollFromTraining(trainingId, userId) {
      const { error } = await client.from(TRAINING_ENROLLMENTS_TABLE).delete().eq("training_id", trainingId).eq("user_id", userId);
      if (error) throw toStoreError(error);
      return true;
    },

    async listEnrollmentsByUser(userId) {
      const { data, error } = await client.from(TRAINING_ENROLLMENTS_TABLE).select("*").eq("user_id", userId);
      if (error) throw toStoreError(error);
      return (data ?? []).map((r) => ({ id: r.id, trainingId: r.training_id, userId: r.user_id, progress: r.progress, enrolledAt: r.enrolled_at }));
    },

    async listEnrollmentsByTraining(trainingId) {
      const { data, error } = await client.from(TRAINING_ENROLLMENTS_TABLE).select("*").eq("training_id", trainingId);
      if (error) throw toStoreError(error);
      return (data ?? []).map((r) => ({ id: r.id, trainingId: r.training_id, userId: r.user_id, progress: r.progress, enrolledAt: r.enrolled_at }));
    },

    async updateEnrollmentProgress(trainingId, userId, progress) {
      const { data, error } = await client.from(TRAINING_ENROLLMENTS_TABLE).update({ progress }).eq("training_id", trainingId).eq("user_id", userId).select("*").maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, trainingId: data.training_id, userId: data.user_id, progress: data.progress, enrolledAt: data.enrolled_at };
    },

    // --- Signal Update (was missing) ---

    async updateSignal(signalId, input) {
      const payload = {
        post_type: input.postType,
        title: input.title,
        content: input.content,
        signal_type: input.signalType,
        target_price: input.targetPrice,
        time_horizon: input.timeHorizon,
        confidence_level: input.confidenceLevel,
        tags: input.tags,
        notify_members: input.notifyMembers,
      };
      const { data, error } = await client.from(ADVISOR_SIGNALS_TABLE).update(payload).eq("id", signalId).select("*").maybeSingle();
      if (error) throw toStoreError(error);
      return data ? mapSignalRow(data) : null;
    },

    // --- Notifications ---

    async createNotification(userId, { title, message, type }) {
      const { data, error } = await client
        .from(NOTIFICATIONS_TABLE)
        .insert({ user_id: userId, title, message: message || "", type: type || "info", read: false })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return { id: data.id, userId: data.user_id, title: data.title, message: data.message, type: data.type, read: data.read, createdAt: data.created_at };
    },

    async listNotificationsByUser(userId) {
      const { data, error } = await client
        .from(NOTIFICATIONS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw toStoreError(error);
      return (data ?? []).map((r) => ({ id: r.id, userId: r.user_id, title: r.title, message: r.message, type: r.type, read: r.read, createdAt: r.created_at }));
    },

    async markNotificationRead(notificationId) {
      const { data, error } = await client
        .from(NOTIFICATIONS_TABLE)
        .update({ read: true })
        .eq("id", notificationId)
        .select("*")
        .maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, userId: data.user_id, title: data.title, message: data.message, type: data.type, read: data.read, createdAt: data.created_at };
    },

    async markAllNotificationsRead(userId) {
      const { error } = await client
        .from(NOTIFICATIONS_TABLE)
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
      if (error) throw toStoreError(error);
    },

    // --- Connections ---

    async createConnection(fromUserId, toUserId, message) {
      // Check for existing connection
      const { data: existing } = await client
        .from(CONNECTIONS_TABLE)
        .select("*")
        .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
        .maybeSingle();
      if (existing) {
        return { id: existing.id, fromUserId: existing.from_user_id, toUserId: existing.to_user_id, message: existing.message ?? "", status: existing.status, createdAt: existing.created_at, updatedAt: existing.updated_at };
      }

      const { data, error } = await client
        .from(CONNECTIONS_TABLE)
        .insert({ from_user_id: fromUserId, to_user_id: toUserId, message: message || "", status: "pending" })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return { id: data.id, fromUserId: data.from_user_id, toUserId: data.to_user_id, message: data.message ?? "", status: data.status, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async updateConnectionStatus(connectionId, status) {
      const { data, error } = await client
        .from(CONNECTIONS_TABLE)
        .update({ status })
        .eq("id", connectionId)
        .select("*")
        .maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, fromUserId: data.from_user_id, toUserId: data.to_user_id, message: data.message ?? "", status: data.status, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async listConnectionsByUser(userId) {
      const { data, error } = await client
        .from(CONNECTIONS_TABLE)
        .select("*")
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map((r) => ({ id: r.id, fromUserId: r.from_user_id, toUserId: r.to_user_id, message: r.message ?? "", status: r.status, createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async findConnectionById(connectionId) {
      const { data, error } = await client
        .from(CONNECTIONS_TABLE)
        .select("*")
        .eq("id", connectionId)
        .maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, fromUserId: data.from_user_id, toUserId: data.to_user_id, message: data.message ?? "", status: data.status, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    // --- Payments ---

    async createPayment(userId, { itemType, itemId, amount, currency, paymentMethod }) {
      const { data, error } = await client
        .from(PAYMENTS_TABLE)
        .insert({ user_id: userId, item_type: itemType, item_id: itemId, amount: parseFloat(amount) || 0, currency: currency || "USD", status: "pending", payment_method: paymentMethod || "card" })
        .select("*")
        .single();
      if (error) throw toStoreError(error);
      return { id: data.id, userId: data.user_id, itemType: data.item_type, itemId: data.item_id, amount: data.amount, currency: data.currency, status: data.status, paymentMethod: data.payment_method, transactionRef: data.transaction_ref, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async completePayment(paymentId, transactionRef) {
      const { data, error } = await client
        .from(PAYMENTS_TABLE)
        .update({ status: "completed", transaction_ref: transactionRef || `TXN-${Date.now()}` })
        .eq("id", paymentId)
        .select("*")
        .maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, userId: data.user_id, itemType: data.item_type, itemId: data.item_id, amount: data.amount, currency: data.currency, status: data.status, paymentMethod: data.payment_method, transactionRef: data.transaction_ref, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async findPaymentById(paymentId) {
      const { data, error } = await client.from(PAYMENTS_TABLE).select("*").eq("id", paymentId).maybeSingle();
      if (error) throw toStoreError(error);
      if (!data) return null;
      return { id: data.id, userId: data.user_id, itemType: data.item_type, itemId: data.item_id, amount: data.amount, currency: data.currency, status: data.status, paymentMethod: data.payment_method, transactionRef: data.transaction_ref, createdAt: data.created_at, updatedAt: data.updated_at };
    },

    async listPaymentsByUser(userId) {
      const { data, error } = await client.from(PAYMENTS_TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw toStoreError(error);
      return (data ?? []).map((r) => ({ id: r.id, userId: r.user_id, itemType: r.item_type, itemId: r.item_id, amount: r.amount, currency: r.currency, status: r.status, paymentMethod: r.payment_method, transactionRef: r.transaction_ref, createdAt: r.created_at, updatedAt: r.updated_at }));
    },

    async hasActivePayment(userId, itemType, itemId) {
      const { data, error } = await client.from(PAYMENTS_TABLE).select("id").eq("user_id", userId).eq("item_type", itemType).eq("item_id", itemId).eq("status", "completed").limit(1);
      if (error) throw toStoreError(error);
      return (data?.length ?? 0) > 0;
    },

    // --- AI Verifications ---

    async createVerification(userId) {
      const { data, error } = await client
        .from(AI_VERIFICATIONS_TABLE)
        .upsert({ user_id: userId, status: "running", recommendation: null, confidence: null, credibility_score: null, summary: null, findings: null, report_markdown: null, sources: [], red_flags: [], search_queries_run: 0, completed_at: null, created_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw toStoreError(error);
      return mapVerificationRow(data);
    },

    async updateVerification(userId, data) {
      const update = {};
      if (data.status !== undefined) update.status = data.status;
      if (data.recommendation !== undefined) update.recommendation = data.recommendation;
      if (data.confidence !== undefined) update.confidence = data.confidence;
      if (data.credibilityScore !== undefined) update.credibility_score = data.credibilityScore;
      if (data.summary !== undefined) update.summary = data.summary;
      if (data.findings !== undefined) update.findings = data.findings;
      if (data.reportMarkdown !== undefined) update.report_markdown = data.reportMarkdown;
      if (data.sources !== undefined) update.sources = data.sources;
      if (data.redFlags !== undefined) update.red_flags = data.redFlags;
      if (data.searchQueriesRun !== undefined) update.search_queries_run = data.searchQueriesRun;
      if (data.status === "complete") update.completed_at = new Date().toISOString();
      const { data: row, error } = await client.from(AI_VERIFICATIONS_TABLE).update(update).eq("user_id", userId).select().single();
      if (error) throw toStoreError(error);
      return row ? mapVerificationRow(row) : null;
    },

    async findVerification(userId) {
      const { data, error } = await client.from(AI_VERIFICATIONS_TABLE).select("*").eq("user_id", userId).single();
      if (error && error.code !== "PGRST116") throw toStoreError(error);
      return data ? mapVerificationRow(data) : null;
    },

    async listVerifications({ status, recommendation } = {}) {
      let query = client.from(AI_VERIFICATIONS_TABLE).select("*").order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      if (recommendation) query = query.eq("recommendation", recommendation);
      const { data, error } = await query;
      if (error) throw toStoreError(error);
      return (data ?? []).map(mapVerificationRow);
    },

    async getVerificationSummary() {
      const { data, error } = await client.from(AI_VERIFICATIONS_TABLE).select("status, recommendation");
      if (error) throw toStoreError(error);
      const rows = data ?? [];
      return {
        total: rows.length,
        running: rows.filter((r) => r.status === "running").length,
        complete: rows.filter((r) => r.status === "complete").length,
        failed: rows.filter((r) => r.status === "failed").length,
        skipped: rows.filter((r) => r.status === "skipped").length,
        accept: rows.filter((r) => r.recommendation === "accept").length,
        review: rows.filter((r) => r.recommendation === "review").length,
        reject: rows.filter((r) => r.recommendation === "reject").length,
      };
    },
  };
}
