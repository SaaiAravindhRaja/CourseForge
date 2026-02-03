'use client';

import { useState } from 'react';
import { Download, FileJson, FileText, Package, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCourseStore } from '@/store/courseStore';
import type { Course } from '@/types';

const EXPORT_FORMATS = [
  {
    id: 'json',
    label: 'JSON',
    description: 'Complete course data in JSON format',
    icon: FileJson,
    disabled: false,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Human-readable markdown files',
    icon: FileText,
    disabled: false,
  },
  {
    id: 'scorm',
    label: 'SCORM',
    description: 'LMS-compatible package (coming soon)',
    icon: Package,
    disabled: true,
  },
] as const;

export function ExportModal() {
  const { course } = useCourseStore();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    if (!course) return;

    setIsExporting(true);
    setSelectedFormat(format);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(course, null, 2);
          filename = `${course.title.replace(/\s+/g, '_')}.json`;
          mimeType = 'application/json';
          break;

        case 'markdown':
          content = generateMarkdown(course);
          filename = `${course.title.replace(/\s+/g, '_')}.md`;
          mimeType = 'text/markdown';
          break;

        default:
          throw new Error('Unsupported format');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setSelectedFormat(null);
    }
  };

  if (!course) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Course</DialogTitle>
          <DialogDescription>
            Download your course in your preferred format
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const isCurrentlyExporting =
              isExporting && selectedFormat === format.id;

            return (
              <Card
                key={format.id}
                className={`p-4 cursor-pointer transition-colors ${
                  format.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => !format.disabled && handleExport(format.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {isCurrentlyExporting ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{format.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {format.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateMarkdown(course: Course): string {
  let md = `# ${course.title}\n\n`;
  md += `${course.description}\n\n`;
  md += `**Target Audience:** ${course.targetAudience}\n`;
  md += `**Course Type:** ${course.courseType}\n`;
  md += `**Difficulty:** ${course.difficulty}\n\n`;
  md += `---\n\n`;

  course.modules.forEach((module, mIndex) => {
    md += `## Module ${mIndex + 1}: ${module.title}\n\n`;
    md += `${module.description}\n\n`;

    if (module.objectives.length > 0) {
      md += `### Learning Objectives\n`;
      module.objectives.forEach((obj) => {
        md += `- ${obj.text} *(${obj.bloomLevel})*\n`;
      });
      md += `\n`;
    }

    module.lessons.forEach((lesson, lIndex) => {
      md += `### Lesson ${mIndex + 1}.${lIndex + 1}: ${lesson.title}\n\n`;

      if (lesson.content) {
        md += `${lesson.content}\n\n`;
      }

      if (lesson.keyTakeaways.length > 0) {
        md += `**Key Takeaways:**\n`;
        lesson.keyTakeaways.forEach((takeaway) => {
          md += `- ${takeaway}\n`;
        });
        md += `\n`;
      }

      if (lesson.interactiveElements.length > 0) {
        md += `**Interactive Elements:**\n`;
        lesson.interactiveElements.forEach((el) => {
          md += `- **${el.title}** (${el.type}): ${el.content}\n`;
        });
        md += `\n`;
      }

      if (lesson.videoScript) {
        md += `**Video Script:**\n`;
        md += `\`\`\`\n${lesson.videoScript.script}\n\`\`\`\n\n`;
      }
    });

    if (module.quiz) {
      md += `### Quiz: ${module.quiz.title}\n\n`;
      module.quiz.questions.forEach((q, qIndex) => {
        md += `**Q${qIndex + 1}:** ${q.question}\n`;
        if (q.options) {
          q.options.forEach((opt, oIndex) => {
            const letter = String.fromCharCode(65 + oIndex);
            md += `  ${letter}. ${opt}\n`;
          });
        }
        md += `\n`;
      });
    }

    md += `---\n\n`;
  });

  return md;
}
