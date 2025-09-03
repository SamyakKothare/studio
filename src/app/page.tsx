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
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GenerateFactCheckVerdictOutput } from "@/ai/flows/generate-fact-check-verdict";
import { checkFact } from "./actions";
import { Logo } from "@/components/logo";
import { VerdictCard } from "@/components/verdict-card";
import { Welcome } from "@/components/welcome";

type FactCheckResult = GenerateFactCheckVerdictOutput & {
  query: string;
};

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
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) {
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
        const response = await checkFact(text);
        if (response) {
          const newResult = { ...response, query: text };
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
  };

  const handleSelectHistory = (selectedResult: FactCheckResult) => {
    setResult(selectedResult);
    setText(selectedResult.query);
  };
  
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
        <header className="flex items-center gap-4 p-2 border-b md:p-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold md:text-xl">Fact Checker</h1>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="p-1 bg-muted rounded-lg flex gap-1 w-fit">
                 <Button type="button" size="sm" className="bg-background shadow-sm hover:bg-background/80"><MessageSquare/>Text</Button>
                 <Button type="button" size="sm" variant="ghost" disabled><ImageIcon/>Image</Button>
                 <Button type="button" size="sm" variant="ghost" disabled><Mic/>Voice</Button>
              </div>
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
            <div className="mt-8">
              {isPending && <VerdictCard isLoading={true} />}
              {!isPending && result && <VerdictCard result={result} />}
              {!isPending && !result && <Welcome />}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
