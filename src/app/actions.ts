"use server";

import { generateFactCheckVerdict, type GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import { factCheckImageAndText, type FactCheckImageAndTextInput, type FactCheckImageAndTextOutput } from "@/ai/flows/fact-check-image-and-text";
import { analyzeTextForFallacies, type AnalyzeTextForFallaciesOutput } from "@/ai/flows/analyze-text-for-fallacies";
import { traceMisinformationSource, type TraceMisinformationSourceOutput } from "@/ai/flows/trace-misinformation-source";
import { analyzeTextForScam, type AnalyzeTextForScamOutput } from "@/ai/flows/analyze-text-for-scam";
import { simplifyForKids, type SimplifyForKidsOutput } from "@/ai/flows/simplify-for-kids";


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

export async function analyzeFallacies(text: string): Promise<AnalyzeTextForFallaciesOutput | null> {
    if (!text) {
      throw new Error("Input text is required for fallacy analysis.");
    }
  
    try {
      const result = await analyzeTextForFallacies({ text });
      return result;
    } catch (error) {
      console.error("Error in analyzeTextForFallacies flow:", error);
      throw new Error("Failed to get an analysis from the AI model.");
    }
  }

export async function traceSource(claim: string): Promise<TraceMisinformationSourceOutput | null> {
    if (!claim) {
      throw new Error("Input claim is required for source tracing.");
    }
  
    try {
      const result = await traceMisinformationSource({ claim });
      return result;
    } catch (error) {
      console.error("Error in traceMisinformationSource flow:", error);
      throw new Error("Failed to get a source trace from the AI model.");
    }
  }

export async function checkForScam(text: string): Promise<AnalyzeTextForScamOutput | null> {
  if (!text) {
    throw new Error("Input text is required for scam analysis.");
  }

  try {
    const result = await analyzeTextForScam({ text });
    return result;
  } catch (error) {
    console.error("Error in analyzeTextForScam flow:", error);
    throw new Error("Failed to get a scam analysis from the AI model.");
  }
}

export async function getSimplifiedExplanation(textToSimplify: string): Promise<SimplifyForKidsOutput | null> {
  if (!textToSimplify) {
    throw new Error("Input text is required for simplification.");
  }
  try {
    const result = await simplifyForKids({ textToSimplify });
    return result;
  } catch (error) {
    console.error("Error in simplifyForKids flow:", error);
    throw new Error("Failed to get a simplified explanation from the AI model.");
  }
}
