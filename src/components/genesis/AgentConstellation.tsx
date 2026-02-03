'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  description: string;
  model: string;
}

const AGENTS: Agent[] = [
  {
    id: 'director',
    name: 'Director',
    role: 'Orchestrator',
    icon: Bot,
    color: '#7c3aed',
    glowColor: 'rgba(124, 58, 237, 0.6)',
    description: 'Coordinates all agents and manages the workflow',
    model: 'Gemini 2.5 Pro',
  },
  {
    id: 'curriculum',
    name: 'Architect',
    role: 'Structure',
    icon: Brain,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    description: 'Designs pedagogically-sound course structures',
    model: 'Gemini 2.5 Pro',
  },
  {
    id: 'content',
    name: 'Alchemist',
    role: 'Content',
    icon: PenTool,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    description: 'Transforms knowledge into engaging lessons',
    model: 'Gemini 2.5 Flash',
  },
  {
    id: 'assessment',
    name: 'Wizard',
    role: 'Assessment',
    icon: ClipboardCheck,
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    description: 'Creates quizzes aligned with objectives',
    model: 'Gemini 2.5 Flash',
  },
  {
    id: 'engagement',
    name: 'Engineer',
    role: 'Engagement',
    icon: Lightbulb,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    description: 'Designs interactive learning experiences',
    model: 'Gemini 2.5 Flash',
  },
  {
    id: 'script',
    name: 'Writer',
    role: 'Video',
    icon: Video,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Produces professional video scripts',
    model: 'Gemini 2.5 Flash',
  },
];

interface AgentConstellationProps {
  activeAgents?: string[];
  currentTask?: string;
  className?: string;
  compact?: boolean;
}

