'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Users,
  Clock,
  Zap,
  Award,
  BarChart3,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { Course, Module } from '@/types';

interface QualityMetric {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs-work' | 'critical';
  suggestions: string[];
  icon: typeof Brain;
  color: string;
}

interface CourseQualityAnalyzerProps {
  course: Course | null;
  isAnalyzing?: boolean;
}

// Bloom's Taxonomy levels with weights
const BLOOM_LEVELS = {
  remember: { weight: 1, label: 'Remember' },
  understand: { weight: 1.5, label: 'Understand' },
  apply: { weight: 2, label: 'Apply' },
  analyze: { weight: 2.5, label: 'Analyze' },
  evaluate: { weight: 3, label: 'Evaluate' },
  create: { weight: 3.5, label: 'Create' },
};

function analyzeBloomsCoverage(course: Course): QualityMetric {
  const bloomCounts: Record<string, number> = {};
  let totalObjectives = 0;

  course.modules.forEach((module) => {
    module.objectives?.forEach((obj) => {
      const level = obj.bloomLevel || 'understand';
      bloomCounts[level] = (bloomCounts[level] || 0) + 1;
      totalObjectives++;
    });
  });

  const coveredLevels = Object.keys(bloomCounts).length;
  const hasHigherOrder = ['analyze', 'evaluate', 'create'].some((l) => bloomCounts[l] > 0);

  let score = Math.min((coveredLevels / 6) * 70 + (hasHigherOrder ? 30 : 0), 100);

  const suggestions: string[] = [];
  if (coveredLevels < 4) {
    suggestions.push('Add objectives covering more cognitive levels');
  }
  if (!hasHigherOrder) {
    suggestions.push('Include higher-order thinking objectives (Analyze, Evaluate, Create)');
  }
  if (totalObjectives < course.modules.length * 2) {
    suggestions.push('Each module should have at least 2-3 learning objectives');
  }

  return {
    id: 'blooms',
    name: "Bloom's Taxonomy Coverage",
    score: Math.round(score),
    maxScore: 100,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-work' : 'critical',
    suggestions,
    icon: Brain,
    color: '#8B5CF6',
  };
}

function analyzeContentDepth(course: Course): QualityMetric {
  let totalContentLength = 0;
  let lessonsWithContent = 0;
  let totalLessons = 0;

  course.modules.forEach((module) => {
    module.lessons.forEach((lesson) => {
      totalLessons++;
      if (lesson.content) {
        lessonsWithContent++;
        totalContentLength += lesson.content.length;
      }
    });
  });

  const avgContentLength = lessonsWithContent > 0 ? totalContentLength / lessonsWithContent : 0;
  const completionRate = totalLessons > 0 ? (lessonsWithContent / totalLessons) * 100 : 0;

  // Score based on average content length and completion
  const lengthScore = Math.min(avgContentLength / 20, 50); // 1000 chars = 50 points
  const completionScore = completionRate * 0.5;
  let score = Math.round(lengthScore + completionScore);

  const suggestions: string[] = [];
  if (avgContentLength < 500) {
    suggestions.push('Expand lesson content with more detailed explanations');
  }
  if (completionRate < 100) {
    suggestions.push(`Complete content for ${totalLessons - lessonsWithContent} remaining lessons`);
  }
  if (avgContentLength > 0 && avgContentLength < 800) {
    suggestions.push('Add examples and case studies to enrich content');
  }

  return {
    id: 'depth',
    name: 'Content Depth',
    score,
    maxScore: 100,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-work' : 'critical',
    suggestions,
    icon: BookOpen,
    color: '#00A67E',
  };
}

