"use server";

import { generateFactCheckVerdict, type GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import { factCheckImageAndText, type FactCheckImageAndTextInput, type FactCheckImageAndTextOutput } from "@/ai/flows/fact-check-image-and-text";

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

export async function checkImageFact(input: FactCheckImageAndTextInput): Promise<FactCheckImageAndTextOutput | null> {
    if (!input.query || !input.photoDataUri) {
      throw new Error("Image and query are required for fact-checking.");
    }
  
    try {
      const result = await factCheckImageAndText(input);
      return result;
    } catch (error) {
      console.error("Error in factCheckImageAndText flow:", error);
      throw new Error("Failed to get a verdict from the AI model for the image.");
    }
  }