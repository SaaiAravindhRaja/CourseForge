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
  Mic,
  MicOff,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCourseStore } from '@/store/courseStore';
import type { AgentMessage, Module, Lesson } from '@/types';
import Image from 'next/image';

// Agent configuration with colors
const AGENTS: Record<string, { name: string; color: string }> = {
  director: { name: 'Director', color: '#EA580C' },
  curriculum: { name: 'Architect', color: '#2563EB' },
  content: { name: 'Writer', color: '#16A34A' },
  assessment: { name: 'Assessor', color: '#CA8A04' },
  engagement: { name: 'Engager', color: '#9333EA' },
  script: { name: 'Producer', color: '#DC2626' },
};

interface WorkspaceProps {
  onReset: () => void;
}

export function Workspace({ onReset }: WorkspaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);

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

  // Initial greeting
  useEffect(() => {
    if (sourceDocument && messages.length === 0) {
      sendInitialGreeting();
    }
  }, [sourceDocument]);

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
      await new Promise((r) => setTimeout(r, 15 + Math.random() * 20));
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

  const handleExport = () => {
    if (!course) return;
    const content = JSON.stringify(course, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-[#FAFAF9]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 bg-white flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-stone-200 px-5 flex items-center">
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
          <div className="p-4 border-b border-stone-200">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Document</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-stone-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{sourceDocument.name}</p>
                <p className="text-xs text-stone-500">{Math.round(sourceDocument.content.length / 1000)}k chars</p>
              </div>
            </div>
          </div>
        )}

        {/* Agent status */}
        <div className="p-4 flex-1">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Agents</p>
          <div className="space-y-2">
            {Object.entries(AGENTS).map(([id, agent]) => (
              <div key={id} className="flex items-center gap-3 py-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${activeAgent === id ? 'agent-dot-active' : ''}`}
                  style={{ backgroundColor: agent.color }}
                />
                <span className={`text-sm ${activeAgent === id ? 'text-stone-900 font-medium' : 'text-stone-500'}`}>
                  {agent.name}
                </span>
                {activeAgent === id && (
                  <span className="text-xs text-orange-600 ml-auto">working</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-stone-200 space-y-2">
          {course && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full justify-start border-stone-200 text-stone-600 hover:text-stone-900"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Course
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full justify-start text-stone-500 hover:text-stone-900"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <Message key={message.id || index} message={message} />
                ))}

                {/* Streaming text */}
                {streamingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-orange-700">AI</span>
                    </div>
                    <div className="flex-1 message-assistant">
                      <p className="text-sm text-stone-700 whitespace-pre-wrap">
                        {streamingText}
                        <span className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5 animate-pulse" />
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-stone-500"
                  >
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-sm">
                      {activeAgent ? `${AGENTS[activeAgent]?.name || 'Agent'} is thinking...` : 'Thinking...'}
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-stone-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to create, modify, or refine your course..."
                disabled={isLoading || !sourceDocument}
                className="flex-1 min-h-[48px] max-h-32 resize-none border-stone-200 focus:border-orange-500 focus:ring-orange-500/20"
                rows={1}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !sourceDocument}
                className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-4"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Course outline panel */}
      <aside className="w-96 border-l border-stone-200 bg-white flex flex-col">
        <div className="h-16 border-b border-stone-200 px-5 flex items-center justify-between">
          <h2 className="font-serif font-medium text-stone-900">Course Outline</h2>
          {course && course.modules.length > 0 && (
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
              {course.modules.length} modules
            </span>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {!course || course.modules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-lg bg-stone-100 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-stone-400" />
                </div>
                <p className="text-sm text-stone-500">Course outline will appear here</p>
                <p className="text-xs text-stone-400 mt-1">Start by chatting with the agents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Course title */}
                <div className="mb-6">
                  <h3 className="font-serif font-medium text-stone-900">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{course.description}</p>
                  )}
                </div>

                {/* Modules */}
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
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

// Message component
function Message({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="message-user max-w-[80%]">
          <p className="text-sm">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  const agent = message.agentRole ? AGENTS[message.agentRole] : AGENTS.director;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${agent.color}15` }}
      >
        <span className="text-xs font-medium" style={{ color: agent.color }}>
          {agent.name.charAt(0)}
        </span>
      </div>
      <div className="flex-1">
        <div className="message-assistant">
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-stone-400 mt-1.5">{agent.name}</p>
      </div>
    </motion.div>
  );
}

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

  return (
    <div className="module-card">
      <button
        onClick={onToggle}
        className="w-full module-card-header flex items-start gap-3 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-600 flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-stone-900 truncate">{module.title}</p>
            {hasContent && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            {module.quiz && ' · Quiz'}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-stone-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-stone-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="module-card-content space-y-1">
              {module.lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-item">
                  {lesson.content ? (
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-stone-300 flex-shrink-0" />
                  )}
                  <span className="text-sm text-stone-600 truncate">{lesson.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
