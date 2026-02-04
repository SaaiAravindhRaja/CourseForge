'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  Download,
  RotateCcw,
  Loader2,
  Sparkles,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  Compass,
  BookOpen,
  MessageSquare,
  GraduationCap,
  FileJson,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCourseStore } from '@/store/courseStore';
import type { AgentMessage, Module, Lesson } from '@/types';
import Image from 'next/image';

// Agent configuration with enhanced visuals
const AGENTS = {
  director: { name: 'Director', color: '#E24A12', icon: Compass, description: 'Orchestrating' },
  curriculum: { name: 'Architect', color: '#0066FF', icon: Brain, description: 'Structuring' },
  content: { name: 'Writer', color: '#00A67E', icon: PenTool, description: 'Writing' },
  assessment: { name: 'Assessor', color: '#F59E0B', icon: ClipboardCheck, description: 'Assessing' },
  engagement: { name: 'Engager', color: '#8B5CF6', icon: Lightbulb, description: 'Engaging' },
  script: { name: 'Producer', color: '#EC4899', icon: Video, description: 'Producing' },
};

type AgentId = keyof typeof AGENTS;

interface WorkspaceProps {
  onReset: () => void;
}

// Agent status display component
function AgentStatus({ agentId, isActive }: { agentId: AgentId; isActive: boolean }) {
  const agent = AGENTS[agentId];
  const Icon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 ${
        isActive ? 'bg-[--paper-100]' : ''
      }`}
    >
      <div className="relative">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isActive ? 'scale-110' : ''
          }`}
          style={{
            backgroundColor: `${agent.color}${isActive ? '20' : '10'}`,
          }}
        >
          <Icon
            className="w-4.5 h-4.5"
            style={{ color: agent.color }}
          />
        </div>
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: agent.color }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isActive ? 'text-[--paper-900]' : 'text-[--paper-600]'}`}>
          {agent.name}
        </p>
        {isActive && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-[--paper-500]"
          >
            {agent.description}...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Progress ring component
function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle
          className="text-[--paper-200]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-circle text-[--ember-500]"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-[--paper-700]">{progress}%</span>
      </div>
    </div>
  );
}

// Message component with enhanced styling
function Message({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end"
      >
        <div className="message-user max-w-[85%]">
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  const agentId = (message.agentRole || 'director') as AgentId;
  const agent = AGENTS[agentId];
  const Icon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ backgroundColor: `${agent.color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: agent.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium text-[--paper-900]">{agent.name}</span>
          <span className="text-xs text-[--paper-400]">Agent</span>
        </div>
        <div className="message-assistant">
          <p className="text-[15px] text-[--paper-700] whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Module card with enhanced visuals
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
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const moduleColors = [
    '#E24A12', '#0066FF', '#00A67E', '#F59E0B', '#8B5CF6', '#EC4899'
  ];
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
        className="w-full module-card-header flex items-start gap-4 text-left"
      >
        {/* Module number */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold"
          style={{
            backgroundColor: `${accentColor}10`,
            color: accentColor,
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-[--paper-900] truncate">{module.title}</p>
            {hasContent && (
              <span className="badge-forge badge-forge-success text-[10px] py-0.5 px-2">
                Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[--paper-500]">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {totalLessons} lessons
            </span>
            {module.quiz && (
              <span className="flex items-center gap-1">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Quiz
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[--paper-400]"
        >
          <ChevronRight className="w-5 h-5" />
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
                    {lesson.videoScript && (
                      <Video className="w-4 h-4 text-[--paper-400]" />
                    )}
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

// Export menu component
function ExportMenu({ onExport, isOpen, onClose }: { onExport: (format: 'json' | 'markdown') => void; isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[--paper-200] shadow-lg overflow-hidden z-50"
          >
            <button
              onClick={() => { onExport('json'); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[--paper-700] hover:bg-[--paper-50] transition-colors"
            >
              <FileJson className="w-4 h-4 text-[--paper-500]" />
              Export as JSON
            </button>
            <button
              onClick={() => { onExport('markdown'); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[--paper-700] hover:bg-[--paper-50] transition-colors border-t border-[--paper-100]"
            >
              <FileCode className="w-4 h-4 text-[--paper-500]" />
              Export as Markdown
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Workspace({ onReset }: WorkspaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    addMessage,
    sourceDocument,
    course,
    stage,
    progress,
    setStage,
    setProgress,
    setCourse,
  } = useCourseStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // Initial greeting
  useEffect(() => {
    if (sourceDocument && messages.length === 0) {
      sendInitialGreeting();
    }
  }, [sourceDocument]);

  // Auto-expand first module
  useEffect(() => {
    if (course && course.modules.length > 0 && expandedModules.size === 0) {
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course]);

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    setActiveAgent('director');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: 'init',
              role: 'user',
              content: `I just uploaded a document called "${sourceDocument?.name}". Please analyze it and help me create a course. Give me a brief overview of what you found and ask what kind of course I'd like to create.`,
              timestamp: new Date().toISOString(),
            },
          ],
          context: {
            sourceDocument: sourceDocument
              ? { name: sourceDocument.name, content: sourceDocument.content.slice(0, 50000), type: sourceDocument.type }
              : undefined,
            stage,
          },
          currentState: {
            course,
            sourceDocument: sourceDocument
              ? { content: sourceDocument.content, name: sourceDocument.name, type: sourceDocument.type }
              : null,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        await typewriterEffect(data.response);
        addMessage({ role: 'assistant', content: data.response, agentRole: 'director' });

        if (data.stateUpdates) {
          if (data.stateUpdates.stage) setStage(data.stateUpdates.stage);
          if (data.stateUpdates.progress) setProgress(data.stateUpdates.progress);
          if (data.stateUpdates.course) setCourse({ ...course, ...data.stateUpdates.course } as typeof course);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({ role: 'assistant', content: 'I encountered an error. Please try again.', agentRole: 'director' });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      setActiveAgent(null);
    }
  };

  const typewriterEffect = async (text: string) => {
    const words = text.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(current);
      await new Promise((r) => setTimeout(r, 12 + Math.random() * 15));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setActiveAgent('director');

    addMessage({ role: 'user', content: userMessage });

    try {
      const allMessages: AgentMessage[] = [
        ...messages,
        { id: 'new', role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: {
            sourceDocument: sourceDocument
              ? { name: sourceDocument.name, content: sourceDocument.content.slice(0, 50000), type: sourceDocument.type }
              : undefined,
            currentCourse: course
              ? { id: course.id, title: course.title, modules: course.modules.map((m) => ({ id: m.id, title: m.title, lessonCount: m.lessons.length })) }
              : undefined,
            stage,
          },
          currentState: {
            course,
            sourceDocument: sourceDocument
              ? { content: sourceDocument.content, name: sourceDocument.name, type: sourceDocument.type }
              : null,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        await typewriterEffect(data.response);
        addMessage({ role: 'assistant', content: data.response, agentRole: 'director' });

        if (data.stateUpdates) {
          if (data.stateUpdates.stage) setStage(data.stateUpdates.stage);
          if (data.stateUpdates.progress) setProgress(data.stateUpdates.progress);
          if (data.stateUpdates.course) setCourse({ ...course, ...data.stateUpdates.course } as typeof course);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({ role: 'assistant', content: 'I encountered an error. Please try again.', agentRole: 'director' });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      setActiveAgent(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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

  const handleExport = (format: 'json' | 'markdown') => {
    if (!course) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(course, null, 2);
      filename = `${course.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      mimeType = 'application/json';
    } else {
      // Generate markdown
      let md = `# ${course.title}\n\n`;
      if (course.description) md += `${course.description}\n\n`;
      md += `---\n\n`;

      course.modules.forEach((module, i) => {
        md += `## Module ${i + 1}: ${module.title}\n\n`;
        if (module.description) md += `${module.description}\n\n`;

        module.lessons.forEach((lesson, j) => {
          md += `### Lesson ${i + 1}.${j + 1}: ${lesson.title}\n\n`;
          if (lesson.content) md += `${lesson.content}\n\n`;
        });

        if (module.quiz) {
          md += `### Quiz\n\n`;
          module.quiz.questions?.forEach((q, k) => {
            md += `**${k + 1}. ${q.question}**\n\n`;
            q.options?.forEach((opt, l) => {
              md += `${l === q.correctAnswer ? '✓' : '○'} ${opt}\n`;
            });
            md += `\n`;
          });
        }
        md += `---\n\n`;
      });

      content = md;
      filename = `${course.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-[--paper-50]">
      {/* Left Sidebar - Agents & Document */}
      <aside className="w-72 border-r border-[--paper-200] bg-white flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-[--paper-200] px-5 flex items-center">
          <Image
            src="/logo.png"
            alt="CourseForge"
            width={130}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </div>

        {/* Document info */}
        {sourceDocument && (
          <div className="p-5 border-b border-[--paper-200]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[--ember-50] border border-[--ember-200] flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-[--ember-600]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[--paper-900] truncate">{sourceDocument.name}</p>
                <p className="text-xs text-[--paper-500]">{Math.round(sourceDocument.content.length / 1000)}k characters</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="p-5 border-b border-[--paper-200]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[--paper-500] uppercase tracking-wide">Progress</span>
            <ProgressRing progress={progress} size={40} />
          </div>
          <div className="h-1.5 bg-[--paper-100] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[--ember-400] to-[--ember-600] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Agent status */}
        <div className="flex-1 overflow-auto p-4">
          <p className="text-xs font-medium text-[--paper-500] uppercase tracking-wide mb-3 px-1">AI Agents</p>
          <div className="space-y-1">
            {(Object.keys(AGENTS) as AgentId[]).map((id) => (
              <AgentStatus key={id} agentId={id} isActive={activeAgent === id} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[--paper-200] space-y-2">
          {course && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full justify-start border-[--paper-200] text-[--paper-700] hover:bg-[--paper-50] hover:border-[--paper-300]"
              >
                <Download className="h-4 w-4 mr-2 text-[--paper-500]" />
                Export Course
              </Button>
              <ExportMenu
                isOpen={showExportMenu}
                onClose={() => setShowExportMenu(false)}
                onExport={handleExport}
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full justify-start text-[--paper-500] hover:text-[--paper-900] hover:bg-[--paper-100]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <Message key={message.id || index} message={message} />
                ))}

                {/* Streaming text */}
                {streamingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${AGENTS[activeAgent || 'director'].color}15` }}
                    >
                      {(() => {
                        const Icon = AGENTS[activeAgent || 'director'].icon;
                        return <Icon className="w-5 h-5" style={{ color: AGENTS[activeAgent || 'director'].color }} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-[--paper-900]">
                          {AGENTS[activeAgent || 'director'].name}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-[--ember-500] animate-pulse" />
                      </div>
                      <div className="message-assistant">
                        <p className="text-[15px] text-[--paper-700] whitespace-pre-wrap leading-relaxed">
                          {streamingText}
                          <span className="typing-cursor" />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-3 bg-[--paper-100] rounded-xl w-fit"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[--ember-500]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[--paper-600]">
                      {activeAgent ? `${AGENTS[activeAgent]?.name} is thinking...` : 'Thinking...'}
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className="border-t border-[--paper-200] bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me to create, modify, or refine your course..."
                  disabled={isLoading || !sourceDocument}
                  className="input-forge min-h-[56px] max-h-32 resize-none pr-12"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 text-xs text-[--paper-400]">
                  ⏎ to send
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !sourceDocument}
                className="btn-forge btn-forge-primary h-14 w-14 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Right Panel - Course Outline */}
      <aside className="w-[400px] border-l border-[--paper-200] bg-white flex flex-col">
        <div className="h-16 border-b border-[--paper-200] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[--paper-500]" />
            <h2 className="font-serif font-medium text-[--paper-900]">Course Outline</h2>
          </div>
          {course && course.modules.length > 0 && (
            <span className="badge-forge badge-forge-neutral">
              {course.modules.length} modules
            </span>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5">
            {!course || course.modules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-[--paper-100] mx-auto mb-5 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-[--paper-400]" />
                </div>
                <h3 className="font-medium text-[--paper-900] mb-2">No course yet</h3>
                <p className="text-sm text-[--paper-500] max-w-xs mx-auto">
                  Start chatting with the agents to create your course structure
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Course header */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="font-serif text-lg font-medium text-[--paper-900] mb-1">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-[--paper-500] line-clamp-2">{course.description}</p>
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
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
