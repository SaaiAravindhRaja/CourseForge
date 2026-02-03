'use client';

import { useEffect, useState } from 'react';
import { Bot, Brain, Sparkles, PenTool, ClipboardCheck, Lightbulb, Video, Palette, Loader2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'working' | 'complete';
  task?: string;
}

const AGENTS: AgentStatus[] = [
  { id: 'director', name: 'Director', role: 'Orchestrator', status: 'idle' },
  { id: 'curriculum', name: 'Curriculum Architect', role: 'Structure', status: 'idle' },
  { id: 'content', name: 'Content Alchemist', role: 'Writing', status: 'idle' },
  { id: 'assessment', name: 'Assessment Wizard', role: 'Quizzes', status: 'idle' },
  { id: 'engagement', name: 'Engagement Engineer', role: 'Activities', status: 'idle' },
  { id: 'script', name: 'Script Writer', role: 'Video', status: 'idle' },
];

const AGENT_ICONS: Record<string, React.ElementType> = {
  director: Bot,
  curriculum: Brain,
  content: PenTool,
  assessment: ClipboardCheck,
  engagement: Lightbulb,
  script: Video,
  visual: Palette,
};

const AGENT_COLORS: Record<string, string> = {
  director: 'from-blue-500 to-indigo-600',
  curriculum: 'from-purple-500 to-pink-600',
  content: 'from-green-500 to-emerald-600',
  assessment: 'from-amber-500 to-orange-600',
  engagement: 'from-pink-500 to-rose-600',
  script: 'from-cyan-500 to-teal-600',
  visual: 'from-violet-500 to-purple-600',
};

interface AgentPanelProps {
  activeAgents: string[];
  currentTask?: string;
}

export function AgentPanel({ activeAgents, currentTask }: AgentPanelProps) {
  const [agents, setAgents] = useState<AgentStatus[]>(AGENTS);

  useEffect(() => {
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        status: activeAgents.includes(agent.id)
          ? 'working'
          : agent.status === 'working'
          ? 'complete'
          : 'idle',
        task: activeAgents.includes(agent.id) ? currentTask : undefined,
      }))
    );
  }, [activeAgents, currentTask]);

  const workingAgents = agents.filter((a) => a.status === 'working');
  const hasActivity = workingAgents.length > 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/30 border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Sparkles className="h-5 w-5 text-primary" />
          {hasActivity && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <h3 className="font-semibold text-sm">AI Production Team</h3>
        {hasActivity && (
          <Badge variant="secondary" className="ml-auto text-xs animate-pulse">
            Working...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => {
          const Icon = AGENT_ICONS[agent.id] || Bot;
          const isActive = agent.status === 'working';
          const isComplete = agent.status === 'complete';
          const gradient = AGENT_COLORS[agent.id] || 'from-gray-500 to-gray-600';

          return (
            <div
              key={agent.id}
              className={`
                relative flex items-center gap-2 p-2 rounded-lg transition-all duration-300
                ${isActive ? 'bg-primary/10 ring-1 ring-primary/30 scale-[1.02]' : 'bg-muted/30'}
                ${isComplete ? 'bg-green-500/10' : ''}
              `}
            >
              <div
                className={`
                  relative p-1.5 rounded-md bg-gradient-to-br ${gradient}
                  ${isActive ? 'animate-pulse shadow-lg' : 'opacity-60'}
                `}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
                {isActive && (
                  <Loader2 className="absolute -bottom-1 -right-1 h-3 w-3 text-primary animate-spin" />
                )}
                {isComplete && (
                  <Check className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                  {agent.name}
                </p>
                {isActive && agent.task && (
                  <p className="text-[10px] text-muted-foreground truncate animate-pulse">
                    {agent.task}
                  </p>
                )}
                {!isActive && (
                  <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentTask && hasActivity && (
        <div className="mt-3 pt-3 border-t border-primary/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="truncate">{currentTask}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
