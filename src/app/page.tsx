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
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import { checkFact } from "./actions";
import { Logo } from "@/components/logo";
import { VerdictCard } from "@/components/verdict-card";
import { Welcome } from "@/components/welcome";
import { ImageInput } from "@/components/image-input";
import { VoiceInput } from "@/components/voice-input";

type FactCheckResult = GenerateFactCheckVerdictOutput & {
  query: string;
};

type InputMode = "text" | "image" | "voice";

const trustedSources = [
  { name: "Wikipedia", icon: <BookCheck /> },
  { name: "NASA", icon: <BookCheck /> },
  { name: "ISRO", icon: <BookCheck /> },
  { name: "Government Websites", icon: <BookCheck /> },
];

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [history, setHistory] = useState<FactCheckResult[]>([]);
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
          const newResult = { ...response, query };
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFactCheck(text);
  };

  const handleSelectHistory = (selectedResult: FactCheckResult) => {
    setResult(selectedResult);
    setText(selectedResult.query);
    setInputMode("text");
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
  
  const getVerdictColor = (verdict?: 'TRUE' | 'FAKE') => {
    if (!verdict) return 'bg-muted';
    return verdict === 'TRUE' ? 'bg-green-500' : 'bg-red-500';
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
                        <span className={cn("mt-1.5 size-2 rounded-full shrink-0", getVerdictColor(item.verdict))}/>
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
                  <SidebarMenuButton tooltip={source.name} isActive={false}>
                    {source.icon}
                    <span>{source.name}</span>
                  </SidebarMenuButton>
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

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-4">
              <div className="p-1 bg-muted rounded-lg flex gap-1 w-fit">
                 <Button
                    type="button"
                    size="sm"
                    className={cn(inputMode === 'text' && "bg-background shadow-sm hover:bg-background/80")}
                    variant={inputMode !== 'text' ? 'ghost' : 'default'}
                    onClick={() => setInputMode('text')}
                  >
                    <MessageSquare/>Text
                  </Button>
                 <Button
                    type="button"
                    size="sm"
                    className={cn(inputMode === 'image' && "bg-background shadow-sm hover:bg-background/80")}
                    variant={inputMode !== 'image' ? 'ghost' : 'default'}
                    onClick={() => setInputMode('image')}
                  >
                    <ImageIcon/>Image
                  </Button>
                 <Button
                    type="button"
                    size="sm"
                    className={cn(inputMode === 'voice' && "bg-background shadow-sm hover:bg-background/80")}
                    variant={inputMode !== 'voice' ? 'ghost' : 'default'}
                    onClick={() => setInputMode('voice')}
                  >
                    <Mic/>Voice
                  </Button>
              </div>
              
              {inputMode === 'text' && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter a statement, claim, or question to fact-check..."
                    className="min-h-[120px] text-base"
                    disabled={isPending}
                  />
                   <Button type="submit" className="self-start" disabled={isPending}>
                    <Sparkles className="mr-2"/>
                    {isPending ? "Analyzing..." : "Fact Check"}
                  </Button>
                </form>
              )}

              {inputMode === 'image' && (
                <ImageInput 
                  onFactCheck={handleFactCheck} 
                  isPending={isPending}
                />
              )}

              {inputMode === 'voice' && (
                <VoiceInput
                  onFactCheck={handleFactCheck}
                  isPending={isPending}
                />
              )}

            </div>
            <div className="mt-8">
              {isPending && <VerdictCard isLoading={true} />}
              {!isPending && result && <VerdictCard result={result} />}
              {!isPending && !result && <Welcome />}
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
