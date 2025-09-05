"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeTextForFallaciesOutput } from "@/ai/flows/analyze-text-for-fallacies";
import { BrainCircuit, BookOpenCheck } from "lucide-react";

type FallacyAnalysisResult = AnalyzeTextForFallaciesOutput & {
  query: string;
};

interface FallacyAnalysisCardProps {
  result?: FallacyAnalysisResult;
  isLoading?: boolean;
}

export function FallacyAnalysisCard({ result, isLoading = false }: FallacyAnalysisCardProps) {
  if (isLoading) {
    return <FallacyAnalysisCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { fallacies, query } = result;

  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
             <BrainCircuit className="size-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Logical Fallacy Analysis</CardTitle>
            <CardDescription className="pt-1">
              Analysis for: "{query}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fallacies.length > 0 ? (
          <ul className="space-y-6">
            {fallacies.map((item, index) => (
              <li key={index} className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                   <BookOpenCheck className="size-5" />
                   {item.fallacy}
                </h3>
                <blockquote className="mt-2 pl-4 border-l-4 border-primary/50 italic text-foreground/80">
                  "{item.excerpt}"
                </blockquote>
                <p className="mt-3 text-sm text-foreground/90">{item.explanation}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
            <BookOpenCheck className="size-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No Logical Fallacies Found</h3>
            <p className="text-muted-foreground mt-1">
              The provided text appears to be logically sound based on our analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FallacyAnalysisCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full" />
          <div>
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {[...Array(2)].map((_, index) => (
             <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