export function AgentConstellation({
  activeAgents = [],
  currentTask = '',
  className = '',
  compact = false,
}: AgentConstellationProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());

  // Track when agents complete
  useEffect(() => {
    const newCompleted = new Set(completedAgents);
    AGENTS.forEach((agent) => {
      if (!activeAgents.includes(agent.id) && completedAgents.has(agent.id)) {
        // Agent was active but is no longer - mark complete briefly
        setTimeout(() => {
          setCompletedAgents((prev) => {
            const next = new Set(prev);
            next.delete(agent.id);
            return next;
          });
        }, 2000);
      } else if (activeAgents.includes(agent.id)) {
        newCompleted.add(agent.id);
      }
    });
    setCompletedAgents(newCompleted);
  }, [activeAgents]);

  const director = AGENTS[0];
  const specialists = AGENTS.slice(1);

  // Calculate positions for specialists around director
  const positions = useMemo(() => {
    const radius = compact ? 70 : 100;
    return specialists.map((_, index) => {
      const angle = ((index * 72) - 90) * (Math.PI / 180);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, [compact]);

  const orbSize = compact ? 'w-10 h-10' : 'w-14 h-14';
  const iconSize = compact ? 'h-4 w-4' : 'h-6 w-6';
  const directorOrbSize = compact ? 'w-14 h-14' : 'w-20 h-20';
  const directorIconSize = compact ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <div className={`relative ${className}`}>
      {/* Container for the constellation */}
      <div
        className="relative"
        style={{
          width: compact ? '200px' : '280px',
          height: compact ? '200px' : '280px',
        }}
      >
        {/* Energy lines from director to specialists */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            {AGENTS.map((agent) => (
              <linearGradient
                key={`gradient-${agent.id}`}
                id={`line-gradient-${agent.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={director.color} />
                <stop offset="100%" stopColor={agent.color} />
              </linearGradient>
            ))}
          </defs>

          {specialists.map((agent, index) => {
            const isActive = activeAgents.includes(agent.id) || activeAgents.includes('director');
            const centerX = compact ? 100 : 140;
            const centerY = compact ? 100 : 140;

            return (
              <g key={agent.id}>
                {/* Base line */}
                <motion.line
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + positions[index].x}
                  y2={centerY + positions[index].y}
                  stroke={`url(#line-gradient-${agent.id})`}
                  strokeWidth={isActive ? 2 : 1}
                  strokeOpacity={isActive ? 0.6 : 0.2}
                  strokeDasharray={isActive ? '0' : '4 4'}
                />

                {/* Animated energy pulse when active */}
                {isActive && (
                  <motion.circle
                    r="3"
                    fill={agent.color}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      cx: [centerX, centerX + positions[index].x],
                      cy: [centerY, centerY + positions[index].y],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Director Orb (Center) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onMouseEnter={() => setHoveredAgent(director.id)}
          onMouseLeave={() => setHoveredAgent(null)}
        >
          <motion.div
            className={`relative ${directorOrbSize} rounded-full flex items-center justify-center cursor-pointer`}
            style={{
              background: `linear-gradient(135deg, ${director.color}, ${director.color}80)`,
              boxShadow: activeAgents.includes(director.id)
                ? `0 0 30px ${director.glowColor}, 0 0 60px ${director.glowColor}`
                : `0 0 20px ${director.glowColor}`,
            }}
            animate={
              activeAgents.includes(director.id)
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 30px ${director.glowColor}, 0 0 60px ${director.glowColor}`,
                      `0 0 40px ${director.glowColor}, 0 0 80px ${director.glowColor}`,
                      `0 0 30px ${director.glowColor}, 0 0 60px ${director.glowColor}`,
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            whileHover={{ scale: 1.1 }}
          >
            {activeAgents.includes(director.id) ? (
              <Loader2 className={`${directorIconSize} text-white animate-spin`} />
            ) : (
              <director.icon className={`${directorIconSize} text-white`} />
            )}

            {/* Pulsing ring */}
            {activeAgents.includes(director.id) && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: director.color }}
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Specialist Orbs */}
        {specialists.map((agent, index) => {
          const isActive = activeAgents.includes(agent.id);
          const isComplete = completedAgents.has(agent.id) && !isActive;
          const pos = positions[index];

          return (
            <motion.div
              key={agent.id}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              <motion.div
                className={`relative ${orbSize} rounded-full flex items-center justify-center cursor-pointer transition-all`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${agent.color}, ${agent.color}80)`
                    : `linear-gradient(135deg, ${agent.color}40, ${agent.color}20)`,
                  boxShadow: isActive
                    ? `0 0 20px ${agent.glowColor}, 0 0 40px ${agent.glowColor}`
                    : hoveredAgent === agent.id
                    ? `0 0 15px ${agent.glowColor}`
                    : `0 0 10px ${agent.color}30`,
                }}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: isActive ? 1 : 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                whileHover={{ scale: 1.15 }}
              >
                {isActive ? (
                  <Loader2
                    className={`${iconSize} animate-spin`}
                    style={{ color: 'white' }}
                  />
                ) : isComplete ? (
                  <Check className={iconSize} style={{ color: agent.color }} />
                ) : (
                  <agent.icon
                    className={iconSize}
                    style={{ color: isActive ? 'white' : agent.color }}
                  />
                )}

                {/* Active ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: agent.color }}
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Agent tooltip */}
              <AnimatePresence>
                {hoveredAgent === agent.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-xl glass-strong whitespace-nowrap z-50"
                    style={{
                      top: '100%',
                      minWidth: '120px',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <agent.icon className="h-3 w-3" style={{ color: agent.color }} />
                      <p className="text-xs font-semibold" style={{ color: agent.color }}>
                        {agent.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-stardust">{agent.description}</p>
                    <p className="text-[9px] text-stardust/60 mt-1">{agent.model}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Current Task Display */}
      <AnimatePresence>
        {currentTask && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle">
              <Sparkles className="h-3 w-3 text-nebula animate-pulse" style={{ color: '#7c3aed' }} />
              <span className="text-xs text-stardust">{currentTask}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
