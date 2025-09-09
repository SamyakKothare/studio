"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeTextForScamOutput } from "@/ai/flows/analyze-text-for-scam";
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle, Link, SpellCheck, UserCheck, Gift } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type ScamAnalysisResult = AnalyzeTextForScamOutput & {
  query: string;
};

interface ScamAnalysisCardProps {
  result?: ScamAnalysisResult;
  isLoading?: boolean;
}

const tacticToIcon: Record<string, React.ReactNode> = {
    "Urgent Call to Action": <AlertTriangle className="size-5" />,
    "Suspicious Link": <Link className="size-5" />,
    "Grammatical Errors": <SpellCheck className="size-5" />,
    "Request for Personal Information": <UserCheck className="size-5" />,
    "Too-Good-To-Be-True Offer": <Gift className="size-5" />,
    "Impersonation": <UserCheck className="size-5" />,
};

const riskLevelConfig = {
    'High Risk': {
        icon: <ShieldAlert className="size-8 text-destructive" />,
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        titleClass: "text-destructive",
        borderColor: "border-destructive/50",
    },
    'Medium Risk': {
        icon: <ShieldQuestion className="size-8 text-amber-500" />,
        badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        titleClass: "text-amber-600",
        borderColor: "border-amber-500/50",
    },
    'Likely Safe': {
        icon: <ShieldCheck className="size-8 text-green-500" />,
        badgeClass: "bg-green-500/10 text-green-600 border-green-500/20",
        titleClass: "text-green-600",
        borderColor: "border-green-500/50",
    }
}

export function ScamAnalysisCard({ result, isLoading = false }: ScamAnalysisCardProps) {
  if (isLoading) {
    return <ScamAnalysisCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { riskLevel, summary, detectedTactics, query } = result;
  const config = riskLevelConfig[riskLevel];

  return (
    <Card className={cn("shadow-lg animate-in fade-in-50 border-t-4", config.borderColor)} style={{borderTopColor: riskLevelConfig[riskLevel] ? `hsl(var(--${riskLevel === 'High Risk' ? 'destructive' : riskLevel === 'Medium Risk' ? 'chart-4' : 'accent'}))` : 'hsl(var(--border))'}}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{config.icon}</div>
                <div>
                    <CardTitle className={cn("text-xl", config.titleClass)}>Scam Analysis Report</CardTitle>
                    <CardDescription className="pt-1 max-w-xl">
                        Analysis for: "{query}"
                    </CardDescription>
                </div>
            </div>
             <Badge className={cn("text-md py-1 px-3", config.badgeClass)}>{riskLevel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-base text-foreground/90">{summary}</p>
      </CardContent>
      {detectedTactics.length > 0 && (
        <CardFooter className="flex-col items-start gap-4 pt-4">
            <h3 className="font-semibold text-lg text-foreground/90">Detected Red Flags</h3>
            <ul className="space-y-6 w-full">
            {detectedTactics.map((item, index) => (
              <li key={index} className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-md text-primary flex items-center gap-2">
                   {tacticToIcon[item.tactic] || <AlertTriangle className="size-5" />}
                   {item.tactic}
                </h4>
                <blockquote className="mt-2 pl-4 border-l-4 border-primary/50 italic text-foreground/80">
                  "{item.excerpt}"
                </blockquote>
                <p className="mt-3 text-sm text-foreground/90">{item.explanation}</p>
              </li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
}

function ScamAnalysisCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-5 w-80" />
                </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4 mt-2" />
      </CardContent>
       <CardFooter className="flex-col items-start gap-4 pt-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="space-y-6 w-full">
            {[...Array(2)].map((_, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ))}
            </div>
        </CardFooter>
    </Card>
  );
}
