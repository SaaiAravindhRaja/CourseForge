'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Trophy,
  Network,
  ChevronRight,
  Check,
  Video,
  ClipboardCheck,
  GraduationCap,
  X,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CourseQualityAnalyzer } from '@/components/analytics/CourseQualityAnalyzer';
import { GamificationSystem } from '@/components/gamification/GamificationSystem';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { KnowledgeGraph } from '@/components/visualization/KnowledgeGraph';
import type { Course, Module } from '@/types';

interface RightPanelProps {
  course: Course | null;
  qualityScore?: number;
}

type PanelTab = 'outline' | 'analytics' | 'achievements' | 'graph';

const TABS = [
  { id: 'outline' as const, label: 'Outline', icon: BookOpen },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  { id: 'achievements' as const, label: 'XP', icon: Trophy },
  { id: 'graph' as const, label: 'Graph', icon: Network },
];

// Module card component
function ModuleCard({
  module,
  index,
  isExpanded,
  onToggle,
}: {
  module: Module;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasContent = module.lessons.some((l) => l.content);
  const completedLessons = module.lessons.filter((l) => l.content).length;
  const totalLessons = module.lessons.length;

  const moduleColors = ['#E24A12', '#0066FF', '#00A67E', '#F59E0B', '#8B5CF6', '#EC4899'];
  const accentColor = moduleColors[index % moduleColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="module-card overflow-hidden"
    >
      {/* Accent bar */}
      <div className="h-1" style={{ backgroundColor: accentColor }} />

      <button
        onClick={onToggle}
        className="w-full module-card-header flex items-start gap-3 text-left"
      >
        {/* Module number */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold"
          style={{
            backgroundColor: `${accentColor}10`,
            color: accentColor,
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-[--paper-900] text-sm truncate flex-1">{module.title}</p>
            {hasContent && (
              <span className="flex-shrink-0 text-[10px] py-0.5 px-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[--paper-500]">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              {totalLessons} lessons
            </span>
            {module.quiz && (
              <span className="flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3 flex-shrink-0" />
                Quiz
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[--paper-400] flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="module-card-content border-t border-[--paper-100]">
              {/* Lessons list */}
              <div className="space-y-1">
                {module.lessons.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.03 }}
                    className="lesson-item group"
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      {lesson.content ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[--paper-300]" />
                      )}
                    </div>
                    <span className="text-sm text-[--paper-600] group-hover:text-[--paper-900] truncate flex-1">
                      {lesson.title}
                    </span>
                    {lesson.videoScript && <Video className="w-4 h-4 text-[--paper-400]" />}
                  </motion.div>
                ))}
              </div>

              {/* Quiz indicator */}
              {module.quiz && (
                <div className="mt-3 pt-3 border-t border-[--paper-100]">
                  <div className="flex items-center gap-2 text-sm text-[--paper-600]">
                    <GraduationCap className="w-4 h-4" />
                    <span>{module.quiz.questions?.length || 0} quiz questions</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Course Outline Tab
function CourseOutlineTab({
  course,
  expandedModules,
  toggleModule,
}: {
  course: Course | null;
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
}) {
  if (!course || course.modules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-xl bg-[--paper-100] mx-auto mb-4 flex items-center justify-center">
          <BookOpen className="h-7 w-7 text-[--paper-400]" />
        </div>
        <h3 className="font-medium text-[--paper-900] mb-1 text-sm">No course yet</h3>
        <p className="text-xs text-[--paper-500]">Chat with agents to create your course</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Course header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 pb-3 border-b border-[--paper-100]"
      >
        <h3 className="font-serif text-base font-medium text-[--paper-900] mb-1 leading-tight">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-[--paper-500] line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}
      </motion.div>

      {/* Modules */}
      <div className="space-y-3">
        {course.modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function RightPanel({ course, qualityScore = 0 }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('outline');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);

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

  // Auto-expand first module when course changes
  useState(() => {
    if (course && course.modules.length > 0 && expandedModules.size === 0) {
      setExpandedModules(new Set([course.modules[0].id]));
    }
  });

  return (
    <>
      <aside className="w-80 flex-shrink-0 border-l border-[--paper-200] bg-white flex flex-col">
        {/* Tab Navigation */}
        <div className="h-14 border-b border-[--paper-200] px-2 flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[--ember-50] text-[--ember-700]'
                  : 'text-[--paper-500] hover:text-[--paper-700] hover:bg-[--paper-50]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'outline' && (
                <motion.div
                  key="outline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CourseOutlineTab
                    course={course}
                    expandedModules={expandedModules}
                    toggleModule={toggleModule}
                  />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AnalyticsDashboard course={course} />
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GamificationSystem course={course} qualityScore={qualityScore} />
                </motion.div>
              )}

              {activeTab === 'graph' && (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[500px]"
                >
                  <KnowledgeGraph course={course} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </aside>

      {/* Fullscreen Graph Modal */}
      <AnimatePresence>
        {isGraphFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <button
              onClick={() => setIsGraphFullscreen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-[--paper-100] flex items-center justify-center text-[--paper-600] hover:bg-[--paper-200]"
            >
              <X className="w-5 h-5" />
            </button>
            <KnowledgeGraph course={course} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
