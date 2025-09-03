"use server";

import { generateFactCheckVerdict, type GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";

export async function checkFact(text: string): Promise<GenerateFactCheckVerdictOutput | null> {
  if (!text) {
    throw new Error("Input text is required for fact-checking.");
  }

  try {
    const result = await generateFactCheckVerdict({ text });
    return result;
  } catch (error) {
    console.error("Error in generateFactCheckVerdict flow:", error);
    // Depending on the desired behavior, you might want to re-throw the error
    // or return null/a specific error object.
    throw new Error("Failed to get a verdict from the AI model.");
  }
}
