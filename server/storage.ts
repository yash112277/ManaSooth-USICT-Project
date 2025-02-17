import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAssessmentsByUserId(userId: string): Promise<Assessment[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<number, Assessment>;
  private currentId: number;

  constructor() {
    this.assessments = new Map();
    this.currentId = 1;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentId++;
    const newAssessment: Assessment = {
      ...assessment,
      id,
      createdAt: new Date(),
      summary: null, // Explicitly set to null initially
      score: null, // Explicitly set to null initially
    };
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsByUserId(userId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(
      (assessment) => assessment.userId === userId
    );
  }
}

export const storage = new MemStorage();