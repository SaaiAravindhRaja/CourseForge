'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  BookOpen,
  Users,
  Target,
  Brain,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  Activity,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { Course } from '@/types';
import { CourseQualityAnalyzer } from './CourseQualityAnalyzer';

interface AnalyticsDashboardProps {
  course: Course | null;
}

interface InsightCard {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
}

function generateInsights(course: Course): InsightCard[] {
  const insights: InsightCard[] = [];

  if (!course || course.modules.length === 0) return insights;

  // Module balance check
  const lessonCounts = course.modules.map((m) => m.lessons.length);
  const avgLessons = lessonCounts.reduce((a, b) => a + b, 0) / lessonCounts.length;
  const variance = lessonCounts.reduce((sum, c) => sum + Math.pow(c - avgLessons, 2), 0) / lessonCounts.length;

  if (variance > 4) {
    insights.push({
      id: 'balance',
      type: 'warning',
      title: 'Unbalanced Modules',
      description: 'Some modules have significantly more lessons than others. Consider redistributing content for a smoother learning experience.',
      action: 'Balance modules',
    });
  }

  // Quiz coverage
  const modulesWithQuiz = course.modules.filter((m) => m.quiz).length;
  if (modulesWithQuiz < course.modules.length) {
    insights.push({
      id: 'quiz',
      type: 'tip',
      title: 'Add More Quizzes',
      description: `${course.modules.length - modulesWithQuiz} modules are missing quizzes. Assessments help reinforce learning.`,
      action: 'Generate quizzes',
    });
  }

  // Content depth
  const emptyLessons = course.modules.flatMap((m) => m.lessons).filter((l) => !l.content).length;
  if (emptyLessons > 0) {
    insights.push({
      id: 'content',
      type: 'info',
      title: 'Incomplete Lessons',
      description: `${emptyLessons} lessons are waiting for content. Generate content to complete your course.`,
      action: 'Generate content',
    });
  }

  // Success insight
  const completeLessons = course.modules.flatMap((m) => m.lessons).filter((l) => l.content).length;
  if (completeLessons > 0) {
    insights.push({
      id: 'progress',
      type: 'success',
      title: 'Great Progress!',
      description: `You've created ${completeLessons} complete lessons. Your course is taking shape!`,
    });
  }

  return insights;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  delay,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
  delay: number;
}) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-[--paper-400]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-[--paper-200] p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-serif font-semibold text-[--paper-900]">{value}</p>
      <p className="text-sm text-[--paper-500] mt-1">{label}</p>
      {subValue && <p className="text-xs text-[--paper-400] mt-1">{subValue}</p>}
    </motion.div>
  );
}

