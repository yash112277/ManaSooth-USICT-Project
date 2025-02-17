import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema } from "@shared/schema";
import { analyzeMentalHealth, generateResponse } from "./openai";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

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

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessment = insertAssessmentSchema.parse(req.body);

      // Calculate scores and analysis if questionnaire responses are provided
      if (assessment.who5Responses || assessment.gad7Responses || assessment.phq9Responses) {
        const analysis = await analyzeMentalHealth({
          who5: assessment.who5Responses || {},
          gad7: assessment.gad7Responses || {},
          phq9: assessment.phq9Responses || {},
        });
        assessment.aiAnalysis = analysis.summary;
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

  return httpServer;
}