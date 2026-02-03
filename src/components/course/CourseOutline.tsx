'use client';

import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Circle,
  GraduationCap,
  Video,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCourseStore } from '@/store/courseStore';
import { LessonPreview } from './LessonPreview';
import type { Module, Lesson } from '@/types';

export function CourseOutline() {
  const { course } = useCourseStore();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [previewLesson, setPreviewLesson] = useState<{ lesson: Lesson; module: Module } | null>(null);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (!course || course.modules.length === 0) {
    return (
      <Card className="h-full border-0 shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30 animate-spin-slow" style={{ animationDuration: '20s' }} />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Course Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Upload a document and chat with the Director to generate your course outline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <>
      <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3 px-0 pt-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {course.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {course.modules.length} modules • {totalLessons} lessons
              </p>
            </div>
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary border-primary/20">
              {course.courseType}
            </Badge>
          </div>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              {course.targetAudience || 'General Audience'}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {course.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-2">
              {course.modules.map((module, index) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  index={index}
                  isExpanded={expandedModules.has(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  onPreviewLesson={(lesson) => setPreviewLesson({ lesson, module })}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Lesson Preview Dialog */}
      {previewLesson && (
        <LessonPreview
          lesson={previewLesson.lesson}
          module={previewLesson.module}
          open={!!previewLesson}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </>
  );
}

interface ModuleItemProps {
  module: Module;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPreviewLesson: (lesson: Lesson) => void;
}

function ModuleItem({ module, index, isExpanded, onToggle, onPreviewLesson }: ModuleItemProps) {
  const hasContent = module.lessons.some((l) => l.content);
  const hasQuiz = !!module.quiz;
  const lessonCount = module.lessons.length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={`
            w-full flex items-start gap-3 p-3 rounded-xl cursor-pointer
            transition-all duration-200 hover:bg-muted/50
            ${isExpanded ? 'bg-muted/50 shadow-sm' : ''}
          `}
        >
          <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary shadow-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{module.title}</h4>
              {hasContent && (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
              {hasQuiz && ' • Quiz included'}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-12 pl-3 border-l-2 border-primary/20 space-y-1 mt-1 mb-2">
          {module.objectives.length > 0 && (
            <div className="py-2">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Learning Objectives
              </p>
              <ul className="space-y-1">
                {module.objectives.slice(0, 3).map((obj) => (
                  <li
                    key={obj.id}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <GraduationCap className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                    <span className="line-clamp-1">{obj.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {module.lessons.map((lesson, lIndex) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={lIndex}
              onPreview={() => onPreviewLesson(lesson)}
            />
          ))}
          {module.quiz && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <FileText className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-500 flex-1">
                {module.quiz.title}
              </span>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                {module.quiz.questions.length} Q
              </Badge>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  onPreview: () => void;
}

function LessonItem({ lesson, index, onPreview }: LessonItemProps) {
  const hasContent = !!lesson.content;
  const hasScript = !!lesson.videoScript;
  const hasInteractive = lesson.interactiveElements.length > 0;

  return (
    <div
      onClick={onPreview}
      className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/20"
    >
      <div className="shrink-0">
        {hasContent ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
      <span className="text-xs flex-1 truncate group-hover:text-primary transition-colors">
        {lesson.title}
      </span>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {hasScript && (
          <span title="Video script ready">
            <Video className="h-3 w-3 text-blue-500" />
          </span>
        )}
        {hasInteractive && (
          <span title="Interactive elements">
            <MessageSquare className="h-3 w-3 text-purple-500" />
          </span>
        )}
        <Eye className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
}
