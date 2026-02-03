'use client';

import { useState } from 'react';
import {
  Bot,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  model: string;
  description: string;
  capabilities: string[];
  icon: React.ElementType;
  color: string;
  position: { x: number; y: number };
}

const AGENTS: Agent[] = [
  {
    id: 'director',
    name: 'Director',
    model: 'Gemini 2.5 Pro',
    description: 'The orchestrator that understands user intent and coordinates all agents.',
    capabilities: ['User interaction', 'Task delegation', '20+ tools', 'Agentic loop'],
    icon: Bot,
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    position: { x: 50, y: 50 },
  },
  {
    id: 'curriculum',
    name: 'Curriculum Architect',
    model: 'Gemini 2.5 Pro',
    description: 'Analyzes documents and designs pedagogically-sound course structures.',
    capabilities: ['Document analysis', 'Module design', 'Learning objectives', "Bloom's taxonomy"],
    icon: Brain,
    color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    position: { x: 15, y: 25 },
  },
  {
    id: 'content',
    name: 'Content Alchemist',
    model: 'Gemini 2.5 Flash',
    description: 'Transforms raw material into engaging, educational lesson content.',
    capabilities: ['Lesson writing', 'Key takeaways', 'Examples', 'Explanations'],
    icon: PenTool,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    position: { x: 85, y: 25 },
  },
  {
    id: 'assessment',
    name: 'Assessment Wizard',
    model: 'Gemini 2.5 Flash',
    description: 'Creates quizzes and assessments aligned with learning objectives.',
    capabilities: ['Quiz generation', 'MCQ creation', 'Difficulty tuning', 'Explanations'],
    icon: ClipboardCheck,
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    position: { x: 15, y: 75 },
  },
  {
    id: 'engagement',
    name: 'Engagement Engineer',
    model: 'Gemini 2.5 Flash',
    description: 'Designs interactive elements that boost learner engagement.',
    capabilities: ['Exercises', 'Reflection prompts', 'Case studies', 'Activities'],
    icon: Lightbulb,
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    position: { x: 85, y: 75 },
  },
  {
    id: 'script',
    name: 'Script Writer',
    model: 'Gemini 2.5 Flash',
    description: 'Creates professional video scripts with visual suggestions.',
    capabilities: ['Video scripts', 'B-roll ideas', 'Timing', 'Visual notes'],
    icon: Video,
    color: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    position: { x: 50, y: 90 },
  },
];

interface ArchitectureDiagramProps {
  activeAgents?: string[];
}

export function ArchitectureDiagram({ activeAgents = [] }: ArchitectureDiagramProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          View Architecture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Multi-Agent Architecture
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {AGENTS.filter((a) => a.id !== 'director').map((agent) => {
              const director = AGENTS[0];
              const isActive =
                activeAgents.includes(agent.id) || activeAgents.includes('director');
              return (
                <line
                  key={agent.id}
                  x1={`${director.position.x}%`}
                  y1={`${director.position.y}%`}
                  x2={`${agent.position.x}%`}
                  y2={`${agent.position.y}%`}
                  stroke={isActive ? 'url(#activeGradient)' : '#94a3b8'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? 'none' : '4 4'}
                  className={isActive ? 'animate-pulse' : 'opacity-30'}
                />
              );
            })}
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Agents */}
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeAgents.includes(agent.id);
            const isDirector = agent.id === 'director';

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  flex flex-col items-center gap-1 p-2 rounded-xl
                  transition-all duration-300 hover:scale-110 cursor-pointer
                  ${isActive ? 'scale-105' : ''}
                `}
                style={{
                  left: `${agent.position.x}%`,
                  top: `${agent.position.y}%`,
                }}
              >
                <div
                  className={`
                    relative p-3 rounded-xl ${agent.color} shadow-lg
                    ${isDirector ? 'p-4' : ''}
                    ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-background animate-pulse' : ''}
                  `}
                >
                  <Icon className={`${isDirector ? 'h-8 w-8' : 'h-5 w-5'} text-white`} />
                  {isActive && (
                    <Loader2 className="absolute -bottom-1 -right-1 h-4 w-4 text-white animate-spin" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-center max-w-[80px] leading-tight">
                  {agent.name}
                </span>
                <Badge variant="outline" className="text-[8px] px-1 py-0">
                  {agent.model.replace('Gemini ', '')}
                </Badge>
              </button>
            );
          })}

          {/* Flow Arrow Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground">
            <span>User</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-primary font-medium">Director</span>
            <ArrowRight className="h-3 w-3" />
            <span>Specialists</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-green-500 font-medium">Course</span>
          </div>
        </div>

        {/* Agent Details */}
        {selectedAgent && (
          <div className="mt-4 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${selectedAgent.color}`}>
                <selectedAgent.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{selectedAgent.name}</h4>
                <p className="text-xs text-muted-foreground">Powered by {selectedAgent.model}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{selectedAgent.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