function analyzeAssessmentQuality(course: Course): QualityMetric {
  let modulesWithQuiz = 0;
  let totalQuestions = 0;
  let questionTypes = new Set<string>();

  course.modules.forEach((module) => {
    if (module.quiz && module.quiz.questions && module.quiz.questions.length > 0) {
      modulesWithQuiz++;
      totalQuestions += module.quiz.questions.length;
      module.quiz.questions.forEach((q) => questionTypes.add(q.type));
    }
  });

  const quizCoverage = course.modules.length > 0 ? (modulesWithQuiz / course.modules.length) * 40 : 0;
  const questionDiversity = Math.min(questionTypes.size * 15, 30);
  const questionDepth = Math.min((totalQuestions / Math.max(course.modules.length, 1)) * 10, 30);

  let score = Math.round(quizCoverage + questionDiversity + questionDepth);

  const suggestions: string[] = [];
  if (modulesWithQuiz < course.modules.length) {
    suggestions.push(`Add quizzes to ${course.modules.length - modulesWithQuiz} modules`);
  }
  if (questionTypes.size < 3) {
    suggestions.push('Use varied question types (MCQ, true/false, short answer)');
  }
  if (totalQuestions / Math.max(course.modules.length, 1) < 5) {
    suggestions.push('Add more questions per module (recommended: 5-10)');
  }

  return {
    id: 'assessment',
    name: 'Assessment Quality',
    score,
    maxScore: 100,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-work' : 'critical',
    suggestions,
    icon: Target,
    color: '#F59E0B',
  };
}

function analyzeEngagement(course: Course): QualityMetric {
  let lessonsWithInteractive = 0;
  let totalInteractive = 0;
  let lessonsWithScript = 0;
  let totalLessons = 0;

  course.modules.forEach((module) => {
    module.lessons.forEach((lesson) => {
      totalLessons++;
      if (lesson.interactiveElements && lesson.interactiveElements.length > 0) {
        lessonsWithInteractive++;
        totalInteractive += lesson.interactiveElements.length;
      }
      if (lesson.videoScript) {
        lessonsWithScript++;
      }
    });
  });

  const interactiveRate = totalLessons > 0 ? (lessonsWithInteractive / totalLessons) * 40 : 0;
  const scriptRate = totalLessons > 0 ? (lessonsWithScript / totalLessons) * 30 : 0;
  const interactiveDensity = Math.min((totalInteractive / Math.max(totalLessons, 1)) * 15, 30);

  let score = Math.round(interactiveRate + scriptRate + interactiveDensity);

  const suggestions: string[] = [];
  if (lessonsWithInteractive / Math.max(totalLessons, 1) < 0.5) {
    suggestions.push('Add interactive elements to more lessons');
  }
  if (lessonsWithScript / Math.max(totalLessons, 1) < 0.3) {
    suggestions.push('Generate video scripts for key lessons');
  }
  if (totalInteractive / Math.max(totalLessons, 1) < 1) {
    suggestions.push('Include reflection prompts and exercises in each lesson');
  }

  return {
    id: 'engagement',
    name: 'Engagement & Interactivity',
    score,
    maxScore: 100,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-work' : 'critical',
    suggestions,
    icon: Lightbulb,
    color: '#EC4899',
  };
}

function analyzeStructure(course: Course): QualityMetric {
  const moduleCount = course.modules.length;
  const avgLessonsPerModule = moduleCount > 0
    ? course.modules.reduce((sum, m) => sum + m.lessons.length, 0) / moduleCount
    : 0;

  // Check for balanced structure
  const lessonCounts = course.modules.map((m) => m.lessons.length);
  const variance = lessonCounts.length > 0
    ? lessonCounts.reduce((sum, c) => sum + Math.pow(c - avgLessonsPerModule, 2), 0) / lessonCounts.length
    : 0;
  const isBalanced = variance < 4;

  // Scoring
  const moduleScore = moduleCount >= 3 && moduleCount <= 10 ? 30 : moduleCount > 0 ? 15 : 0;
  const avgLessonScore = avgLessonsPerModule >= 2 && avgLessonsPerModule <= 6 ? 35 : avgLessonsPerModule > 0 ? 20 : 0;
  const balanceScore = isBalanced ? 35 : 15;

  let score = moduleScore + avgLessonScore + balanceScore;

  const suggestions: string[] = [];
  if (moduleCount < 3) {
    suggestions.push('Consider adding more modules for better organization');
  }
  if (moduleCount > 10) {
    suggestions.push('Consider consolidating some modules to reduce cognitive load');
  }
  if (avgLessonsPerModule < 2) {
    suggestions.push('Add more lessons to each module');
  }
  if (!isBalanced) {
    suggestions.push('Balance the number of lessons across modules');
  }

  return {
    id: 'structure',
    name: 'Course Structure',
    score: Math.round(score),
    maxScore: 100,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-work' : 'critical',
    suggestions,
    icon: BarChart3,
    color: '#0066FF',
  };
}

