'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Award,
  Target,
  BookOpen,
  PenTool,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Crown,
  Medal,
  Gift,
} from 'lucide-react';
import type { Course } from '@/types';

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_course',
    name: 'Course Creator',
    description: 'Create your first course',
    icon: BookOpen,
    color: '#0066FF',
    xp: 100,
    category: 'milestone',
    condition: (stats: UserStats) => stats.coursesCreated >= 1,
  },
  {
    id: 'module_master',
    name: 'Module Master',
    description: 'Create a course with 5+ modules',
    icon: Target,
    color: '#00A67E',
    xp: 150,
    category: 'content',
    condition: (stats: UserStats) => stats.maxModules >= 5,
  },
  {
    id: 'quiz_wizard',
    name: 'Quiz Wizard',
    description: 'Generate 10 quiz questions',
    icon: Zap,
    color: '#F59E0B',
    xp: 100,
    category: 'assessment',
    condition: (stats: UserStats) => stats.questionsCreated >= 10,
  },
  {
    id: 'content_king',
    name: 'Content King',
    description: 'Write 5000+ characters of lesson content',
    icon: PenTool,
    color: '#8B5CF6',
    xp: 200,
    category: 'content',
    condition: (stats: UserStats) => stats.contentWritten >= 5000,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve 90%+ course quality score',
    icon: Star,
    color: '#EC4899',
    xp: 300,
    category: 'quality',
    condition: (stats: UserStats) => stats.highestQualityScore >= 90,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Create a complete course in under 5 minutes',
    icon: Flame,
    color: '#E24A12',
    xp: 250,
    category: 'special',
    condition: (stats: UserStats) => stats.fastestCourseTime <= 300,
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Use CourseForge 3 days in a row',
    icon: Flame,
    color: '#F97316',
    xp: 100,
    category: 'engagement',
    condition: (stats: UserStats) => stats.currentStreak >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Use CourseForge 7 days in a row',
    icon: Crown,
    color: '#EAB308',
    xp: 300,
    category: 'engagement',
    condition: (stats: UserStats) => stats.currentStreak >= 7,
  },
  {
    id: 'video_producer',
    name: 'Video Producer',
    description: 'Generate 5 video scripts',
    icon: Award,
    color: '#06B6D4',
    xp: 150,
    category: 'content',
    condition: (stats: UserStats) => stats.scriptsCreated >= 5,
  },
  {
    id: 'interactive_guru',
    name: 'Interactive Guru',
    description: 'Add 20 interactive elements',
    icon: Sparkles,
    color: '#A855F7',
    xp: 200,
    category: 'engagement',
    condition: (stats: UserStats) => stats.interactiveElements >= 20,
  },
];

// Level thresholds
const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Novice Creator' },
  { level: 2, xpRequired: 100, title: 'Apprentice' },
  { level: 3, xpRequired: 250, title: 'Course Crafter' },
  { level: 4, xpRequired: 500, title: 'Content Artisan' },
  { level: 5, xpRequired: 800, title: 'Learning Architect' },
  { level: 6, xpRequired: 1200, title: 'Education Expert' },
  { level: 7, xpRequired: 1700, title: 'Master Creator' },
  { level: 8, xpRequired: 2300, title: 'Course Virtuoso' },
  { level: 9, xpRequired: 3000, title: 'Grand Master' },
  { level: 10, xpRequired: 4000, title: 'Legendary Forger' },
];

interface UserStats {
  coursesCreated: number;
  maxModules: number;
  questionsCreated: number;
  contentWritten: number;
  highestQualityScore: number;
  fastestCourseTime: number;
  currentStreak: number;
  scriptsCreated: number;
  interactiveElements: number;
  totalXp: number;
  unlockedAchievements: string[];
  lastActiveDate: string;
}

interface GamificationSystemProps {
  course: Course | null;
  qualityScore?: number;
}

function calculateStats(course: Course | null, qualityScore: number): Partial<UserStats> {
  if (!course) return {};

  let contentLength = 0;
  let questionsCount = 0;
  let scriptsCount = 0;
  let interactiveCount = 0;

  course.modules.forEach((module) => {
    if (module.quiz?.questions) {
      questionsCount += module.quiz.questions.length;
    }
    module.lessons.forEach((lesson) => {
      if (lesson.content) {
        contentLength += lesson.content.length;
      }
      if (lesson.videoScript) {
        scriptsCount++;
      }
      if (lesson.interactiveElements) {
        interactiveCount += lesson.interactiveElements.length;
      }
    });
  });

  return {
    coursesCreated: 1,
    maxModules: course.modules.length,
    questionsCreated: questionsCount,
    contentWritten: contentLength,
    highestQualityScore: qualityScore,
    scriptsCreated: scriptsCount,
    interactiveElements: interactiveCount,
  };
}

function getLevel(xp: number): { current: typeof LEVELS[0]; next: typeof LEVELS[0] | null; progress: number } {
  let currentLevel = LEVELS[0];
  let nextLevel: typeof LEVELS[0] | null = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel
    ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  return { current: currentLevel, next: nextLevel, progress };
}

