
"use client";

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils";
import type { GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import type { FactCheckImageAndTextOutput } from "@/ai/flows/fact-check-image-and-text";
import { CheckCircle2, Link as LinkIcon, AlertCircle, Info, ExternalLink, MapPin, ScanSearch, Shield, ShieldAlert, Volume2, Loader } from "lucide-react";
import { speakText } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type FactCheckResult = (GenerateFactCheckVerdictOutput | FactCheckImageAndTextOutput) & {
  query: string;
};

interface VerdictCardProps {
  result?: FactCheckResult;
  isLoading?: boolean;
}

export function VerdictCard({ result, isLoading = false }: VerdictCardProps) {
  const [isSpeaking, startSpeakingTransition] = useTransition();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  if (isLoading) {
    return <VerdictCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { verdict, confidenceScore, confidenceReasoning, sources, when, where, query, explanation } = result;
  const manipulationAnalysis = 'manipulationAnalysis' in result ? result.manipulationAnalysis : null;
  const isTrue = verdict === "TRUE";

  const handleSpeak = (text: string) => {
    if (audio?.src && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setAudio(null);
      return;
    }

    startSpeakingTransition(async () => {
      try {
        const response = await speakText(text);
        if (response?.audioDataUri) {
          const newAudio = new Audio(response.audioDataUri);
          setAudio(newAudio);
          newAudio.play();
          newAudio.onended = () => setAudio(null);
        }
      } catch (error) {
        console.error("Failed to generate speech:", error);
        toast({
          title: "Speech Generation Failed",
          description: "Could not generate audio for the selected text.",
          variant: "destructive",
        });
      }
    });
  };

  const confidenceColor =
    confidenceScore > 75
      ? "bg-green-500"
      : confidenceScore > 40
      ? "bg-yellow-500"
      : "bg-red-500";
      
  const manipulationConfidenceColor = manipulationAnalysis
    ? manipulationAnalysis.manipulationConfidence > 75
      ? "bg-green-500"
      : manipulationAnalysis.manipulationConfidence > 40
      ? "bg-yellow-500"
      : "bg-red-500"
    : "";

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Verdict</CardTitle>
            <CardDescription className="pt-1">
              Result for: "{query}"
            </CardDescription>
          </div>
          <Badge
            className={cn(
              "text-lg",
              isTrue
                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800"
                : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800"
            )}
          >
            {isTrue ? (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            ) : (
              <AlertCircle className="mr-2 h-5 w-5" />
            )}
            {verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Confidence Score</h3>
          <div className="flex items-center gap-4">
            <Progress value={confidenceScore} className={cn("h-3", confidenceColor)} />
            <span className="font-semibold text-lg text-foreground/80">
              {confidenceScore}%
            </span>
          </div>
           {confidenceReasoning && (
            <p className="text-sm text-muted-foreground mt-2 italic">"{confidenceReasoning}"</p>
          )}
        </div>

        {manipulationAnalysis && <Separator />}

        {manipulationAnalysis && (
          <div>
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium flex items-center gap-2">
                  <ScanSearch className="size-5 text-primary" />
                  Image Manipulation Analysis
                </h3>
                 <Badge
                    variant="outline"
                    className={cn(
                      manipulationAnalysis.isManipulated
                        ? "border-amber-500 text-amber-600"
                        : "border-green-500 text-green-600"
                    )}
                  >
                    {manipulationAnalysis.isManipulated ? (
                       <ShieldAlert className="mr-2 h-4 w-4" />
                    ) : (
                       <Shield className="mr-2 h-4 w-4" />
                    )}
                    {manipulationAnalysis.isManipulated ? "Manipulation Likely" : "Seems Authentic"}
                  </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={manipulationAnalysis.manipulationConfidence} className={cn("h-3", manipulationConfidenceColor)} />
              <span className="font-semibold text-lg text-foreground/80">
                {manipulationAnalysis.manipulationConfidence}%
              </span>
            </div>
            {manipulationAnalysis.manipulationReasoning && (
              <p className="text-sm text-muted-foreground mt-2 italic">"{manipulationAnalysis.manipulationReasoning}"</p>
            )}
          </div>
        )}

        {(when || where) && <Separator />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {when && (
            <div>
              <h3 className="font-medium mb-2 text-primary">When</h3>
              <p className="text-foreground/90">{when}</p>
            </div>
          )}
          {where && (
            <div>
              <h3 className="font-medium mb-2 text-primary flex items-center gap-2">
                Where 
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`} target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary">
                    <MapPin className="size-4" />
                </a>
              </h3>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-foreground/90 hover:underline"
              >
                {where}
              </a>
            </div>
          )}
        </div>

         {explanation && <Separator />}

          {explanation && (
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <div className="flex items-center justify-between w-full">
                  <AccordionTrigger className="flex-1">
                    <span className="flex items-center gap-2 text-primary font-medium">
                        <Info className="size-4" />
                        Explain Further
                    </span>
                  </AccordionTrigger>
                  <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(explanation);
                      }}
                      disabled={isSpeaking}
                      className='mr-2'
                      aria-label="Speak explanation"
                  >
                      {isSpeaking ? <Loader className="animate-spin" /> : <Volume2 />}
                  </Button>
                </div>
                <AccordionContent className="text-base text-foreground/90">
                  {explanation}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <Separator />
        <h3 className="font-medium">Sources</h3>
        <div className="space-y-4 w-full">
          {sources.map((source, index) => (
             <div key={index} className="flex flex-col gap-1">
                {isValidUrl(source.url) ? (
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary hover:underline"
                >
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    <p className="truncate font-medium text-foreground">{source.url}</p>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
                ) : (
                <div
                    className="text-sm text-muted-foreground flex items-center gap-2"
                >
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    <p className="truncate font-medium text-foreground">{source.url}</p>
                </div>
                )}
                 <p className="text-sm text-muted-foreground pl-6">{source.summary}</p>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

function VerdictCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </div>
        <Separator />
        <div>
          <Skeleton className="h-5 w-48 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div>
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <Separator/>
         <div>
            <Skeleton className="h-8 w-40" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <Separator />
        <Skeleton className="h-6 w-24 mb-2" />
        <div className="space-y-4 w-full">
            <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6 ml-6" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6 ml-6" />
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
