import { Router } from "express";
import { normalizeTrainingInput } from "../trainings.js";
import { createAuthenticate, requireApprovedRole } from "../middleware/auth.js";
import { paginate, trimText } from "../utils.js";

export function createTrainingsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);
  const requireAdvisorRole = requireApprovedRole("advisor");

  router.post("/", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const input = normalizeTrainingInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Training title is required." });
      const training = await store.createTraining(req.auth.userId, input);
      res.status(201).json({ message: "Training created successfully.", training });
    } catch (error) { next(error); }
  });

  router.get("/", authenticate, async (req, res, next) => {
    try {
      const trainings = await store.listTrainings();
      const { data, pagination } = paginate(trainings, req.query);
      res.json({ trainings: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.get("/my-enrollments", authenticate, async (req, res, next) => {
    try {
      const enrollments = await store.listEnrollmentsByUser(req.auth.userId);
      res.json({ enrollments });
    } catch (error) { next(error); }
  });

  router.get("/:id", authenticate, async (req, res, next) => {
    try {
      const training = await store.findTrainingById(trimText(req.params.id));
      if (!training) return res.status(404).json({ message: "Training not found." });
      res.json({ training });
    } catch (error) { next(error); }
  });

  router.put("/:id", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const existing = await store.findTrainingById(trainingId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Training not found." });
      const input = normalizeTrainingInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Training title is required." });
      const training = await store.updateTraining(trainingId, input);
      res.json({ message: "Training updated successfully.", training });
    } catch (error) { next(error); }
  });

  router.delete("/:id", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const existing = await store.findTrainingById(trainingId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Training not found." });
      await store.deleteTraining(trainingId);
      res.json({ message: "Training deleted successfully." });
    } catch (error) { next(error); }
  });

  router.get("/:id/enrollments", authenticate, async (req, res, next) => {
    try {
      const enrollments = await store.listEnrollmentsByTraining(trimText(req.params.id));
      res.json({ enrollments });
    } catch (error) { next(error); }
  });

  router.post("/:id/enroll", authenticate, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const training = await store.findTrainingById(trainingId);
      if (!training) return res.status(404).json({ message: "Training not found." });
      if (training.enrolled >= training.capacity) return res.status(400).json({ message: "Training is full." });
      const enrollment = await store.enrollInTraining(trainingId, req.auth.userId);
      res.status(201).json({ message: "Enrolled successfully.", enrollment });
    } catch (error) { next(error); }
  });

  router.post("/:id/unenroll", authenticate, async (req, res, next) => {
    try {
      await store.unenrollFromTraining(trimText(req.params.id), req.auth.userId);
      res.json({ message: "Unenrolled successfully." });
    } catch (error) { next(error); }
  });

  router.patch("/:id/progress", authenticate, async (req, res, next) => {
    try {
      const progress = Math.max(0, Math.min(100, Number.parseInt(String(req.body?.progress ?? 0), 10) || 0));
      const enrollment = await store.updateEnrollmentProgress(trimText(req.params.id), req.auth.userId, progress);
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found." });
      res.json({ message: "Progress updated.", enrollment });
    } catch (error) { next(error); }
  });

  return router;
}
