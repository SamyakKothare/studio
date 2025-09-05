
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TraceMisinformationSourceOutput } from "@/ai/flows/trace-misinformation-source";
import { Share2, FileText, Newspaper, Megaphone } from "lucide-react";
import { Separator } from "./ui/separator";
import { ResponsiveContainer, ComposedChart, Scatter, XAxis, YAxis, Tooltip, ZAxis, Legend, Line, Customized } from 'recharts';
import { useMemo } from "react";

type SourceTraceResult = TraceMisinformationSourceOutput & {
  query: string;
};

interface SourceGraphCardProps {
  result?: SourceTraceResult;
  isLoading?: boolean;
}

// A simple hashing function to create positions for the graph
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export function SourceGraphCard({ result, isLoading = false }: SourceGraphCardProps) {
  if (isLoading) {
    return <SourceGraphCardSkeleton />;
  }

  if (!result) {
    return null;
  }

  const { nodes, links, summary, query } = result;

  const graphData = useMemo(() => {
    const positionedNodes = nodes.map((node, index) => ({
      ...node,
      x: simpleHash(node.id) % 100, // Position based on hash
      y: Math.floor(index / (Math.sqrt(nodes.length) || 1)) * 25 + (simpleHash(node.label) % 25), // Stagger y-position
      size: 150, // Size for scatter plot
    }));

    const nodeMap = new Map(positionedNodes.map(node => [node.id, node]));

    const graphLinks = links.map(link => ({
      source: nodeMap.get(link.source),
      target: nodeMap.get(link.target)
    })).filter(l => l.source && l.target);

    return { nodes: positionedNodes, links: graphLinks };
  }, [nodes, links]);


  const typeToIcon = {
    origin: <FileText className="size-5 text-red-500" />,
    amplifier: <Megaphone className="size-5 text-yellow-500" />,
    news_outlet: <Newspaper className="size-5 text-blue-500" />,
    social_media: <Share2 className="size-5 text-purple-500" />
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.label) {
        return (
            <div className="p-2 bg-background border border-border rounded-lg shadow-lg max-w-xs">
                <p className="font-bold text-foreground">{data.label}</p>
                <p className="text-sm text-muted-foreground break-all">{data.id}</p>
                {data.timestamp && <p className="text-xs text-primary mt-1">{data.timestamp}</p>}
            </div>
            );
      }
    }
    return null;
  };
  
  const typeToColor = {
    origin: 'hsl(var(--destructive))',
    amplifier: 'hsl(var(--chart-4))',
    news_outlet: 'hsl(var(--chart-1))',
    social_media: 'hsl(var(--chart-2))'
  };

  const NodeWithTimestamp = (props: any) => {
    const { cx, cy, payload } = props;
    const color = typeToColor[payload.type as keyof typeof typeToColor] || '#8884d8';
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={color} />
        {payload.timestamp && (
          <text x={cx} y={cy + 18} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">
            {payload.timestamp}
          </text>
        )}
      </g>
    );
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
        
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                    >
                    <XAxis type="number" dataKey="x" hide domain={[-5, 105]} />
                    <YAxis type="number" dataKey="y" hide domain={[-5, 105]}/>
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }}/>
                     
                    {/* Render lines first */}
                    <Customized data={graphData.links} content={(props) => (
                      <g>
                        {graphData.links.map((link, i) => (
                          <line
                            key={`line-${i}`}
                            x1={link.source?.x}
                            y1={link.source?.y}
                            x2={link.target?.x}
                            y2={link.target?.y}
                            stroke="hsl(var(--border))"
                            strokeWidth={1}
                          />
                        ))}
                      </g>
                    )} />
                    
                    <Scatter name="Nodes" data={graphData.nodes} shape={<NodeWithTimestamp />} />

                </ComposedChart>
            </ResponsiveContainer>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-primary mb-3">Detected Sources ({nodes.length})</h3>
          <ul className="space-y-4">
            {nodes.map(node => (
                <li key={node.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <span className="flex-shrink-0">{typeToIcon[node.type]}</span>
                    <div className="flex-1 overflow-hidden">
                        <span className="font-medium">{node.label}</span>
                        <a href={node.id.startsWith('http') ? node.id : `https://www.google.com/search?q=${encodeURIComponent(node.id)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate">
                            {node.id}
                        </a>
                    </div>
                     {node.timestamp && <Badge variant="outline" className="text-xs">{node.timestamp}</Badge>}
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
