'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AgentConstellation } from './AgentConstellation';
import { ParticleField } from './ParticleField';
import { VoiceButton } from './VoiceAlchemy';
import { ExportPanel } from './ExportPanel';
import { useCourseStore } from '@/store/courseStore';
import type { AgentMessage, Module, Lesson } from '@/types';

interface ForgeWorkspaceProps {
  onBack?: () => void;
}

export function ForgeWorkspace({ onBack }: ForgeWorkspaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<{ module: Module; lesson: Lesson } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    addMessage,
    sourceDocument,
    course,
    stage,
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

  // Auto-send initial greeting when document is uploaded
  useEffect(() => {
    if (sourceDocument && messages.length === 0) {
      sendInitialGreeting();
    }
  }, [sourceDocument]);

  const simulateAgentActivity = (task: string) => {
    const agentMap: Record<string, string[]> = {
      analyzing: ['director', 'curriculum'],
      outline: ['director', 'curriculum'],
      content: ['director', 'content'],
      quiz: ['director', 'assessment'],
      activity: ['director', 'engagement'],
      script: ['director', 'script'],
      default: ['director'],
    };

    const keyword = Object.keys(agentMap).find((k) =>
      task.toLowerCase().includes(k)
    );
    setActiveAgents(keyword ? agentMap[keyword] : agentMap.default);
    setCurrentTask(task);
  };

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    simulateAgentActivity('Analyzing document');

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
              ? {
                  name: sourceDocument.name,
                  content: sourceDocument.content.slice(0, 50000),
                  type: sourceDocument.type,
                }
              : undefined,
            stage,
          },
          currentState: {
            course,
            sourceDocument: sourceDocument
              ? {
                  content: sourceDocument.content,
                  name: sourceDocument.name,
                  type: sourceDocument.type,
                }
              : null,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        await typewriterEffect(data.response);
        addMessage({
          role: 'assistant',
          content: data.response,
          agentRole: 'director',
        });

        if (data.stateUpdates) {
          if (data.stateUpdates.stage) setStage(data.stateUpdates.stage);
          if (data.stateUpdates.progress) setProgress(data.stateUpdates.progress);
          if (data.stateUpdates.course) {
            setCourse({ ...course, ...data.stateUpdates.course } as typeof course);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: 'I encountered an error while analyzing your document. Please try again.',
        agentRole: 'director',
      });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      setActiveAgents([]);
      setCurrentTask('');
    }
  };

  const typewriterEffect = async (text: string) => {
    const words = text.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(current);
      await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    addMessage({ role: 'user', content: userMessage });
    simulateAgentActivity(userMessage);

    try {
      const allMessages: AgentMessage[] = [
        ...messages,
        {
          id: 'new',
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: {
            sourceDocument: sourceDocument
              ? {
                  name: sourceDocument.name,
                  content: sourceDocument.content.slice(0, 50000),
                  type: sourceDocument.type,
                }
              : undefined,
            currentCourse: course
              ? {
                  id: course.id,
                  title: course.title,
                  modules: course.modules.map((m) => ({
                    id: m.id,
                    title: m.title,
                    lessonCount: m.lessons.length,
                  })),
                }
              : undefined,
            stage,
          },
          currentState: {
            course,
            sourceDocument: sourceDocument
              ? {
                  content: sourceDocument.content,
                  name: sourceDocument.name,
                  type: sourceDocument.type,
                }
              : null,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        await typewriterEffect(data.response);
        addMessage({
          role: 'assistant',
          content: data.response,
          agentRole: 'director',
        });

        if (data.stateUpdates) {
          if (data.stateUpdates.stage) setStage(data.stateUpdates.stage);
          if (data.stateUpdates.progress) setProgress(data.stateUpdates.progress);
          if (data.stateUpdates.course) {
            setCourse({ ...course, ...data.stateUpdates.course } as typeof course);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        agentRole: 'director',
      });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      setActiveAgents([]);
      setCurrentTask('');
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

  return (
    <div className="h-screen flex bg-[#030014] overflow-hidden">
      {/* Particle Background */}
      <ParticleField intensity="low" />

      {/* Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-gradient-radial from-cyan-500/8 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 glass-subtle flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-nebula glow-nebula">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gradient-nebula">GENESIS</h1>
                <p className="text-[10px] text-stardust">The Forge</p>
              </div>
            </div>
          </div>

          {/* Right Header Section */}
          <div className="flex items-center gap-3">
            {/* Document Badge */}
            {sourceDocument && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl glass-subtle"
              >
                <FileText className="h-4 w-4 text-energy" style={{ color: '#06b6d4' }} />
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">
                    {sourceDocument.name}
                  </p>
                  <p className="text-[10px] text-stardust">
                    {Math.round(sourceDocument.content.length / 1000)}k characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Export Button */}
            {course && <ExportPanel />}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-6 space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble key={message.id || index} message={message} />
                ))}

                {/* Streaming text */}
                {streamingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl gradient-nebula flex items-center justify-center glow-nebula">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 glass-card rounded-2xl px-5 py-4">
                      <div className="text-sm text-white/90 whitespace-pre-wrap">
                        {streamingText}
                        <span className="inline-block w-0.5 h-4 bg-nebula ml-1 animate-blink" style={{ backgroundColor: '#7c3aed' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-stardust"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#7c3aed' }}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <span className="text-sm">Director is thinking...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                {/* Voice Button */}
                <VoiceButton
                  onTranscript={(text) => setInput((prev) => prev ? `${prev} ${text}` : text)}
                  disabled={isLoading || !sourceDocument}
                />

                {/* Text Input */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={sourceDocument ? 'Ask me to create, modify, or enhance your course...' : 'Upload a document to begin...'}
                    disabled={isLoading || !sourceDocument}
                    className="min-h-[52px] max-h-40 resize-none rounded-xl bg-white/5 border-white/10 text-white placeholder:text-stardust/50 focus:border-nebula/50 focus:ring-nebula/20"
                    rows={1}
                  />
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim() || !sourceDocument}
                  className="shrink-0 h-[52px] w-[52px] rounded-xl gradient-nebula glow-nebula hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Agent Constellation Panel */}
          <div className="w-80 border-l border-white/5 glass-subtle flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: '#7c3aed' }} />
                AI Production Team
              </h3>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <AgentConstellation
                activeAgents={activeAgents}
                currentTask={currentTask}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Course Outline */}
      <div className="w-96 border-l border-white/5 glass flex flex-col relative z-10">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Course Outline</h2>
            {course && course.modules.length > 0 && (
              <Badge variant="secondary" className="bg-nebula/20 text-nebula-bright border-nebula/30" style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', color: '#a855f7', borderColor: 'rgba(124, 58, 237, 0.3)' }}>
                {course.modules.length} modules
              </Badge>
            )}
          </div>
          {course?.title && (
            <p className="text-sm text-gradient-cosmic mt-2 font-medium">{course.title}</p>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {!course || course.modules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full glass-card mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-stardust" />
                </div>
                <p className="text-sm text-stardust">
                  Your course outline will appear here
                </p>
                <p className="text-xs text-stardust/60 mt-1">
                  Start by chatting with the Director
                </p>
              </div>
            ) : (
              course.modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  isExpanded={expandedModules.has(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  onSelectLesson={(lesson) => setSelectedLesson({ module, lesson })}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-slate-600 to-slate-800'
            : 'gradient-nebula glow-nebula'
        }`}
      >
        {isUser ? (
          <MessageSquare className="h-5 w-5 text-white" />
        ) : (
          <Sparkles className="h-5 w-5 text-white" />
        )}
      </div>
      <div
        className={`flex-1 ${isUser ? 'text-right' : ''}`}
        style={{ maxWidth: '75%' }}
      >
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser
              ? 'gradient-nebula text-white'
              : 'glass-card text-white/90'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && message.agentRole && (
          <p className="text-[10px] text-stardust mt-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" style={{ color: '#7c3aed' }} />
            {message.agentRole.charAt(0).toUpperCase() + message.agentRole.slice(1)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface ModuleCardProps {
  module: Module;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

function ModuleCard({ module, index, isExpanded, onToggle, onSelectLesson }: ModuleCardProps) {
  const hasContent = module.lessons.some((l) => l.content);
  const colors = ['#7c3aed', '#06b6d4', '#f97316', '#ec4899', '#10b981'];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl glass-card overflow-hidden card-hover"
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: `${color}40`, color }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-white truncate">{module.title}</h4>
            {hasContent && (
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#10b981' }} />
            )}
          </div>
          <p className="text-xs text-stardust mt-0.5">
            {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            {module.quiz && ' • Quiz'}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          className="shrink-0 text-stardust"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {module.lessons.map((lesson, lIndex) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  {lesson.content ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#10b981' }} />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-stardust/50 shrink-0" />
                  )}
                  <span className="text-xs text-stardust group-hover:text-white transition-colors truncate">
                    {lesson.title}
                  </span>
                  <Eye className="h-3 w-3 text-stardust/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
