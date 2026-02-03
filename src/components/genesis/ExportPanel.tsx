'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileJson,
  FileText,
  FileCode,
  Check,
  Copy,
  X,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCourseStore } from '@/store/courseStore';

const EXPORT_FORMATS = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Full course data structure',
    icon: FileJson,
    color: '#f97316',
    extension: '.json',
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Human-readable documentation',
    icon: FileText,
    color: '#06b6d4',
    extension: '.md',
  },
  {
    id: 'scorm',
    name: 'SCORM',
    description: 'LMS-compatible package',
    icon: FileCode,
    color: '#10b981',
    extension: '.zip',
    comingSoon: true,
  },
];

export function ExportPanel() {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const { course } = useCourseStore();

  if (!course) return null;

  const handleExport = async (formatId: string) => {
    setSelectedFormat(formatId);
    setIsExporting(true);

    // Simulate export processing
    await new Promise((r) => setTimeout(r, 1500));

    let content = '';
    let filename = '';
    let mimeType = '';

    if (formatId === 'json') {
      content = JSON.stringify(course, null, 2);
      filename = `${course.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      mimeType = 'application/json';
    } else if (formatId === 'markdown') {
      content = generateMarkdown(course);
      filename = `${course.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      mimeType = 'text/markdown';
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportComplete(true);

    setTimeout(() => {
      setExportComplete(false);
      setSelectedFormat(null);
    }, 2000);
  };

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(course, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-nebula/30 text-nebula-bright hover:bg-nebula/10 hover:border-nebula/50"
          style={{ borderColor: 'rgba(124, 58, 237, 0.3)', color: '#a855f7' }}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md glass-strong border-white/10 bg-[#0a0a1a]/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5" style={{ color: '#7c3aed' }} />
            Export Course
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Course Preview */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-white mb-1">{course.title}</h3>
            <p className="text-sm text-stardust">
              {course.modules.length} modules •{' '}
              {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            {EXPORT_FORMATS.map((format) => {
              const isSelected = selectedFormat === format.id;
              const isDisabled = format.comingSoon;

              return (
                <motion.button
                  key={format.id}
                  onClick={() => !isDisabled && handleExport(format.id)}
                  disabled={isExporting || isDisabled}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? 'glass-card ring-2 ring-purple-500' : 'hover:bg-white/5'}
                  `}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${format.color}20` }}
                  >
                    {isSelected && isExporting ? (
                      <Loader2 className="h-6 w-6 animate-spin" style={{ color: format.color }} />
                    ) : isSelected && exportComplete ? (
                      <Check className="h-6 w-6" style={{ color: format.color }} />
                    ) : (
                      <format.icon className="h-6 w-6" style={{ color: format.color }} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{format.name}</p>
                      {format.comingSoon && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stardust">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stardust">{format.description}</p>
                  </div>

                  {!isDisabled && (
                    <Download className="h-5 w-5 text-stardust" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Copy JSON Button */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full gap-2 border-white/10 text-stardust hover:text-white hover:bg-white/5"
              onClick={handleCopyJSON}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy JSON to Clipboard
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateMarkdown(course: any): string {
  let md = `# ${course.title}\n\n`;
  md += `${course.description || ''}\n\n`;
  md += `**Target Audience:** ${course.targetAudience || 'General'}\n`;
  md += `**Difficulty:** ${course.difficulty || 'Beginner'}\n`;
  md += `**Duration:** ${course.estimatedDuration || 'Self-paced'}\n\n`;
  md += `---\n\n`;

  course.modules.forEach((module: any, mIndex: number) => {
    md += `## Module ${mIndex + 1}: ${module.title}\n\n`;
    md += `${module.description || ''}\n\n`;

    if (module.objectives?.length > 0) {
      md += `### Learning Objectives\n\n`;
      module.objectives.forEach((obj: any) => {
        md += `- ${obj.text}\n`;
      });
      md += `\n`;
    }

    module.lessons.forEach((lesson: any, lIndex: number) => {
      md += `### Lesson ${mIndex + 1}.${lIndex + 1}: ${lesson.title}\n\n`;

      if (lesson.content) {
        md += `${lesson.content}\n\n`;
      }

      if (lesson.keyTakeaways?.length > 0) {
        md += `**Key Takeaways:**\n`;
        lesson.keyTakeaways.forEach((takeaway: string) => {
          md += `- ${takeaway}\n`;
        });
        md += `\n`;
      }
    });

    if (module.quiz) {
      md += `### Quiz: ${module.quiz.title}\n\n`;
      module.quiz.questions.forEach((q: any, qIndex: number) => {
        md += `**Q${qIndex + 1}: ${q.question}**\n`;
        q.options?.forEach((opt: string, oIndex: number) => {
          const isCorrect = oIndex === q.correctAnswer;
          md += `${isCorrect ? '✓' : ' '} ${String.fromCharCode(65 + oIndex)}. ${opt}\n`;
        });
        if (q.explanation) {
          md += `\n*Explanation: ${q.explanation}*\n`;
        }
        md += `\n`;
      });
    }

    md += `---\n\n`;
  });

  md += `\n*Generated with GENESIS - AI Course Studio*\n`;
  md += `*Powered by Google Gemini*\n`;

  return md;
}
