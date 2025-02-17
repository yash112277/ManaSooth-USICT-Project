import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, insertConsultationSchema, insertProfessionalSchema } from "@shared/schema";
import { analyzeMentalHealth, generateResponse } from "./openai";
import { ZodError } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

  // Existing chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, questionnaireResponses } = req.body;
      const response = await generateResponse(message, history, questionnaireResponses);
      res.json({ response });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  });

  // Existing assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessment = insertAssessmentSchema.parse(req.body);

      if (assessment.who5Responses || assessment.gad7Responses || assessment.phq9Responses) {
        const analysis = await analyzeMentalHealth({
          who5: assessment.who5Responses || {},
          gad7: assessment.gad7Responses || {},
          phq9: assessment.phq9Responses || {},
        });
        assessment.aiAnalysis = analysis.summary;
        assessment.consultationRecommended = analysis.needsConsultation;
      }

      const result = await storage.createAssessment(assessment);
      res.json(result);
    } catch (err) {
      const error = err as ZodError | Error;
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const assessment = await storage.getAssessment(id);
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    res.json(assessment);
  });

  app.get("/api/users/:userId/assessments", async (req, res) => {
    const { userId } = req.params;
    const assessments = await storage.getAssessmentsByUserId(userId);
    res.json(assessments);
  });

  // New consultation routes
  app.post("/api/consultations", async (req, res) => {
    try {
      const consultation = insertConsultationSchema.parse(req.body);
      const result = await storage.createConsultation(consultation);
      res.json(result);
    } catch (err) {
      const error = err as ZodError | Error;
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const consultation = await storage.getConsultation(id);
    if (!consultation) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    res.json(consultation);
  });

  app.get("/api/users/:userId/consultations", async (req, res) => {
    const { userId } = req.params;
    const consultations = await storage.getConsultationsByUserId(userId);
    res.json(consultations);
  });

  app.patch("/api/consultations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const result = await storage.updateConsultationStatus(id, status);
      res.json(result);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  });

  // Professional routes
  app.post("/api/professionals", async (req, res) => {
    try {
      const professional = insertProfessionalSchema.parse(req.body);
      const result = await storage.createProfessional(professional);
      res.json(result);
    } catch (err) {
      const error = err as ZodError | Error;
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/professionals", async (req, res) => {
    const professionals = await storage.listProfessionals();
    res.json(professionals);
  });

  app.get("/api/professionals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const professional = await storage.getProfessional(id);
    if (!professional) {
      res.status(404).json({ error: "Professional not found" });
      return;
    }
    res.json(professional);
  });

  app.get("/api/professionals/:id/availability", async (req, res) => {
    const id = parseInt(req.params.id);
    const professional = await storage.getProfessionalAvailability(id);
    if (!professional) {
      res.status(404).json({ error: "Professional not found" });
      return;
    }
    res.json(professional.availability);
  });

  return httpServer;
}