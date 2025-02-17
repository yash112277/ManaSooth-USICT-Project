import OpenAI from "openai";
import { type Message, type QuestionnaireResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a professional mental health assessment chatbot. Your role is to:
1. Review and analyze the user's questionnaire responses (WHO-5, GAD-7, PHQ-9)
2. Have a supportive conversation about their mental health
3. Ask relevant follow-up questions based on their questionnaire responses
4. Provide insights and suggestions while maintaining appropriate boundaries
5. Always include appropriate medical disclaimers
6. Direct users to emergency resources if they express crisis situations

WHO-5 Scoring:
- Raw score ranges from 0-25
- Multiply by 4 to get percentage (0-100)
- Scores below 50 indicate low well-being
- Scores below 28 indicate depression

GAD-7 Scoring:
- 0-4: Minimal anxiety
- 5-9: Mild anxiety
- 10-14: Moderate anxiety
- 15-21: Severe anxiety

PHQ-9 Scoring:
- 0-4: Minimal depression
- 5-9: Mild depression
- 10-14: Moderate depression
- 15-19: Moderately severe depression
- 20-27: Severe depression

Respond in JSON format with: { "message": string, "emergency": boolean }`;

export async function generateResponse(
  message: string,
  history: Message[],
  questionnaireResponses?: QuestionnaireResponse
): Promise<{ message: string; emergency: boolean }> {
  try {
    let systemMessage = SYSTEM_PROMPT;
    if (questionnaireResponses && !history.length) {
      // First message after questionnaire completion
      const scores = calculateScores(questionnaireResponses);
      systemMessage += `\n\nQuestionnaire Results:
WHO-5 Score: ${scores.who5} (${interpretWHO5(scores.who5)})
GAD-7 Score: ${scores.gad7} (${interpretGAD7(scores.gad7)})
PHQ-9 Score: ${scores.phq9} (${interpretPHQ9(scores.phq9)})`;
    }

    const messages = [
      { role: "system", content: systemMessage },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as { message: string; emergency: boolean };
  } catch (err) {
    const error = err as Error;
    throw new Error("Failed to generate response: " + error.message);
  }
}

function calculateScores(responses: QuestionnaireResponse) {
  const who5 = Object.values(responses.who5).reduce((sum, val) => sum + val, 0) * 4;
  const gad7 = Object.values(responses.gad7).reduce((sum, val) => sum + val, 0);
  const phq9 = Object.values(responses.phq9).reduce((sum, val) => sum + val, 0);

  return { who5, gad7, phq9 };
}

function interpretWHO5(score: number): string {
  if (score < 28) return "Probable depression";
  if (score < 50) return "Low well-being";
  return "Good well-being";
}

function interpretGAD7(score: number): string {
  if (score >= 15) return "Severe anxiety";
  if (score >= 10) return "Moderate anxiety";
  if (score >= 5) return "Mild anxiety";
  return "Minimal anxiety";
}

function interpretPHQ9(score: number): string {
  if (score >= 20) return "Severe depression";
  if (score >= 15) return "Moderately severe depression";
  if (score >= 10) return "Moderate depression";
  if (score >= 5) return "Mild depression";
  return "Minimal depression";
}

export async function analyzeMentalHealth(
  responses: QuestionnaireResponse
): Promise<{ score: number; summary: string }> {
  try {
    const scores = calculateScores(responses);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the mental health assessment scores and provide a comprehensive summary. The scores are:
WHO-5: ${scores.who5}/100 (${interpretWHO5(scores.who5)})
GAD-7: ${scores.gad7}/21 (${interpretGAD7(scores.gad7)})
PHQ-9: ${scores.phq9}/27 (${interpretPHQ9(scores.phq9)})

Provide a JSON response with:
- score: overall well-being score (0-100)
- summary: detailed analysis of the results with recommendations`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as { score: number; summary: string };
  } catch (err) {
    const error = err as Error;
    throw new Error("Failed to analyze responses: " + error.message);
  }
}