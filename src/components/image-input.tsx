"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Sparkles, X } from 'lucide-react';
import Image from 'next/image';

interface ImageInputProps {
  onFactCheck: (query: string) => void;
  isPending: boolean;
}

export function ImageInput({ onFactCheck, isPending }: ImageInputProps) {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: 'Image size too large',
          description: 'Please select an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) {
        toast({
            title: 'Image required',
            description: 'Please upload an image to fact-check.',
            variant: 'destructive',
        });
        return;
    }
    if (!description.trim()) {
        toast({
            title: 'Description required',
            description: 'Please describe what you want to fact-check in the image.',
            variant: 'destructive',
        });
        return;
    }

    const query = `Image: [${imageFile.name}] - ${description}`;
    onFactCheck(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in-50">
      {!imagePreview ? (
        <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (max. 4MB)</p>
          </div>
          <Input id="dropzone-file" type="file" className="absolute w-full h-full opacity-0" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" />
        </label>
      ) : (
        <div className="relative">
          <Image src={imagePreview} alt="Image preview" width={200} height={200} className="w-full max-h-72 object-contain rounded-lg" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
       <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you want to fact-check about this image?"
          className="min-h-[80px] text-base"
          disabled={isPending}
        />

      <Button type="submit" className="self-start" disabled={isPending || !imageFile}>
        <Sparkles className="mr-2" />
        {isPending ? 'Analyzing...' : 'Fact Check Image'}
      </Button>
    </form>
  );
}
