'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Play,
  FileText,
  ArrowRight,
  Sparkles,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface LandingProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

// Agent data with icons and descriptions
const AGENTS = [
  {
    id: 'director',
    name: 'Director',
    role: 'Orchestrates the entire workflow',
    color: '#E24A12',
    icon: Compass,
    description: 'The mastermind that coordinates all agents'
  },
  {
    id: 'architect',
    name: 'Architect',
    role: 'Designs course structure',
    color: '#0066FF',
    icon: Brain,
    description: 'Creates learning paths and module hierarchies'
  },
  {
    id: 'writer',
    name: 'Writer',
    role: 'Creates lesson content',
    color: '#00A67E',
    icon: PenTool,
    description: 'Transforms concepts into engaging lessons'
  },
  {
    id: 'assessor',
    name: 'Assessor',
    role: 'Builds quizzes & tests',
    color: '#F59E0B',
    icon: ClipboardCheck,
    description: 'Designs assessments to validate learning'
  },
  {
    id: 'engager',
    name: 'Engager',
    role: 'Adds interactive elements',
    color: '#8B5CF6',
    icon: Lightbulb,
    description: 'Creates discussions, reflections, activities'
  },
  {
    id: 'producer',
    name: 'Producer',
    role: 'Writes video scripts',
    color: '#EC4899',
    icon: Video,
    description: 'Crafts production-ready video content'
  },
];

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return <span ref={ref} className="counter">{count}</span>;
}

