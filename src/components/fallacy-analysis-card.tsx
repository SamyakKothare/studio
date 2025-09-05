"use client";
import { useState, useTransition, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeTextForFallaciesOutput } from "@/ai/flows/analyze-text-for-fallacies";
import { BrainCircuit, BookOpenCheck, Volume2, Loader, Square } from "lucide-react";
import { Button } from "./ui/button";
import { speakTextStream } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type FallacyAnalysisResult = AnalyzeTextForFallaciesOutput & {
  query: string;
};

interface FallacyAnalysisCardProps {
  result?: FallacyAnalysisResult;
  isLoading?: boolean;
}

export function FallacyAnalysisCard({ result, isLoading = false }: FallacyAnalysisCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const { toast } = useToast();

  const cleanupAudio = useCallback(() => {
    sourceNodeRef.current?.stop();
    sourceNodeRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setIsSpeaking(false);
  }, []);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      cleanupAudio();
      return;
    }

    setIsSpeaking(true);
    try {
      const stream = await speakTextStream(text);
      const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = newAudioContext;

      const pcmPlayer = new PCMPlayer(newAudioContext);
      pcmPlayer.feed(stream);
      pcmPlayer.on('ended', cleanupAudio);
      pcmPlayer.on('error', (error) => {
        console.error("Playback error:", error);
        toast({
          title: "Audio Playback Error",
          description: "Could not play the generated audio.",
          variant: "destructive",
        });
        cleanupAudio();
      });
      sourceNodeRef.current = pcmPlayer.getSourceNode();
    } catch (error) {
      console.error("Failed to generate speech:", error);
      toast({
        title: "Speech Generation Failed",
        description: "Could not generate audio for the selected text.",
        variant: "destructive",
      });
      setIsSpeaking(false);
    }
  };

  if (isLoading) {
    return <FallacyAnalysisCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { fallacies, query } = result;

  const fullExplanation = fallacies.map(f => `${f.fallacy}. Quote: ${f.excerpt}. Explanation: ${f.explanation}`).join('\n');

  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <div className="flex items-start justify-between">
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
             {fallacies.length > 0 && (
             <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSpeak(fullExplanation)}
                aria-label={isSpeaking ? "Stop speaking" : "Speak explanation"}
              >
                {isSpeaking ? (
                  sourceNodeRef.current ? <Square /> : <Loader className="animate-spin" />
                ) : (
                  <Volume2 />
                )}
              </Button>
            )}
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

class PCMPlayer {
    private audioCtx: AudioContext;
    private source: AudioBufferSourceNode | null = null;
    private eventHandlers: { [key: string]: ((...args: any[]) => void)[] } = {};

    constructor(audioCtx: AudioContext) {
        this.audioCtx = audioCtx;
    }

    async feed(stream: ReadableStream<string>) {
        const reader = stream.getReader();
        const pcmChunks: Float32Array[] = [];
        let totalLength = 0;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const buffer = Buffer.from(value, 'base64');
                const pcmChunk = new Float32Array(buffer.length / 2);
                for (let i = 0; i < pcmChunk.length; i++) {
                    pcmChunk[i] = buffer.readInt16LE(i * 2) / 32768.0;
                }
                pcmChunks.push(pcmChunk);
                totalLength += pcmChunk.length;
            }

            if (this.audioCtx.state === 'closed') {
              return;
            }

            const audioBuffer = this.audioCtx.createBuffer(1, totalLength, 24000);
            const channelData = audioBuffer.getChannelData(0);

            let offset = 0;
            for (const chunk of pcmChunks) {
                channelData.set(chunk, offset);
                offset += chunk.length;
            }

            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.audioCtx.destination);
            this.source.start();
            this.source.onended = () => this.emit('ended');
        } catch (error) {
            this.emit('error', error);
        }
    }

    on(event: string, handler: (...args: any[]) => void) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event: string, ...args: any[]) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(...args));
        }
    }

    getSourceNode() {
      return this.source;
    }
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
