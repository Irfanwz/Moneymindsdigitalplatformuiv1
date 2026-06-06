import { Router } from "express";
import { sanitizeUser } from "../auth.js";
import { buildStartupProfile, normalizeStartupProfileInput } from "../startupProfiles.js";
import { buildInvestorProfile, normalizeInvestorProfileInput } from "../investorProfiles.js";
import { buildAdvisorProfile, normalizeAdvisorProfileInput } from "../advisorProfiles.js";
import { createAuthenticate, requireApprovedRole } from "../middleware/auth.js";
import { paginate, trimText } from "../utils.js";

export function createProfilesRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);
  const requireStartupRole = requireApprovedRole("startup");
  const requireInvestorRole = requireApprovedRole("investor");
  const requireAdvisorRole = requireApprovedRole("advisor");

  // --- Startup Profile ---
  router.get("/startup/profile", authenticate, requireStartupRole, async (req, res, next) => {
    try {
      const profile = await store.findStartupProfileByUserId(req.auth.userId);
      res.json({ profile: buildStartupProfile(req.currentUser, profile) });
    } catch (error) { next(error); }
  });

  router.put("/startup/profile", authenticate, requireStartupRole, async (req, res, next) => {
    try {
      const profileInput = normalizeStartupProfileInput(req.body, req.currentUser);
      if (profileInput.companyName.length < 2) return res.status(400).json({ message: "Company name is required." });
      if (profileInput.industry.length < 2) return res.status(400).json({ message: "Industry is required." });
      if (profileInput.description.length < 20) return res.status(400).json({ message: "Company description must be at least 20 characters." });
      if (profileInput.stage.length < 2) return res.status(400).json({ message: "Funding stage is required." });
      const savedProfile = await store.upsertStartupProfile(req.auth.userId, profileInput);
      res.json({ message: "Startup profile saved successfully.", profile: buildStartupProfile(req.currentUser, savedProfile) });
    } catch (error) { next(error); }
  });

  // --- Investor Profile ---
  router.get("/investor/profile", authenticate, requireInvestorRole, async (req, res, next) => {
    try {
      const profile = await store.findInvestorProfileByUserId(req.auth.userId);
      res.json({ profile: buildInvestorProfile(req.currentUser, profile) });
    } catch (error) { next(error); }
  });

  router.put("/investor/profile", authenticate, requireInvestorRole, async (req, res, next) => {
    try {
      const profileInput = normalizeInvestorProfileInput(req.body, req.currentUser);
      if (profileInput.investorType.length < 2) return res.status(400).json({ message: "Investor type is required." });
      if (profileInput.industries.length === 0) return res.status(400).json({ message: "Select at least one industry of interest." });
      const savedProfile = await store.upsertInvestorProfile(req.auth.userId, profileInput);
      res.json({ message: "Investor profile saved successfully.", profile: buildInvestorProfile(req.currentUser, savedProfile) });
    } catch (error) { next(error); }
  });

  // --- Advisor Profile ---
  router.get("/advisor/profile", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profile = await store.findAdvisorProfileByUserId(req.auth.userId);
      res.json({ profile: buildAdvisorProfile(req.currentUser, profile) });
    } catch (error) { next(error); }
  });

  router.put("/advisor/profile", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profileInput = normalizeAdvisorProfileInput(req.body, req.currentUser);
      if (profileInput.title.length < 2) return res.status(400).json({ message: "Professional title is required." });
      if (profileInput.specialization.length < 2) return res.status(400).json({ message: "Primary specialization is required." });
      if (profileInput.industries.length === 0) return res.status(400).json({ message: "Select at least one industry." });
      const savedProfile = await store.upsertAdvisorProfile(req.auth.userId, profileInput);
      res.json({ message: "Advisor profile saved successfully.", profile: buildAdvisorProfile(req.currentUser, savedProfile) });
    } catch (error) { next(error); }
  });

  // --- Public Profiles ---
  router.get("/advisors/:userId/public-profile", authenticate, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const user = await store.findUserById(userId);
      if (!user) return res.status(404).json({ message: "Advisor not found." });
      const profile = await store.findAdvisorProfileByUserId(userId);
      res.json({ profile: buildAdvisorProfile(user, profile), name: user.fullName, location: user.location, bio: user.bio });
    } catch (error) { next(error); }
  });

  router.get("/startups/:userId/public-profile", authenticate, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const user = await store.findUserById(userId);
      if (!user) return res.status(404).json({ message: "Startup not found." });
      const profile = await store.findStartupProfileByUserId(userId);
      res.json({ profile: buildStartupProfile(user, profile), name: user.fullName, location: user.location, bio: user.bio });
    } catch (error) { next(error); }
  });

  // --- Search & Discovery ---
  router.get("/startups/search", authenticate, async (req, res, next) => {
    try {
      const industry = trimText(req.query.industry) || undefined;
      const stage = trimText(req.query.stage) || undefined;
      const query = trimText(req.query.q) || undefined;
      const startups = await store.searchStartups({ industry, stage, query });
      const { data, pagination } = paginate(startups, req.query);
      res.json({ startups: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.get("/advisors/search", authenticate, async (req, res, next) => {
    try {
      const industry = trimText(req.query.industry) || undefined;
      const specialization = trimText(req.query.specialization) || undefined;
      const query = trimText(req.query.q) || undefined;
      const advisors = await store.searchAdvisors({ industry, specialization, query });
      const { data, pagination } = paginate(advisors, req.query);
      res.json({ advisors: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  return router;
}