// Agent card with hover effects
function AgentCard({ agent, index }: { agent: typeof AGENTS[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="card-forge p-6 h-full cursor-pointer">
        {/* Accent bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: agent.color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
          style={{
            backgroundColor: `${agent.color}10`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <Icon
            className="w-6 h-6 transition-colors duration-300"
            style={{ color: agent.color }}
          />
        </div>

        {/* Content */}
        <h3 className="font-semibold text-[--paper-900] mb-1 text-base">{agent.name}</h3>
        <p className="text-sm text-[--paper-500] leading-relaxed">{agent.role}</p>

        {/* Expanded description on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-[--paper-400] mt-3 pt-3 border-t border-[--paper-100]"
            >
              {agent.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Status indicator */}
        <div className="absolute top-4 right-4">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Process step component
function ProcessStep({ step, index, total }: { step: { number: string; title: string; description: string }; index: number; total: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative"
    >
      {/* Connection line */}
      {index < total - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-8 h-[2px]">
          <motion.div
            className="h-full bg-[--ember-300]"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}

      {/* Step number */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-[--ember-50] border border-[--ember-200] flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <span className="font-serif text-2xl font-semibold text-[--ember-600]">{step.number}</span>
        </motion.div>
      </div>

      {/* Content */}
      <h3 className="font-serif text-xl font-medium text-[--paper-900] mb-2">{step.title}</h3>
      <p className="text-[--paper-500] leading-relaxed">{step.description}</p>
    </motion.div>
  );
}

export function Landing({ onUploadClick, onDemoClick }: LandingProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    'Multi-agent AI orchestration',
    'Complete course generation',
    'Interactive assessments',
    'Video script production',
    'Export-ready formats'
  ];

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-[--paper-50] overflow-x-hidden">
      {/* Subtle grain overlay */}
      <div className="grain-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[--paper-50]/80 backdrop-blur-md border-b border-[--paper-200]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="CourseForge"
              width={150}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onDemoClick}
              className="text-[--paper-600] hover:text-[--paper-900] hover:bg-[--paper-100]"
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo
            </Button>
            <Button
              size="sm"
              onClick={onUploadClick}
              className="btn-forge btn-forge-primary"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex items-center pt-16"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-forge-pattern" />
        <div className="absolute inset-0 bg-forge-grid opacity-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 badge-forge badge-forge-primary mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by Google Gemini 2.5</span>
            </motion.div>

            {/* Main headline with word animation */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-[--paper-900] leading-[1.1] mb-6">
              {'Transform documents into '.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gradient"
              >
                production-ready courses
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl md:text-2xl text-[--paper-600] leading-relaxed mb-8 max-w-2xl"
            >
              Six specialized AI agents collaborate to analyze your content and create
              complete courses with lessons, quizzes, and video scripts.
            </motion.p>

            {/* Rotating features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="h-8 mb-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-[--paper-500]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[--ember-500]" />
                  <span>{features[activeFeature]}</span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button
                size="lg"
                onClick={onUploadClick}
                className="btn-forge btn-forge-primary h-14 px-8 text-base"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onDemoClick}
                className="btn-forge btn-forge-secondary h-14 px-8 text-base"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Supported formats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="text-sm text-[--paper-400]">Supports</span>
              {['PDF', 'Markdown', 'TXT', 'DOC'].map((format, i) => (
                <motion.span
                  key={format}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  className="badge-forge badge-forge-neutral"
                >
                  {format}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-20 grid grid-cols-4 gap-6 max-w-2xl"
          >
            {[
              { value: 6, label: 'AI Agents', suffix: '' },
              { value: 30, label: 'Tools', suffix: '+' },
              { value: 10, label: 'Achievements', suffix: '+' },
              { value: 4, label: 'Export Formats', suffix: '' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-semibold text-[--paper-900]">
                  <AnimatedCounter value={stat.value} />
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-sm text-[--paper-500] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Agent Grid Section */}
      <section className="py-24 bg-white border-y border-[--paper-200]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-forge badge-forge-primary mb-4 inline-flex">
              Multi-Agent System
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[--paper-900] mb-4">
              Six Specialized Agents
            </h2>
            <p className="text-lg text-[--paper-500] max-w-2xl mx-auto">
              Each agent is an expert in their domain, working together to create
              comprehensive, well-structured courses.
            </p>
          </motion.div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGENTS.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-[--paper-50]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[--paper-900] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[--paper-500] max-w-2xl mx-auto">
              From document to complete course in three simple steps
            </p>
          </motion.div>

          {/* Process steps */}
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                number: '01',
                title: 'Upload your content',
                description: 'Drop any document containing the knowledge you want to transform. We support PDFs, markdown, text files, and more.'
              },
              {
                number: '02',
                title: 'AI analyzes & structures',
                description: 'Our agents identify key concepts, create logical modules, and design optimal learning paths for your content.'
              },
              {
                number: '03',
                title: 'Review & export',
                description: 'Refine any section through conversation, then export your production-ready course in JSON or Markdown format.'
              }
            ].map((step, index) => (
              <ProcessStep
                key={step.number}
                step={step}
                index={index}
                total={3}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 bg-white border-y border-[--paper-200]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-forge badge-forge-primary mb-4 inline-flex">
              Premium Features
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[--paper-900] mb-4">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-lg text-[--paper-500] max-w-2xl mx-auto">
              Packed with advanced features that set CourseForge apart
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI Quality Analyzer',
                description: 'Real-time course quality scoring with Bloom\'s Taxonomy analysis',
                color: '#8B5CF6',
                badge: 'Smart'
              },
              {
                title: 'Knowledge Graph',
                description: 'Interactive visualization of course concepts and connections',
                color: '#0066FF',
                badge: 'Visual'
              },
              {
                title: 'Gamification',
                description: 'XP, achievements, and streaks to track your progress',
                color: '#F59E0B',
                badge: 'Fun'
              },
              {
                title: 'SCORM Export',
                description: 'LMS-ready packages compatible with any learning system',
                color: '#00A67E',
                badge: 'LMS'
              },
              {
                title: 'Command Palette',
                description: 'Power-user keyboard shortcuts for maximum efficiency',
                color: '#EC4899',
                badge: 'Pro'
              },
              {
                title: 'Analytics Dashboard',
                description: 'Deep insights into course structure and content quality',
                color: '#E24A12',
                badge: 'Insights'
              },
              {
                title: 'Multi-Format Export',
                description: 'JSON, Markdown, SCORM 1.2 & 2004 export options',
                color: '#06B6D4',
                badge: 'Flexible'
              },
              {
                title: 'Voice Input',
                description: 'Speak your commands and let AI transcribe them',
                color: '#A855F7',
                badge: 'Voice'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card-forge p-5 group hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: feature.color }}
                  >
                    {feature.badge}
                  </span>
                </div>
                <h3 className="font-medium text-[--paper-900] mb-1">{feature.title}</h3>
                <p className="text-sm text-[--paper-500]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[--paper-800]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-6">
              Ready to transform your content?
            </h2>
            <p className="text-lg text-[--paper-400] mb-10 max-w-xl mx-auto">
              Upload a document and watch as our AI agents collaborate to create
              your perfect course.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={onUploadClick}
                className="btn-forge btn-forge-primary h-14 px-8 text-base"
              >
                <Upload className="h-5 w-5 mr-2" />
                Start Creating
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onDemoClick}
                className="h-14 px-8 text-base bg-transparent border-[--paper-600] text-[--paper-300] hover:bg-[--paper-700] hover:text-white"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo First
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[--paper-900] border-t border-[--paper-800]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--paper-500]">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="CourseForge"
              width={100}
              height={24}
              className="h-6 w-auto opacity-50"
            />
          </div>
          <span>Built for the Gemini API Hackathon 2025</span>
          <span>Powered by Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