function InsightCard({ insight, delay }: { insight: InsightCard; delay: number }) {
  const iconMap = {
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
    tip: Sparkles,
  };
  const colorMap = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '#00A67E' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '#F59E0B' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '#0066FF' },
    tip: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '#8B5CF6' },
  };

  const Icon = iconMap[insight.type];
  const colors = colorMap[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`${colors.bg} ${colors.border} border rounded-xl p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5" style={{ color: colors.icon }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${colors.text} text-sm`}>{insight.title}</h4>
          <p className="text-sm text-[--paper-600] mt-1">{insight.description}</p>
          {insight.action && (
            <button className={`text-sm font-medium ${colors.text} mt-2 hover:underline`}>
              {insight.action} →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BloomsTaxonomyChart({ course }: { course: Course }) {
  const bloomsData = useMemo(() => {
    const counts: Record<string, number> = {
      remember: 0,
      understand: 0,
      apply: 0,
      analyze: 0,
      evaluate: 0,
      create: 0,
    };

    course.modules.forEach((module) => {
      module.objectives?.forEach((obj) => {
        const level = obj.bloomLevel || 'understand';
        if (counts[level] !== undefined) {
          counts[level]++;
        }
      });
    });

    return Object.entries(counts).map(([level, count]) => ({
      level,
      count,
      percentage: course.modules.flatMap((m) => m.objectives || []).length > 0
        ? Math.round((count / course.modules.flatMap((m) => m.objectives || []).length) * 100)
        : 0,
    }));
  }, [course]);

  const colors = ['#DC2626', '#F59E0B', '#EAB308', '#22C55E', '#0EA5E9', '#8B5CF6'];

  return (
    <div className="bg-white rounded-xl border border-[--paper-200] p-4">
      <h3 className="font-medium text-[--paper-900] mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4 text-[--paper-500]" />
        Bloom&apos;s Taxonomy Coverage
      </h3>
      <div className="space-y-3">
        {bloomsData.map((item, index) => (
          <div key={item.level} className="flex items-center gap-3">
            <span className="w-20 text-xs text-[--paper-600] capitalize">{item.level}</span>
            <div className="flex-1 h-6 bg-[--paper-100] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
            </div>
            <span className="w-10 text-xs text-right text-[--paper-500]">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseStructureChart({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-xl border border-[--paper-200] p-4">
      <h3 className="font-medium text-[--paper-900] mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[--paper-500]" />
        Course Structure
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {course.modules.slice(0, 6).map((module, index) => {
          const lessonCount = module.lessons.length;
          const maxLessons = Math.max(...course.modules.map((m) => m.lessons.length), 1);
          const height = (lessonCount / maxLessons) * 100;

          return (
            <div key={module.id} className="text-center">
              <div className="h-24 flex items-end justify-center mb-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-8 rounded-t-md"
                  style={{
                    backgroundColor: ['#E24A12', '#0066FF', '#00A67E', '#F59E0B', '#8B5CF6', '#EC4899'][
                      index % 6
                    ],
                  }}
                />
              </div>
              <p className="text-xs text-[--paper-500] truncate" title={module.title}>
                M{index + 1}
              </p>
              <p className="text-xs font-medium text-[--paper-700]">{lessonCount}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[--paper-400] text-center mt-3">Lessons per module</p>
    </div>
  );
}

export function AnalyticsDashboard({ course }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'insights'>('overview');

  const stats = useMemo(() => {
    if (!course) return null;

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completeLessons = course.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.content).length;
    const totalQuestions = course.modules
      .filter((m) => m.quiz)
      .reduce((sum, m) => sum + (m.quiz?.questions?.length || 0), 0);
    const totalScripts = course.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.videoScript).length;
    const totalInteractive = course.modules
      .flatMap((m) => m.lessons)
      .reduce((sum, l) => sum + (l.interactiveElements?.length || 0), 0);

    const contentLength = course.modules
      .flatMap((m) => m.lessons)
      .reduce((sum, l) => sum + (l.content?.length || 0), 0);

    const estimatedReadTime = Math.ceil(contentLength / 1500); // ~200 words per minute, 7.5 chars per word

    return {
      modules: course.modules.length,
      lessons: totalLessons,
      completeLessons,
      questions: totalQuestions,
      scripts: totalScripts,
      interactive: totalInteractive,
      contentLength,
      estimatedReadTime,
      completionRate: totalLessons > 0 ? Math.round((completeLessons / totalLessons) * 100) : 0,
    };
  }, [course]);

  const insights = useMemo(() => (course ? generateInsights(course) : []), [course]);

  if (!course || course.modules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[--paper-100] mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-[--paper-400]" />
          </div>
          <h3 className="font-medium text-[--paper-900] mb-1">No Analytics Yet</h3>
          <p className="text-sm text-[--paper-500]">
            Create a course to see detailed analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-2 bg-[--paper-50] border-b border-[--paper-200]">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'quality', label: 'Quality', icon: Award },
          { id: 'insights', label: 'Insights', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[--paper-900] shadow-sm'
                : 'text-[--paper-500] hover:text-[--paper-700]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={BookOpen}
                  label="Modules"
                  value={stats.modules}
                  color="#0066FF"
                  delay={0}
                />
                <StatCard
                  icon={Target}
                  label="Lessons"
                  value={stats.lessons}
                  subValue={`${stats.completionRate}% complete`}
                  color="#00A67E"
                  delay={0.05}
                />
                <StatCard
                  icon={Zap}
                  label="Quiz Questions"
                  value={stats.questions}
                  color="#F59E0B"
                  delay={0.1}
                />
                <StatCard
                  icon={Clock}
                  label="Est. Duration"
                  value={`${stats.estimatedReadTime}m`}
                  subValue="reading time"
                  color="#8B5CF6"
                  delay={0.15}
                />
              </div>

              {/* Charts */}
              <BloomsTaxonomyChart course={course} />
              <CourseStructureChart course={course} />
            </motion.div>
          )}

          {activeTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CourseQualityAnalyzer course={course} />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <InsightCard key={insight.id} insight={insight} delay={index * 0.1} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-[--paper-300] mx-auto mb-3" />
                  <p className="text-[--paper-500]">No insights available yet</p>
                  <p className="text-sm text-[--paper-400] mt-1">
                    Add more content to get personalized suggestions
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
