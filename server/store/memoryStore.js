import { randomUUID } from "node:crypto";

function now() {
  return new Date().toISOString();
}

function cloneUser(user) {
  return {
    ...user,
    requestedRoles: [...user.requestedRoles],
    approvedRoles: [...user.approvedRoles],
  };
}

function cloneStartupProfile(profile) {
  return {
    ...profile,
    categories: [...profile.categories],
    teamMembers: profile.teamMembers.map((member) => ({ ...member })),
  };
}

function cloneInvestorProfile(profile) {
  return {
    ...profile,
    industries: [...profile.industries],
  };
}

function cloneAdvisorProfile(profile) {
  return {
    ...profile,
    expertiseAreas: profile.expertiseAreas.map((e) => ({ ...e })),
    certifications: profile.certifications.map((c) => ({ ...c })),
    industries: [...profile.industries],
  };
}

export function createMemoryStore() {
  const users = [];
  const startupProfiles = [];
  const investorProfiles = [];
  const advisorProfiles = [];
  const advisorGroups = [];
  const advisorGroupMembers = [];
  const advisorSignals = [];
  const trainings = [];
  const trainingEnrollments = [];
  const passwordResetTokens = [];
  const signalComments = [];
  const signalReactions = [];
  const notifications = [];
  const connections = [];
  const payments = [];

  return {
    mode: "memory",

    async health() {
      return {
        mode: "memory",
        userCount: users.length,
      };
    },

    async ensureAdminAccount({ fullName, email, passwordHash }) {
      const existingUser = users.find((user) => user.email === email.toLowerCase());
      const timestamp = now();

      if (existingUser) {
        existingUser.fullName = fullName;
        existingUser.passwordHash = passwordHash;
        existingUser.isAdmin = true;
        existingUser.status = "approved";
        existingUser.updatedAt = timestamp;
        return cloneUser(existingUser);
      }

      const user = {
        id: randomUUID(),
        fullName,
        email: email.toLowerCase(),
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
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      users.push(user);
      return cloneUser(user);
    },

    async createUserProfile(profile) {
      const email = profile.email.toLowerCase();

      if (users.some((user) => user.email === email)) {
        const error = new Error("An account with this email already exists.");
        error.code = "DUPLICATE_EMAIL";
        throw error;
      }

      const timestamp = now();
      const user = {
        id: randomUUID(),
        fullName: profile.fullName,
        email,
        passwordHash: profile.passwordHash,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        status: "pending",
        requestedRoles: profile.requestedRoles,
        approvedRoles: [],
        isAdmin: false,
        adminNotes: null,
        rejectionReason: null,
        approvedAt: null,
        approvedBy: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      users.push(user);
      return cloneUser(user);
    },

    async findUserByEmail(email) {
      const user = users.find((entry) => entry.email === email.toLowerCase());
      return user ? cloneUser(user) : null;
    },

    async findUserById(userId) {
      const user = users.find((entry) => entry.id === userId);
      return user ? cloneUser(user) : null;
    },

    async listUsers({ status, includeAdmins = false } = {}) {
      return users
        .filter((user) => includeAdmins || !user.isAdmin)
        .filter((user) => !status || user.status === status)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(cloneUser);
    },

    async updateApproval(userId, approval) {
      const user = users.find((entry) => entry.id === userId);

      if (!user) {
        return null;
      }

      user.status = approval.status;
      user.approvedRoles = approval.status === "approved" ? approval.approvedRoles : [];
      user.adminNotes = approval.adminNotes ?? null;
      user.rejectionReason = approval.status === "rejected" ? approval.rejectionReason ?? null : null;
      user.approvedAt = approval.status === "approved" ? now() : null;
      user.approvedBy = approval.approvedBy ?? null;
      user.updatedAt = now();

      return cloneUser(user);
    },

    // --- Password Reset ---

    async createPasswordResetToken(userId, token, expiresAt) {
      const entry = {
        id: randomUUID(),
        userId,
        token,
        expiresAt,
        used: false,
        createdAt: now(),
      };
      passwordResetTokens.push(entry);
      return { ...entry };
    },

    async findPasswordResetToken(token) {
      const entry = passwordResetTokens.find((t) => t.token === token);
      return entry ? { ...entry } : null;
    },

    async markPasswordResetTokenUsed(token) {
      const entry = passwordResetTokens.find((t) => t.token === token);
      if (entry) entry.used = true;
      return true;
    },

    async updateUserPassword(userId, passwordHash) {
      const user = users.find((u) => u.id === userId);
      if (!user) return null;
      user.passwordHash = passwordHash;
      user.updatedAt = now();
      return cloneUser(user);
    },

    async findStartupProfileByUserId(userId) {
      const profile = startupProfiles.find((entry) => entry.userId === userId);
      return profile ? cloneStartupProfile(profile) : null;
    },

    async upsertStartupProfile(userId, profileInput) {
      const timestamp = now();
      const existingProfile = startupProfiles.find((entry) => entry.userId === userId);

      if (existingProfile) {
        Object.assign(existingProfile, {
          ...profileInput,
          updatedAt: timestamp,
        });

        return cloneStartupProfile(existingProfile);
      }

      const profile = {
        id: randomUUID(),
        userId,
        ...profileInput,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      startupProfiles.push(profile);
      return cloneStartupProfile(profile);
    },

    async findInvestorProfileByUserId(userId) {
      const profile = investorProfiles.find((entry) => entry.userId === userId);
      return profile ? cloneInvestorProfile(profile) : null;
    },

    async upsertInvestorProfile(userId, profileInput) {
      const timestamp = now();
      const existingProfile = investorProfiles.find((entry) => entry.userId === userId);

      if (existingProfile) {
        Object.assign(existingProfile, {
          ...profileInput,
          updatedAt: timestamp,
        });

        return cloneInvestorProfile(existingProfile);
      }

      const profile = {
        id: randomUUID(),
        userId,
        ...profileInput,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      investorProfiles.push(profile);
      return cloneInvestorProfile(profile);
    },

    async findAdvisorProfileByUserId(userId) {
      const profile = advisorProfiles.find((entry) => entry.userId === userId);
      return profile ? cloneAdvisorProfile(profile) : null;
    },

    async upsertAdvisorProfile(userId, profileInput) {
      const timestamp = now();
      const existingProfile = advisorProfiles.find((entry) => entry.userId === userId);

      if (existingProfile) {
        Object.assign(existingProfile, {
          ...profileInput,
          updatedAt: timestamp,
        });

        return cloneAdvisorProfile(existingProfile);
      }

      const profile = {
        id: randomUUID(),
        userId,
        ...profileInput,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      advisorProfiles.push(profile);
      return cloneAdvisorProfile(profile);
    },

    // --- Search ---

    async searchStartups({ industry, stage, query } = {}) {
      const results = [];
      for (const profile of startupProfiles) {
        if (!profile.companyName) continue;
        const user = users.find((u) => u.id === profile.userId);
        if (!user || user.status !== "approved") continue;
        if (profile.isPublic === false) continue;

        if (industry && profile.industry?.toLowerCase() !== industry.toLowerCase()
            && !profile.categories?.some((c) => c.toLowerCase() === industry.toLowerCase())) continue;
        if (stage && profile.stage?.toLowerCase() !== stage.toLowerCase()) continue;
        if (query) {
          const q = query.toLowerCase();
          const haystack = [profile.companyName, profile.tagline, profile.description, profile.industry, ...(profile.categories || [])].join(" ").toLowerCase();
          if (!haystack.includes(q)) continue;
        }

        results.push({
          id: profile.id,
          userId: profile.userId,
          companyName: profile.companyName,
          tagline: profile.tagline ?? "",
          industry: profile.industry,
          stage: profile.stage,
          totalRaised: profile.totalRaised ?? "",
          description: profile.description ?? "",
          categories: [...(profile.categories || [])],
          location: profile.location ?? user.location ?? "",
        });
      }
      return results;
    },

    async searchAdvisors({ industry, specialization, query } = {}) {
      const results = [];
      for (const profile of advisorProfiles) {
        const user = users.find((u) => u.id === profile.userId);
        if (!user || user.status !== "approved") continue;
        if (profile.isPublic === false) continue;

        if (industry && !profile.industries?.some((i) => i.toLowerCase() === industry.toLowerCase())) continue;
        if (specialization && profile.specialization?.toLowerCase() !== specialization.toLowerCase()) continue;
        if (query) {
          const q = query.toLowerCase();
          const haystack = [user.fullName, profile.title, profile.bio, profile.specialization, ...(profile.industries || []), ...(profile.expertiseAreas || []).map((e) => e.area)].join(" ").toLowerCase();
          if (!haystack.includes(q)) continue;
        }

        results.push({
          id: profile.id,
          userId: profile.userId,
          name: user.fullName,
          title: profile.title ?? "",
          location: user.location ?? "",
          bio: profile.bio ?? "",
          yearsExperience: profile.yearsExperience ?? null,
          clientsHelped: profile.clientsHelped ?? null,
          specialization: profile.specialization ?? "",
          typicalRate: profile.typicalRate ?? "",
          availability: profile.availability ?? "",
          industries: [...(profile.industries || [])],
          expertiseAreas: (profile.expertiseAreas || []).map((e) => ({ ...e })),
        });
      }
      return results;
    },

    // --- Advisor Groups ---

    async createGroup(advisorId, groupInput) {
      const timestamp = now();
      const group = {
        id: randomUUID(),
        advisorId,
        ...groupInput,
        memberCount: 0,
        signalCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      advisorGroups.push(group);
      return { ...group };
    },

    async listGroupsByAdvisor(advisorId) {
      return advisorGroups
        .filter((g) => g.advisorId === advisorId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((g) => ({ ...g }));
    },

    async listPublicGroups() {
      return advisorGroups
        .filter((g) => !g.isPrivate)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((g) => ({ ...g }));
    },

    async listUserMemberships(userId) {
      return advisorGroupMembers
        .filter((m) => m.userId === userId)
        .map((m) => ({ ...m }));
    },

    async findGroupById(groupId) {
      const group = advisorGroups.find((g) => g.id === groupId);
      return group ? { ...group } : null;
    },

    async updateGroup(groupId, groupInput) {
      const group = advisorGroups.find((g) => g.id === groupId);
      if (!group) return null;
      Object.assign(group, { ...groupInput, updatedAt: now() });
      return { ...group };
    },

    async deleteGroup(groupId) {
      const index = advisorGroups.findIndex((g) => g.id === groupId);
      if (index === -1) return false;
      advisorGroups.splice(index, 1);
      // Clean up members and signals
      for (let i = advisorGroupMembers.length - 1; i >= 0; i--) {
        if (advisorGroupMembers[i].groupId === groupId) advisorGroupMembers.splice(i, 1);
      }
      for (let i = advisorSignals.length - 1; i >= 0; i--) {
        if (advisorSignals[i].groupId === groupId) advisorSignals.splice(i, 1);
      }
      return true;
    },

    async joinGroup(groupId, userId) {
      const existing = advisorGroupMembers.find((m) => m.groupId === groupId && m.userId === userId);
      if (existing) return { ...existing };
      const member = {
        id: randomUUID(),
        groupId,
        userId,
        role: "member",
        joinedAt: now(),
      };
      advisorGroupMembers.push(member);
      const group = advisorGroups.find((g) => g.id === groupId);
      if (group) group.memberCount++;
      return { ...member };
    },

    async leaveGroup(groupId, userId) {
      const index = advisorGroupMembers.findIndex((m) => m.groupId === groupId && m.userId === userId);
      if (index === -1) return false;
      advisorGroupMembers.splice(index, 1);
      const group = advisorGroups.find((g) => g.id === groupId);
      if (group && group.memberCount > 0) group.memberCount--;
      return true;
    },

    async listGroupMembers(groupId) {
      return advisorGroupMembers
        .filter((m) => m.groupId === groupId)
        .map((m) => ({ ...m }));
    },

    async removeGroupMember(groupId, userId) {
      const index = advisorGroupMembers.findIndex((m) => m.groupId === groupId && m.userId === userId);
      if (index === -1) return false;
      advisorGroupMembers.splice(index, 1);
      const group = advisorGroups.find((g) => g.id === groupId);
      if (group && group.memberCount > 0) group.memberCount--;
      return true;
    },

    // --- Advisor Signals ---

    async createSignal(groupId, advisorId, signalInput) {
      const timestamp = now();
      const signal = {
        id: randomUUID(),
        groupId,
        advisorId,
        ...signalInput,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      advisorSignals.push(signal);
      const group = advisorGroups.find((g) => g.id === groupId);
      if (group) group.signalCount++;
      return { ...signal };
    },

    async listSignalsByGroup(groupId) {
      return advisorSignals
        .filter((s) => s.groupId === groupId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((s) => ({ ...s, tags: [...s.tags] }));
    },

    async deleteSignal(signalId) {
      const index = advisorSignals.findIndex((s) => s.id === signalId);
      if (index === -1) return false;
      const signal = advisorSignals[index];
      advisorSignals.splice(index, 1);
      const group = advisorGroups.find((g) => g.id === signal.groupId);
      if (group && group.signalCount > 0) group.signalCount--;
      return true;
    },

    async findSignalById(signalId) {
      const signal = advisorSignals.find((s) => s.id === signalId);
      return signal ? { ...signal, tags: [...signal.tags] } : null;
    },

    async updateSignal(signalId, input) {
      const signal = advisorSignals.find((s) => s.id === signalId);
      if (!signal) return null;
      Object.assign(signal, {
        postType: input.postType ?? signal.postType,
        title: input.title ?? signal.title,
        content: input.content ?? signal.content,
        signalType: input.signalType ?? signal.signalType,
        targetPrice: input.targetPrice ?? signal.targetPrice,
        timeHorizon: input.timeHorizon ?? signal.timeHorizon,
        confidenceLevel: input.confidenceLevel ?? signal.confidenceLevel,
        tags: Array.isArray(input.tags) ? [...input.tags] : signal.tags,
        notifyMembers: input.notifyMembers ?? signal.notifyMembers,
        updatedAt: now(),
      });
      return { ...signal, tags: [...signal.tags] };
    },

    // --- Signal Comments & Reactions ---

    async createComment(signalId, userId, content) {
      const comment = {
        id: randomUUID(),
        signalId,
        userId,
        content,
        createdAt: now(),
        updatedAt: now(),
      };
      signalComments.push(comment);
      return { ...comment };
    },

    async listCommentsBySignal(signalId) {
      return signalComments
        .filter((c) => c.signalId === signalId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((c) => ({ ...c }));
    },

    async deleteComment(commentId) {
      const index = signalComments.findIndex((c) => c.id === commentId);
      if (index === -1) return false;
      signalComments.splice(index, 1);
      return true;
    },

    async findCommentById(commentId) {
      const c = signalComments.find((c) => c.id === commentId);
      return c ? { ...c } : null;
    },

    async toggleReaction(signalId, userId, reaction) {
      const existing = signalReactions.find(
        (r) => r.signalId === signalId && r.userId === userId && r.reaction === reaction
      );
      if (existing) {
        const index = signalReactions.indexOf(existing);
        signalReactions.splice(index, 1);
        return { added: false };
      }
      signalReactions.push({
        id: randomUUID(),
        signalId,
        userId,
        reaction,
        createdAt: now(),
      });
      return { added: true };
    },

    async listReactionsBySignal(signalId) {
      return signalReactions
        .filter((r) => r.signalId === signalId)
        .map((r) => ({ ...r }));
    },

    // --- Trainings ---

    async createTraining(advisorId, input) {
      const timestamp = now();
      const training = { id: randomUUID(), advisorId, ...input, enrolled: 0, createdAt: timestamp, updatedAt: timestamp };
      trainings.push(training);
      return { ...training, topics: [...training.topics], targetAudience: [...training.targetAudience] };
    },

    async listTrainings() {
      return trainings
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((t) => {
          const user = users.find((u) => u.id === t.advisorId);
          return { ...t, topics: [...t.topics], targetAudience: [...t.targetAudience], instructorName: user?.fullName ?? "" };
        });
    },

    async listTrainingsByAdvisor(advisorId) {
      return trainings
        .filter((t) => t.advisorId === advisorId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((t) => ({ ...t, topics: [...t.topics], targetAudience: [...t.targetAudience] }));
    },

    async findTrainingById(trainingId) {
      const t = trainings.find((t) => t.id === trainingId);
      if (!t) return null;
      const user = users.find((u) => u.id === t.advisorId);
      return { ...t, topics: [...t.topics], targetAudience: [...t.targetAudience], instructorName: user?.fullName ?? "" };
    },

    async updateTraining(trainingId, input) {
      const t = trainings.find((t) => t.id === trainingId);
      if (!t) return null;
      Object.assign(t, { ...input, updatedAt: now() });
      return { ...t, topics: [...t.topics], targetAudience: [...t.targetAudience] };
    },

    async deleteTraining(trainingId) {
      const idx = trainings.findIndex((t) => t.id === trainingId);
      if (idx === -1) return false;
      trainings.splice(idx, 1);
      for (let i = trainingEnrollments.length - 1; i >= 0; i--) {
        if (trainingEnrollments[i].trainingId === trainingId) trainingEnrollments.splice(i, 1);
      }
      return true;
    },

    async enrollInTraining(trainingId, userId) {
      const existing = trainingEnrollments.find((e) => e.trainingId === trainingId && e.userId === userId);
      if (existing) return { ...existing };
      const enrollment = { id: randomUUID(), trainingId, userId, progress: 0, enrolledAt: now() };
      trainingEnrollments.push(enrollment);
      const t = trainings.find((t) => t.id === trainingId);
      if (t) t.enrolled++;
      return { ...enrollment };
    },

    async unenrollFromTraining(trainingId, userId) {
      const idx = trainingEnrollments.findIndex((e) => e.trainingId === trainingId && e.userId === userId);
      if (idx === -1) return false;
      trainingEnrollments.splice(idx, 1);
      const t = trainings.find((t) => t.id === trainingId);
      if (t && t.enrolled > 0) t.enrolled--;
      return true;
    },

    async listEnrollmentsByUser(userId) {
      return trainingEnrollments
        .filter((e) => e.userId === userId)
        .map((e) => ({ ...e }));
    },

    async listEnrollmentsByTraining(trainingId) {
      return trainingEnrollments
        .filter((e) => e.trainingId === trainingId)
        .map((e) => ({ ...e }));
    },

    async updateEnrollmentProgress(trainingId, userId, progress) {
      const e = trainingEnrollments.find((e) => e.trainingId === trainingId && e.userId === userId);
      if (!e) return null;
      e.progress = progress;
      return { ...e };
    },

    // --- Notifications ---

    async createNotification(userId, { title, message, type }) {
      const notification = {
        id: randomUUID(),
        userId,
        title,
        message: message || "",
        type: type || "info",
        read: false,
        createdAt: now(),
      };
      notifications.push(notification);
      return { ...notification };
    },

    async listNotificationsByUser(userId) {
      return notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50)
        .map((n) => ({ ...n }));
    },

    async markNotificationRead(notificationId) {
      const n = notifications.find((n) => n.id === notificationId);
      if (!n) return null;
      n.read = true;
      return { ...n };
    },

    async markAllNotificationsRead(userId) {
      notifications.filter((n) => n.userId === userId).forEach((n) => { n.read = true; });
    },

    // --- Connections ---

    async createConnection(fromUserId, toUserId, message) {
      const existing = connections.find(
        (c) => (c.fromUserId === fromUserId && c.toUserId === toUserId) ||
               (c.fromUserId === toUserId && c.toUserId === fromUserId)
      );
      if (existing) return existing;

      const connection = {
        id: randomUUID(),
        fromUserId,
        toUserId,
        message: message || "",
        status: "pending",
        createdAt: now(),
        updatedAt: now(),
      };
      connections.push(connection);
      return { ...connection };
    },

    async updateConnectionStatus(connectionId, status) {
      const c = connections.find((c) => c.id === connectionId);
      if (!c) return null;
      c.status = status;
      c.updatedAt = now();
      return { ...c };
    },

    async listConnectionsByUser(userId) {
      return connections
        .filter((c) => c.fromUserId === userId || c.toUserId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((c) => ({ ...c }));
    },

    async findConnectionById(connectionId) {
      const c = connections.find((c) => c.id === connectionId);
      return c ? { ...c } : null;
    },

    // --- Payments ---

    async createPayment(userId, { itemType, itemId, amount, currency, paymentMethod }) {
      const payment = {
        id: randomUUID(),
        userId,
        itemType,
        itemId,
        amount: parseFloat(amount) || 0,
        currency: currency || "USD",
        status: "pending",
        paymentMethod: paymentMethod || "card",
        transactionRef: null,
        createdAt: now(),
        updatedAt: now(),
      };
      payments.push(payment);
      return { ...payment };
    },

    async completePayment(paymentId, transactionRef) {
      const p = payments.find((p) => p.id === paymentId);
      if (!p) return null;
      p.status = "completed";
      p.transactionRef = transactionRef || `TXN-${Date.now()}`;
      p.updatedAt = now();
      return { ...p };
    },

    async findPaymentById(paymentId) {
      const p = payments.find((p) => p.id === paymentId);
      return p ? { ...p } : null;
    },

    async listPaymentsByUser(userId) {
      return payments
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((p) => ({ ...p }));
    },

    async hasActivePayment(userId, itemType, itemId) {
      return payments.some((p) => p.userId === userId && p.itemType === itemType && p.itemId === itemId && p.status === "completed");
    },
  };
}
