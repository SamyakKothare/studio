"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Waves } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { speechToText } from '@/ai/flows/speech-to-text';

interface VoiceInputProps {
  onFactCheck: (query: string) => void;
  isPending: boolean;
}

export function VoiceInput({ onFactCheck, isPending }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const getMicPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
      toast({
          title: 'Microphone Access Denied',
          description: 'Please enable microphone permissions in your browser settings.',
          variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        getMicPermission();
    }
  }, [getMicPermission]);

  const handleStartRecording = async () => {
    if (isRecording) return;
    if (hasPermission !== true) {
        await getMicPermission();
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            toast({
                title: 'Processing Audio',
                description: 'Transcribing your speech...',
            });
            try {
                const {transcription} = await speechToText({audioDataUri: base64Audio});
                if (transcription) {
                    onFactCheck(transcription);
                } else {
                    toast({
                        title: 'Transcription Failed',
                        description: 'Could not transcribe the audio. Please try again.',
                        variant: 'destructive',
                    });
                }
            } catch(e) {
                console.error(e);
                toast({
                    title: 'Transcription Error',
                    description: 'An error occurred during transcription.',
                    variant: 'destructive',
                });
            }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Speak now...',
      });
    } catch (error) {
        console.error("Error starting recording:", error)
        toast({
            title: 'Recording Error',
            description: 'Could not start recording. Please check your microphone.',
            variant: 'destructive',
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // get the stream and stop it to turn off the mic indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };


  if (hasPermission === false) {
    return (
        <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertTitle>Microphone Access Required</AlertTitle>
            <AlertDescription>
                Please allow microphone access in your browser settings to use this feature.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg animate-in fade-in-50">
        {!isRecording ? (
             <Button 
                size="lg" 
                className="w-48 h-16 text-lg"
                onClick={handleStartRecording}
                disabled={isPending || hasPermission === null}
                >
                <Mic className="mr-2" />
                Start Recording
            </Button>
        ) : (
            <Button 
                size="lg" 
                variant="destructive" 
                className="w-48 h-16 text-lg"
                onClick={handleStopRecording}
                disabled={isPending}
            >
                <Square className="mr-2" />
                Stop Recording
            </Button>
        )}
       
        <div className="flex items-center gap-2 text-muted-foreground">
            {isRecording ? (
                <>
                    <Waves className="size-5 text-destructive animate-pulse" />
                    <span>Recording...</span>
                </>
            ) : (
                 <span>
                    {isPending ? 'Analyzing...' : 'Click "Start Recording" to speak your query'}
                </span>
            )}
        </div>
    </div>
  );
}
