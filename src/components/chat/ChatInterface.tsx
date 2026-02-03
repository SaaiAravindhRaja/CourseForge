'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCourseStore } from '@/store/courseStore';
import { VoiceInput } from './VoiceInput';
import { ToolCallVisualizer } from './ToolCallVisualizer';
import { WelcomeHero } from '@/components/welcome/WelcomeHero';
import type { AgentMessage } from '@/types';

interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'complete' | 'error';
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ChatInterfaceProps {
  onAgentActivity?: (agents: string[], task: string) => void;
}

export function ChatInterface({ onAgentActivity }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCall[]>([]);
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

  // Send initial greeting when document is uploaded
  useEffect(() => {
    if (sourceDocument && messages.length === 0) {
      sendInitialGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceDocument]);

  const simulateAgentActivity = (task: string) => {
    // Simulate different agents becoming active based on the task
    const agentMap: Record<string, string[]> = {
      analyzing: ['director', 'curriculum'],
      outline: ['director', 'curriculum'],
      content: ['director', 'content'],
      quiz: ['director', 'assessment'],
      activity: ['director', 'engagement'],
      script: ['director', 'script'],
    };

    const keyword = Object.keys(agentMap).find((k) =>
      task.toLowerCase().includes(k)
    );
    const agents = keyword ? agentMap[keyword] : ['director'];
    onAgentActivity?.(agents, task);
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
              content: `I just uploaded a document called "${sourceDocument?.name}". Please greet me warmly and help me create a course from it. Ask me what type of course I want to create.`,
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
        // Simulate streaming effect
        await typewriterEffect(data.response);

        addMessage({
          role: 'assistant',
          content: data.response,
          agentRole: 'director',
        });

        // Apply state updates
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
        content: 'I apologize, but I encountered an error. Please try again.',
        agentRole: 'director',
      });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      onAgentActivity?.([], '');
    }
  };

  const typewriterEffect = async (text: string) => {
    const words = text.split(' ');
    let current = '';

    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(current);
      // Variable delay for more natural feel
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setCurrentToolCalls([]);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Determine what kind of task this might be
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

      // Simulate tool calls being shown
      setCurrentToolCalls([
        { id: '1', name: 'Processing request', status: 'running' },
      ]);

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

      // Update tool calls to complete
      setCurrentToolCalls((prev) =>
        prev.map((tc) => ({ ...tc, status: 'complete' as const }))
      );

      if (data.success) {
        // Simulate streaming effect
        await typewriterEffect(data.response);

        addMessage({
          role: 'assistant',
          content: data.response,
          agentRole: 'director',
        });

        // Apply state updates
        if (data.stateUpdates) {
          if (data.stateUpdates.stage) setStage(data.stateUpdates.stage);
          if (data.stateUpdates.progress) setProgress(data.stateUpdates.progress);
          if (data.stateUpdates.course) {
            setCourse({ ...course, ...data.stateUpdates.course } as typeof course);
          }
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setCurrentToolCalls((prev) =>
        prev.map((tc) => ({ ...tc, status: 'error' as const }))
      );
      addMessage({
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again.',
        agentRole: 'director',
      });
    } finally {
      setIsLoading(false);
      setStreamingText('');
      onAgentActivity?.([], '');
      setTimeout(() => setCurrentToolCalls([]), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.length === 0 && !sourceDocument && (
            <WelcomeHero onDemoClick={() => {
              // Trigger demo via header button click
              const demoButton = document.querySelector('[data-demo-trigger]') as HTMLButtonElement;
              demoButton?.click();
            }} />
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Streaming text */}
          {streamingText && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-muted">
                <div className="text-sm whitespace-pre-wrap">{streamingText}</div>
                <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* Tool calls */}
          {currentToolCalls.length > 0 && (
            <ToolCallVisualizer toolCalls={currentToolCalls} />
          )}

          {isLoading && !streamingText && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span>Director is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isLoading || !sourceDocument}
          />
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              sourceDocument
                ? 'Ask me to create your course, adjust modules, or refine content...'
                : 'Upload a document to get started...'
            }
            disabled={isLoading || !sourceDocument}
            className="min-h-[44px] max-h-32 resize-none bg-background/50"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || !sourceDocument}
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs">
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm
          ${
            isUser
              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
              : 'bg-muted'
          }
        `}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        {message.agentRole && !isUser && (
          <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <Sparkles className="h-3 w-3" />
            <span className="capitalize">{message.agentRole.replace('-', ' ')}</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
