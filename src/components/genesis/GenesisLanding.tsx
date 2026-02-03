'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Mic,
  ArrowRight,
  Zap,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  Bot,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleField } from './ParticleField';

interface GenesisLandingProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

const AGENTS = [
  { id: 'director', name: 'Director', icon: Bot, color: '#7c3aed', description: 'Orchestrates the team' },
  { id: 'curriculum', name: 'Architect', icon: Brain, color: '#a855f7', description: 'Designs structure' },
  { id: 'content', name: 'Alchemist', icon: PenTool, color: '#06b6d4', description: 'Crafts content' },
  { id: 'assessment', name: 'Wizard', icon: ClipboardCheck, color: '#f97316', description: 'Creates quizzes' },
  { id: 'engagement', name: 'Engineer', icon: Lightbulb, color: '#ec4899', description: 'Builds activities' },
  { id: 'script', name: 'Writer', icon: Video, color: '#10b981', description: 'Writes scripts' },
];

const FEATURES = [
  'Transform any document into a complete course',
  '6 specialized AI agents working in harmony',
  'Interactive quizzes and assessments',
  'Video scripts ready for production',
  'Powered by Google Gemini',
];

export function GenesisLanding({ onUploadClick, onDemoClick }: GenesisLandingProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014]">
      {/* Particle Field Background */}
      <ParticleField intensity="medium" />

      {/* Cosmic Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-radial from-cyan-500/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-pink-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-between p-6"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl gradient-nebula glow-nebula">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-xl gradient-nebula opacity-50 blur-lg"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-nebula">GENESIS</h1>
              <p className="text-xs text-stardust">AI Course Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-stardust hover:text-white hover:bg-white/5"
              onClick={onDemoClick}
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Demo
            </Button>
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Animated Logo/Orb */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 100 }}
            className="relative mb-12"
          >
            {/* Central Orb */}
            <div className="relative w-32 h-32">
              <motion.div
                className="absolute inset-0 rounded-full gradient-nebula glow-nebula"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)',
                    '0 0 60px rgba(124, 58, 237, 0.6), 0 0 100px rgba(124, 58, 237, 0.3)',
                    '0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-14 w-14 text-white" />
              </div>

              {/* Orbiting Agent Icons */}
              {AGENTS.map((agent, index) => {
                const angle = (index * 60 - 90) * (Math.PI / 180);
                const radius = 90;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                    }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <motion.div
                      className="relative p-2.5 rounded-full cursor-pointer transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${agent.color}40, ${agent.color}20)`,
                        boxShadow: hoveredAgent === agent.id
                          ? `0 0 20px ${agent.color}60, 0 0 40px ${agent.color}30`
                          : `0 0 10px ${agent.color}30`,
                      }}
                      whileHover={{ scale: 1.2 }}
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        y: { duration: 2, repeat: Infinity, delay: index * 0.2 },
                      }}
                    >
                      <agent.icon className="h-4 w-4" style={{ color: agent.color }} />

                      {/* Connection line to center */}
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        width="180"
                        height="180"
                        style={{ transform: 'translate(-50%, -50%)' }}
                      >
                        <motion.line
                          x1="90"
                          y1="90"
                          x2={90 - x}
                          y2={90 - y}
                          stroke={agent.color}
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="4 4"
                          animate={{
                            strokeOpacity: hoveredAgent === agent.id ? [0.3, 0.6, 0.3] : 0.2,
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </svg>
                    </motion.div>

                    {/* Agent tooltip */}
                    <AnimatePresence>
                      {hoveredAgent === agent.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg glass-strong whitespace-nowrap"
                        >
                          <p className="text-xs font-medium" style={{ color: agent.color }}>
                            {agent.name}
                          </p>
                          <p className="text-[10px] text-stardust">{agent.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="text-gradient-nebula">GENESIS</span>
            </h2>
            <p className="text-xl md:text-2xl text-stardust font-light">
              Where Knowledge Takes Form
            </p>
          </motion.div>

          {/* Rotating Feature Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="h-8 mb-10 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-stardust text-center"
              >
                {FEATURES[currentFeature]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden px-8 py-6 text-lg gradient-nebula glow-nebula border-0 hover:scale-105 transition-transform"
              onClick={onUploadClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Begin Genesis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg border-[#06b6d4]/30 text-[#06b6d4] hover:bg-[#06b6d4]/10 hover:border-[#06b6d4]/50"
              onClick={onDemoClick}
            >
              <Mic className="h-5 w-5 mr-2" />
              Voice Create
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="flex items-center gap-8 mt-16"
          >
            {[
              { value: '6', label: 'AI Agents' },
              { value: '20+', label: 'Tools' },
              { value: '3', label: 'Gemini Models' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <motion.p
                  className="text-3xl font-bold text-gradient-cosmic"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 + i * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-stardust mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-stardust text-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Powered by Google Gemini</span>
            <span className="mx-2">•</span>
            <span>Gemini API Hackathon 2025</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
