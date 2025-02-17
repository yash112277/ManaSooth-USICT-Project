import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  who5Responses: jsonb("who5_responses").$type<Record<string, number>>(),
  gad7Responses: jsonb("gad7_responses").$type<Record<string, number>>(),
  phq9Responses: jsonb("phq9_responses").$type<Record<string, number>>(),
  who5Score: integer("who5_score"),
  gad7Score: integer("gad7_score"),
  phq9Score: integer("phq9_score"),
  conversationResponses: jsonb("conversation_responses").$type<Message[]>(),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  professionalId: text("professional_id").notNull(),
  dateTime: timestamp("date_time").notNull(),
  status: text("status").notNull().default('pending'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialization: text("specialization").notNull(),
  bio: text("bio"),
  availability: jsonb("availability").$type<AvailabilitySlot[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  createdAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type Message = z.infer<typeof messageSchema>;

// Questionnaire schemas
export const who5Questions = [
  "I have felt cheerful and in good spirits",
  "I have felt calm and relaxed",
  "I have felt active and vigorous",
  "I woke up feeling fresh and rested",
  "My daily life has been filled with things that interest me"
] as const;

export const gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
] as const;

export const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead or of hurting yourself"
] as const;

export type WHO5Question = typeof who5Questions[number];
export type GAD7Question = typeof gad7Questions[number];
export type PHQ9Question = typeof phq9Questions[number];

export const questionnaireResponseSchema = z.object({
  who5: z.record(z.string(), z.number()),
  gad7: z.record(z.string(), z.number()),
  phq9: z.record(z.string(), z.number()),
});

export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;

export type AvailabilitySlot = {
  day: string;
  startTime: string;
  endTime: string;
};