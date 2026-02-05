'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileJson,
  FileText,
  Package,
  Check,
  Loader2,
  Copy,
  ExternalLink,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types';
import { exportToSCORM } from '@/lib/export/scorm';

interface EnhancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

type ExportFormat = 'json' | 'markdown' | 'scorm12' | 'scorm2004' | 'html';

interface ExportOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: typeof FileJson;
  color: string;
  badge?: string;
  features: string[];
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Complete course data in JSON format',
    icon: FileJson,
    color: '#F59E0B',
    features: ['Full course structure', 'All metadata', 'Machine readable', 'Import ready'],
  },
  {
    id: 'markdown',
    name: 'Markdown Document',
    description: 'Human-readable documentation',
    icon: FileText,
    color: '#0066FF',
    features: ['Easy to read', 'Version control friendly', 'Editable', 'Portable'],
  },
  {
    id: 'scorm12',
    name: 'SCORM 1.2',
    description: 'LMS-compatible package (widely supported)',
    icon: Package,
    color: '#00A67E',
    badge: 'LMS Ready',
    features: ['Universal LMS support', 'Progress tracking', 'Quiz scoring', 'Completion status'],
  },
  {
    id: 'scorm2004',
    name: 'SCORM 2004',
    description: 'Latest SCORM standard with enhanced tracking',
    icon: Package,
    color: '#8B5CF6',
    badge: 'Advanced',
    features: ['Detailed analytics', 'Sequencing rules', 'Better tracking', 'Modern LMS'],
  },
  {
    id: 'html',
    name: 'Static HTML',
    description: 'Self-contained website ready to host',
    icon: ExternalLink,
    color: '#EC4899',
    badge: 'Coming Soon',
    features: ['Host anywhere', 'No LMS needed', 'Mobile responsive', 'Offline capable'],
  },
];

