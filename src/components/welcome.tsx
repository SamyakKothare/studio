import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, Camera, Mic, BrainCircuit, Share2, ShieldQuestion } from "lucide-react";

export function Welcome() {
  return (
    <Card className="border-dashed animate-in fade-in-50">
      <CardHeader>
        <div className="text-center">
            <Sparkles className="text-primary size-10 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold">
                Welcome to FACT CHECKER-AI
            </CardTitle>
             <CardDescription className="text-lg mt-2 text-muted-foreground">
                Your intelligent assistant for navigating the complex information landscape.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Get started by selecting a tool above and providing a claim, image, or text. Our AI will analyze your query and provide a comprehensive, evidence-based report.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg border flex flex-col items-center text-center">
            <FileText className="mb-3 size-9 text-accent" />
            <h3 className="font-semibold text-lg">Fact-Check Text</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Verify statements, claims, and questions against trusted sources.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border flex flex-col items-center text-center">
            <BrainCircuit className="mb-3 size-9 text-accent" />
            <h3 className="font-semibold text-lg">Analyze Rhetoric</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Detect logical fallacies in arguments, articles, or speeches.
            </p>
          </div>
           <div className="p-6 bg-card rounded-lg border flex flex-col items-center text-center">
            <ShieldQuestion className="mb-3 size-9 text-accent" />
            <h3 className="font-semibold text-lg">Detect Scams</h3>
            <p className="text-sm text-muted-foreground mt-1">
             Analyze emails and messages for common scam tactics.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
