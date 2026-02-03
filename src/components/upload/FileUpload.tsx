'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCourseStore } from '@/store/courseStore';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { sourceDocument, setSourceDocument, setStage, addMessage } = useCourseStore();

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setStage('uploading');

      try {
        const text = await readFileContent(file);
        const fileType = getFileType(file.name);

        setSourceDocument({
          id: uuidv4(),
          name: file.name,
          type: fileType,
          content: text,
          uploadedAt: new Date().toISOString(),
        });

        setStage('analyzing');

        // Add system message about the upload
        addMessage({
          role: 'system',
          content: `Document uploaded: ${file.name} (${fileType})`,
        });

        onUploadComplete?.();
      } catch (error) {
        console.error('File processing error:', error);
        setStage('idle');
      } finally {
        setIsProcessing(false);
      }
    },
    [setSourceDocument, setStage, addMessage, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSourceDocument(null);
    setStage('idle');
  }, [setSourceDocument, setStage]);

  if (sourceDocument) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{sourceDocument.name}</p>
              <p className="text-xs text-muted-foreground">
                {sourceDocument.type} • Uploaded
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-xl p-8
        transition-all duration-200 cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
      `}
    >
      <input
        type="file"
        accept=".pdf,.txt,.doc,.docx,.md"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center gap-3 text-center">
        {isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium">Processing document...</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drop your document here</p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, TXT, DOC, DOCX, or MD files
              </p>
            </div>
            <Button variant="secondary" size="sm" className="mt-2">
              Browse Files
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function getFileType(filename: string): 'pdf' | 'text' | 'video-transcript' | 'article' {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'md':
      return 'text';
    default:
      return 'article';
  }
}