function ExportOptionCard({
  option,
  isSelected,
  onSelect,
  isDisabled,
}: {
  option: ExportOption;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}) {
  const Icon = option.icon;

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed border-[--paper-200] bg-[--paper-50]'
          : isSelected
          ? 'border-[--ember-500] bg-[--ember-50]'
          : 'border-[--paper-200] hover:border-[--paper-300] bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${option.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: option.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-[--paper-900]">{option.name}</h3>
            {option.badge && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: option.color }}
              >
                {option.badge}
              </span>
            )}
            {isSelected && (
              <div className="ml-auto w-5 h-5 rounded-full bg-[--ember-500] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-[--paper-500] mb-2">{option.description}</p>
          <div className="flex flex-wrap gap-1">
            {option.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[--paper-100] text-[--paper-600]"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export function EnhancedExportModal({ isOpen, onClose, course }: EnhancedExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeScripts, setIncludeScripts] = useState(true);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      const safeTitle = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      switch (selectedFormat) {
        case 'json':
          const jsonData = { ...course };
          if (!includeQuizzes) {
            jsonData.modules = jsonData.modules.map((m) => ({ ...m, quiz: undefined }));
          }
          if (!includeScripts) {
            jsonData.modules = jsonData.modules.map((m) => ({
              ...m,
              lessons: m.lessons.map((l) => ({ ...l, videoScript: undefined })),
            }));
          }
          content = JSON.stringify(jsonData, null, 2);
          filename = `${safeTitle}.json`;
          mimeType = 'application/json';
          break;

        case 'markdown':
          content = generateMarkdown(course, includeQuizzes, includeScripts);
          filename = `${safeTitle}.md`;
          mimeType = 'text/markdown';
          break;

        case 'scorm12':
        case 'scorm2004':
          const version = selectedFormat === 'scorm12' ? '1.2' : '2004';
          const blob = await exportToSCORM(course, version);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeTitle}-scorm-${version}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setIsExporting(false);
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 3000);
          return;

        default:
          throw new Error('Format not supported yet');
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateMarkdown = (course: Course, withQuizzes: boolean, withScripts: boolean): string => {
    let md = `# ${course.title}\n\n`;
    if (course.description) md += `${course.description}\n\n`;
    md += `**Target Audience:** ${course.targetAudience || 'Not specified'}\n`;
    md += `**Difficulty:** ${course.difficulty || 'Not specified'}\n`;
    md += `**Type:** ${course.courseType || 'Not specified'}\n\n`;
    md += `---\n\n`;

    course.modules.forEach((module, i) => {
      md += `## Module ${i + 1}: ${module.title}\n\n`;
      if (module.description) md += `${module.description}\n\n`;

      if (module.objectives && module.objectives.length > 0) {
        md += `### Learning Objectives\n\n`;
        module.objectives.forEach((obj) => {
          md += `- ${obj.text} *(${obj.bloomLevel})*\n`;
        });
        md += `\n`;
      }

      module.lessons.forEach((lesson, j) => {
        md += `### Lesson ${i + 1}.${j + 1}: ${lesson.title}\n\n`;
        if (lesson.content) md += `${lesson.content}\n\n`;

        if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
          md += `**Key Takeaways:**\n`;
          lesson.keyTakeaways.forEach((kt) => {
            md += `- ${kt}\n`;
          });
          md += `\n`;
        }

        if (withScripts && lesson.videoScript) {
          md += `#### Video Script\n\n`;
          md += `\`\`\`\n${lesson.videoScript.script || 'Script content'}\n\`\`\`\n\n`;
        }
      });

      if (withQuizzes && module.quiz && module.quiz.questions) {
        md += `### Quiz: ${module.quiz.title || 'Module Quiz'}\n\n`;
        module.quiz.questions.forEach((q, k) => {
          md += `**${k + 1}. ${q.question}**\n\n`;
          if (q.options) {
            q.options.forEach((opt, l) => {
              md += `${l === q.correctAnswer ? '✓' : '○'} ${opt}\n`;
            });
          }
          if (q.explanation) {
            md += `\n*Explanation: ${q.explanation}*\n`;
          }
          md += `\n`;
        });
      }

      md += `---\n\n`;
    });

    md += `\n*Generated by CourseForge*\n`;
    return md;
  };

  // Stats for the course
  const stats = {
    modules: course.modules.length,
    lessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    quizzes: course.modules.filter((m) => m.quiz).length,
    scripts: course.modules.flatMap((m) => m.lessons).filter((l) => l.videoScript).length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[--paper-900]/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[--paper-200] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[--paper-200]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[--paper-900]">
                    Export Course
                  </h2>
                  <p className="text-sm text-[--paper-500] mt-1">
                    Choose a format and download your course
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[--paper-400] hover:text-[--paper-600] hover:bg-[--paper-100]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Course Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-[--paper-600]">
                  <BookOpen className="w-4 h-4" />
                  <span>{stats.modules} modules</span>
                </div>
                <div className="flex items-center gap-1.5 text-[--paper-600]">
                  <FileText className="w-4 h-4" />
                  <span>{stats.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1.5 text-[--paper-600]">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{stats.quizzes} quizzes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[--paper-600]">
                  <Video className="w-4 h-4" />
                  <span>{stats.scripts} scripts</span>
                </div>
              </div>
            </div>

            {/* Format Options */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <p className="text-xs font-medium text-[--paper-500] uppercase tracking-wide mb-3">
                Select Format
              </p>
              <div className="space-y-3">
                {EXPORT_OPTIONS.map((option) => (
                  <ExportOptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedFormat === option.id}
                    onSelect={() => setSelectedFormat(option.id)}
                    isDisabled={option.id === 'html'}
                  />
                ))}
              </div>

              {/* Export Options */}
              <div className="mt-6 pt-6 border-t border-[--paper-200]">
                <p className="text-xs font-medium text-[--paper-500] uppercase tracking-wide mb-3">
                  Include
                </p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeQuizzes}
                      onChange={(e) => setIncludeQuizzes(e.target.checked)}
                      className="w-4 h-4 rounded border-[--paper-300] text-[--ember-500] focus:ring-[--ember-500]"
                    />
                    <span className="text-sm text-[--paper-700]">Quizzes & Assessments</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeScripts}
                      onChange={(e) => setIncludeScripts(e.target.checked)}
                      className="w-4 h-4 rounded border-[--paper-300] text-[--ember-500] focus:ring-[--ember-500]"
                    />
                    <span className="text-sm text-[--paper-700]">Video Scripts</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[--paper-200] bg-[--paper-50] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {exportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-emerald-600"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Export complete!</span>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-[--paper-300]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || selectedFormat === 'html'}
                  className="btn-forge btn-forge-primary"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
