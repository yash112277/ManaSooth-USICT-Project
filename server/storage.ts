import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { consultations, type Consultation, type InsertConsultation } from "@shared/schema";
import { professionals, type Professional, type InsertProfessional } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte } from "drizzle-orm";

export interface IStorage {
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAssessmentsByUserId(userId: string): Promise<Assessment[]>;

  // Consultation methods
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  getConsultationsByUserId(userId: string): Promise<Consultation[]>;
  getConsultationsByProfessionalId(professionalId: string): Promise<Consultation[]>;
  updateConsultationStatus(id: number, status: string): Promise<Consultation>;

  // Professional methods
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  getProfessional(id: number): Promise<Professional | undefined>;
  listProfessionals(): Promise<Professional[]>;
  getProfessionalAvailability(id: number): Promise<Professional | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Assessment methods
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment;
  }

  async getAssessmentsByUserId(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId));
  }

  // Consultation methods
  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db
      .insert(consultations)
      .values(consultation)
      .returning();
    return newConsultation;
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));
    return consultation;
  }

  async getConsultationsByUserId(userId: string): Promise<Consultation[]> {
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.userId, userId));
  }

  async getConsultationsByProfessionalId(professionalId: string): Promise<Consultation[]> {
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.professionalId, professionalId));
  }

  async updateConsultationStatus(id: number, status: string): Promise<Consultation> {
    const [updatedConsultation] = await db
      .update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();
    return updatedConsultation;
  }

  // Professional methods
  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [newProfessional] = await db
      .insert(professionals)
      .values(professional)
      .returning();
    return newProfessional;
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, id));
    return professional;
  }

  async listProfessionals(): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals);
  }

  async getProfessionalAvailability(id: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, id));
    return professional;
  }
}

export const storage = new DatabaseStorage();