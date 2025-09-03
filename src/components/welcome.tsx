import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, Camera, Mic } from "lucide-react";

export function Welcome() {
  return (
    <Card className="border-dashed animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Sparkles className="text-primary size-7" />
          <span className="text-2xl font-headline">
            Welcome to FACT CHECKER-AI
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Your intelligent assistant for verifying information. Get started by
          entering a statement, claim, or question in the text box above.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-background rounded-lg">
            <FileText className="mx-auto mb-2 size-8 text-accent" />
            <h3 className="font-semibold">Text Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Paste any text to check its validity.
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <Camera className="mx-auto mb-2 size-8 text-accent" />
            <h3 className="font-semibold">Image Verification</h3>
            <p className="text-sm text-muted-foreground">
              Upload an image to check its origin.
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <Mic className="mx-auto mb-2 size-8 text-accent" />
            <h3 className="font-semibold">Voice Transcription</h3>
            <p className="text-sm text-muted-foreground">
              Speak your query and get it fact-checked.
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground pt-4">
          Our AI cross-references multiple trusted sources to provide a
          confidence score and a clear verdict.
        </p>
      </CardContent>
    </Card>
  );
}
