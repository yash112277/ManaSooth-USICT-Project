import OpenAI from "openai";
import { type Message } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a professional mental health assessment chatbot. Your role is to:
1. Ask questions about mental health in a conversational, empathetic way
2. Gather information about mood, sleep, anxiety, and other relevant factors
3. Provide a supportive environment for users to share their experiences
4. Always include appropriate medical disclaimers
5. Direct users to emergency resources if they express crisis situations

Respond in JSON format with: { "message": string, "emergency": boolean }`;

export async function generateResponse(
  message: string,
  history: Message[]
): Promise<{ message: string; emergency: boolean }> {
  try {
    const messages: OpenAI.ChatCompletionMessage[] = [
      { role: "system", content: SYSTEM_PROMPT } as const,
      ...history.map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      { role: "user" as const, content: message }
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

export async function analyzeMentalHealth(
  responses: Record<string, string>
): Promise<{ score: number; summary: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content:
            "Analyze the mental health assessment responses and provide a score (0-100) and summary. Respond in JSON format.",
        },
        {
          role: "user" as const,
          content: JSON.stringify(responses),
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