function AchievementCard({
  achievement,
  isUnlocked,
  isNew,
  delay,
}: {
  achievement: typeof ACHIEVEMENTS[0];
  isUnlocked: boolean;
  isNew: boolean;
  delay: number;
}) {
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className={`relative p-4 rounded-xl border transition-all ${
        isUnlocked
          ? 'bg-white border-[--paper-200] shadow-sm'
          : 'bg-[--paper-50] border-[--paper-100] opacity-60'
      }`}
    >
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-[--ember-500] rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs font-bold">!</span>
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isUnlocked ? '' : 'grayscale'
          }`}
          style={{ backgroundColor: isUnlocked ? `${achievement.color}15` : undefined }}
        >
          {isUnlocked ? (
            <Icon className="w-6 h-6" style={{ color: achievement.color }} />
          ) : (
            <Lock className="w-5 h-5 text-[--paper-400]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[--paper-900] text-sm">{achievement.name}</h4>
          <p className="text-xs text-[--paper-500] mt-0.5">{achievement.description}</p>
          {isUnlocked && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3 h-3 text-[--ember-500]" />
              <span className="text-xs font-medium text-[--ember-600]">+{achievement.xp} XP</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function XPAnimation({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-[--ember-500] to-[--ember-600] text-white px-6 py-4 rounded-2xl shadow-lg z-50"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <Star className="w-8 h-8 text-yellow-300" />
        </motion.div>
        <div>
          <p className="text-sm text-white/80">XP Earned!</p>
          <p className="text-2xl font-bold">+{xp}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function GamificationSystem({ course, qualityScore = 0 }: GamificationSystemProps) {
  // Load stats from localStorage
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window === 'undefined') {
      return {
        coursesCreated: 0,
        maxModules: 0,
        questionsCreated: 0,
        contentWritten: 0,
        highestQualityScore: 0,
        fastestCourseTime: Infinity,
        currentStreak: 1,
        scriptsCreated: 0,
        interactiveElements: 0,
        totalXp: 0,
        unlockedAchievements: [],
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
    }
    const saved = localStorage.getItem('courseforge-gamification');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      coursesCreated: 0,
      maxModules: 0,
      questionsCreated: 0,
      contentWritten: 0,
      highestQualityScore: 0,
      fastestCourseTime: Infinity,
      currentStreak: 1,
      scriptsCreated: 0,
      interactiveElements: 0,
      totalXp: 0,
      unlockedAchievements: [],
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
  });

  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Update stats when course changes
  useEffect(() => {
    if (!course) return;

    const courseStats = calculateStats(course, qualityScore);
    setStats((prev) => {
      const updated = {
        ...prev,
        coursesCreated: Math.max(prev.coursesCreated, courseStats.coursesCreated || 0),
        maxModules: Math.max(prev.maxModules, courseStats.maxModules || 0),
        questionsCreated: Math.max(prev.questionsCreated, courseStats.questionsCreated || 0),
        contentWritten: Math.max(prev.contentWritten, courseStats.contentWritten || 0),
        highestQualityScore: Math.max(prev.highestQualityScore, courseStats.highestQualityScore || 0),
        scriptsCreated: Math.max(prev.scriptsCreated, courseStats.scriptsCreated || 0),
        interactiveElements: Math.max(prev.interactiveElements, courseStats.interactiveElements || 0),
      };

      // Check for new achievements
      let xpEarned = 0;
      const newlyUnlocked: string[] = [];

      ACHIEVEMENTS.forEach((achievement) => {
        if (!prev.unlockedAchievements.includes(achievement.id) && achievement.condition(updated)) {
          newlyUnlocked.push(achievement.id);
          xpEarned += achievement.xp;
        }
      });

      if (newlyUnlocked.length > 0) {
        updated.unlockedAchievements = [...prev.unlockedAchievements, ...newlyUnlocked];
        updated.totalXp = prev.totalXp + xpEarned;
        setNewAchievements(newlyUnlocked);
        setEarnedXP(xpEarned);
        setShowXPAnimation(true);
      }

      // Save to localStorage
      localStorage.setItem('courseforge-gamification', JSON.stringify(updated));
      return updated;
    });
  }, [course, qualityScore]);

  const levelInfo = useMemo(() => getLevel(stats.totalXp), [stats.totalXp]);

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[--ember-500] to-[--ember-700] rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Level {levelInfo.current.level}</p>
              <h3 className="text-xl font-serif font-semibold">{levelInfo.current.title}</h3>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Experience Points</span>
              <span className="font-semibold">{stats.totalXp} XP</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {levelInfo.next && (
              <p className="text-xs text-white/60 text-right">
                {levelInfo.next.xpRequired - stats.totalXp} XP to {levelInfo.next.title}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-[--paper-200] p-4 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-[--paper-500]">Current Streak</p>
          <p className="text-2xl font-bold text-[--paper-900]">
            {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[--paper-400]">Best: 7 days</p>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[--paper-900]">Achievements</h3>
          <span className="text-xs text-[--paper-500]">
            {stats.unlockedAchievements.length} / {ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENTS.slice(0, 6).map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={stats.unlockedAchievements.includes(achievement.id)}
              isNew={newAchievements.includes(achievement.id)}
              delay={index * 0.05}
            />
          ))}
        </div>

        {ACHIEVEMENTS.length > 6 && (
          <button className="w-full mt-3 py-2 text-sm text-[--ember-600] hover:text-[--ember-700] font-medium">
            View all achievements
          </button>
        )}
      </div>

      {/* XP Animation */}
      <AnimatePresence>
        {showXPAnimation && (
          <XPAnimation xp={earnedXP} onComplete={() => setShowXPAnimation(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
