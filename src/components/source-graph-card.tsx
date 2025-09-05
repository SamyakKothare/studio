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
import type { TraceMisinformationSourceOutput } from "@/ai/flows/trace-misinformation-source";
import { Share2, FileText, Newspaper, Megaphone } from "lucide-react";
import { Separator } from "./ui/separator";

type SourceTraceResult = TraceMisinformationSourceOutput & {
  query: string;
};

interface SourceGraphCardProps {
  result?: SourceTraceResult;
  isLoading?: boolean;
}

export function SourceGraphCard({ result, isLoading = false }: SourceGraphCardProps) {
  if (isLoading) {
    return <SourceGraphCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { nodes, links, summary, query } = result;

  const typeToIcon = {
    origin: <FileText className="size-5 text-red-500" />,
    amplifier: <Megaphone className="size-5 text-yellow-500" />,
    news_outlet: <Newspaper className="size-5 text-blue-500" />,
    social_media: <Share2 className="size-5 text-purple-500" />
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
             <Share2 className="size-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Misinformation Source Trace</CardTitle>
            <CardDescription className="pt-1">
              Analysis for: "{query}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg text-primary mb-2">Spread Summary</h3>
            <p className="text-foreground/90">{summary}</p>
        </div>
        <Separator />
        {/* Placeholder for the actual graph */}
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Network graph visualization coming soon...</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-primary mb-3">Detected Sources ({nodes.length})</h3>
          <ul className="space-y-4">
            {nodes.map(node => (
                <li key={node.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <span className="flex-shrink-0">{typeToIcon[node.type]}</span>
                    <div className="flex flex-col">
                        <span className="font-medium">{node.label}</span>
                        <a href={node.id} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate">
                            {node.id}
                        </a>
                    </div>
                </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function SourceGraphCardSkeleton() {
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
        <div>
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
        <Separator />
        <Skeleton className="h-96 w-full rounded-lg" />
         <div>
            <Skeleton className="h-6 w-56 mb-4" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
