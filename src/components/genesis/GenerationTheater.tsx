'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Check, Loader2, Brain, PenTool, ClipboardCheck, Lightbulb, Video } from 'lucide-react';

interface GenerationStep {
  id: string;
  agent: string;
  agentIcon: React.ElementType;
  agentColor: string;
  action: string;
  status: 'pending' | 'running' | 'complete';
  duration?: number;
}

interface GenerationTheaterProps {
  isGenerating: boolean;
  currentAgent?: string;
  steps?: GenerationStep[];
  onComplete?: () => void;
}

const AGENT_CONFIG: Record<string, { icon: React.ElementType; color: string; name: string }> = {
  director: { icon: Sparkles, color: '#7c3aed', name: 'Director' },
  curriculum: { icon: Brain, color: '#a855f7', name: 'Architect' },
  content: { icon: PenTool, color: '#06b6d4', name: 'Alchemist' },
  assessment: { icon: ClipboardCheck, color: '#f97316', name: 'Wizard' },
  engagement: { icon: Lightbulb, color: '#ec4899', name: 'Engineer' },
  script: { icon: Video, color: '#10b981', name: 'Writer' },
};

export function GenerationTheater({
  isGenerating,
  currentAgent = 'director',
  steps = [],
  onComplete,
}: GenerationTheaterProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate particles when generating
  useEffect(() => {
    if (!isGenerating || !containerRef.current) return;

    const interval = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const config = AGENT_CONFIG[currentAgent] || AGENT_CONFIG.director;
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * rect.width,
        y: rect.height,
        color: config.color,
      };

      setParticles((prev) => [...prev.slice(-20), newParticle]);
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, currentAgent]);

  // Clean up particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles((prev) => prev.slice(-15));
    }, 2000);
    return () => clearInterval(cleanup);
  }, []);

  const config = AGENT_CONFIG[currentAgent] || AGENT_CONFIG.director;
  const AgentIcon = config.icon;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: particle.x, y: particle.y, scale: 0, opacity: 1 }}
              animate={{ y: -100, scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main visualization */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass-card rounded-xl p-6"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-30"
              style={{
                background: `radial-gradient(circle at center, ${config.color}40, transparent 70%)`,
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="relative flex items-center gap-4">
              {/* Agent orb */}
              <motion.div
                className="relative shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${config.color}, ${config.color}80)`,
                    boxShadow: `0 0 30px ${config.color}60, 0 0 60px ${config.color}30`,
                  }}
                >
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                </div>

                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: config.color }}
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>

              {/* Status text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AgentIcon className="h-4 w-4" style={{ color: config.color }} />
                  <span className="text-sm font-semibold" style={{ color: config.color }}>
                    {config.name}
                  </span>
                  <motion.span
                    className="text-xs text-stardust"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    is working...
                  </motion.span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: config.color }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Neural pulse indicator */}
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: config.color }}
                    animate={{
                      height: ['8px', '24px', '8px'],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Steps list */}
            {steps.length > 0 && (
              <div className="mt-4 space-y-2">
                {steps.map((step, index) => {
                  const stepConfig = AGENT_CONFIG[step.agent] || AGENT_CONFIG.director;
                  const StepIcon = stepConfig.icon;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      {step.status === 'complete' ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${stepConfig.color}30` }}
                        >
                          <Check className="h-3.5 w-3.5" style={{ color: stepConfig.color }} />
                        </div>
                      ) : step.status === 'running' ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${stepConfig.color}30` }}
                        >
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            style={{ color: stepConfig.color }}
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <StepIcon className="h-3.5 w-3.5 text-stardust" />
                        </div>
                      )}

                      <span
                        className={
                          step.status === 'complete'
                            ? 'text-white'
                            : step.status === 'running'
                            ? 'text-white'
                            : 'text-stardust'
                        }
                      >
                        {step.action}
                      </span>

                      {step.duration && step.status === 'complete' && (
                        <span className="text-xs text-stardust ml-auto">{step.duration}ms</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Streaming text component with glow effect
interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  color?: string;
}

export function StreamingText({ text, isStreaming, color = '#7c3aed' }: StreamingTextProps) {
  return (
    <div className="relative">
      <p className="text-sm text-white/90 whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <motion.span
            className="inline-block w-0.5 h-4 ml-0.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </p>

      {/* Glow on new text */}
      {isStreaming && (
        <motion.div
          className="absolute bottom-0 right-0 w-32 h-8 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}20)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Tool call visualization
interface ToolCallProps {
  name: string;
  status: 'running' | 'complete' | 'error';
  agent?: string;
  duration?: number;
}

export function ToolCallBadge({ name, status, agent = 'director', duration }: ToolCallProps) {
  const config = AGENT_CONFIG[agent] || AGENT_CONFIG.director;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
        ${status === 'running' ? 'glass-card' : ''}
        ${status === 'complete' ? 'bg-aurora/10 border border-aurora/20' : ''}
        ${status === 'error' ? 'bg-red-500/10 border border-red-500/20' : ''}
      `}
      style={{
        borderColor: status === 'running' ? `${config.color}30` : undefined,
      }}
    >
      {status === 'running' ? (
        <Loader2 className="h-3 w-3 animate-spin" style={{ color: config.color }} />
      ) : status === 'complete' ? (
        <Check className="h-3 w-3" style={{ color: '#10b981' }} />
      ) : (
        <Zap className="h-3 w-3 text-red-500" />
      )}

      <span className={status === 'running' ? 'text-white' : 'text-stardust'}>{name}</span>

      {duration && status === 'complete' && (
        <span className="text-stardust/60">{duration}ms</span>
      )}
    </motion.div>
  );
}
