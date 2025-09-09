
"use client";

import React, { useState, useTransition } from "react";
import {
  BookCheck,
  History,
  Image as ImageIcon,
  Mic,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Trash2,
  RotateCw,
  ChevronDown,
  BrainCircuit,
  Share2,
  ShieldQuestion,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import { checkFact, checkImageFact, analyzeFallacies, traceSource, checkForScam } from "./actions";
import { Logo } from "@/components/logo";
import { VerdictCard } from "@/components/verdict-card";
import { Welcome } from "@/components/welcome";
import { ImageInput } from "@/components/image-input";
import { VoiceInput } from "@/components/voice-input";
import { buttonVariants } from "@/components/ui/button";
import type { FactCheckImageAndTextInput, FactCheckImageAndTextOutput } from "@/ai/flows/fact-check-image-and-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzeTextForFallaciesOutput } from "@/ai/flows/analyze-text-for-fallacies";
import { FallacyAnalysisCard } from "@/components/fallacy-analysis-card";
import type { TraceMisinformationSourceOutput } from "@/ai/flows/trace-misinformation-source";
import { SourceGraphCard } from "@/components/source-graph-card";
import type { AnalyzeTextForScamOutput } from "@/ai/flows/analyze-text-for-scam";
import { ScamAnalysisCard } from "@/components/scam-analysis-card";


type FactCheckResult = (GenerateFactCheckVerdictOutput | FactCheckImageAndTextOutput) & {
  type: "fact-check";
  query: string;
};

type FallacyAnalysisResult = AnalyzeTextForFallaciesOutput & {
  type: "fallacy-analysis";
  query: string;
}

type SourceTraceResult = TraceMisinformationSourceOutput & {
  type: "source-trace";
  query: string;
}

type ScamAnalysisResult = AnalyzeTextForScamOutput & {
  type: "scam-analysis";
  query: string;
}

type Result = FactCheckResult | FallacyAnalysisResult | SourceTraceResult | ScamAnalysisResult;

type InputMode = "text" | "image" | "voice" | "analyze" | "trace" | "scam";

const trustedSources = [
  { name: "Wikipedia", icon: <BookCheck />, url: "https://www.wikipedia.org/" },
  { name: "NASA", icon: <BookCheck />, url: "https://www.nasa.gov/" },
  { name: "ISRO", icon: <BookCheck />, url: "https://www.isro.gov.in/" },
  { name: "Government Websites", icon: <BookCheck /> },
];

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const { toast } = useToast();

  const handleFactCheck = (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to fact-check.",
        variant: "destructive",
      });
      return;
    }
    setResult(null);

    startTransition(async () => {
      try {
        const response = await checkFact(query);
        if (response) {
          const newResult: FactCheckResult = { ...response, query, type: 'fact-check' };
          setResult(newResult);
          setHistory((prevHistory) => [newResult, ...prevHistory]);
        }
      } catch (error) {
        console.error("Fact check failed:", error);
        toast({
          title: "Error",
          description: "Failed to get fact-check result. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  const handleImageFactCheck = (input: FactCheckImageAndTextInput) => {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await checkImageFact(input);
        if (response) {
          const newResult: FactCheckResult = { ...response, query: input.query, type: 'fact-check' };
          setResult(newResult);
          setHistory((prevHistory) => [newResult, ...prevHistory]);
        }
      } catch (error) {
        console.error("Image fact check failed:", error);
        toast({
          title: "Error",
          description: "Failed to get image fact-check result. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleFallacyCheck = (query: string) => {
     if (!query.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }
    setResult(null);
    startTransition(async () => {
      try {
        const response = await analyzeFallacies(query);
        if(response) {
          const newResult: FallacyAnalysisResult = { ...response, query, type: 'fallacy-analysis' };
          setResult(newResult);
          setHistory((prevHistory) => [newResult, ...prevHistory]);
        }
      } catch (error) {
        console.error("Fallacy analysis failed:", error);
        toast({
          title: "Error",
          description: "Failed to get fallacy analysis result. Please try again.",
          variant: "destructive",
        });
      }
    })
  }

  const handleSourceTrace = (query: string) => {
    if (!query.trim()) {
     toast({
       title: "Input required",
       description: "Please enter a claim to trace.",
       variant: "destructive",
     });
     return;
   }
   setResult(null);
   startTransition(async () => {
     try {
       const response = await traceSource(query);
       if(response) {
         const newResult: SourceTraceResult = { ...response, query, type: 'source-trace' };
         setResult(newResult);
         setHistory((prevHistory) => [newResult, ...prevHistory]);
       }
     } catch (error) {
       console.error("Source trace failed:", error);
       toast({
         title: "Error",
         description: "Failed to get source trace result. Please try again.",
         variant: "destructive",
       });
     }
   })
 }

 const handleScamCheck = (query: string) => {
  if (!query.trim()) {
   toast({
     title: "Input required",
     description: "Please enter text to check for scams.",
     variant: "destructive",
   });
   return;
 }
 setResult(null);
 startTransition(async () => {
   try {
     const response = await checkForScam(query);
     if(response) {
       const newResult: ScamAnalysisResult = { ...response, query, type: 'scam-analysis' };
       setResult(newResult);
       setHistory((prevHistory) => [newResult, ...prevHistory]);
     }
   } catch (error) {
     console.error("Scam check failed:", error);
     toast({
       title: "Error",
       description: "Failed to get scam analysis result. Please try again.",
       variant: "destructive",
     });
   }
 })
}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMode === 'analyze') {
      handleFallacyCheck(text);
    } else if (inputMode === 'trace') {
      handleSourceTrace(text);
    } else if (inputMode === 'scam') {
      handleScamCheck(text);
    }
    else {
      handleFactCheck(text);
    }
  };

  const handleSelectHistory = (selectedResult: Result) => {
    setResult(selectedResult);
    setText(selectedResult.query);
    setInputMode(selectedResult.type === 'fact-check' ? 'text' : selectedResult.type);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
    setText("");
    setShowClearHistoryDialog(false);
    toast({
      title: "History Cleared",
      description: "Your fact-checking history has been deleted.",
    });
  };

  const handleNewSession = (message: string) => {
    setText("");
    setResult(null);
    setInputMode("text");
    toast({
      title: "New Session Started",
      description: message,
    })
  }

  const getHistoryItemIcon = (item: Result) => {
    switch (item.type) {
      case 'fact-check':
        const isTrue = item.verdict === 'TRUE';
        return <div className={cn("mt-1 size-2.5 rounded-full shrink-0", isTrue ? 'bg-green-500' : 'bg-red-500')} />;
      case 'fallacy-analysis':
        return <BrainCircuit className="size-3.5 shrink-0 text-sidebar-foreground/70" />;
      case 'source-trace':
        return <Share2 className="size-3.5 shrink-0 text-sidebar-foreground/70" />;
      case 'scam-analysis':
        return <ShieldQuestion className="size-3.5 shrink-0 text-sidebar-foreground/70" />;
      default:
        return null;
    }
  }

  const renderResult = () => {
    if (isPending) {
       if (inputMode === 'analyze') {
         return <FallacyAnalysisCard isLoading={true} />
       }
       if (inputMode === 'trace') {
        return <SourceGraphCard isLoading={true} />
      }
      if (inputMode === 'scam') {
        return <ScamAnalysisCard isLoading={true} />
      }
       return <VerdictCard isLoading={true} />
    }
    if (!result) {
      return <Welcome />
    }

    if (result.type === 'fact-check') {
      return <VerdictCard result={result} />
    }
    if (result.type === 'fallacy-analysis') {
      return <FallacyAnalysisCard result={result} />
    }
    if (result.type === 'source-trace') {
      return <SourceGraphCard result={result} />
    }
    if (result.type === 'scam-analysis') {
      return <ScamAnalysisCard result={result} />
    }
    return <Welcome />;
  }

  const getInputPlaceHolder = () => {
    switch (inputMode) {
      case 'text':
        return "Enter a statement, claim, or question to fact-check...";
      case 'analyze':
        return "Enter a paragraph or argument to analyze for logical fallacies...";
      case 'trace':
        return "Enter a claim to trace its origin and spread...";
      case 'scam':
        return "Paste an email, text message, or other text to check for scam tactics...";
      default:
        return "";
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <History />
              History
            </SidebarGroupLabel>
            {history.length > 0 && (
              <SidebarGroupAction asChild>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => setShowClearHistoryDialog(true)}>
                  <Trash2/>
                </Button>
              </SidebarGroupAction>
            )}
            <SidebarMenu>
              {history.length === 0 && (
                 <p className="px-2 text-sm text-sidebar-foreground/70">No queries yet.</p>
              )}
              {history.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton onClick={() => handleSelectHistory(item)} className="h-auto py-2">
                     <div className="flex items-start gap-3">
                        {getHistoryItemIcon(item)}
                        <span className="text-wrap text-left">{item.query}</span>
                      </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <ShieldCheck />
              Trusted Sources
            </SidebarGroupLabel>
            <SidebarMenu>
              {trustedSources.map((source, index) => (
                <SidebarMenuItem key={index}>
                   {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="w-full">
                      <SidebarMenuButton asChild tooltip={source.name} isActive={false} className="w-full">
                        <span>
                          {source.icon}
                          <span>{source.name}</span>
                        </span>
                      </SidebarMenuButton>
                    </a>
                  ) : (
                    <SidebarMenuButton tooltip={source.name} isActive={false}>
                      {source.icon}
                      <span>{source.name}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="outline" className="w-full" disabled>
            Manage Sources
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex items-center justify-between gap-4 p-2 border-b md:p-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl">Fact Checker</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 font-bold">
                <RotateCw className="size-4" />
                <span>New Session</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleNewSession("Ready for a new fact-check!")}>
                Start Fresh
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleNewSession("Let's investigate something new.")}>
                Clear and Go
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleNewSession("A clean slate for your next query.")}>
                Reset Canvas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-secondary/30">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary"/>
                  Submit a Claim for Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-1 bg-muted rounded-lg flex gap-1 w-fit flex-wrap">
                  <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'text' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('text')}
                    >
                      <MessageSquare/>Fact-Check
                    </Button>
                  <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'image' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('image')}
                    >
                      <ImageIcon/>Image
                    </Button>
                  <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'voice' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('voice')}
                    >
                      <Mic/>Voice
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'analyze' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('analyze')}
                    >
                      <BrainCircuit/>Analyze
                    </Button>
                     <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'trace' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('trace')}
                    >
                      <Share2/>Trace Source
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className={cn(inputMode === 'scam' && "bg-background shadow text-foreground hover:bg-background/90")}
                      variant="ghost"
                      onClick={() => setInputMode('scam')}
                    >
                      <ShieldQuestion/>Scam Detector
                    </Button>
                </div>
                
                {(inputMode === 'text' || inputMode === 'trace' || inputMode === 'analyze' || inputMode === 'scam') && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={getInputPlaceHolder()}
                      className="min-h-[120px] text-base"
                      disabled={isPending}
                    />
                     <Button type="submit" size="lg" className="self-start" disabled={isPending || !text.trim()}>
                      {inputMode === 'text' && <Sparkles className="mr-2" />}
                      {inputMode === 'analyze' && <BrainCircuit className="mr-2" />}
                      {inputMode === 'trace' && <Share2 className="mr-2" />}
                      {inputMode === 'scam' && <ShieldQuestion className="mr-2" />}
                      {isPending ? "Analyzing..." : 
                        inputMode === 'text' ? "Fact Check" :
                        inputMode === 'analyze' ? "Analyze for Fallacies" :
                        inputMode === 'trace' ? "Trace Source" :
                        "Check for Scam"
                      }
                    </Button>
                  </form>
                )}

                {inputMode === 'image' && (
                  <ImageInput 
                    onFactCheck={handleImageFactCheck} 
                    isPending={isPending}
                  />
                )}

                {inputMode === 'voice' && (
                  <VoiceInput
                    onFactCheck={handleFactCheck}
                    isPending={isPending}
                  />
                )}
              </CardContent>
            </Card>

            <div className="mt-8">
              {renderResult()}
            </div>
          </div>
        </main>
      </SidebarInset>
      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete your entire fact-checking history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