function calculateOverallScore(metrics: QualityMetric[]): number {
  if (metrics.length === 0) return 0;
  const weights = { blooms: 0.25, depth: 0.25, assessment: 0.2, engagement: 0.15, structure: 0.15 };
  let totalWeight = 0;
  let weightedSum = 0;

  metrics.forEach((m) => {
    const weight = weights[m.id as keyof typeof weights] || 0.2;
    weightedSum += m.score * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

function getScoreGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: 'A+', label: 'Exceptional', color: '#00A67E' };
  if (score >= 80) return { grade: 'A', label: 'Excellent', color: '#00A67E' };
  if (score >= 70) return { grade: 'B', label: 'Good', color: '#0066FF' };
  if (score >= 60) return { grade: 'C', label: 'Fair', color: '#F59E0B' };
  if (score >= 50) return { grade: 'D', label: 'Needs Work', color: '#F97316' };
  return { grade: 'F', label: 'Critical', color: '#DC2626' };
}

function MetricCard({ metric, delay }: { metric: QualityMetric; delay: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = metric.icon;
  const percentage = (metric.score / metric.maxScore) * 100;

  const statusColors = {
    excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    good: 'bg-blue-50 text-blue-700 border-blue-200',
    'needs-work': 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl border border-[--paper-200] overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${metric.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: metric.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[--paper-900]">{metric.name}</span>
            <span className="text-sm font-semibold" style={{ color: metric.color }}>
              {metric.score}%
            </span>
          </div>
          <div className="h-2 bg-[--paper-100] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: metric.color }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[--paper-400]"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && metric.suggestions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[--paper-100]"
          >
            <div className="p-4 bg-[--paper-50]">
              <p className="text-xs font-medium text-[--paper-500] uppercase tracking-wide mb-2">
                Suggestions
              </p>
              <ul className="space-y-2">
                {metric.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[--paper-700]">
                    <Sparkles className="w-4 h-4 text-[--ember-500] flex-shrink-0 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CourseQualityAnalyzer({ course, isAnalyzing }: CourseQualityAnalyzerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const metrics = useMemo(() => {
    if (!course || course.modules.length === 0) return [];
    return [
      analyzeBloomsCoverage(course),
      analyzeContentDepth(course),
      analyzeAssessmentQuality(course),
      analyzeEngagement(course),
      analyzeStructure(course),
    ];
  }, [course]);

  const overallScore = useMemo(() => calculateOverallScore(metrics), [metrics]);
  const grade = useMemo(() => getScoreGrade(overallScore), [overallScore]);

  if (!course || course.modules.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[--paper-100] mx-auto mb-4 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-[--paper-400]" />
        </div>
        <h3 className="font-medium text-[--paper-900] mb-1">No course data</h3>
        <p className="text-sm text-[--paper-500]">Generate a course to see quality analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[--paper-800] to-[--paper-900] rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Course Quality Score</p>
            <div className="flex items-baseline gap-3">
              <motion.span
                className="text-5xl font-serif font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {overallScore}
              </motion.span>
              <span className="text-white/40 text-lg">/100</span>
            </div>
            <p className="text-white/80 mt-2">{grade.label}</p>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-serif font-bold"
            style={{ backgroundColor: grade.color }}
          >
            {grade.grade}
          </motion.div>
        </div>

        {/* Quick stats */}
        <div className="relative mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <p className="text-white/50 text-xs mb-1">Modules</p>
            <p className="text-lg font-semibold">{course.modules.length}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Lessons</p>
            <p className="text-lg font-semibold">
              {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Quizzes</p>
            <p className="text-lg font-semibold">
              {course.modules.filter((m) => m.quiz).length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-[--paper-900] text-sm">Quality Metrics</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-[--ember-600] hover:text-[--ember-700] font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      {metrics.some((m) => m.suggestions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[--ember-50] to-[--ember-100]/50 rounded-xl p-4 border border-[--ember-200]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[--ember-600]" />
            <span className="text-sm font-medium text-[--ember-800]">Quick Wins</span>
          </div>
          <ul className="space-y-2">
            {metrics
              .flatMap((m) => m.suggestions.slice(0, 1))
              .slice(0, 3)
              .map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[--ember-700]">
                  <CheckCircle2 className="w-4 h-4 text-[--ember-500] flex-shrink-0 mt-0.5" />
                  {suggestion}
                </li>
              ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
